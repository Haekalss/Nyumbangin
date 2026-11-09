import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Creator from '@/models/Creator';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Verify creator exists
    const creator = await Creator.findById(decoded.userId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }

    // Get stats for this specific creator only (PAID donations only)
    const paidMatch = {
      status: 'PAID',
      $or: [
        { createdByUsername: creator.username },
        { createdBy: creator._id }
      ]
    };

    const totalDonations = await Donation.countDocuments(paidMatch);
    
    // Total amount only from PAID donations
    const totalAmount = await Donation.aggregate([
      { $match: paidMatch },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Today's PAID donations (since 00:00 local server time)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayStats = await Donation.aggregate([
      {
        $match: {
          ...paidMatch,
          createdAt: { $gte: startOfToday }
        }
      },
      {
        $group: {
          _id: null,
          todayAmount: { $sum: "$amount" },
          todayDonations: { $sum: 1 }
        }
      }
    ]);

    const paidAmount = await Donation.aggregate([
      { 
        $match: { 
          $or: [
            { 
              createdByUsername: creator.username,
              status: 'PAID',
              $or: [
                { isPaidOut: false },
                { isPaidOut: { $exists: false } }
              ]
            },
            { 
              createdBy: creator._id,
              status: 'PAID',
              $or: [
                { isPaidOut: false },
                { isPaidOut: { $exists: false } }
              ]
            }
          ]
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const uniqueDonors = await Donation.distinct("name", { 
      $or: [
        { createdByUsername: creator.username, status: 'PAID' },
        { createdBy: creator._id, status: 'PAID' }
      ]
    });

    res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        todayAmount: todayStats[0]?.todayAmount || 0,
        todayDonations: todayStats[0]?.todayDonations || 0,
        uniqueDonors: uniqueDonors.length
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    

    
    res.status(500).json({ success: false, error: error.message });
  }
}
