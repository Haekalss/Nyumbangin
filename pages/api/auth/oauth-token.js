import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import { signToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await dbConnect();

    let user = null;
    let userType = null;

    // Check if it's an admin first (consistent with NextAuth)
    user = await Admin.findOne({ email });
    if (user) {
      userType = 'admin';
    } else {
      // Check if it's a creator
      user = await Creator.findOne({ email });
      if (user) {
        userType = 'creator';
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update login tracking
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Generate JWT with user type
    const token = signToken(user, userType);

    // Prepare response based on user type
    let responseUser = {};

    if (userType === 'creator') {
      responseUser = {
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        userType: 'creator',
        role: 'user',
        payoutSettings: user.payoutSettings,
        donationSettings: user.donationSettings,
        isPayoutReady: user.hasCompletePayoutSettings(),
        stats: user.stats
      };
    } else if (userType === 'admin') {
      responseUser = {
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        userType: 'admin',
        role: 'admin',
        adminRole: user.role,
        permissions: user.permissions,
        stats: user.stats
      };
    }

    res.status(200).json({
      success: true,
      token,
      user: responseUser
    });
  } catch (err) {
    console.error('OAuth token generation error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
