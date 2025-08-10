import dbConnect from '../../../src/lib/db';
import User from '../../../src/models/User';
import { verifyToken } from '../../../src/lib/jwt';

export default async function handler(req, res) {
  if (!['PUT','GET'].includes(req.method)) {
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

    if (req.method === 'GET') {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
      return res.status(200).json({ success: true, user });
    }

    const { displayName, username, payoutBankName, payoutAccountNumber, payoutAccountHolder } = req.body;

    // Validate input
    if (!displayName || !username) {
      return res.status(400).json({ message: 'Nama tampilan dan username harus diisi' });
    }

    // Ambil user dulu agar bisa cek apakah payout sudah terkunci
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) return res.status(404).json({ message: 'User tidak ditemukan' });

    // Check if username already exists (except current user)
    const existingUser = await User.findOne({ 
      username: username,
      _id: { $ne: decoded.userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Update basic fields
    currentUser.displayName = displayName;
    currentUser.username = username.toLowerCase();

    const payoutAlreadySet = !!(currentUser.payoutAccountNumber || currentUser.payoutAccountHolder || currentUser.payoutBankName);

  if (payoutAlreadySet) {
      // Jika user mencoba mengubah payout fields setelah terkunci
      const tryingToChange = (
        (payoutBankName && payoutBankName !== currentUser.payoutBankName) ||
        (payoutAccountNumber && payoutAccountNumber !== currentUser.payoutAccountNumber) ||
        (payoutAccountHolder && payoutAccountHolder !== currentUser.payoutAccountHolder)
      );
      if (tryingToChange) {
        return res.status(400).json({ message: 'Data rekening sudah dikunci dan tidak bisa diubah. Hubungi support jika perlu perubahan.' });
      }
      // Jika ada request kosong, abaikan (jangan mengosongkan)
    } else {
      // Pertama kali set (hanya kalau ada isi minimal nomor & holder)
      if (payoutAccountNumber && payoutAccountHolder) {
        // Validasi nomor rekening hanya angka
        if (!/^\d+$/.test(payoutAccountNumber)) {
          return res.status(400).json({ message: 'Nomor rekening hanya boleh berisi angka' });
        }
        currentUser.payoutBankName = payoutBankName || '';
        currentUser.payoutAccountNumber = payoutAccountNumber;
        currentUser.payoutAccountHolder = payoutAccountHolder;
      } else if (payoutBankName || payoutAccountNumber || payoutAccountHolder) {
        // Partial fill not allowed
        return res.status(400).json({ message: 'Lengkapi semua field rekening (Bank/Channel, Nomor, Nama Pemilik) sekaligus.' });
      }
    }

    await currentUser.save();
    const sanitized = currentUser.toObject();
    delete sanitized.password;

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diupdate',
      user: sanitized
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
