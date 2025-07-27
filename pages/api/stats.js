import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import jwt from 'jsonwebtoken';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.username) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Get stats for this specific creator only
    const totalDonations = await Donation.countDocuments({ 
      ownerUsername: decoded.username 
    });
    
    const totalAmount = await Donation.aggregate([
      { $match: { ownerUsername: decoded.username } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const paidAmount = await Donation.aggregate([
      { 
        $match: { 
          ownerUsername: decoded.username,
          status: 'PAID' 
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const uniqueDonors = await Donation.distinct("name", { 
      ownerUsername: decoded.username 
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
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
}
