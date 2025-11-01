require('dotenv').config();
const mongoose = require('mongoose');

async function reprocessMediaShare() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    const db = mongoose.connection.db;
    
    // Import models (use require for CommonJS)
    const Donation = mongoose.model('Donation', require('../src/models/donations').default.schema);
    const MediaShareModel = require('../src/models/MediaShare');
    
    // Find donations with unprocessed media share requests
    const donations = await db.collection('donations').find({
      'mediaShareRequest.enabled': true,
      'mediaShareRequest.processed': false,
      status: 'PAID'
    }).toArray();
    
    console.log(`\n📊 Found ${donations.length} unprocessed media share donations`);
    
    for (const donation of donations) {
      console.log(`\n🎥 Processing donation ${donation._id}...`);
      console.log('Donor:', donation.name);
      console.log('Amount:', donation.amount);
      console.log('YouTube URL:', donation.mediaShareRequest.youtubeUrl);
      
      try {
        // Extract video ID
        const videoId = extractVideoId(donation.mediaShareRequest.youtubeUrl);
        
        if (!videoId) {
          console.log('❌ Invalid YouTube URL');
          continue;
        }
        
        console.log('Video ID:', videoId);
        
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
          youtubeUrl: donation.mediaShareRequest.youtubeUrl,
          videoId,
          requestedDuration: donation.mediaShareRequest.duration,
          message: donation.message || '',
          merchant_ref: donation.merchant_ref,
          queuePosition,
          isApproved: true,
          status: 'PENDING',
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await db.collection('mediashares').insertOne(mediaShare);
        console.log('✅ Media share created:', result.insertedId);
        
        // Mark as processed
        await db.collection('donations').updateOne(
          { _id: donation._id },
          { $set: { 'mediaShareRequest.processed': true } }
        );
        console.log('✅ Donation marked as processed');
        
      } catch (err) {
        console.error('❌ Error processing:', err.message);
      }
    }
    
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Helper function to extract video ID
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

reprocessMediaShare();
