// Fix pending donations - update to PAID manually
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://haekal:Haekalsyukurmas@cluster11.fpsgop4.mongodb.net/nyumbangin?retryWrites=true&w=majority&appName=Cluster11';

async function fixPendingDonations() {
  console.log('🔧 Fixing Pending Donations...\n');
  
  try {
    await mongoose.connect(MONGO_URI, { bufferCommands: false });
    console.log('✅ Database connected\n');
    
    // Find all pending donations
    const pendingDonations = await mongoose.connection.db.collection('donations')
      .find({ status: 'PENDING' })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${pendingDonations.length} pending donations:\n`);
    
    pendingDonations.forEach((donation, index) => {
      const createdDate = new Date(donation.createdAt);
      const now = new Date();
      const hoursAgo = Math.floor((now - createdDate) / (1000 * 60 * 60));
      
      console.log(`${index + 1}. Merchant Ref: ${donation.merchant_ref}`);
      console.log(`   Name: ${donation.name}`);
      console.log(`   Amount: Rp ${donation.amount.toLocaleString('id-ID')}`);
      console.log(`   Created: ${createdDate.toLocaleString('id-ID')} (${hoursAgo} hours ago)`);
      console.log(`   Creator: ${donation.createdByUsername}`);
      console.log('');
    });
    
    if (pendingDonations.length === 0) {
      console.log('✅ No pending donations found!\n');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }
    
    // Ask user which donations to update
    console.log('Options:');
    console.log('1. Update ALL pending donations to PAID');
    console.log('2. Update donations from last 24 hours to PAID');
    console.log('3. Update specific donation by merchant_ref');
    console.log('4. Exit without changes');
    console.log('');
    console.log('For quick fix, updating ALL to PAID...\n');
    
    // Update all to PAID (you can modify this logic)
    const result = await mongoose.connection.db.collection('donations').updateMany(
      { status: 'PENDING' },
      { 
        $set: { 
          status: 'PAID',
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} donations to PAID status\n`);
    
    // Verify
    const stillPending = await mongoose.connection.db.collection('donations')
      .countDocuments({ status: 'PENDING' });
    
    console.log(`Remaining pending donations: ${stillPending}`);
    
    const paidCount = await mongoose.connection.db.collection('donations')
      .countDocuments({ status: 'PAID' });
    
    console.log(`Total PAID donations: ${paidCount}\n`);
    
    console.log('⚠️  Note: Ini adalah quick fix untuk development.');
    console.log('💡 Di production, gunakan webhook Midtrans yang sebenarnya.');
    console.log('');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixPendingDonations();
