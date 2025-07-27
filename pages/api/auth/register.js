import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, username, displayName, description } = req.body;

  if (!email || !password || !username || !displayName) {
    return res.status(400).json({ error: 'Email, password, username, dan display name wajib diisi' });
  }

  // Validate username format (alphanumeric, underscore, dash only)
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ 
      error: 'Username hanya boleh berisi huruf, angka, underscore, dan dash' 
    });
  }

  try {
    await dbConnect();
    
    // Check if email or username already exists
    const existing = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }]
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: existing.email === email ? 'Email sudah terdaftar' : 'Username sudah digunakan'
      });
    }

    const user = await User.create({ 
      email, 
      password, 
      username: username.toLowerCase(),
      displayName,
      description: description || '',
      role: 'admin' // Semua user adalah creator/admin
    });

    res.status(201).json({ 
      success: true, 
      message: 'Creator berhasil didaftarkan',
      user: { 
        email: user.email, 
        username: user.username,
        displayName: user.displayName,
        role: user.role 
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
