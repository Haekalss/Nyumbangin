import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await dbConnect();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Verify admin exists and has permission
    const admin = await Admin.findById(payload.userId);
    if (!admin || !admin.hasPermission('manage_creators')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { id } = req.query;
    const creator = await Creator.findById(id);
    if (!creator) return res.status(404).json({ error: 'Creator not found' });
    
    await Creator.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}
