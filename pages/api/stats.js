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

    // Get stats for this specific creator only
    // Support both old and new data structure
    const totalDonations = await Donation.countDocuments({ 
      $or: [
        { createdByUsername: creator.username },
        { createdBy: creator._id }
      ]
    });
    
    const totalAmount = await Donation.aggregate([
      { 
        $match: { 
          $or: [
            { createdByUsername: creator.username },
            { createdBy: creator._id }
          ]
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const paidAmount = await Donation.aggregate([
      { 
        $match: { 
          $or: [
            { 
              createdByUsername: creator.username,
              status: 'PAID' 
            },
            { 
              createdBy: creator._id,
              status: 'PAID' 
            }
          ]
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const uniqueDonors = await Donation.distinct("name", { 
      $or: [
        { createdByUsername: creator.username },
        { createdBy: creator._id }
      ]
    });

    res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        uniqueDonors: uniqueDonors.length
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    

    
    res.status(500).json({ success: false, error: error.message });
  }
}
