import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ error: 'Email, token, dan password wajib diisi' });
  if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

  try {
    await dbConnect();
    const creator = await Creator.findOne({ email: email.toLowerCase(), resetPasswordToken: token });
    if (!creator) return res.status(400).json({ error: 'Token tidak valid atau email tidak ditemukan' });

    if (!creator.resetPasswordExpires || creator.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Token reset password telah kadaluarsa' });
    }

    const hashed = await bcrypt.hash(password, 10);
    creator.password = hashed;
    creator.resetPasswordToken = null;
    creator.resetPasswordExpires = null;
    await creator.save();

    return res.status(200).json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
