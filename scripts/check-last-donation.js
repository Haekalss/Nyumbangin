require('dotenv').config();
const mongoose = require('mongoose');

async function checkLastDonation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');
    
    const db = mongoose.connection.db;
    const donations = await db.collection('donations')
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    console.log('\n📊 Last 3 donations:');
    donations.forEach((don, idx) => {
      console.log(`\n=== Donation ${idx + 1} ===`);
      console.log('ID:', don._id);
      console.log('Name:', don.name);
      console.log('Amount:', don.amount);
      console.log('Status:', don.status);
      console.log('Message:', don.message);
      console.log('Media Share Request:', JSON.stringify(don.mediaShareRequest, null, 2));
      console.log('Created:', don.createdAt);
    });
    
    // Check mediashares collection
    const mediaShares = await db.collection('mediashares')
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    console.log('\n\n📹 Last 3 media shares:');
    if (mediaShares.length === 0) {
      console.log('❌ No media shares found!');
    } else {
      mediaShares.forEach((ms, idx) => {
        console.log(`\n=== Media Share ${idx + 1} ===`);
        console.log('ID:', ms._id);
        console.log('Donor:', ms.donorName);
        console.log('YouTube URL:', ms.youtubeUrl);
        console.log('Video ID:', ms.videoId);
        console.log('Duration:', ms.requestedDuration);
        console.log('Status:', ms.status);
        console.log('Queue Position:', ms.queuePosition);
        console.log('Created:', ms.createdAt);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLastDonation();
