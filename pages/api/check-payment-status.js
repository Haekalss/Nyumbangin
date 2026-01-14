// API to manually check and update donation status via Midtrans Transaction Status API
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Notification from '@/models/Notification';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';
import Creator from '@/models/Creator';
import MediaShare from '@/models/MediaShare';
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

    // If donation was created for GoPay Merchant (QRIS), skip Midtrans API call
    if (donation.paymentMethod === 'gopay-merchant') {
      return res.json({
        success: true,
        status: donation.status,
        message: 'GoPay Merchant donation - status from DB',
        donation: {
          id: donation._id,
          merchant_ref: donation.merchant_ref,
          name: donation.name,
          amount: donation.amount,
          status: donation.status
        }
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
      
      // Re-fetch donation to ensure we have latest data including mediaShareRequest
      const freshDonation = await Donation.findOne({ merchant_ref });
      
      console.log('🔍 Fresh donation data:', {
        hasMediaShareRequest: !!freshDonation.mediaShareRequest,
        enabled: freshDonation.mediaShareRequest?.enabled,
        processed: freshDonation.mediaShareRequest?.processed,
        youtubeUrl: freshDonation.mediaShareRequest?.youtubeUrl
      });
      
      // Send notification if paid (but skip for media share donations)
      if (newStatus === 'PAID') {
        try {
          const hasMediaShare = freshDonation.mediaShareRequest && 
                               freshDonation.mediaShareRequest.enabled === true && 
                               freshDonation.mediaShareRequest.youtubeUrl;
          
          console.log('🎯 Decision:', hasMediaShare ? 'SKIP notification (Media Share)' : 'CREATE notification (Regular)');
          console.log('🔍 Media share check:', {
            hasRequest: !!freshDonation.mediaShareRequest,
            enabled: freshDonation.mediaShareRequest?.enabled,
            hasUrl: !!freshDonation.mediaShareRequest?.youtubeUrl,
            result: hasMediaShare
          });
          
          if (!hasMediaShare) {
            await Notification.createDonationNotification(freshDonation);
            console.log('✅ Notification created for REGULAR donation:', freshDonation._id);
            console.log('💡 Overlay will pick up this donation via polling');
          } else {
            console.log('⏩ SKIPPING notification - this is a MEDIA SHARE donation');
            console.log('💡 Processing media share...');
            
            // Create media share directly (since webhook might not be called in development)
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

                console.log('✅ Media share created successfully');
                
                // Update leaderboard
                if (freshDonation.createdBy) {
                  try {
                    await MonthlyLeaderboard.updateCurrentMonth(freshDonation.createdBy);
                    console.log('✅ Leaderboard updated');
                  } catch (err) {
                    console.error('❌ Leaderboard update failed:', err);
                  }
                }
                
                // Update creator stats
                if (freshDonation.createdBy) {
                  try {
                    const creator = await Creator.findById(freshDonation.createdBy);
                    if (creator) {
                      await creator.updateStats();
                      console.log('✅ Creator stats updated');
                    }
                  } catch (err) {
                    console.error('❌ Creator stats update failed:', err);
                  }
                }
              } else {
                console.error('❌ Invalid YouTube URL:', freshDonation.mediaShareRequest.youtubeUrl);
              }
            }
          }
        } catch (notifErr) {
          console.error('❌ Failed in PAID processing:', notifErr);
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
