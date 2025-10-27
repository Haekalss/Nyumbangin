import { verifyToken } from './jwt';
import dbConnect from './db';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';

export async function authMiddleware(req, res, next, requireRole = null) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    await dbConnect();
    const decoded = verifyToken(token);
    
    let user = null;
    let userType = null;

    // Check if it's a creator first
    user = await Creator.findById(decoded.id).select('-password');
    if (user) {
      userType = 'creator';
    } else {
      // Check if it's an admin
      user = await Admin.findById(decoded.id).select('-password');
      if (user) {
        userType = 'admin';
      }
    }

    if (!user) return res.status(401).json({ error: 'Invalid token user' });

    // Role checking for backwards compatibility
    if (requireRole) {
      if (requireRole === 'admin' && userType !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      if (requireRole === 'user' && userType !== 'creator') {
        return res.status(403).json({ error: 'Forbidden: Creator access required' });
      }
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Helper function for creator-only routes
export async function requireCreator(req, res, next) {
  return authMiddleware(req, res, next, 'user'); // 'user' maps to creator for backwards compatibility
}

// Helper function for admin-only routes
export async function requireAdmin(req, res, next) {
  return authMiddleware(req, res, next, 'admin');
}

// Helper function to get user (creator or admin) by token
export async function getUserFromToken(token) {
  try {
    await dbConnect();
    const decoded = verifyToken(token);
    
    // Try creator first
    let user = await Creator.findById(decoded.id).select('-password');
    if (user) {
      return { user, type: 'creator' };
    }
    
    // Try admin
    user = await Admin.findById(decoded.id).select('-password');
    if (user) {
      return { user, type: 'admin' };
    }
    
    return null;
  } catch (err) {
    return null;
  }
}
