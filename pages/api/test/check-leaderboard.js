// TEST ENDPOINT - Cek leaderboard di database untuk creator tertentu
// Gunakan ini untuk verify data sudah masuk ke MonthlyLeaderboard collection
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    console.log(`🔍 TEST: Checking leaderboard for ${creator.username}`);

    // Get leaderboard untuk bulan ini
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const leaderboard = await MonthlyLeaderboard.findOne({
      creatorId: creator._id,
      year: currentYear,
      month: currentMonth
    });

    if (!leaderboard) {
      console.log(`⚠️  TEST: Leaderboard belum ada di database`);
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'Leaderboard belum ada di database. Gunakan /api/test/update-leaderboard untuk membuat.',
        creatorUsername: creator.username,
        year: currentYear,
        month: currentMonth
      });
    }

    console.log(`✅ TEST: Leaderboard found in database`);

    return res.status(200).json({
      success: true,
      exists: true,
      message: 'Leaderboard ditemukan di database',
      data: {
        _id: leaderboard._id,
        creatorUsername: leaderboard.creatorUsername,
        year: leaderboard.year,
        month: leaderboard.month,
        monthYear: leaderboard.monthYear,
        topDonorsCount: leaderboard.topDonors?.length || 0,
        topDonors: leaderboard.topDonors?.map(donor => ({
          rank: donor.rank,
          name: donor.name,
          totalAmount: donor.totalAmount,
          donationCount: donor.donationCount,
          avgDonationAmount: donor.avgDonationAmount,
          lastDonationAt: donor.lastDonationAt
        })),
        monthlyStats: leaderboard.monthlyStats,
        isFinalized: leaderboard.isFinalized,
        lastUpdated: leaderboard.lastUpdated,
        createdAt: leaderboard.createdAt
      }
    });
  } catch (error) {
    console.error('❌ TEST: Error checking leaderboard:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
}
