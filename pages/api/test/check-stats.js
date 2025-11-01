// TEST ENDPOINT - Check creator stats tanpa update
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';
import DonationHistory from '@/models/DonationHistory';
import Payout from '@/models/payout';
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

    console.log(`🔍 TEST: Checking stats for ${creator.username}`);

    // Manual calculation untuk compare
    const donationStats = await Donation.aggregate([
      { $match: { createdBy: creator._id, status: 'PAID' } },
      { 
        $group: { 
          _id: null, 
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const historyStats = await DonationHistory.aggregate([
      { $match: { createdBy: creator._id, status: 'PAID' } },
      { 
        $group: { 
          _id: null, 
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const payoutStats = await Payout.aggregate([
      { 
        $match: { 
          creatorId: creator._id, 
          status: { $in: ['APPROVED', 'PROCESSED'] }
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalPayouts: { $sum: '$amount' }
        }
      }
    ]);

    const currentDonations = donationStats[0]?.totalCount || 0;
    const currentAmount = donationStats[0]?.totalAmount || 0;
    const historyDonations = historyStats[0]?.totalCount || 0;
    const historyAmount = historyStats[0]?.totalAmount || 0;
    const totalPayouts = payoutStats[0]?.totalPayouts || 0;

    const calculatedTotalDonations = currentDonations + historyDonations;
    const calculatedTotalAmount = currentAmount + historyAmount;

    return res.status(200).json({
      success: true,
      data: {
        username: creator.username,
        statsFromDB: {
          totalDonations: creator.stats.totalDonations,
          totalAmount: creator.stats.totalAmount,
          totalPayouts: creator.stats.totalPayouts
        },
        calculatedStats: {
          fromDonations: {
            count: currentDonations,
            amount: currentAmount
          },
          fromHistory: {
            count: historyDonations,
            amount: historyAmount
          },
          totalDonations: calculatedTotalDonations,
          totalAmount: calculatedTotalAmount,
          totalPayouts: totalPayouts,
          currentBalance: currentAmount // Saldo yang bisa di-payout
        },
        isMatch: {
          donations: creator.stats.totalDonations === calculatedTotalDonations,
          amount: creator.stats.totalAmount === calculatedTotalAmount,
          payouts: creator.stats.totalPayouts === totalPayouts
        }
      }
    });
  } catch (error) {
    console.error('❌ TEST: Error checking stats:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
}
