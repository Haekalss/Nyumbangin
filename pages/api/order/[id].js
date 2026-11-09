import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Creator from '@/models/Creator';
import {
  applyGatewayStatus,
  isDonationExpired,
  processDonationFulfillment,
  syncDonationFromGateway,
} from '@/lib/donationPayments';

const MIN_STATUS_CHECK_INTERVAL_MS = 2500;

function serializeOrder(donation, creator) {
  return {
    id: donation._id,
    merchantRef: donation.merchant_ref,
    status: donation.status,
    name: donation.name,
    amount: donation.amount,
    totalAmount: donation.totalAmount,
    uniqueCode: donation.uniqueCode,
    message: donation.message,
    paymentMethod: donation.paymentMethod,
    checkoutUrl: donation.checkoutUrl,
    expiresAt: donation.expiresAt,
    paidAt: donation.paidAt,
    createdAt: donation.createdAt,
    creator: {
      username: donation.createdByUsername,
      displayName: creator?.displayName || donation.createdByUsername,
    },
  };
}

async function refreshPendingDonation(donation) {
  if (donation.status !== 'PENDING' || !donation.transactionId) return donation;

  const now = Date.now();
  const lastCheck = donation.lastStatusCheckAt
    ? new Date(donation.lastStatusCheckAt).getTime()
    : 0;

  if (now - lastCheck < MIN_STATUS_CHECK_INTERVAL_MS) {
    return donation;
  }

  await Donation.updateOne(
    { _id: donation._id },
    { $set: { lastStatusCheckAt: new Date(now) } }
  ).catch(() => {});

  let synced = donation;
  try {
    synced = await syncDonationFromGateway(donation);
  } catch (error) {
    // Gateway unavailable: keep serving the last known DB state.
    console.error('[QRISGate] Status check gagal:', error?.code || error?.message || error);
    return donation;
  }

  if (isDonationExpired(synced)) {
    synced = await applyGatewayStatus(synced, {
      status: 'EXPIRED',
      raw: synced.qrisgateData || {},
    });
  }

  if (synced.status === 'PAID') {
    processDonationFulfillment(synced._id).catch((error) => {
      console.error('[QRISGate] Fulfillment error:', error?.message || error);
    });
  }

  return synced;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID pesanan wajib diisi' });
  }

  try {
    await dbConnect();

    let donation;
    try {
      donation = await Donation.findById(id);
    } catch {
      donation = null;
    }

    if (!donation) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }

    donation = await refreshPendingDonation(donation);

    let creator = null;
    if (donation.createdBy) {
      creator = await Creator.findById(donation.createdBy).select('displayName username');
    }

    return res.status(200).json({
      success: true,
      order: serializeOrder(donation, creator),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[QRISGate] Order status error:', error?.message || error);
    return res.status(500).json({ error: 'Gagal memuat status pesanan' });
  }
}
