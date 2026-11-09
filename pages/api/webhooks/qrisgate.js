// QRISGate payment webhook.
//
// Raw body is required for signature verification, so the Next.js body parser
// is disabled for this route.
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import WebhookEvent from '@/models/WebhookEvent';
import { verifyWebhookSignature } from '@/lib/qrisgate';
import { applyGatewayStatus, processDonationFulfillment } from '@/lib/donationPayments';

export const config = {
  api: {
    bodyParser: false,
  },
};

function getHeader(req, name) {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function getDeliveryId(req, payload, data) {
  const explicitEventId =
    payload?.event_id ||
    data?.event_id ||
    getHeader(req, 'x-qrisgate-delivery-id') ||
    getHeader(req, 'x-qrisgate-event-id') ||
    payload?.id;

  if (explicitEventId) return String(explicitEventId);

  // Fallback key: same event + transaction always gets the same id.
  return `${payload?.event || 'event'}:${data?.transaction_id || data?.external_order_id || 'unknown'}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    console.error('[QRISGate] Gagal membaca raw body:', error?.message || error);
    return res.status(400).json({ error: 'Invalid body' });
  }

  const timestamp = getHeader(req, 'x-qrisgate-timestamp');
  const signature = getHeader(req, 'x-qrisgate-signature');
  const secret = process.env.QRISGATE_WEBHOOK_SECRET;

  // 1. Replay window (5 minutes) + timing-safe HMAC-SHA256 verification.
  const verification = verifyWebhookSignature({
    rawBody,
    timestamp,
    signature,
    secret,
  });

  if (!verification.valid) {
    console.warn('[QRISGate] Webhook ditolak:', verification.reason);
    return res.status(401).json({
      error: 'Invalid signature',
      reason: verification.reason,
    });
  }

  // 2. Parse JSON after raw-body signature verification.
  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  const event = String(payload?.event || data?.event || '');
  const externalOrderId = data?.external_order_id || payload?.external_order_id;
  const transactionId = data?.transaction_id || data?.id || payload?.transaction_id;

  if (!externalOrderId) {
    return res.status(200).json({ received: true, ignored: 'missing_external_order_id' });
  }

  const deliveryId = getDeliveryId(req, payload, data);

  try {
    await dbConnect();

    // 3. Idempotency by event_id / X-QRISGate-Delivery-Id.
    let webhookEvent = await WebhookEvent.findOne({ deliveryId });

    if (webhookEvent?.processed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    if (!webhookEvent) {
      try {
        webhookEvent = await WebhookEvent.create({
          deliveryId,
          event,
          transactionId,
          externalOrderId,
          payload,
        });
      } catch (error) {
        if (error?.code === 11000) {
          // Concurrent delivery of the same event.
          webhookEvent = await WebhookEvent.findOne({ deliveryId });
          if (webhookEvent?.processed) {
            return res.status(200).json({ received: true, duplicate: true });
          }
        } else {
          throw error;
        }
      }
    }

    const donation = await Donation.findOne({ merchant_ref: externalOrderId });

    if (!donation) {
      await WebhookEvent.updateOne(
        { deliveryId },
        { $set: { processed: true, processedAt: new Date(), error: 'order_not_found' } }
      );
      console.warn('[QRISGate] Webhook untuk order yang tidak dikenal:', externalOrderId);
      return res.status(200).json({ received: true, ignored: 'order_not_found' });
    }

    if (event === 'payment.paid') {
      // Integrity checks: never trust a webhook amount blindly.
      const baseAmount = Number(data?.base_amount ?? data?.amount);
      const totalAmount = Number(data?.total_amount);
      const expectedBase = Number(donation.amount);
      const expectedTotal = Number(donation.totalAmount);

      if (Number.isFinite(baseAmount) && baseAmount !== expectedBase) {
        await WebhookEvent.updateOne(
          { deliveryId },
          { $set: { processed: true, processedAt: new Date(), error: 'base_amount_mismatch' } }
        );
        console.error('[QRISGate] base_amount mismatch:', {
          order: externalOrderId,
          expected: expectedBase,
          received: baseAmount,
        });
        return res.status(200).json({ received: true, ignored: 'base_amount_mismatch' });
      }

      if (
        Number.isFinite(expectedTotal) &&
        Number.isFinite(totalAmount) &&
        totalAmount !== expectedTotal
      ) {
        await WebhookEvent.updateOne(
          { deliveryId },
          { $set: { processed: true, processedAt: new Date(), error: 'total_amount_mismatch' } }
        );
        console.error('[QRISGate] total_amount mismatch:', {
          order: externalOrderId,
          expected: expectedTotal,
          received: totalAmount,
        });
        return res.status(200).json({ received: true, ignored: 'total_amount_mismatch' });
      }

      const paidDonation = await applyGatewayStatus(donation, {
        status: 'PAID',
        paidAt: data?.paid_at || payload?.paid_at,
        totalAmount: data?.total_amount ?? payload?.total_amount,
        uniqueCode: data?.unique_code ?? payload?.unique_code,
        transactionId,
        raw: payload,
      });

      await WebhookEvent.updateOne(
        { deliveryId },
        { $set: { processed: true, processedAt: new Date() } }
      );

      // Respond fast. Heavy fulfillment runs in the background; the order
      // status page also retries fulfillment via polling if this process dies.
      res.status(200).json({ received: true });

      if (paidDonation?._id) {
        processDonationFulfillment(paidDonation._id).catch((error) => {
          console.error('[QRISGate] Background fulfillment error:', error?.message || error);
        });
      }

      return;
    }

    if (event === 'payment.expired' || event === 'payment.cancelled') {
      await applyGatewayStatus(donation, {
        status: event === 'payment.expired' ? 'EXPIRED' : 'CANCELLED',
        raw: payload,
      });
    }

    await WebhookEvent.updateOne(
      { deliveryId },
      { $set: { processed: true, processedAt: new Date() } }
    );

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[QRISGate] Webhook error:', error?.message || error);
    // Return 500 so QRISGate retries delivery. The order page polling remains
    // the second line of defense.
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
