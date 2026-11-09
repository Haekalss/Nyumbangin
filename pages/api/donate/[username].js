import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';
import FilteredWords from '@/models/FilteredWords';
import { createQrisgateTransaction, qrisgateErrorResponse } from '@/lib/qrisgate';
import { filterMessage } from '@/utils/messageFilter';

// Generate a unique external_order_id for QRISGate.
function generateExternalOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `DON-${timestamp}-${random}`;
}

function getRequestOrigin(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];

  const proto = String(Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'http')
    .split(',')[0]
    .trim();

  const host = String(
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ||
      req.headers.host ||
      'localhost:3000'
  )
    .split(',')[0]
    .trim();

  return `${proto}://${host}`;
}

function normalizePaymentMethod(value) {
  const method = String(value || 'QRIS').trim().toUpperCase();

  if (method === 'GOPAY-MERCHANT' || method === 'GOPAY') {
    return 'QRIS';
  }

  if (method === 'BANK_TRANSFER' || method === 'TRANSFER_BANK' || method === 'BANK') {
    return 'BANK_TRANSFER';
  }

  if (method === 'QRIS') return 'QRIS';

  return null;
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
          profileImage: creator.profileImageId ? `/api/user/profile-image/${creator._id}` : null,
          socialLinks: creator.socialLinks || {},
          donationSettings: {
            mediaShareEnabled: creator.donationSettings?.mediaShareEnabled !== false,
            minAmount: 1,
            maxAmount: Math.max(1, Number(creator.donationSettings?.maxAmount) || 10000000)
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
  } else if (req.method === 'POST') {
    // Create a donation and a QRISGate transaction.
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

      const { name, amount, message = '', mediaShare, payment_method, bank_code } = req.body || {};

      if (!name || amount === undefined || amount === null || amount === '') {
        return res.status(400).json({ error: 'Nama dan jumlah donasi wajib diisi' });
      }

      const donationName = String(name).trim();
      if (donationName.length < 2) {
        return res.status(400).json({ error: 'Nama minimal 2 karakter' });
      }

      // Nominal harus integer Rupiah minimal Rp 1 (QRISGate mendukung mulai Rp 1).
      // Batas maksimum diambil dari database (donationSettings creator).
      const numericAmount = Number(amount);
      const minAmount = 1;
      const maxAmount = Math.max(
        minAmount,
        Number(creator.donationSettings?.maxAmount) || 10000000
      );

      if (!Number.isSafeInteger(numericAmount)) {
        return res.status(400).json({ error: 'Jumlah donasi harus bilangan bulat Rupiah' });
      }

      if (numericAmount < minAmount) {
        return res.status(400).json({
          error: `Minimal donasi adalah Rp ${minAmount.toLocaleString('id-ID')}`
        });
      }

      if (numericAmount > maxAmount) {
        return res.status(400).json({
          error: `Maksimal donasi adalah Rp ${maxAmount.toLocaleString('id-ID')}`
        });
      }

      const paymentMethod = normalizePaymentMethod(payment_method);
      if (!paymentMethod) {
        return res.status(400).json({
          error: 'Metode pembayaran tidak didukung. Gunakan QRIS atau BANK_TRANSFER.'
        });
      }

      let bankCode = null;
      if (paymentMethod === 'BANK_TRANSFER' && bank_code) {
        const normalizedBank = String(bank_code).trim().toUpperCase();
        if (!/^[A-Z0-9]{2,20}$/.test(normalizedBank)) {
          return res.status(400).json({ error: 'Kode bank tidak valid' });
        }
        bankCode = normalizedBank;
      }

      // Filter message untuk kata-kata kasar
      const filteredWordsDoc = await FilteredWords.findOne({ creatorId: creator._id });
      const filteredWords = filteredWordsDoc?.words || [];
      const filteredMessage = filterMessage(String(message || ''), filteredWords);

      const merchantRef = generateExternalOrderId();

      const donationData = {
        name: donationName,
        amount: numericAmount,
        message: filteredMessage,
        merchant_ref: merchantRef,
        createdBy: creator._id,
        createdByUsername: creator.username,
        status: 'PENDING',
        paymentMethod,
        ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null
      };

      // Add media share request if enabled
      if (mediaShare && mediaShare.enabled && mediaShare.youtubeUrl) {
        donationData.mediaShareRequest = {
          enabled: true,
          youtubeUrl: String(mediaShare.youtubeUrl).trim(),
          duration: mediaShare.duration || 30,
          processed: false
        };
      }

      const donation = await Donation.create(donationData);

      let transaction;
      try {
        transaction = await createQrisgateTransaction({
          externalOrderId: merchantRef,
          amount: numericAmount,
          customerName: donationName,
          returnUrl: `${getRequestOrigin(req)}/order/${donation._id}`,
          paymentMethod,
          bankCode
        });
      } catch (gatewayError) {
        // Jangan tinggalkan record PENDING tanpa sesi pembayaran.
        await Donation.deleteOne({ _id: donation._id }).catch(() => {});

        console.error('[QRISGate] Gagal membuat transaksi:', {
          code: gatewayError?.code,
          status: gatewayError?.status,
          message: gatewayError?.message,
        });

        const mapped = qrisgateErrorResponse(gatewayError);
        return res.status(mapped.status).json(mapped.body);
      }

      donation.transactionId = transaction.transaction_id;
      donation.totalAmount = transaction.total_amount;
      donation.uniqueCode = transaction.unique_code;
      donation.checkoutUrl = transaction.checkout_url;
      donation.expiresAt = transaction.expires_at ? new Date(transaction.expires_at) : undefined;
      donation.qrisgateData = transaction;
      donation.paymentMethod = transaction.payment_method || paymentMethod;
      donation.status = 'PENDING';
      await donation.save();

      return res.status(201).json({
        success: true,
        message: 'Donasi berhasil dibuat. Lanjutkan pembayaran.',
        checkout_url: transaction.checkout_url,
        data: {
          transaction_id: transaction.transaction_id,
          external_order_id: merchantRef,
          checkout_url: transaction.checkout_url,
          total_amount: transaction.total_amount,
          unique_code: transaction.unique_code,
          qr_string: transaction.qr_string,
          expires_at: transaction.expires_at
        },
        donation: {
          id: donation._id,
          _id: donation._id,
          name: donation.name,
          amount: donation.amount,
          totalAmount: donation.totalAmount,
          uniqueCode: donation.uniqueCode,
          message: donation.message,
          merchant_ref: donation.merchant_ref,
          createdAt: donation.createdAt,
          expiresAt: donation.expiresAt,
          checkoutUrl: donation.checkoutUrl,
          status: donation.status
        },
        order: {
          id: donation._id,
          url: `/order/${donation._id}`
        },
        payment: {
          checkout_url: transaction.checkout_url,
          total_amount: transaction.total_amount,
          unique_code: transaction.unique_code,
          qr_string: transaction.qr_string,
          expires_at: transaction.expires_at
        }
      });
    } catch (error) {
      console.error('Error creating donation:', error);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
