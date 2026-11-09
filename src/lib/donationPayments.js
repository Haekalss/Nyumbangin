import Donation from '@/models/donations';
import Notification from '@/models/Notification';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';
import Creator from '@/models/Creator';
import MediaShare from '@/models/MediaShare';
import { getQrisgateTransaction } from '@/lib/qrisgate';

const FULFILLMENT_STALE_MS = 5 * 60 * 1000;

function toSafeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

/**
 * Apply a status returned by QRISGate (webhook or status API) to a donation.
 * Payment amounts from the gateway are stored verbatim — never rounded.
 */
export async function applyGatewayStatus(donation, payload = {}) {
  if (!donation?._id) return donation;

  const normalized = String(payload.status || '').toUpperCase();

  if (normalized === 'PAID') {
    const update = {
      status: 'PAID',
      paidAt: payload.paidAt ? new Date(payload.paidAt) : new Date(),
    };

    const totalAmount = toSafeInteger(payload.totalAmount);
    if (totalAmount !== null) update.totalAmount = totalAmount;

    const uniqueCode = toSafeInteger(payload.uniqueCode);
    if (uniqueCode !== null) update.uniqueCode = uniqueCode;

    if (payload.transactionId) update.transactionId = payload.transactionId;
    if (payload.raw) update.qrisgateData = payload.raw;

    const updated = await Donation.findOneAndUpdate(
      { _id: donation._id, status: { $ne: 'PAID' } },
      { $set: update },
      { new: true }
    );

    return updated || (await Donation.findById(donation._id));
  }

  if (['EXPIRED', 'CANCELLED', 'FAILED'].includes(normalized)) {
    const finalStatus = normalized === 'FAILED' ? 'FAILED' : 'CANCELLED';
    const update = { status: finalStatus };
    if (payload.raw) update.qrisgateData = payload.raw;

    const updated = await Donation.findOneAndUpdate(
      { _id: donation._id, status: 'PENDING' },
      { $set: update },
      { new: true }
    );

    return updated || (await Donation.findById(donation._id));
  }

  return donation;
}

/**
 * Poll QRISGate for the latest status of a PENDING donation.
 * This is the webhook fallback used by the order status page.
 */
export async function syncDonationFromGateway(donation) {
  if (!donation?.transactionId) return donation;

  const data = await getQrisgateTransaction(donation.transactionId);

  return applyGatewayStatus(donation, {
    status: data.status,
    paidAt: data.paid_at,
    totalAmount: data.total_amount,
    uniqueCode: data.unique_code,
    transactionId: data.transaction_id,
    raw: data,
  });
}

async function claimFulfillment(donationId) {
  const claimed = await Donation.findOneAndUpdate(
    {
      _id: donationId,
      status: 'PAID',
      fulfillmentStatus: { $in: ['NONE', 'FAILED', null] },
    },
    {
      $set: {
        fulfillmentStatus: 'PROCESSING',
        fulfillmentStartedAt: new Date(),
      },
    },
    { new: true }
  );

  if (claimed) return claimed;

  // Recover a worker that crashed mid-fulfillment.
  return Donation.findOneAndUpdate(
    {
      _id: donationId,
      status: 'PAID',
      fulfillmentStatus: 'PROCESSING',
      fulfillmentStartedAt: { $lt: new Date(Date.now() - FULFILLMENT_STALE_MS) },
    },
    {
      $set: {
        fulfillmentStatus: 'PROCESSING',
        fulfillmentStartedAt: new Date(),
      },
    },
    { new: true }
  );
}

/**
 * Post-payment fulfillment: notification, leaderboard, creator stats, media share.
 *
 * Idempotent: an atomic claim prevents duplicate notifications / media share
 * entries when both the webhook and the status poll process the same payment.
 */
export async function processDonationFulfillment(donationId) {
  let donation;
  try {
    donation = await claimFulfillment(donationId);
  } catch (error) {
    console.error('[QRISGate] Gagal claim fulfillment:', error?.message || error);
    return { ok: false, error };
  }

  if (!donation) return { ok: false, skipped: true };

  try {
    const hasMediaShare =
      donation.mediaShareRequest &&
      donation.mediaShareRequest.enabled === true &&
      Boolean(donation.mediaShareRequest.youtubeUrl);

    if (!hasMediaShare) {
      const existingNotification = await Notification.findOne({ donationId: donation._id });
      if (!existingNotification) {
        await Notification.createDonationNotification(donation);
      }
    } else if (!donation.mediaShareRequest.processed) {
      const existingMediaShare = await MediaShare.findOne({ donationId: donation._id });

      if (!existingMediaShare) {
        const videoId = MediaShare.extractVideoId(donation.mediaShareRequest.youtubeUrl);

        if (videoId) {
          const lastInQueue = await MediaShare.findOne({
            createdByUsername: donation.createdByUsername,
            status: { $in: ['PENDING', 'PLAYING'] },
          }).sort({ queuePosition: -1 });

          const queuePosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;

          await MediaShare.create({
            donationId: donation._id,
            createdBy: donation.createdBy,
            createdByUsername: donation.createdByUsername,
            donorName: donation.name,
            donorEmail: donation.email || 'anonymous@nyumbangin.com',
            amount: donation.amount,
            youtubeUrl: donation.mediaShareRequest.youtubeUrl,
            videoId,
            requestedDuration: donation.mediaShareRequest.duration,
            message: donation.message || '',
            merchant_ref: donation.merchant_ref,
            queuePosition,
            isApproved: true,
          });
        } else {
          console.error(
            '[QRISGate] URL YouTube media share tidak valid:',
            donation.mediaShareRequest.youtubeUrl
          );
        }
      }

      donation.mediaShareRequest.processed = true;
      await donation.save();
    }

    if (donation.createdBy) {
      try {
        await MonthlyLeaderboard.updateCurrentMonth(donation.createdBy);
      } catch (error) {
        console.error('[QRISGate] Gagal update leaderboard:', error?.message || error);
      }

      try {
        const creator = await Creator.findById(donation.createdBy);
        if (creator) await creator.updateStats();
      } catch (error) {
        console.error('[QRISGate] Gagal update statistik creator:', error?.message || error);
      }
    }

    await Donation.updateOne(
      { _id: donation._id },
      { $set: { fulfillmentStatus: 'DONE', fulfillmentCompletedAt: new Date() } }
    );

    return { ok: true };
  } catch (error) {
    console.error('[QRISGate] Fulfillment gagal:', error?.message || error);
    try {
      await Donation.updateOne(
        { _id: donation._id },
        { $set: { fulfillmentStatus: 'FAILED', fulfillmentError: error?.message || 'unknown' } }
      );
    } catch {
      // ignore secondary failure
    }
    return { ok: false, error };
  }
}

export function isDonationExpired(donation, now = Date.now()) {
  if (!donation || donation.status !== 'PENDING') return false;
  const expiresAt = donation.expiresAt
    ? new Date(donation.expiresAt).getTime()
    : new Date(donation.createdAt).getTime() + 15 * 60 * 1000;
  return Number.isFinite(expiresAt) && now > expiresAt;
}
