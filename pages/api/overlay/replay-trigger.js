// In-memory store for replay triggers (per username)
// This is a simple solution - for production with multiple instances, use Redis
const replayTriggers = new Map();

export default async function handler(req, res) {
  const { username, type } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, error: 'Username required' });
  }

  if (req.method === 'POST') {
    // Dashboard triggers a replay
    const { data } = req.body;
    
    if (!data || !type) {
      return res.status(400).json({ success: false, error: 'Data and type required' });
    }

    const trigger = {
      type, // 'notification' or 'mediashare'
      data,
      timestamp: Date.now()
    };

    // Store trigger for this username
    replayTriggers.set(`${username}-${type}`, trigger);

    // Auto-clear after 10 seconds
    setTimeout(() => {
      replayTriggers.delete(`${username}-${type}`);
    }, 10000);

    return res.status(200).json({ success: true, message: 'Replay trigger set' });
  }

  if (req.method === 'GET') {
    // Overlay checks for replay trigger
    if (!type) {
      return res.status(400).json({ success: false, error: 'Type required' });
    }

    const key = `${username}-${type}`;
    const trigger = replayTriggers.get(key);

    if (trigger && Date.now() - trigger.timestamp < 10000) {
      // Clear after reading (one-time trigger)
      replayTriggers.delete(key);
      return res.status(200).json({ success: true, trigger });
    }

    return res.status(200).json({ success: true, trigger: null });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
