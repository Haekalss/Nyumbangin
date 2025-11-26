require('dotenv').config();
const mongoose = require('mongoose');

async function checkLatestDonation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // Get latest donations sorted by time
    const donations = await db.collection('donations')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    console.log('📊 Last 5 donations:\n');
    
    donations.forEach((don, idx) => {
      console.log(`=== Donation ${idx + 1} ===`);
      console.log('ID:', don._id);
      console.log('Name:', don.name);
      console.log('Amount:', don.amount);
      console.log('Status:', don.status);
      console.log('Message:', don.message || '(no message)');
      console.log('Merchant Ref:', don.merchant_ref);
      console.log('Created By Username:', don.createdByUsername);
      console.log('Created At:', don.createdAt);
      console.log('Media Share Request:', JSON.stringify(don.mediaShareRequest, null, 2));
      console.log('');
    });
    
    // Check notifications
    console.log('\n📢 Last 3 notifications:');
    const notifications = await db.collection('notifications')
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    notifications.forEach((notif, idx) => {
      console.log(`\n${idx + 1}. ${notif.type} - ${notif.title}`);
      console.log('   Message:', notif.message);
      console.log('   Donation ID:', notif.donationId);
      console.log('   Created:', notif.createdAt);
    });
    
    // Check media shares
    console.log('\n\n🎥 Last 3 media shares:');
    const mediaShares = await db.collection('mediashares')
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    mediaShares.forEach((ms, idx) => {
      console.log(`\n${idx + 1}. ${ms.donorName} - ${ms.status}`);
      console.log('   YouTube:', ms.youtubeUrl);
      console.log('   Video ID:', ms.videoId);
      console.log('   Duration:', ms.requestedDuration);
      console.log('   Donation ID:', ms.donationId);
      console.log('   Created:', ms.createdAt);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLatestDonation();
