import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payout from '../src/models/payout.js';
import Donation from '../src/models/donations.js';

dotenv.config();

async function debugPayout() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get latest payout
    const latestPayout = await Payout.findOne().sort({ requestedAt: -1 });
    console.log('\n📋 Latest Payout:');
    console.log('ID:', latestPayout._id);
    console.log('CreatorUsername:', latestPayout.creatorUsername);
    console.log('Amount:', latestPayout.amount);
    console.log('Status:', latestPayout.status);
    console.log('ProcessedAt:', latestPayout.processedAt);
    
    // Check donations for this creator
    console.log('\n💰 Donations for', latestPayout.creatorUsername);
    
    const allDonations = await Donation.find({
      createdByUsername: latestPayout.creatorUsername,
      status: 'PAID'
    }).select('amount isPaidOut paidOutAt payoutId status');
    
    console.log('Total PAID donations:', allDonations.length);
    
    const paidOut = allDonations.filter(d => d.isPaidOut);
    const notPaidOut = allDonations.filter(d => !d.isPaidOut);
    
    console.log('Already paid out:', paidOut.length);
    console.log('Not paid out yet:', notPaidOut.length);
    
    const totalNotPaidOut = notPaidOut.reduce((sum, d) => sum + d.amount, 0);
    console.log('Total amount not paid out:', totalNotPaidOut.toLocaleString('id-ID'));
    
    if (notPaidOut.length > 0) {
      console.log('\n🔍 Sample not paid out donations:');
      notPaidOut.slice(0, 3).forEach(d => {
        console.log('- Amount:', d.amount, 'isPaidOut:', d.isPaidOut);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugPayout();
