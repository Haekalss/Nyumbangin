import { verifyToken } from './jwt';
import dbConnect from './db';
import User from '@/models/User';

export async function authMiddleware(req, res, next, requireRole = null) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    await dbConnect();
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ error: 'Invalid token user' });

    if (requireRole && user.role !== requireRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
