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

    // Hitung saldo PAID
    const totalPaid = await Donation.aggregate([
      { $match: { createdByUsername: username, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const saldo = totalPaid[0]?.total || 0;
    
    if (saldo < 50000) {
      return res.status(400).json({ error: 'Minimal pencairan Rp 50.000' });
    }

    // Cek apakah sudah ada payout pending
    const pending = await Payout.findOne({ 
      creatorUsername: username, 
      status: 'PENDING' 
    });
    if (pending) {
      return res.status(400).json({ error: 'Masih ada pencairan pending' });
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
      message: 'Permintaan pencairan berhasil dibuat',
      data: payout 
    });
  } catch (err) {
    console.error('Payout request error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
