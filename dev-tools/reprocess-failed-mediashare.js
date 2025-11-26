require('dotenv').config();
const mongoose = require('mongoose');

async function reprocessFailedMediaShare() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // Find donations with unprocessed media share
    const failedDonations = await db.collection('donations').find({
      'mediaShareRequest.enabled': true,
      'mediaShareRequest.processed': false,
      status: 'PAID'
    }).toArray();
    
    console.log(`📊 Found ${failedDonations.length} failed media share donations\n`);
    
    for (const donation of failedDonations) {
      console.log(`🎥 Processing donation ${donation._id}...`);
      console.log('Donor:', donation.name);
      console.log('Original URL:', donation.mediaShareRequest.youtubeUrl);
      
      // Trim URL
      const cleanUrl = donation.mediaShareRequest.youtubeUrl.trim();
      console.log('Cleaned URL:', cleanUrl);
      
      // Extract video ID
      const extractVideoId = (url) => {
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
          /^([a-zA-Z0-9_-]{11})$/
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        
        return null;
      };
      
      const videoId = extractVideoId(cleanUrl);
      
      if (!videoId) {
        console.log('❌ Invalid YouTube URL after cleaning');
        continue;
      }
      
      console.log('✅ Video ID:', videoId);
      
      // Get queue position
      const lastInQueue = await db.collection('mediashares')
        .find({
          createdByUsername: donation.createdByUsername,
          status: { $in: ['PENDING', 'PLAYING'] }
        })
        .sort({ queuePosition: -1 })
        .limit(1)
        .toArray();
      
      const queuePosition = lastInQueue.length > 0 ? lastInQueue[0].queuePosition + 1 : 1;
      console.log('Queue position:', queuePosition);
      
      // Create media share
      const mediaShare = {
        donationId: donation._id,
        createdBy: donation.createdBy,
        createdByUsername: donation.createdByUsername,
        donorName: donation.name,
        donorEmail: donation.email || 'anonymous@nyumbangin.com',
        amount: donation.amount,
        youtubeUrl: cleanUrl,
        videoId,
        requestedDuration: donation.mediaShareRequest.duration,
        message: donation.message || '',
        merchant_ref: donation.merchant_ref,
        queuePosition,
        isApproved: true,
        status: 'PENDING',
        isArchived: false,
        actualDuration: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('mediashares').insertOne(mediaShare);
      console.log('✅ Media share created:', result.insertedId);
      
      // Update donation URL and mark as processed
      await db.collection('donations').updateOne(
        { _id: donation._id },
        { 
          $set: { 
            'mediaShareRequest.youtubeUrl': cleanUrl,
            'mediaShareRequest.processed': true 
          } 
        }
      );
      console.log('✅ Donation updated\n');
    }
    
    console.log('🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

reprocessFailedMediaShare();
