export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required' });
  }

  try {
    // Return notifications-specific configuration
    const notificationsConfig = {
      showNotifications: true,
      notificationPosition: "top-right",
      notificationDuration: 5000,
      soundEnabled: true,
      soundVolume: 0.7,
      animationStyle: "slide"
    };

    res.status(200).json(notificationsConfig);
  } catch (error) {
    console.error('Error fetching notifications config:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
