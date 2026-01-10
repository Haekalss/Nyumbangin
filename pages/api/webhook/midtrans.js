// Midtrans Payment Notification Webhook
// Receives POST from Midtrans. Verifies signature and updates donation status.
// Only fields needed now: order_id, transaction_status, status_code, gross_amount, signature_key
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Notification from '@/models/Notification';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';
import Creator from '@/models/Creator';
import MediaShare from '@/models/MediaShare';
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

    // Always process PAID status, even if status doesn't change (for reprocessing)
    const shouldProcess = newStatus === 'PAID';
    
    if (newStatus !== donation.status) {
      donation.status = newStatus;
      donation.transactionId = req.body.transaction_id;
      donation.paymentMethod = req.body.payment_type;
      donation.midtransData = req.body;
      await donation.save();
      console.log('✅ Donation status updated to:', newStatus);
    } else if (shouldProcess) {
      console.log('ℹ️ Donation already PAID, checking for unprocessed actions...');
    }
      
    if (shouldProcess) {
      // ⚠️ RE-FETCH donation to ensure we have latest data including mediaShareRequest
      const freshDonation = await Donation.findOne({ merchant_ref: order_id });
      
      // ✅ CREATE NOTIFICATION when payment is successful
      // BUT skip notification if this is a media share (will show in mediashare overlay instead)
      try {
        const hasMediaShare = freshDonation.mediaShareRequest && 
                             freshDonation.mediaShareRequest.enabled === true && 
                             freshDonation.mediaShareRequest.youtubeUrl;
        
        console.log('🔍 Checking media share:', {
          hasMediaShareRequest: !!freshDonation.mediaShareRequest,
          enabled: freshDonation.mediaShareRequest?.enabled,
          youtubeUrl: freshDonation.mediaShareRequest?.youtubeUrl,
          processed: freshDonation.mediaShareRequest?.processed,
          hasMediaShare: hasMediaShare
        });
        
        if (!hasMediaShare) {
          // Only create notification for regular donations (no media share)
          await Notification.createDonationNotification(freshDonation);
          console.log('✅ Notification created for REGULAR donation:', freshDonation._id);
          console.log('💡 Overlay will pick up this donation via polling');
        } else {
          console.log('⏩ SKIPPING notification - this is a MEDIA SHARE donation');
          console.log('💡 Will show in media share overlay instead, NOT in regular donation overlay');
        }
          
        // ✅ UPDATE LEADERBOARD immediately after successful payment
        if (freshDonation.createdBy) {
          try {
            await MonthlyLeaderboard.updateCurrentMonth(freshDonation.createdBy);
            console.log('✅ Leaderboard updated for creator:', freshDonation.createdByUsername);
          } catch (leaderboardErr) {
            console.error('❌ Failed to update leaderboard:', leaderboardErr);
            // Don't fail webhook if leaderboard update fails
          }
        }
        
        // ✅ UPDATE CREATOR STATS immediately after successful payment
        if (freshDonation.createdBy) {
          try {
            const creator = await Creator.findById(freshDonation.createdBy);
            if (creator) {
              await creator.updateStats();
              console.log('✅ Creator stats updated:', freshDonation.createdByUsername);
            }
          } catch (statsErr) {
            console.error('❌ Failed to update creator stats:', statsErr);
            // Don't fail webhook if stats update fails
          }
        }

        // ✅ CREATE MEDIA SHARE if donation has media share request
        if (freshDonation.mediaShareRequest && freshDonation.mediaShareRequest.enabled && !freshDonation.mediaShareRequest.processed) {
          try {
            console.log('🎥 Processing media share request...');
            console.log('YouTube URL:', freshDonation.mediaShareRequest.youtubeUrl);
            
            const videoId = MediaShare.extractVideoId(freshDonation.mediaShareRequest.youtubeUrl);
            console.log('Extracted Video ID:', videoId);
            
            if (videoId) {
              // Get queue position
              const lastInQueue = await MediaShare.findOne({
                createdByUsername: freshDonation.createdByUsername,
                status: { $in: ['PENDING', 'PLAYING'] }
              }).sort({ queuePosition: -1 });

              const queuePosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;
              console.log('Queue position:', queuePosition);

              // Create media share
              const mediaShare = await MediaShare.create({
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

              console.log('✅ Media share created:', mediaShare._id);

              // Mark as processed
              freshDonation.mediaShareRequest.processed = true;
              await freshDonation.save();

              console.log('✅ Donation marked as processed');
            } else {
              console.error('❌ Invalid YouTube URL for media share:', freshDonation.mediaShareRequest.youtubeUrl);
            }
          } catch (msErr) {
            console.error('❌ Failed to create media share:', msErr);
            console.error('Error details:', msErr.message);
            console.error('Stack trace:', msErr.stack);
            // Don't fail webhook if media share creation fails
          }
        }
      } catch (notifErr) {
        console.error('❌ Failed in PAID processing:', notifErr);
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
