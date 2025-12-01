import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, username, displayName, bio } = req.body;

  if (!email || !password || !username || !displayName) {
    return res.status(400).json({ error: 'Email, password, username, dan display name wajib diisi' });
  }

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ 
      error: 'Username hanya boleh berisi huruf, angka, underscore, dan dash' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  try {
    await dbConnect();
    
    // Check if email or username already exists
    const existing = await Creator.findOne({
      $or: [{ email }, { username: username.toLowerCase() }]
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: existing.email === email 
          ? 'Email sudah terdaftar' 
          : 'Username sudah digunakan'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const creator = await Creator.create({ 
      email, 
      password: hashedPassword, 
      username: username.toLowerCase(),
      displayName,
      bio: bio || '',
      isActive: true
    });

    res.status(201).json({ 
      success: true, 
      message: 'Creator berhasil didaftarkan',
      user: { 
        email: creator.email, 
        username: creator.username,
        displayName: creator.displayName,
        bio: creator.bio,
        userType: 'creator',
        role: 'user',
        payoutSettings: creator.payoutSettings,
        donationSettings: creator.donationSettings,
        isPayoutReady: creator.hasCompletePayoutSettings(),
        stats: creator.stats
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
