import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    await dbConnect();
    const { username } = req.body;
    
    const creator = await Creator.findOne({ username });
    if (!creator) return res.status(404).json({ error: 'Creator tidak ditemukan' });

    // Check if payout settings are complete
    if (!creator.hasCompletePayoutSettings()) {
      return res.status(400).json({ error: 'Lengkapi data bank terlebih dahulu' });
    }

    // Hitung saldo PAID minggu lalu
    const now = new Date();
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const totalPaid = await Donation.aggregate([
      { $match: { createdByUsername: username, status: 'PAID', createdAt: { $gte: lastWeek, $lte: now } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const saldo = totalPaid[0]?.total || 0;
    
    if (saldo < 50000) {
      return res.status(400).json({ error: 'Minimal pencairan mingguan Rp 50.000' });
    }

    // Cek apakah sudah ada payout pending minggu ini
    const pending = await Payout.findOne({ 
      creatorUsername: username, 
      status: 'PENDING', 
      requestedAt: { $gte: lastWeek } 
    });
    if (pending) {
      return res.status(400).json({ error: 'Sudah ada pencairan mingguan pending' });
    }

    const payout = await Payout.create({
      creatorId: creator._id,
      creatorUsername: username,
      amount: saldo,
      status: 'PENDING',
      bankInfo: {
        bankName: creator.payoutSettings.bankName,
        accountNumber: creator.payoutSettings.accountNumber,
        accountName: creator.payoutSettings.accountName
      }
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Permintaan pencairan mingguan berhasil dibuat',
      data: payout 
    });
  } catch (err) {
    console.error('Weekly payout error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
