// API to manually check and update donation status via Midtrans Transaction Status API
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Notification from '@/models/Notification';
import { getSnap } from '@/lib/midtrans';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { merchant_ref } = req.body;
    
    if (!merchant_ref) {
      return res.status(400).json({ error: 'merchant_ref required' });
    }

    console.log('🔍 Checking payment status for:', merchant_ref);
    
    // Find donation in database
    const donation = await Donation.findOne({ merchant_ref });
    
    if (!donation) {
      return res.status(404).json({ 
        error: 'Donation not found',
        merchant_ref 
      });
    }

    // If already PAID, return success
    if (donation.status === 'PAID') {
      return res.json({
        success: true,
        status: 'PAID',
        message: 'Donation already marked as paid',
        donation: {
          id: donation._id,
          merchant_ref: donation.merchant_ref,
          name: donation.name,
          amount: donation.amount,
          status: donation.status
        }
      });
    }

    // Check status from Midtrans
    try {
      const snap = getSnap();
      const statusResponse = await snap.transaction.status(merchant_ref);
      
      console.log('Midtrans status response:', statusResponse);
      
      const transaction_status = statusResponse.transaction_status;
      const fraud_status = statusResponse.fraud_status;
      
      let newStatus = donation.status;
      
      // Determine status based on Midtrans response
      if (transaction_status === 'capture') {
        if (fraud_status === 'accept') {
          newStatus = 'PAID';
        }
      } else if (transaction_status === 'settlement') {
        newStatus = 'PAID';
      } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
        newStatus = 'FAILED';
      } else if (transaction_status === 'pending') {
        newStatus = 'PENDING';
      }
      
      // Update if status changed
      if (newStatus !== donation.status) {
        donation.status = newStatus;
        await donation.save();
        console.log('✅ Status updated from', donation.status, 'to', newStatus);
      }
      
      // Send notification if paid
      if (newStatus === 'PAID') {
        try {
          await Notification.createDonationNotification(donation);
          console.log('✅ Notification created for donation:', donation._id);
          console.log('💡 Overlay will pick up this donation via polling');
        } catch (notifErr) {
          console.error('❌ Failed to create notification:', notifErr);
        }
      }
      
      return res.json({
        success: true,
        status: newStatus,
        transaction_status,
        fraud_status,
        updated: newStatus !== donation.status,
        donation: {
          id: donation._id,
          merchant_ref: donation.merchant_ref,
          name: donation.name,
          amount: donation.amount,
          status: newStatus
        }
      });
      
    } catch (midtransError) {
      console.error('Midtrans API error:', midtransError);
      
      // If Midtrans returns 404, it means transaction not found
      // For sandbox testing, we'll allow manual override
      if (midtransError.httpStatusCode === 404) {
        return res.status(200).json({
          success: false,
          error: 'Transaction not found in Midtrans',
          message: 'Untuk testing, gunakan /api/test-webhook untuk manual update',
          merchant_ref
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to check Midtrans status',
        details: midtransError.message 
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
}
