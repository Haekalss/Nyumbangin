import dbConnect from '../../../src/lib/db';
import Creator from '../../../src/models/Creator';
import Admin from '../../../src/models/Admin';
import { verifyToken } from '../../../src/lib/jwt';
import bcrypt from 'bcryptjs';

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

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Password lama dan baru harus diisi' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    // Find user by ID and type
    let user;
    if (decoded.userType === 'admin') {
      user = await Admin.findById(decoded.userId);
    } else {
      user = await Creator.findById(decoded.userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Password lama tidak benar' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password based on user type
    if (decoded.userType === 'admin') {
      await Admin.findByIdAndUpdate(decoded.userId, {
        password: hashedNewPassword
      });
    } else {
      await Creator.findByIdAndUpdate(decoded.userId, {
        password: hashedNewPassword
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
