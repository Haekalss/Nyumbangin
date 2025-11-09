import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        error: 'Username hanya boleh huruf, angka, underscore, dan dash',
        available: false 
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ 
        error: 'Username harus 3-30 karakter',
        available: false 
      });
    }

    // Check if username exists
    const existingUser = await Creator.findOne({ 
      username: username.toLowerCase() 
    });

    if (existingUser) {
      return res.status(200).json({ available: false });
    }

    return res.status(200).json({ available: true });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
