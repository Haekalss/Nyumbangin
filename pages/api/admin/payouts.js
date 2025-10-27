import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import Donation from '@/models/donations';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Admin: get all payout requests
    await dbConnect();
    
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    
    // Verify admin exists and has permission
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.hasPermission('manage_payouts')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const payouts = await Payout.find().sort({ requestedAt: -1 }).populate('creator', 'username displayName email');
    return res.status(200).json({ success: true, data: payouts });
  }

  if (req.method === 'POST') {
    // Creator: request payout
    await dbConnect();
    const { username } = req.body;
    
    // Verify creator token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(403).json({ error: 'Hanya creator yang bisa request payout' });
    }
    
    const creator = await Creator.findById(decoded.userId);
    if (!creator || creator.username !== username) {
      return res.status(404).json({ error: 'Creator tidak ditemukan atau tidak sesuai' });
    }

    // Check payout settings
    if (!creator.hasCompletePayoutSettings()) {
      return res.status(400).json({ error: 'Lengkapi data payout terlebih dahulu' });
    }

    // Hitung saldo PAID
    const totalPaid = await Donation.aggregate([
      { $match: { createdByUsername: username, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const saldo = totalPaid[0]?.total || 0;
    if (saldo < 50000) return res.status(400).json({ error: 'Minimal pencairan Rp 50.000' });

    // Cek apakah sudah ada payout pending
    const pending = await Payout.findOne({ creatorId: creator._id, status: 'pending' });
    if (pending) return res.status(400).json({ error: 'Masih ada pencairan pending' });

    const payout = await Payout.create({
      creatorId: creator._id,
      username,
      amount: saldo,
      status: 'pending',
    });
    return res.status(201).json({ success: true, data: payout });
  }

  if (req.method === 'PUT') {
    // Admin: process payout
    await dbConnect();
    
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    
    // Verify admin exists and has permission
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.hasPermission('process_payouts')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { id, status, notes } = req.body;
    const payout = await Payout.findById(id);
    if (!payout) return res.status(404).json({ error: 'Payout tidak ditemukan' });
    
    payout.status = status;
    payout.processedAt = new Date();
    payout.processedBy = decoded.userId;
    payout.notes = notes;
    await payout.save();
    
    return res.status(200).json({ success: true, data: payout });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
