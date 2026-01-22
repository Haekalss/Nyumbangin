import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ error: 'Email dan token wajib diisi' });

  try {
    await dbConnect();
    const creator = await Creator.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: token
    });

    if (!creator) {
      return res.status(400).json({ error: 'Kode OTP tidak valid untuk email ini' });
    }

    if (!creator.resetPasswordExpires || creator.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Kode OTP telah kadaluarsa' });
    }

    return res.status(200).json({
      success: true,
      message: 'Kode OTP valid',
      email: creator.email
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}