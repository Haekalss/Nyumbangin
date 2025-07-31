export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  try {
    // Return leaderboard-specific configuration
    const leaderboardConfig = {
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
