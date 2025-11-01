import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import Creator from '@/models/Creator';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Verify creator token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(403).json({ error: 'Akses ditolak - Hanya untuk creator' });
    }
    
    // Get creator
    const creator = await Creator.findById(decoded.userId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }
    
    // Get creator's payouts
    const payouts = await Payout.find({ 
      creatorUsername: creator.username 
    })
    .sort({ requestedAt: -1 })
    .populate('processedBy', 'username fullName');
    
    return res.status(200).json({ 
      success: true, 
      data: payouts 
    });
  } catch (err) {
    console.error('Get creator payouts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
