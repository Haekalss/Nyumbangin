// Receives incoming notification from MacroDroid for GoPay Merchant (QRIS)
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Notification from '@/models/Notification';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';
import Creator from '@/models/Creator';
import MediaShare from '@/models/MediaShare';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    let payload = req.body || {};
    // If body is a raw string, try to parse as JSON
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (parseErr) {
        console.warn('Incoming body is string and not valid JSON');
      }
    }

    // Normalize keys and values
    let merchant_ref = payload.merchant_ref || payload.merchantRef || payload.order_id || null;
    let amount = payload.amount ?? payload.value ?? null;
    let payment_method = payload.payment_method || payload.paymentMethod || null;
    const completion_source = payload.completion_source || payload.completionSource || null;
    const rawText = payload.rawText || payload.raw_text || payload.text || '';
    const receivedAt = payload.receivedAt || payload.received_at || new Date().toISOString();

    console.log('=== GOPAY INCOMING ===');
    console.log('Raw payload:', req.body);
    console.log('Parsed payload:', payload);

    // SECURITY: require incoming secret header when configured for production
    const configuredSecret = process.env.GOPAY_INCOMING_SECRET || process.env.INCOMING_SECRET;
    const receivedSecret = req.headers['x-incoming-secret'] || req.headers['x-gopay-incoming-secret'];
    if (configuredSecret) {
      if (!receivedSecret || receivedSecret !== configuredSecret) {
        console.warn('Incoming secret missing or invalid');
        return res.status(401).json({ error: 'unauthorized' });
      }
    } else {
      console.warn('No GOPAY_INCOMING_SECRET configured — incoming endpoint is permissive (not recommended for production)');
    }

    // Try to coerce amount to number if it's a string like "Rp10.000" or "10.000"
    if (typeof amount === 'string') {
      const digits = amount.replace(/[^0-9]/g, '');
      amount = digits ? parseInt(digits) : null;
    }

    // If merchant_ref contains placeholder tokens (e.g. '%merchant_ref%'), treat as missing
    if (merchant_ref && typeof merchant_ref === 'string' && merchant_ref.includes('%')) {
      merchant_ref = null;
    }

    // If amount missing or invalid during tests, default to 1 so test payloads work
    let amountDefaulted = false;
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      console.log('Amount missing/invalid in incoming payload — defaulting to 1 for test');
      amount = 1;
      amountDefaulted = true;
    }

    // If amount or payment_method missing because MacroDroid didn't substitute variables,
    // try to extract values from rawText.
    if ((!amount || !payment_method) && rawText) {
      // Extract merchant_ref pattern DON... if missing
      if (!merchant_ref) {
        const m = rawText.match(/(DON[0-9A-Z]+)/i);
        if (m) merchant_ref = m[1];
      }

      // Extract digits for amount if missing
      if (!amount) {
        const mAmt = rawText.match(/([0-9]{1,3}(?:[.,][0-9]{3})*|[0-9]+)/);
        if (mAmt) {
          const digits = mAmt[0].replace(/[^0-9]/g, '');
          amount = digits ? parseInt(digits) : null;
        }
      }

      // Default payment_method to gopay-merchant if missing (endpoint is GoPay-specific)
      if (!payment_method) {
        payment_method = 'gopay-merchant';
      }
    }

    if (!payment_method) {
      return res.status(400).json({ error: 'payment_method required' });
    }

    // normalize payment method
    payment_method = payment_method.toString().toLowerCase();
    if (payment_method !== 'gopay-merchant' && payment_method !== 'gopay') {
      return res.status(400).json({ error: 'unsupported payment_method' });
    }

    // Try to find pending donation: prefer merchant_ref match if provided, otherwise match by amount
    const lookbackMinutes = 60; // only consider donations within last hour
    const since = new Date(Date.now() - lookbackMinutes * 60 * 1000);

    let donation = null;
    if (merchant_ref) {
      console.log('Searching donation by merchant_ref (pending only):', merchant_ref);
      donation = await Donation.findOne({ merchant_ref: merchant_ref, status: 'PENDING' });
    }

    if (!donation) {
      console.log('Searching donation by amount match:', amount);
      donation = await Donation.findOne({
        paymentMethod: 'gopay-merchant',
        amount: parseInt(amount),
        status: 'PENDING',
        createdAt: { $gte: since }
      }).sort({ createdAt: -1 });
    }

    // If still not found, and amount was defaulted (test placeholders),
    // fallback to the most recent PENDING GoPay donation within lookback window ONLY when explicitly allowed.
    const allowFallback = (process.env.ALLOW_INCOMING_FALLBACK || 'false').toLowerCase() === 'true';
    if (!donation && amountDefaulted) {
      if (allowFallback) {
        console.log('Amount was defaulted — attempting fallback to most recent pending GoPay donation (fallback enabled)');
        donation = await Donation.findOne({
          paymentMethod: 'gopay-merchant',
          status: 'PENDING',
          createdAt: { $gte: since }
        }).sort({ createdAt: -1 });
      } else {
        console.warn('Amount was defaulted and fallback is disabled — refusing to match by most-recent');
      }
    }

    if (!donation) {
      console.error('No matching pending donation found for GoPay incoming');
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Mark as paid and attach incoming data (record headers and source IP)
    donation.status = 'PAID';
    donation.gopayIncoming = {
      receivedAt: receivedAt || new Date().toISOString(),
      completion_source: completion_source || 'external-notification',
      rawText: rawText || '',
      rawPayload: payload,
      incomingHeaders: req.headers,
      incomingIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null
    };

    await donation.save();
    console.log('Donation marked as PAID:', donation._id);

    // Process post-payment actions similar to Midtrans webhook
    try {
      const freshDonation = await Donation.findById(donation._id);

      const hasMediaShare = freshDonation.mediaShareRequest &&
                           freshDonation.mediaShareRequest.enabled &&
                           freshDonation.mediaShareRequest.youtubeUrl;

      if (!hasMediaShare) {
        // Create regular donation notification
        await Notification.createDonationNotification(freshDonation);
      } else {
        // Media share: create MediaShare entry
        if (!freshDonation.mediaShareRequest.processed) {
          const videoId = MediaShare.extractVideoId(freshDonation.mediaShareRequest.youtubeUrl);
          if (videoId) {
            const lastInQueue = await MediaShare.findOne({
              createdByUsername: freshDonation.createdByUsername,
              status: { $in: ['PENDING', 'PLAYING'] }
            }).sort({ queuePosition: -1 });

            const queuePosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;

            await MediaShare.create({
              donationId: freshDonation._id,
              createdBy: freshDonation.createdBy,
              createdByUsername: freshDonation.createdByUsername,
              donorName: freshDonation.name,
              donorEmail: freshDonation.email || 'anonymous@nyumbangin.com',
              amount: freshDonation.amount,
              youtubeUrl: freshDonation.mediaShareRequest.youtubeUrl,
              videoId,
              requestedDuration: freshDonation.mediaShareRequest.duration,
              message: freshDonation.message || '',
              merchant_ref: freshDonation.merchant_ref,
              queuePosition,
              isApproved: true
            });

            freshDonation.mediaShareRequest.processed = true;
            await freshDonation.save();
          } else {
            console.error('Invalid YouTube URL for media share:', freshDonation.mediaShareRequest.youtubeUrl);
          }
        }
      }

      // Update leaderboard and creator stats
      if (freshDonation.createdBy) {
        try {
          await MonthlyLeaderboard.updateCurrentMonth(freshDonation.createdBy);
        } catch (err) {
          console.error('Failed to update leaderboard:', err);
        }

        try {
          const creator = await Creator.findById(freshDonation.createdBy);
          if (creator) await creator.updateStats();
        } catch (err) {
          console.error('Failed to update creator stats:', err);
        }
      }
    } catch (procErr) {
      console.error('Post-payment processing error:', procErr);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Incoming processing error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

export const config = { api: { bodyParser: true } };
