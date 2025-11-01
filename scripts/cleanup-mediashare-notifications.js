require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupMediaShareNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // Find donations with media share
    const mediaShareDonations = await db.collection('donations')
      .find({ 'mediaShareRequest.enabled': true })
      .toArray();
    
    console.log(`📊 Found ${mediaShareDonations.length} media share donations\n`);
    
    const donationIds = mediaShareDonations.map(d => d._id);
    
    // Delete notifications for these donations
    const result = await db.collection('notifications').deleteMany({
      donationId: { $in: donationIds }
    });
    
    console.log(`🗑️ Deleted ${result.deletedCount} notifications for media share donations`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupMediaShareNotifications();
