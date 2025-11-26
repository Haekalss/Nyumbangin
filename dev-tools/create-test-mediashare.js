require('dotenv').config();
const mongoose = require('mongoose');

async function createTestMediaShare() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // Create a test donation first
    console.log('📝 Creating test donation...');
    const donation = {
      name: 'Test Donor',
      amount: 20000,
      message: 'Test media share video',
      merchant_ref: 'TEST' + Date.now(),
      createdByUsername: 'peacemaker',
      createdBy: new mongoose.Types.ObjectId('67038e97e5797e1085efda80'), // Your creator ID
      status: 'PAID',
      mediaShareRequest: {
        enabled: true,
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 60,
        processed: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const donationResult = await db.collection('donations').insertOne(donation);
    console.log('✅ Donation created:', donationResult.insertedId);
    
    // Extract video ID
    const extractVideoId = (url) => {
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
    };
    
    const videoId = extractVideoId(donation.mediaShareRequest.youtubeUrl);
    console.log('📹 Video ID:', videoId);
    
    // Get queue position
    const lastInQueue = await db.collection('mediashares')
      .find({
        createdByUsername: 'peacemaker',
        status: { $in: ['PENDING', 'PLAYING'] }
      })
      .sort({ queuePosition: -1 })
      .limit(1)
      .toArray();
    
    const queuePosition = lastInQueue.length > 0 ? lastInQueue[0].queuePosition + 1 : 1;
    console.log('📊 Queue position:', queuePosition);
    
    // Create media share
    console.log('\n🎥 Creating media share...');
    const mediaShare = {
      donationId: donationResult.insertedId,
      createdBy: donation.createdBy,
      createdByUsername: 'peacemaker',
      donorName: donation.name,
      donorEmail: 'test@example.com',
      amount: donation.amount,
      youtubeUrl: donation.mediaShareRequest.youtubeUrl,
      videoId,
      requestedDuration: donation.mediaShareRequest.duration,
      message: donation.message,
      merchant_ref: donation.merchant_ref,
      queuePosition,
      isApproved: true,
      status: 'PENDING',
      isArchived: false,
      actualDuration: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const msResult = await db.collection('mediashares').insertOne(mediaShare);
    console.log('✅ Media share created:', msResult.insertedId);
    
    // Mark donation as processed
    await db.collection('donations').updateOne(
      { _id: donationResult.insertedId },
      { $set: { 'mediaShareRequest.processed': true } }
    );
    console.log('✅ Donation marked as processed');
    
    console.log('\n🎉 Test data created successfully!');
    console.log('🔗 Open: http://localhost:3000/overlay/peacemaker/mediashare');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestMediaShare();
