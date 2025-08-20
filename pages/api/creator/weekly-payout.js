import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import User from '@/models/User';
import Donation from '@/models/donations';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: 'Creator tidak ditemukan' });

  // Hitung saldo PAID minggu lalu
  const now = new Date();
  const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const totalPaid = await Donation.aggregate([
    { $match: { ownerUsername: username, status: 'PAID', createdAt: { $gte: lastWeek, $lte: now } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const saldo = totalPaid[0]?.total || 0;
  if (saldo < 50000) return res.status(400).json({ error: 'Minimal pencairan mingguan Rp 50.000' });

  // Cek apakah sudah ada payout pending minggu ini
  const pending = await Payout.findOne({ username, status: 'pending', requestedAt: { $gte: lastWeek } });
  if (pending) return res.status(400).json({ error: 'Sudah ada pencairan mingguan pending' });

  const payout = await Payout.create({
    creator: user._id,
    username,
    amount: saldo,
    status: 'pending',
  });
  return res.status(201).json({ success: true, data: payout });
}
