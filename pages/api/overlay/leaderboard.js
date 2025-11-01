// API untuk mengambil leaderboard overlay dari database
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import MonthlyLeaderboard from '@/models/MonthlyLeaderboard';
import Donation from '@/models/donations';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  try {
    await dbConnect();
    
    // Check if creator exists
    const creator = await Creator.findOne({ username: username.toLowerCase() });
    if (!creator) {
      return res.status(404).json({ 
        success: false,
        error: 'Creator not found',
        leaderboard: []
      });
    }

    // Get current month leaderboard from database
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let leaderboard = await MonthlyLeaderboard.findOne({
      creatorId: creator._id,
      year: currentYear,
      month: currentMonth
    });

    // FALLBACK: If no leaderboard data in MonthlyLeaderboard, calculate from Donation collection
    if (!leaderboard || !leaderboard.topDonors || leaderboard.topDonors.length === 0) {
      console.log('📊 MonthlyLeaderboard not found, calculating from donations...');
      
      // Get all donations for this month
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 1);
      
      const donations = await Donation.find({
        createdByUsername: creator.username,
        status: 'PAID',
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth
        }
      }).select('name amount createdAt');
      
      if (donations.length === 0) {
        return res.status(200).json({
          success: true,
          leaderboard: [],
          message: 'Belum ada donasi bulan ini',
          source: 'donations'
        });
      }
      
      // Group donations by donor name and sum amounts (SAMA DENGAN DASHBOARD)
      const grouped = donations.reduce((acc, donation) => {
        const name = donation.name || 'Anonymous';
        
        if (!acc[name]) {
          acc[name] = {
            name,
            totalAmount: 0,
            donationCount: 0,
            lastDonation: donation.createdAt
          };
        }
        acc[name].totalAmount += donation.amount;
        acc[name].donationCount += 1;
        if (new Date(donation.createdAt) > new Date(acc[name].lastDonation)) {
          acc[name].lastDonation = donation.createdAt;
        }
        return acc;
      }, {});

      // Convert to array and sort by total amount - Top 5 for overlay
      const topDonors = Object.values(grouped)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map((donor, index) => ({
          rank: index + 1,
          name: donor.name,
          totalAmount: donor.totalAmount,
          donationCount: donor.donationCount
        }));
      
      return res.status(200).json({
        success: true,
        leaderboard: topDonors,
        monthYear: `${currentYear}-${currentMonth.toString().padStart(2, '0')}`,
        lastUpdated: new Date(),
        source: 'donations' // Indicator bahwa data dari donations, bukan MonthlyLeaderboard
      });
    }

    // Return top 5 donors from MonthlyLeaderboard
    const topDonors = leaderboard.topDonors
      .slice(0, 5)
      .map(donor => ({
        rank: donor.rank,
        name: donor.name,
        totalAmount: donor.totalAmount,
        donationCount: donor.donationCount
      }));

    res.status(200).json({
      success: true,
      leaderboard: topDonors,
      monthYear: leaderboard.monthYear,
      lastUpdated: leaderboard.lastUpdated,
      source: 'monthlyLeaderboard' // Indicator bahwa data dari MonthlyLeaderboard
    });
  } catch (error) {
    console.error('Error fetching overlay leaderboard:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      leaderboard: []
    });
  }
}
