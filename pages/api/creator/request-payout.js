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

    // Hitung saldo PAID saja yang belum dicairkan (exclude PENDING dan yang sudah isPaidOut)
    const totalPaid = await Donation.aggregate([
      { 
        $match: { 
          createdByUsername: username, 
          status: 'PAID',
          $or: [
            { isPaidOut: false },
            { isPaidOut: { $exists: false } }
          ]
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const grossAmount = totalPaid[0]?.total || 0;
    
    // Hitung platform fee dan net amount
    const platformFee = Math.floor(grossAmount * (PLATFORM_FEE_PERCENTAGE / 100));
    const netAmount = grossAmount - platformFee;
    
    // Available balance = netAmount (tidak perlu dikurangi totalProcessed lagi karena sudah filter isPaidOut)
    const availableBalance = netAmount;
    
    if (availableBalance < 50000) {
      return res.status(400).json({ error: 'Minimal pencairan Rp 50.000 (setelah platform fee)' });
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
      amount: availableBalance, // Amount setelah platform fee dan dikurangi payout processed
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
      message: 'Permintaan pencairan berhasil dibuat',
      data: {
        ...payout.toObject(),
        grossAmount,
        platformFee,
        netAmount,
        availableBalance
      }
    });
  } catch (err) {
    console.error('Payout request error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
