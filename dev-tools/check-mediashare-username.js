require('dotenv').config();
const mongoose = require('mongoose');

async function checkMediaShareUsername() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // Get all media shares
    const mediaShares = await db.collection('mediashares')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`📊 Total media shares: ${mediaShares.length}\n`);
    
    if (mediaShares.length === 0) {
      console.log('❌ No media shares found!');
    } else {
      mediaShares.forEach((ms, idx) => {
        console.log(`=== Media Share ${idx + 1} ===`);
        console.log('ID:', ms._id);
        console.log('Donor:', ms.donorName);
        console.log('Created By Username:', ms.createdByUsername); // ⭐ Check this
        console.log('YouTube URL:', ms.youtubeUrl);
        console.log('Video ID:', ms.videoId);
        console.log('Duration:', ms.requestedDuration);
        console.log('Status:', ms.status);
        console.log('Queue Position:', ms.queuePosition);
        console.log('Is Approved:', ms.isApproved);
        console.log('Created:', ms.createdAt);
        console.log('');
      });
    }
    
    // Also check donations to see what username they have
    console.log('\n📊 Last donation username:');
    const donation = await db.collection('donations')
      .find({ 'mediaShareRequest.enabled': true })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    if (donation.length > 0) {
      console.log('Donation ID:', donation[0]._id);
      console.log('Created By Username:', donation[0].createdByUsername); // ⭐ Compare
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMediaShareUsername();
