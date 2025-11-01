// API endpoint untuk fix admin permissions
// Hanya bisa diakses oleh SUPER_ADMIN
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify SUPER_ADMIN token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    const token = authHeader.replace('Bearer ', '');

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'admin') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    // Verify super admin
    const requestingAdmin = await Admin.findById(decoded.userId);
    if (!requestingAdmin || requestingAdmin.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Hanya SUPER_ADMIN yang bisa menjalankan ini' });
    }

    console.log('🔧 Fixing admin permissions...');

    // Get all admins
    const admins = await Admin.find({});
    console.log(`📋 Found ${admins.length} admin(s)`);

    const updates = [];

    for (const admin of admins) {
      // Get correct permissions for role
      const correctPermissions = Admin.getDefaultPermissions(admin.role);
      
      // Update permissions
      admin.permissions = correctPermissions;
      await admin.save();
      
      updates.push({
        username: admin.username,
        role: admin.role,
        permissions: correctPermissions
      });
      
      console.log(`✅ Updated: ${admin.username} (${admin.role})`);
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
