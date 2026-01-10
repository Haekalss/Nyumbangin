import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import Donation from '@/models/donations';
import { verifyToken } from '@/lib/jwt';
import { sendPayoutApprovedEmail, sendPayoutRejectedEmail } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Admin: get all payout requests
    await dbConnect();
    
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    
    // Verify admin exists and has permission
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.hasPermission('MANAGE_PAYOUTS')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const payouts = await Payout.find().sort({ requestedAt: -1 }).populate('creatorId', 'username displayName email');
    return res.status(200).json({ success: true, data: payouts });
  }

  if (req.method === 'POST') {
    // Creator: request payout
    await dbConnect();
    const { username } = req.body;
    
    // Verify creator token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'creator') {
      return res.status(403).json({ error: 'Hanya creator yang bisa request payout' });
    }
    
    const creator = await Creator.findById(decoded.userId);
    if (!creator || creator.username !== username) {
      return res.status(404).json({ error: 'Creator tidak ditemukan atau tidak sesuai' });
    }

    // Check payout settings
    if (!creator.hasCompletePayoutSettings()) {
      return res.status(400).json({ error: 'Lengkapi data payout terlebih dahulu' });
    }

    // Hitung saldo PAID
    const totalPaid = await Donation.aggregate([
      { $match: { createdByUsername: username, status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const saldo = totalPaid[0]?.total || 0;
    if (saldo < 50000) return res.status(400).json({ error: 'Minimal pencairan Rp 50.000' });

    // Cek apakah sudah ada payout pending
    const pending = await Payout.findOne({ creatorId: creator._id, status: 'pending' });
    if (pending) return res.status(400).json({ error: 'Masih ada pencairan pending' });

    const payout = await Payout.create({
      creatorId: creator._id,
      creatorUsername: username,
      amount: saldo,
      status: 'pending',
    });
    return res.status(201).json({ success: true, data: payout });
  }

  if (req.method === 'PUT') {
    // Admin: process payout
    await dbConnect();
    
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    
    // Verify admin exists and has permission
    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.hasPermission('MANAGE_PAYOUTS')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { id, status, notes } = req.body;
    const payout = await Payout.findById(id).populate('creatorId');
    if (!payout) return res.status(404).json({ error: 'Payout tidak ditemukan' });
    
    payout.status = status;
    payout.processedAt = new Date();
    payout.processedBy = decoded.userId;
    payout.adminNote = notes;
    await payout.save();
    
    // Jika PROCESSED (sudah ditransfer ke bank), mark donasi dan kirim email
    if (status === 'PROCESSED') {
      // Mark semua donasi PAID yang belum dicairkan sebagai sudah dicairkan
      const updateResult = await Donation.updateMany(
        {
          createdByUsername: payout.creatorUsername,
          status: 'PAID',
          $or: [
            { isPaidOut: false },
            { isPaidOut: { $exists: false } }
          ]
        },
        {
          $set: {
            isPaidOut: true,
            paidOutAt: new Date(),
            payoutId: payout._id
          }
        }
      );
      
      console.log(`✅ Payout PROCESSED (Sudah ditransfer) for ${payout.creatorUsername}:`);
      console.log(`   - ${updateResult.modifiedCount} donations marked as paid out`);
      console.log(`   - Payout amount: Rp ${payout.amount.toLocaleString('id-ID')}`);
      
      // Kirim email notifikasi payout sudah ditransfer
      if (payout.creatorId?.email) {
        try {
          console.log(`📧 Attempting to send email to: ${payout.creatorId.email}`);
          console.log(`📧 SMTP configured: ${!!process.env.SMTP_USER}`);
          
          const emailResult = await sendPayoutApprovedEmail({
            creatorEmail: payout.creatorId.email,
            creatorName: payout.creatorId.displayName || payout.creatorId.username,
            amount: payout.amount,
            payoutReference: payout.payoutReference,
            bankInfo: {
              bankName: payout.creatorId.payoutSettings?.bankName,
              accountNumber: payout.creatorId.payoutSettings?.accountNumber,
              accountName: payout.creatorId.payoutSettings?.accountName,
            }
          });
          
          if (emailResult.success) {
            console.log(`✅ Email payout processed sent successfully to ${payout.creatorId.email}`);
          } else {
            console.error(`❌ Email failed to send: ${emailResult.error}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send payout processed email:', emailError.message);
          // Don't fail the request if email fails
        }
      } else {
        console.warn(`⚠️ Creator email not found for ${payout.creatorUsername}`);
      }
    }
    
    // Jika APPROVED (disetujui tapi belum ditransfer), hanya log
    if (status === 'APPROVED') {
      console.log(`✅ Payout APPROVED (Menunggu transfer) for ${payout.creatorUsername}`);
      console.log(`   - Payout amount: Rp ${payout.amount.toLocaleString('id-ID')}`);
      console.log(`   - Email akan dikirim setelah status PROCESSED`);
    }
    
    // Jika REJECTED, kirim email notifikasi penolakan
    if (status === 'REJECTED') {
      if (payout.creatorId?.email) {
        try {
          console.log(`📧 Attempting to send rejection email to: ${payout.creatorId.email}`);
          
          const emailResult = await sendPayoutRejectedEmail({
            creatorEmail: payout.creatorId.email,
            creatorName: payout.creatorId.displayName || payout.creatorId.username,
            amount: payout.amount,
            payoutReference: payout.payoutReference,
            reason: notes || 'Tidak ada keterangan dari admin.'
          });
          
          if (emailResult.success) {
            console.log(`✅ Email payout rejected sent successfully to ${payout.creatorId.email}`);
          } else {
            console.error(`❌ Email failed to send: ${emailResult.error}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send payout rejected email:', emailError.message);
          // Don't fail the request if email fails
        }
      } else {
        console.warn(`⚠️ Creator email not found for ${payout.creatorUsername}`);
      }
    }
    
    return res.status(200).json({ success: true, data: payout });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
