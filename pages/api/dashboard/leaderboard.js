import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Creator from '@/models/Creator';
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
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Verify creator exists
    const creator = await Creator.findById(decoded.userId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }

    // For leaderboard, fetch ALL donations from ALL users
    // No ownerUsername filter - this is global leaderboard
    const donations = await Donation.find({})
      .sort({ createdAt: -1 })
      .limit(1000);

    return res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
