import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;

  try {
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT with username
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      success: true,
      token, 
      user: { 
        email: user.email, 
        username: user.username,
        displayName: user.displayName,
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
