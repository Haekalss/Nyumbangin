import { signToken } from '@/lib/jwt';
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email required' });
    }

    // Get user from database
    const creator = await Creator.findById(userId);
    
    if (!creator) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify email matches
    if (creator.email !== email) {
      return res.status(400).json({ error: 'Email mismatch' });
    }

    // Generate token
    const token = signToken(creator, 'creator');

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: creator._id,
        email: creator.email,
        username: creator.username,
        displayName: creator.displayName,
        authProvider: creator.authProvider,
        userType: 'creator'
      }
    });
  } catch (error) {
    console.error('Error generating OAuth token:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
