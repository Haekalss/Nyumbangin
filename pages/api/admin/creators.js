import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const payload = verifyToken(token);
    console.log('Admin creators API - Token payload:', payload);
    if (!payload || payload.userType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
      // Verify admin exists and has permission
    const admin = await Admin.findById(payload.userId);
    console.log('Admin creators API - Found admin:', admin ? { id: admin._id, role: admin.role, permissions: admin.permissions } : 'null');
    if (!admin || !admin.hasPermission('MANAGE_CREATORS')) {
      console.log('Admin creators API - Permission check failed:', { 
        hasAdmin: !!admin, 
        hasPermission: admin ? admin.hasPermission('MANAGE_CREATORS') : false 
      });
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const creators = await Creator.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ creators });
  } catch (e) {
    console.error('API /admin/creators error:', e);
    res.status(500).json({ error: 'Server error', detail: e?.message || e });
  }
}
