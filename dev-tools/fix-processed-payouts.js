import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payout from '../src/models/payout.js';
import Donation from '../src/models/donations.js';

dotenv.config();

async function fixProcessedPayouts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all PROCESSED payouts
    const processedPayouts = await Payout.find({ status: 'PROCESSED' });
    console.log(`\n📋 Found ${processedPayouts.length} PROCESSED payouts`);
    
    for (const payout of processedPayouts) {
      console.log(`\n🔄 Processing payout ${payout._id} for ${payout.creatorUsername}`);
      
      // Mark donations as paid out
      const updateResult = await Donation.updateMany(
        {
          createdByUsername: payout.creatorUsername,
          status: 'PAID',
          $or: [
            { isPaidOut: false },
            { isPaidOut: { $exists: false } }
          ]
        },
        {
          $set: {
            isPaidOut: true,
            paidOutAt: payout.processedAt || new Date(),
            payoutId: payout._id
          }
        }
      );
      
      console.log(`   ✅ Updated ${updateResult.modifiedCount} donations`);
      console.log(`   💰 Payout amount: Rp ${payout.amount.toLocaleString('id-ID')}`);
    }
    
    console.log('\n✅ All PROCESSED payouts have been fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProcessedPayouts();
