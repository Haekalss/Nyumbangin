import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import jwt from 'jsonwebtoken';

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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    if (!decoded || !decoded.username) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Sanitize and parse limit
    let limit = 50;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit);
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
        limit = parsedLimit;
      }
    }

    // Only fetch donations for the authenticated creator
    const donations = await Donation.find({ ownerUsername: decoded.username })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
