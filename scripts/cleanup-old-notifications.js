require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');
    
    const db = mongoose.connection.db;
    
    // Delete old notifications for this donation
    const donationId = new mongoose.Types.ObjectId('69065338f2c0c09ddff9e274');
    
    const result = await db.collection('notifications').deleteMany({
      donationId
    });
    
    console.log(`🗑️ Deleted ${result.deletedCount} old notifications`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanup();
