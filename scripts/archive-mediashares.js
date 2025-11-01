// Script untuk archive media share yang sudah played/skipped > 6 jam
// Jalankan sebagai cron job setiap jam

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found');
  process.exit(1);
}

// Define schemas
const MediaShareSchema = new mongoose.Schema({}, { strict: false });
const MediaShareHistorySchema = new mongoose.Schema({}, { strict: false });

const MediaShare = mongoose.models.MediaShare || mongoose.model('MediaShare', MediaShareSchema);
const MediaShareHistory = mongoose.models.MediaShareHistory || mongoose.model('MediaShareHistory', MediaShareHistorySchema);

async function archiveMediaShares() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    // Get media shares ready for archive (played/skipped > 6 hours ago)
    const hoursAgo6 = new Date(Date.now() - 6 * 60 * 60 * 1000);
    
    const mediaShares = await MediaShare.find({
      playedAt: { $lt: hoursAgo6 },
      status: { $in: ['PLAYED', 'SKIPPED'] },
      isArchived: false
    });

    console.log(`📋 Found ${mediaShares.length} media share(s) to archive\n`);

    if (mediaShares.length === 0) {
      console.log('✅ No media shares to archive');
      return;
    }

    let archived = 0;

    for (const ms of mediaShares) {
      try {
        // Create history record
        await MediaShareHistory.create({
          originalId: ms._id,
          donationId: ms.donationId,
          createdBy: ms.createdBy,
          createdByUsername: ms.createdByUsername,
          donorName: ms.donorName,
          donorEmail: ms.donorEmail,
          amount: ms.amount,
          youtubeUrl: ms.youtubeUrl,
          videoId: ms.videoId,
          requestedDuration: ms.requestedDuration,
          actualDuration: ms.actualDuration,
          status: ms.status,
          playedAt: ms.playedAt,
          originalCreatedAt: ms.createdAt,
          message: ms.message,
          isApproved: ms.isApproved,
          moderationNote: ms.moderationNote,
          merchant_ref: ms.merchant_ref,
          archivedAt: new Date()
        });

        // Delete from active collection
        await MediaShare.findByIdAndDelete(ms._id);

        archived++;
        console.log(`✅ Archived: ${ms.donorName} - ${ms.videoId} (${ms.status})`);
      } catch (err) {
        console.error(`❌ Error archiving ${ms._id}:`, err.message);
      }
    }

    console.log(`\n🎉 Successfully archived ${archived} media share(s)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

archiveMediaShares();
