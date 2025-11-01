import dbConnect from '@/lib/db';
import MediaShare from '@/models/MediaShare';
import Donation from '@/models/donations';
import Creator from '@/models/Creator';
import { verifyToken } from '@/lib/jwt';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Get media share queue for creator
    try {
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({ error: 'Username diperlukan' });
      }

      // Get pending and playing media shares
      const mediaShares = await MediaShare.find({
        createdByUsername: username.toLowerCase(),
        status: { $in: ['PENDING', 'PLAYING'] },
        isApproved: true
      })
      .sort({ queuePosition: 1, createdAt: 1 })
      .limit(50);

      return res.status(200).json({
        success: true,
        data: mediaShares,
        total: mediaShares.length
      });
    } catch (err) {
      console.error('Get media share error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    // Create new media share (from donation)
    try {
      const { donationId, youtubeUrl, duration, message } = req.body;

      if (!donationId || !youtubeUrl) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }

      // Validate YouTube URL
      const videoId = MediaShare.extractVideoId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ error: 'URL YouTube tidak valid' });
      }

      // Get donation
      const donation = await Donation.findById(donationId);
      if (!donation) {
        return res.status(404).json({ error: 'Donasi tidak ditemukan' });
      }

      if (donation.status !== 'PAID') {
        return res.status(400).json({ error: 'Donasi belum dibayar' });
      }

      // Check if media share already exists for this donation
      const existing = await MediaShare.findOne({ donationId });
      if (existing) {
        return res.status(400).json({ error: 'Media share sudah dibuat untuk donasi ini' });
      }

      // Calculate max duration based on amount
      const maxDuration = MediaShare.calculateMaxDuration(donation.amount);
      const requestedDuration = Math.min(duration || maxDuration, maxDuration);

      // Get creator
      const creator = await Creator.findOne({ username: donation.createdByUsername });
      if (!creator) {
        return res.status(404).json({ error: 'Creator tidak ditemukan' });
      }

      // Get current queue position
      const lastInQueue = await MediaShare.findOne({
        createdByUsername: donation.createdByUsername,
        status: { $in: ['PENDING', 'PLAYING'] }
      }).sort({ queuePosition: -1 });

      const queuePosition = lastInQueue ? lastInQueue.queuePosition + 1 : 1;

      // Create media share
      const mediaShare = await MediaShare.create({
        donationId: donation._id,
        createdBy: creator._id,
        createdByUsername: donation.createdByUsername,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        amount: donation.amount,
        youtubeUrl,
        videoId,
        requestedDuration,
        message: message || '',
        merchant_ref: donation.merchant_ref,
        queuePosition,
        isApproved: creator.mediaShareSettings?.autoApprove !== false
      });

      return res.status(201).json({
        success: true,
        message: 'Media share berhasil dibuat',
        data: mediaShare
      });
    } catch (err) {
      console.error('Create media share error:', err);
      return res.status(500).json({ error: err.message || 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    // Update media share status
    try {
      const { id, status, actualDuration } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
      }

      const mediaShare = await MediaShare.findById(id);
      if (!mediaShare) {
        return res.status(404).json({ error: 'Media share tidak ditemukan' });
      }

      // Update status
      mediaShare.status = status;
      if (actualDuration) {
        mediaShare.actualDuration = actualDuration;
      }
      if (status === 'PLAYED' || status === 'SKIPPED') {
        mediaShare.playedAt = new Date();
      }

      await mediaShare.save();

      return res.status(200).json({
        success: true,
        message: 'Status media share diupdate',
        data: mediaShare
      });
    } catch (err) {
      console.error('Update media share error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete/skip media share (creator only)
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
      }

      const decoded = verifyToken(token);
      if (!decoded || decoded.userType !== 'creator') {
        return res.status(403).json({ error: 'Hanya creator yang bisa skip media share' });
      }

      const { id, reason } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID media share diperlukan' });
      }

      const mediaShare = await MediaShare.findById(id);
      if (!mediaShare) {
        return res.status(404).json({ error: 'Media share tidak ditemukan' });
      }

      // Verify creator owns this media share
      const creator = await Creator.findById(decoded.userId);
      if (!creator || creator.username !== mediaShare.createdByUsername) {
        return res.status(403).json({ error: 'Akses ditolak' });
      }

      // Mark as skipped
      await mediaShare.markAsSkipped(reason || 'Skipped by creator');

      return res.status(200).json({
        success: true,
        message: 'Media share di-skip'
      });
    } catch (err) {
      console.error('Skip media share error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
