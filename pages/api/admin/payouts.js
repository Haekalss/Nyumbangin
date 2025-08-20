import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import User from '@/models/User';
import Donation from '@/models/donations';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Admin: get all payout requests
    await dbConnect();
    const payouts = await Payout.find().sort({ requestedAt: -1 }).populate('creator', 'username displayName email');
    return res.status(200).json({ success: true, data: payouts });
  }

  if (req.method === 'POST') {
    // Creator: request payout
    await dbConnect();
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Creator tidak ditemukan' });

    // Hitung saldo PAID
    const totalPaid = await Donation.aggregate([
      { $match: { ownerUsername: username, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const saldo = totalPaid[0]?.total || 0;
    if (saldo < 50000) return res.status(400).json({ error: 'Minimal pencairan Rp 50.000' });

    // Cek apakah sudah ada payout pending
    const pending = await Payout.findOne({ username, status: 'pending' });
    if (pending) return res.status(400).json({ error: 'Masih ada pencairan pending' });

    const payout = await Payout.create({
      creator: user._id,
      username,
      amount: saldo,
      status: 'pending',
    });
    return res.status(201).json({ success: true, data: payout });
  }

  if (req.method === 'PUT') {
    // Admin: process payout
    await dbConnect();
    const { id, status, notes } = req.body;
    const payout = await Payout.findById(id);
    if (!payout) return res.status(404).json({ error: 'Payout tidak ditemukan' });
    payout.status = status;
    payout.processedAt = new Date();
    payout.notes = notes;
    await payout.save();
    return res.status(200).json({ success: true, data: payout });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
