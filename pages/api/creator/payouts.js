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
    
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenErr) {
      console.error('Token verification error:', tokenErr.message);
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    
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
    .lean(); // Use lean() to get plain objects instead of Mongoose documents
    
    // Manually populate processedBy if exists
    for (let payout of payouts) {
      if (payout.processedBy) {
        try {
          const Admin = require('@/models/Admin').default;
          const admin = await Admin.findById(payout.processedBy).select('username fullName').lean();
          payout.processedBy = admin || null;
        } catch (populateErr) {
          console.error('Error populating processedBy:', populateErr);
          payout.processedBy = null;
        }
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      data: payouts 
    });
  } catch (err) {
    console.error('Get creator payouts error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
