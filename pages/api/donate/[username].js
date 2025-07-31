import dbConnect from '@/lib/db';
import User from '@/models/User';
import Donation from '@/models/donations';

// Generate unique merchant reference
function generateMerchantRef() {
  return 'DON' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

export default async function handler(req, res) {
  const { username } = req.query;

  if (req.method === 'GET') {
    // Get creator profile and their donations
    try {
      await dbConnect();

      const creator = await User.findOne({ 
        username: username.toLowerCase() 
      }).select('-password');

      if (!creator) {
        return res.status(404).json({ error: 'Creator tidak ditemukan' });
      }

      // Get donations for this creator
      // If 'all=true' parameter is passed, return all donations (for leaderboard calculation)
      // Otherwise, return only recent 10 donations (for public display)
      const isAllRequested = req.query.all === 'true';
      
      let donationsQuery = Donation.find({ 
        ownerUsername: creator.username,
        status: 'PAID' // Only show paid donations publicly
      })
      .sort({ createdAt: -1 })
      .select('name amount message createdAt');
      
      // Apply limit only if not requesting all donations
      if (!isAllRequested) {
        donationsQuery = donationsQuery.limit(10);
      }
      
      const donations = await donationsQuery;

      // Get stats for this creator
      const stats = await Donation.aggregate([
        { $match: { ownerUsername: creator.username, status: 'PAID' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDonations: { $sum: 1 },
            uniqueDonors: { $addToSet: '$name' }
          }
        }
      ]);

      const creatorStats = stats[0] || { totalAmount: 0, totalDonations: 0, uniqueDonors: [] };

      res.json({
        success: true,
        creator: {
          username: creator.username,
          displayName: creator.displayName,
          description: creator.description
        },
        donations,
        stats: {
          totalAmount: creatorStats.totalAmount,
          totalDonations: creatorStats.totalDonations,
          uniqueDonors: creatorStats.uniqueDonors.length
        }
      });
    } catch (error) {
      console.error('Error fetching creator data:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  else if (req.method === 'POST') {
    // Create donation for specific creator
    try {
      await dbConnect();

      const creator = await User.findOne({ 
        username: username.toLowerCase() 
      });

      if (!creator) {
        return res.status(404).json({ error: 'Creator tidak ditemukan' });
      }

      const { name, amount, message = '' } = req.body;

      if (!name || !amount) {
        return res.status(400).json({ error: 'Nama dan jumlah donasi wajib diisi' });
      }

      if (amount < 1000) {
        return res.status(400).json({ error: 'Minimal donasi Rp 1.000' });
      }

      const donation = await Donation.create({
        name,
        amount: parseInt(amount),
        message,
        merchant_ref: generateMerchantRef(),
        owner: creator._id,
        ownerUsername: creator.username,
        status: 'PAID' // Donasi baru langsung PAID
      });

      // Kirim notifikasi ke socket server Railway dan lokal
      try {
        // Emit ke socket lokal jika tersedia
        if (global._io) {
          global._io.emit('new-donation', {
            name: donation.name,
            amount: donation.amount,
            message: donation.message,
            createdAt: donation.createdAt,
            ownerUsername: creator.username
          });
          console.log('Local socket notification sent');
        }

        // Kirim juga ke socket server Railway sebagai backup
        await fetch('https://socket-server-production-03be.up.railway.app/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: donation.name,
            amount: donation.amount,
            message: donation.message,
            createdAt: donation.createdAt,
            ownerUsername: creator.username
          })
        });
        console.log('External socket notification sent');
      } catch (err) {
        console.error('Gagal kirim notifikasi ke socket server:', err);
      }

      res.status(201).json({
        success: true,
        message: 'Donasi berhasil dibuat',
        donation: {
          id: donation._id,
          name: donation.name,
          amount: donation.amount,
          message: donation.message,
          merchant_ref: donation.merchant_ref,
          createdAt: donation.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating donation:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
