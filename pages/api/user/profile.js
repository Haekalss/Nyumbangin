import dbConnect from '../../../src/lib/db';
import User from '../../../src/models/User';
import { verifyToken } from '../../../src/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    const { displayName, username } = req.body;

    // Validate input
    if (!displayName || !username) {
      return res.status(400).json({ message: 'Nama tampilan dan username harus diisi' });
    }

    // Check if username already exists (except current user)
    const existingUser = await User.findOne({ 
      username: username,
      _id: { $ne: decoded.userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        displayName,
        username: username.toLowerCase()
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diupdate',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
