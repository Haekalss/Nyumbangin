export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  try {
    // Return default configuration for any username
    // This allows the overlay to work even if the user doesn't exist yet
    // Can be enhanced later to store user-specific settings in database
    const overlayConfig = {
      showLeaderboard: true,
      leaderboardSize: "medium",
      leaderboardPosition: "top-right"
    };

    res.status(200).json(overlayConfig);
  } catch (error) {
    console.error('Error fetching overlay config:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
