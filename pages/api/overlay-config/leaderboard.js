import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  try {
    await dbConnect();
    
    // Check if creator exists
    const creator = await Creator.findOne({ username });
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // Return leaderboard-specific configuration from creator settings or default
    const leaderboardConfig = creator.overlaySettings?.leaderboard || {
      showLeaderboard: true,
      leaderboardSize: "medium",
      leaderboardPosition: "top-right",
      maxItems: 5,
      refreshInterval: 60000
    };

    res.status(200).json(leaderboardConfig);
  } catch (error) {
    console.error('Error fetching leaderboard config:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
