import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';

const PLATFORM_FEE_PERCENTAGE = 5; // 5%

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

    // Hitung saldo PAID minggu lalu (exclude PENDING)
    const now = new Date();
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const totalPaid = await Donation.aggregate([
      { $match: { createdByUsername: username, status: 'PAID', createdAt: { $gte: lastWeek, $lte: now } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const grossAmount = totalPaid[0]?.total || 0;
    
    // Hitung platform fee dan net amount
    const platformFee = Math.floor(grossAmount * (PLATFORM_FEE_PERCENTAGE / 100));
    const netAmount = grossAmount - platformFee;
    
    if (netAmount < 50000) {
      return res.status(400).json({ error: 'Minimal pencairan mingguan Rp 50.000 (setelah platform fee)' });
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
      amount: netAmount, // Amount setelah platform fee
      platformFee: platformFee, // Simpan platform fee
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
      data: {
        ...payout.toObject(),
        grossAmount,
        platformFee,
        netAmount
      }
    });
  } catch (err) {
    console.error('Weekly payout error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
