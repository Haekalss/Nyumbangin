import dbConnect from '@/lib/db';
import MediaShare from '@/models/MediaShare';
import MediaShareHistory from '@/models/MediaShareHistory';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify cron secret (optional security)
    const cronSecret = req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get media shares ready for archive
    const mediaShares = await MediaShare.getReadyForArchive();

    console.log(`Found ${mediaShares.length} media shares to archive`);

    if (mediaShares.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No media shares to archive',
        archived: 0
      });
    }

    let archived = 0;
    const errors = [];

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
        console.log(`Archived media share: ${ms._id}`);
      } catch (err) {
        console.error(`Error archiving media share ${ms._id}:`, err);
        errors.push({ id: ms._id, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Archived ${archived} media shares`,
      archived,
      total: mediaShares.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Archive media shares error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
