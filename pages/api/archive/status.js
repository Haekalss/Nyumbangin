// Archive status endpoint - Check pending and archived donations
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import DonationHistory from '@/models/DonationHistory';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Count donations that need archiving (> 24 hours old)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const needArchiving = await Donation.countDocuments({
      status: 'PAID',
      createdAt: { $lt: twentyFourHoursAgo }
    });
    
    // Get total counts
    const totalActive = await Donation.countDocuments({ status: 'PAID' });
    const totalArchived = await DonationHistory.countDocuments();
    
    // Get last archived donation
    const lastArchived = await DonationHistory.findOne()
      .sort({ archivedAt: -1 })
      .select('archivedAt merchant_ref amount createdByUsername');
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        archiveThreshold: '24 hours',
        schedule: 'Every 6 hours via GitHub Actions',
        timezone: 'UTC (0, 6, 12, 18:00)'
      },
      active: {
        total: totalActive,
        needArchiving,
        status: needArchiving > 0 ? 'PENDING_ARCHIVE' : 'UP_TO_DATE'
      },
      archived: {
        total: totalArchived,
        lastArchived: lastArchived ? {
          date: lastArchived.archivedAt,
          merchant_ref: lastArchived.merchant_ref,
          amount: lastArchived.amount,
          creator: lastArchived.createdByUsername
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
