// Midtrans Payment Notification Webhook
// Receives POST from Midtrans. Verifies signature and updates donation status.
// Only fields needed now: order_id, transaction_status, status_code, gross_amount, signature_key
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Notification from '@/models/Notification';
import crypto from 'crypto';

function verifySignature(order_id, status_code, gross_amount, signature_key) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const payload = order_id + status_code + gross_amount + serverKey;
  const hash = crypto.createHash('sha512').update(payload).digest('hex');
  return hash === signature_key;
}

export default async function handler(req, res) {
  console.log('=== MIDTRANS WEBHOOK RECEIVED ===');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    console.log('✅ Database connected');
    
    const { order_id, transaction_status, status_code, gross_amount, signature_key } = req.body || {};
    
    console.log('📋 Parsed data:', { order_id, transaction_status, status_code, gross_amount });
    
    if (!order_id) {
      console.error('❌ Missing order_id');
      return res.status(400).json({ error: 'Missing order_id' });
    }
    
    if (signature_key && !verifySignature(order_id, status_code, gross_amount, signature_key)) {
      console.error('❌ Invalid signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const donation = await Donation.findOne({ merchant_ref: order_id });
    
    if (!donation) {
      console.error('❌ Donation not found for order_id:', order_id);
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    console.log('✅ Donation found:', donation._id);

    // Extra integrity check: amount must match
    if (gross_amount && parseInt(gross_amount) !== donation.amount) {
      console.error('❌ Amount mismatch:', { expected: donation.amount, received: gross_amount });
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    let newStatus = donation.status;
    
    // Update status based on transaction_status
    if (['capture', 'settlement'].includes(transaction_status)) {
      newStatus = 'PAID';
      console.log('💰 Status will be updated to PAID');
    }
    if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
      newStatus = 'UNPAID';
      console.log('❌ Status will be updated to UNPAID');
    }

    if (newStatus !== donation.status) {
      donation.status = newStatus;
      donation.transactionId = req.body.transaction_id;
      donation.paymentMethod = req.body.payment_type;
      donation.midtransData = req.body;
      await donation.save();
      console.log('✅ Donation status updated to:', newStatus);
      
      // ✅ CREATE NOTIFICATION when payment is successful
      if (newStatus === 'PAID') {
        try {
          await Notification.createDonationNotification(donation);
          console.log('✅ Notification created for donation:', donation._id);
          console.log('💡 Overlay will pick up this donation via polling');
        } catch (notifErr) {
          console.error('❌ Failed to create notification:', notifErr);
        }
      }
    }

    console.log('=== ✅ WEBHOOK PROCESSED SUCCESSFULLY ===');
    return res.json({ success: true });
  } catch (err) {
    console.error('=== ❌ WEBHOOK ERROR ===');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

export const config = { api: { bodyParser: true } };
