// Script untuk menambahkan field isPaidOut ke semua donasi yang belum punya
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI or MONGODB_URI not found in .env');
  process.exit(1);
}

const DonationSchema = new mongoose.Schema({}, { strict: false });
const Donation = mongoose.model('Donation', DonationSchema, 'donations');

async function fixDonationsPaidOut() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update semua donasi yang belum punya field isPaidOut
    const result = await Donation.updateMany(
      { isPaidOut: { $exists: false } },
      { 
        $set: { 
          isPaidOut: false 
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} donations with isPaidOut: false`);

    // Cek berapa yang sudah punya field
    const withField = await Donation.countDocuments({ isPaidOut: { $exists: true } });
    const total = await Donation.countDocuments();
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total donations: ${total}`);
    console.log(`   With isPaidOut field: ${withField}`);
    console.log(`   isPaidOut = true: ${await Donation.countDocuments({ isPaidOut: true })}`);
    console.log(`   isPaidOut = false: ${await Donation.countDocuments({ isPaidOut: false })}`);

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDonationsPaidOut();
