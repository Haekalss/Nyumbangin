// Manual payment status check (webhook fallback).
// Uses QRISGate GET /api/v1/transactions/:id via the server-side helper.
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import {
  applyGatewayStatus,
  isDonationExpired,
  processDonationFulfillment,
  syncDonationFromGateway,
} from '@/lib/donationPayments';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const input = req.method === 'GET' ? req.query : req.body || {};
    const merchantRef = input.merchant_ref || input.order_id || input.id;

    if (!merchantRef) {
      return res.status(400).json({ error: 'merchant_ref required' });
    }

    let donation = await Donation.findOne({ merchant_ref: merchantRef });
    if (!donation) {
      try {
        donation = await Donation.findById(merchantRef);
      } catch {
        donation = null;
      }
    }

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found', merchant_ref: merchantRef });
    }

    if (donation.status === 'PENDING' && donation.transactionId) {
      try {
        donation = await syncDonationFromGateway(donation);

        if (isDonationExpired(donation)) {
          donation = await applyGatewayStatus(donation, {
            status: 'EXPIRED',
            raw: donation.qrisgateData || {},
          });
        }

        if (donation.status === 'PAID') {
          processDonationFulfillment(donation._id).catch((error) => {
            console.error('[QRISGate] Fulfillment error:', error?.message || error);
          });
        }
      } catch (error) {
        console.error('[QRISGate] Status check gagal:', error?.code || error?.message || error);
        return res.status(502).json({
          success: false,
          error: 'Gagal mengecek status ke QRISGate',
          status: donation.status,
        });
      }
    }

    return res.json({
      success: true,
      status: donation.status,
      donation: {
        id: donation._id,
        merchant_ref: donation.merchant_ref,
        name: donation.name,
        amount: donation.amount,
        totalAmount: donation.totalAmount,
        uniqueCode: donation.uniqueCode,
        status: donation.status,
        checkoutUrl: donation.checkoutUrl,
        expiresAt: donation.expiresAt,
        paidAt: donation.paidAt,
      },
    });
  } catch (error) {
    console.error('[QRISGate] check-payment-status error:', error?.message || error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
