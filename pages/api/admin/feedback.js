import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import Admin from '@/models/Admin';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  try {
    await dbConnect();

    // Verify admin token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin only' });
    }

    // Verify admin exists and has permission
    const admin = await Admin.findById(payload.userId);
    if (!admin || !admin.hasPermission('VIEW_CONTACTS')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // GET - Ambil semua feedback
    if (req.method === 'GET') {
      const { status, search, limit = 50, page = 1 } = req.query;

      // Build query
      let query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [feedbacks, total] = await Promise.all([
        Contact.find(query)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip(skip)
          .lean(),
        Contact.countDocuments(query)
      ]);

      // Get counts by status
      const counts = await Contact.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);      const statusCounts = {
        all: total,
        unread: 0,
        read: 0
      };

      counts.forEach(({ _id, count }) => {
        statusCounts[_id] = count;
      });

      return res.status(200).json({
        success: true,
        data: feedbacks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        counts: statusCounts
      });
    }

    // PUT - Update status feedback
    if (req.method === 'PUT') {
      const { id, status, adminNotes } = req.body;      if (!id || !status) {
        return res.status(400).json({ error: 'ID dan status wajib diisi' });
      }

      const validStatuses = ['unread', 'read'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid' });
      }

      const updateData = { status };
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }

      const feedback = await Contact.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!feedback) {
        return res.status(404).json({ error: 'Feedback tidak ditemukan' });
      }

      return res.status(200).json({
        success: true,
        message: 'Status feedback berhasil diupdate',
        data: feedback
      });
    }

    // DELETE - Hapus feedback
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID wajib diisi' });
      }

      const feedback = await Contact.findByIdAndDelete(id);

      if (!feedback) {
        return res.status(404).json({ error: 'Feedback tidak ditemukan' });
      }

      return res.status(200).json({
        success: true,
        message: 'Feedback berhasil dihapus'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin feedback API error:', error);
    return res.status(500).json({ 
      error: 'Terjadi kesalahan server',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
