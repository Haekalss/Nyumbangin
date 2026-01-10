import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    const creator = await Creator.findById(decoded.userId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }

    const { mediaShareEnabled } = req.body;
    
    if (typeof mediaShareEnabled !== 'boolean') {
      return res.status(400).json({ error: 'mediaShareEnabled harus berupa boolean' });
    }

    // Update media share enabled status
    if (!creator.donationSettings) {
      creator.donationSettings = {};
    }
    creator.donationSettings.mediaShareEnabled = mediaShareEnabled;
    await creator.save();

    res.json({
      success: true,
      message: mediaShareEnabled ? 'Media Share berhasil diaktifkan' : 'Media Share berhasil dinonaktifkan',
      donationSettings: creator.donationSettings
    });
  } catch (error) {
    console.error('Error toggling media share:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
