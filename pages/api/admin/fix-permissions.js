// API endpoint untuk fix admin permissions
// Hanya bisa diakses oleh admin
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    const token = authHeader.replace('Bearer ', '');

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'admin') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Verify admin
    const requestingAdmin = await Admin.findById(decoded.userId);
    if (!requestingAdmin) {
      return res.status(403).json({ error: 'Admin tidak ditemukan' });
    }

    console.log('🔧 Fixing admin permissions...');

    // Get all admins
    const admins = await Admin.find({});
    console.log(`📋 Found ${admins.length} admin(s)`);

    const updates = [];

    for (const admin of admins) {
      // Get default permissions
      const correctPermissions = Admin.getDefaultPermissions();
      
      // Update permissions
      admin.permissions = correctPermissions;
      await admin.save();
      
      updates.push({
        username: admin.username,
        permissions: correctPermissions
      });
      
      console.log(`✅ Updated: ${admin.username}`);
    }

    console.log('🎉 All admin permissions updated!');

    return res.status(200).json({
      success: true,
      message: 'Semua admin permissions berhasil di-update',
      updates
    });
  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
}
