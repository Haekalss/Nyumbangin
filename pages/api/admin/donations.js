import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Admin from '@/models/Admin';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    const token = authHeader.replace('Bearer ', '');

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'admin') {
      return res.status(401).json({ error: 'Token tidak valid - Admin required' });
    }

    // Verify admin exists
    const admin = await Admin.findById(decoded.userId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin tidak ditemukan' });
    }

    // Sanitize and parse limit
    let limit = 100;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 1000) {
        limit = parsedLimit;
      }
    }

    // Fetch all donations for admin
    const donations = await Donation.find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    // Calculate stats
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);

    // Group by creator
    const donationsByCreator = {};
    donations.forEach(donation => {
      const username = donation.createdByUsername || 'unknown';
      if (!donationsByCreator[username]) {
        donationsByCreator[username] = {
          count: 0,
          totalAmount: 0,
          donations: []
        };
      }
      donationsByCreator[username].count++;
      donationsByCreator[username].totalAmount += donation.amount || 0;
      donationsByCreator[username].donations.push(donation);
    });

    res.json({
      success: true,
      data: donations,
      stats: {
        totalDonations,
        totalAmount,
        donationsByCreator
      }
    });

  } catch (error) {
    console.error('Admin donations API error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      detail: error?.message || error 
    });
  }
}
