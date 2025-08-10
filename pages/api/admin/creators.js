import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const creators = await User.find({ role: 'user' })
      .select('-password');
    res.json({ creators });
  } catch (e) {
    console.error('API /admin/creators error:', e);
    res.status(500).json({ error: 'Server error', detail: e?.message || e });
  }
}
