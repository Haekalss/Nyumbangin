import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Creator from '@/models/Creator';
import { verifyToken } from '@/lib/jwt';

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
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Verify creator exists
    const creator = await Creator.findById(decoded.userId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }

    // Find donation and verify ownership
    const donation = await Donation.findOne({
      _id: id,
      createdByUsername: creator.username // Pastikan hanya owner yang bisa akses
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donasi tidak ditemukan atau Anda tidak memiliki akses' });
    }

    if (req.method === 'PATCH') {
      // Set status donasi langsung PAID (simulasi, tidak ada UNPAID)
      donation.status = 'PAID';
      await donation.save();

      // Notification will be picked up by polling system
      console.log('✅ Donation updated to PAID:', donation._id);
      console.log('💡 Overlay will detect this via polling');

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
    

    
    res.status(500).json({ error: 'Server error' });
  }
}
