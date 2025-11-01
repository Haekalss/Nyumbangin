// TEST ENDPOINT - Manual update creator stats
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    console.log(`🧪 TEST: Updating stats for ${creator.username}`);

    // Update stats
    await creator.updateStats();

    console.log(`✅ TEST: Stats updated successfully`);
    console.log(`📊 Total donations:`, creator.stats.totalDonations);
    console.log(`💰 Total amount:`, creator.stats.totalAmount);
    console.log(`💸 Total payouts:`, creator.stats.totalPayouts);

    return res.status(200).json({
      success: true,
      message: 'Stats berhasil di-update',
      data: {
        username: creator.username,
        stats: {
          totalDonations: creator.stats.totalDonations,
          totalAmount: creator.stats.totalAmount,
          totalPayouts: creator.stats.totalPayouts,
          currentBalance: creator.stats.totalAmount // Saldo saat ini (belum di-payout)
        }
      }
    });
  } catch (error) {
    console.error('❌ TEST: Error updating stats:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
}
