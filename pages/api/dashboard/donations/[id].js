import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    await dbConnect();

    // Get token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.username) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Find donation and verify ownership
    const donation = await Donation.findOne({
      _id: id,
      ownerUsername: decoded.username // Pastikan hanya owner yang bisa akses
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donasi tidak ditemukan atau Anda tidak memiliki akses' });
    }

    if (req.method === 'PATCH') {
      // Set status donasi langsung PAID (simulasi, tidak ada UNPAID)
      donation.status = 'PAID';
      await donation.save();

      // Kirim notifikasi ke socket server Railway setiap donasi diupdate
      try {
        await fetch('https://socket-server-production-03be.up.railway.app/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: donation.name,
            amount: donation.amount,
            message: donation.message,
            createdAt: donation.createdAt
          })
        });
      } catch (err) {
        console.error('Gagal kirim notifikasi ke socket server:', err);
      }

      res.json({
        success: true,
        message: 'Donasi berhasil diproses',
        donation
      });
    }
    else if (req.method === 'DELETE') {
      // Delete donation
      await Donation.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Donasi berhasil dihapus'
      });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling donation:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
}
