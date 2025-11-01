// TEST ENDPOINT - Manual trigger update leaderboard untuk creator tertentu
// Gunakan ini untuk testing tanpa perlu tunggu cron atau akhir bulan
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify creator login
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    const token = authHeader.replace('Bearer ', '');

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Verify creator exists
    const creator = await Creator.findById(decoded.userId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }

    console.log(`🧪 TEST: Updating leaderboard for ${creator.username}`);

    // Update leaderboard untuk bulan ini
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const leaderboard = await MonthlyLeaderboard.updateMonthlyData(
      creator._id,
      currentYear,
      currentMonth
    );

    console.log(`✅ TEST: Leaderboard updated successfully`);
    console.log(`📊 Top donors:`, leaderboard.topDonors?.length || 0);
    console.log(`💰 Total amount:`, leaderboard.monthlyStats?.totalAmount || 0);

    return res.status(200).json({
      success: true,
      message: 'Leaderboard berhasil di-update',
      data: {
        creatorUsername: creator.username,
        year: currentYear,
        month: currentMonth,
        monthYear: leaderboard.monthYear,
        topDonorsCount: leaderboard.topDonors?.length || 0,
        topDonors: leaderboard.topDonors?.slice(0, 5).map(donor => ({
          rank: donor.rank,
          name: donor.name,
          totalAmount: donor.totalAmount,
          donationCount: donor.donationCount
        })),
        monthlyStats: {
          totalDonations: leaderboard.monthlyStats?.totalDonations || 0,
          totalAmount: leaderboard.monthlyStats?.totalAmount || 0,
          uniqueDonors: leaderboard.monthlyStats?.uniqueDonors || 0,
          avgDonationAmount: leaderboard.monthlyStats?.avgDonationAmount || 0
        },
        lastUpdated: leaderboard.lastUpdated
      }
    });
  } catch (error) {
    console.error('❌ TEST: Error updating leaderboard:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
}
