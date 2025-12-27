import dbConnect from '@/lib/db';
import DonationShare from '@/models/DonationShare';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { creatorUsername, platform, donationId } = req.body;

    // Validate input
    if (!creatorUsername || !platform) {
      return res.status(400).json({ error: 'Creator username dan platform wajib diisi' });
    }

    const validPlatforms = ['whatsapp', 'twitter', 'facebook', 'telegram', 'copy', 'other'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Platform tidak valid' });
    }

    // Get current date in YYYY-MM-DD format (Indonesia timezone)
    const now = new Date();
    const indonesiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const date = indonesiaTime.toISOString().split('T')[0];

    // Create share record
    const shareData = {
      creatorUsername: creatorUsername.toLowerCase(),
      platform,
      date,
    };

    // Add donation reference if provided
    if (donationId) {
      shareData.donationId = donationId;
    }

    const share = await DonationShare.create(shareData);

    res.status(201).json({
      success: true,
      message: 'Share tracked successfully',
      share: {
        id: share._id,
        platform: share.platform,
        date: share.date
      }
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
