// Manual script to archive old donations
// Run with: npm run archive
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env.local');
  process.exit(1);
}

// Import models (using require for Node.js script)
const DonationSchema = new mongoose.Schema({
  name: String,
  email: String,
  amount: Number,
  message: String,
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  createdByUsername: String,
  merchant_ref: String,
  transactionId: String,
  paymentMethod: String,
  midtransData: Object,
  ipAddress: String,
  userAgent: String,
  isArchived: { type: Boolean, default: false },
  isDisplayedInOverlay: { type: Boolean, default: false },
  displayedAt: Date
}, { timestamps: true });

const DonationHistorySchema = new mongoose.Schema({
  name: String,
  email: String,
  amount: Number,
  message: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  createdByUsername: String,
  status: String,
  merchant_ref: String,
  transactionId: String,
  paymentMethod: String,
  midtransData: Object,
  originalDonationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    unique: true 
  },
  archivedAt: { type: Date, default: Date.now },
  archivedReason: { 
    type: String, 
    enum: ['AUTO_24H', 'MANUAL_ADMIN', 'MONTHLY_CLEANUP'],
    default: 'AUTO_24H' 
  },
  monthYear: String,
  year: Number,
  month: Number,
  originalCreatedAt: Date,
  originalUpdatedAt: Date,
  wasDisplayedInOverlay: { type: Boolean, default: false },
  displayedAt: Date,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

const Donation = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
const DonationHistory = mongoose.models.DonationHistory || mongoose.model('DonationHistory', DonationHistorySchema);

async function archiveDonations() {
  console.log('\n=== 🗄️  MANUAL ARCHIVE DONATIONS ===\n');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find donations older than 24 hours with PAID status
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    console.log(`📅 Looking for donations older than: ${twentyFourHoursAgo.toLocaleString('id-ID')}`);
    
    const oldDonations = await Donation.find({
      status: 'PAID',
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    console.log(`📦 Found ${oldDonations.length} donations to archive\n`);
    
    if (oldDonations.length === 0) {
      console.log('✨ No donations to archive. All up to date!');
      await mongoose.connection.close();
      return;
    }
    
    let archived = 0;
    let failed = 0;
    const errors = [];
    
    for (const donation of oldDonations) {
      try {
        // Check if already archived
        const existing = await DonationHistory.findOne({ 
          originalDonationId: donation._id 
        });
        
        if (existing) {
          console.log(`⚠️  Already archived: ${donation.merchant_ref}`);
          // Still delete from donations if already in history
          await Donation.findByIdAndDelete(donation._id);
          archived++;
          continue;
        }
        
        // Set temporal fields
        const createdDate = new Date(donation.createdAt);
        const year = createdDate.getFullYear();
        const month = createdDate.getMonth() + 1;
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
        
        // Create archive record
        const archiveData = {
          name: donation.name,
          email: donation.email,
          amount: donation.amount,
          message: donation.message,
          createdBy: donation.createdBy,
          createdByUsername: donation.createdByUsername,
          status: donation.status,
          merchant_ref: donation.merchant_ref,
          transactionId: donation.transactionId,
          paymentMethod: donation.paymentMethod,
          midtransData: donation.midtransData,
          ipAddress: donation.ipAddress,
          userAgent: donation.userAgent,
          originalDonationId: donation._id,
          archivedReason: 'MANUAL_ADMIN',
          originalCreatedAt: donation.createdAt,
          originalUpdatedAt: donation.updatedAt,
          wasDisplayedInOverlay: donation.isDisplayedInOverlay,
          displayedAt: donation.displayedAt,
          monthYear: monthYear,
          year: year,
          month: month
        };
        
        await DonationHistory.create(archiveData);
        
        // Delete from donations collection
        await Donation.findByIdAndDelete(donation._id);
        
        archived++;
        console.log(`✅ Archived & Deleted: ${donation.merchant_ref} (${donation.createdByUsername || 'unknown'})`);
        console.log(`   Amount: Rp ${donation.amount.toLocaleString('id-ID')}`);
        console.log(`   Date: ${donation.createdAt.toLocaleString('id-ID')}`);
        console.log(`   Moved to: ${monthYear}\n`);
        
      } catch (error) {
        failed++;
        const errorMsg = `Failed to archive ${donation.merchant_ref}: ${error.message}`;
        console.error(`❌ ${errorMsg}\n`);
        errors.push(errorMsg);
      }
    }
    
    // Summary
    console.log('\n=== 📊 ARCHIVE SUMMARY ===');
    console.log(`Total Found:    ${oldDonations.length}`);
    console.log(`✅ Archived:    ${archived}`);
    console.log(`❌ Failed:      ${failed}`);
    
    if (failed > 0) {
      console.log('\n=== ❌ ERRORS ===');
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log('\n✨ Archive process completed!');
    
  } catch (error) {
    console.error('\n=== ❌ FATAL ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
  }
}

// Run the script
archiveDonations().catch(console.error);
