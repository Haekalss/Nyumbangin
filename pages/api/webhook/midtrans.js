// Midtrans Payment Notification Webhook
// Receives POST from Midtrans. Verifies signature and updates donation status.
// Only fields needed now: order_id, transaction_status, status_code, gross_amount, signature_key
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import crypto from 'crypto';

function verifySignature(order_id, status_code, gross_amount, signature_key) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const payload = order_id + status_code + gross_amount + serverKey;
  const hash = crypto.createHash('sha512').update(payload).digest('hex');
  return hash === signature_key;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();
  try {
    const { order_id, transaction_status, status_code, gross_amount, signature_key } = req.body || {};
    if (!order_id) return res.status(400).json({ error: 'Missing order_id' });
    if (signature_key && !verifySignature(order_id, status_code, gross_amount, signature_key)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const donation = await Donation.findOne({ merchant_ref: order_id });
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    // Extra integrity check: amount must match
    if (gross_amount && parseInt(gross_amount) !== donation.amount) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    let newStatus = donation.status;
    if (['capture', 'settlement'].includes(transaction_status)) newStatus = 'PAID';
    if (['expire', 'cancel', 'deny'].includes(transaction_status)) newStatus = 'UNPAID';

    if (newStatus !== donation.status) {
      donation.status = newStatus;
      await donation.save();
    }

  if (donation && donation.status === 'PAID') {
      try {
        if (global._io) {
          global._io.emit('new-donation', {
            name: donation.name,
            amount: donation.amount,
            message: donation.message,
            createdAt: donation.createdAt,
            ownerUsername: donation.ownerUsername
          });
        }
        await fetch('https://socket-server-production-03be.up.railway.app/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: donation.name,
            amount: donation.amount,
            message: donation.message,
            createdAt: donation.createdAt,
            ownerUsername: donation.ownerUsername
          })
        });
      } catch (e) {
        console.error('Socket notify failed:', e);
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Midtrans webhook error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export const config = { api: { bodyParser: true } };
