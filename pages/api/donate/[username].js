import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';
import FilteredWords from '@/models/FilteredWords';
import { getSnap } from '@/lib/midtrans';
import { filterMessage } from '@/utils/messageFilter';

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

      const creator = await Creator.findOne({ 
        username: username.toLowerCase() 
      }).select('-password');

      if (!creator) {
        return res.status(404).json({ error: 'Creator tidak ditemukan' });
      }

      // Cek apakah creator sudah mengisi data payout (rekening / e-wallet)
      const payoutReady = creator.hasCompletePayoutSettings();
      if (!payoutReady) {
        return res.status(403).json({ error: 'Creator belum mengaktifkan donasi' });
      }

      // Cek apakah donasi dinonaktifkan oleh creator
      if (!creator.donationSettings?.isEnabled) {
        return res.status(200).json({ 
          success: false,
          error: 'Donasi sedang tidak aktif',
          disabled: true,
          creator: {
            username: creator.username,
            displayName: creator.displayName,
            description: creator.bio
          }
        });
      }

      // Get donations for this creator
      // If 'all=true' parameter is passed, return all donations (for leaderboard calculation)
      // Otherwise, return only recent 10 donations (for public display)
      const isAllRequested = req.query.all === 'true';
      
      let donationsQuery = Donation.find({ 
        createdByUsername: creator.username,
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
        { $match: { createdByUsername: creator.username, status: 'PAID' } },
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
          description: creator.bio,
          donationSettings: {
            mediaShareEnabled: creator.donationSettings?.mediaShareEnabled !== false
          }
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

      const creator = await Creator.findOne({ 
        username: username.toLowerCase() 
      });

      if (!creator) {
        return res.status(404).json({ error: 'Creator tidak ditemukan' });
      }

      const payoutReady = creator.hasCompletePayoutSettings();
      if (!payoutReady) {
        return res.status(403).json({ error: 'Creator belum mengaktifkan donasi' });
      }

      // Cek apakah donasi dinonaktifkan oleh creator
      if (!creator.donationSettings?.isEnabled) {
        return res.status(403).json({ 
          error: 'Donasi sedang tidak aktif',
          disabled: true 
        });
      }

  const { name, amount, message = '', mediaShare, payment_method } = req.body;

      if (!name || amount === undefined || amount === null) {
        return res.status(400).json({ error: 'Nama dan jumlah donasi wajib diisi' });
      }

      const numericAmount = parseInt(amount);
      if (isNaN(numericAmount) || numericAmount < 1) {
        return res.status(400).json({ error: 'Minimal donasi Rp 1' });
      }

  // Filter message untuk kata-kata kasar
  const filteredWordsDoc = await FilteredWords.findOne({ creatorId: creator._id });
  const filteredWords = filteredWordsDoc?.words || [];
  const filteredMessage = filterMessage(message, filteredWords);

  const merchantRef = generateMerchantRef();

  // Flow Midtrans real (selalu PENDING dulu, menunggu webhook)
      const donationData = {
        name,
        amount: parseInt(amount),
        message: filteredMessage, // Simpan message yang sudah difilter
        merchant_ref: merchantRef,
        createdBy: creator._id,
        createdByUsername: creator.username,
        status: 'PENDING'
      };

      // Add media share request if enabled
      if (mediaShare && mediaShare.enabled && mediaShare.youtubeUrl) {
        donationData.mediaShareRequest = {
          enabled: true,
          youtubeUrl: mediaShare.youtubeUrl.trim(), // ✅ Trim whitespace
          duration: mediaShare.duration || 30,
          processed: false
        };
      }

      // If payment_method is gopay-merchant, do not initiate Midtrans.
      // Instead return a static QR image and keep donation in PENDING state.
      let donation = null;
      if (payment_method === 'gopay-merchant') {
        donationData.paymentMethod = 'gopay-merchant';
        donationData.status = 'PENDING';
        donation = await Donation.create(donationData);

        return res.status(201).json({
          success: true,
          message: 'Donasi dibuat. Silakan scan QR untuk membayar.',
          donation: {
            _id: donation._id,
            id: donation._id,
            name: donation.name,
            amount: donation.amount,
            message: donation.message,
            merchant_ref: donation.merchant_ref,
            createdAt: donation.createdAt,
            status: donation.status
          },
          payment: {
            qr_image: '/qris/nyumbangin.png'
          }
        });
      }

      donation = await Donation.create(donationData);

      // Inisiasi transaksi Midtrans Snap
      let snapToken = null;
      let redirectUrl = null;
      try {
        const snap = getSnap();
        const parameter = {
          transaction_details: {
            order_id: merchantRef,
            gross_amount: donation.amount
          },
          customer_details: {
            first_name: name,
          },
          item_details: [
            {
              id: 'donation',
              price: donation.amount,
              quantity: 1,
              name: `Donasi untuk ${creator.displayName}`
            }
          ],
          credit_card: {
            secure: true
          }
        };
        const snapRes = await snap.createTransaction(parameter);
        snapToken = snapRes.token;
        redirectUrl = snapRes.redirect_url;
      } catch (err) {
        console.error('Midtrans init error:', err);
        // Jika gagal membuat transaksi Midtrans, hapus record donasi agar tidak ada data sampah
        await Donation.findByIdAndDelete(donation._id);
        return res.status(500).json({ error: 'Gagal memproses pembayaran' });
      }

      res.status(201).json({
        success: true,
        message: 'Donasi berhasil dibuat, lanjutkan pembayaran',
        donation: {
          id: donation._id,
          name: donation.name,
          amount: donation.amount,
          message: donation.message,
          merchant_ref: donation.merchant_ref,
          createdAt: donation.createdAt,
          status: donation.status
        },
        payment: {
          token: snapToken,
            redirect_url: redirectUrl
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
