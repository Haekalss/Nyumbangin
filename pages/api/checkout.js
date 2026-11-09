import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';
import FilteredWords from '@/models/FilteredWords';
import { createQrisgateTransaction, qrisgateErrorResponse } from '@/lib/qrisgate';
import { filterMessage } from '@/utils/messageFilter';

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

/**
 * POST /api/checkout
 * Server-side checkout endpoint for QRISGate.
 *
 * 1. Receives order/donation input from frontend.
 * 2. Computes/validates total amount against Creator settings stored in DATABASE.
 * 3. Calls POST /api/v1/transactions on QRISGate with Authorization: Bearer QRISGATE_API_KEY.
 * 4. Persists external_order_id, transactionId, total_amount, and status PENDING in MongoDB.
 * 5. Returns checkout_url and data.{checkout_url, total_amount, unique_code, qr_string, expires_at}.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      username,
      creatorId,
      name,
      customer_name,
      amount,
      items,
      message = '',
      mediaShare,
      payment_method,
      bank_code,
    } = req.body || {};

    let creator = null;
    if (username && typeof username === 'string') {
      creator = await Creator.findOne({ username: username.trim().toLowerCase() });
    } else if (creatorId) {
      creator = await Creator.findById(creatorId);
    }

    if (!creator) {
      return res.status(404).json({ error: 'Creator tidak ditemukan' });
    }

    if (!creator.hasCompletePayoutSettings()) {
      return res.status(403).json({ error: 'Creator belum mengaktifkan donasi' });
    }

    if (!creator.donationSettings?.isEnabled) {
      return res.status(403).json({
        error: 'Donasi sedang tidak aktif',
        disabled: true,
      });
    }

    const donorName = String(customer_name || name || '').trim();
    if (donorName.length < 2) {
      return res.status(400).json({ error: 'Nama minimal 2 karakter' });
    }

    // Harga satuan item & batas max diambil dari DATABASE (Creator.donationSettings),
    // bukan dari harga yang dikirim browser. Minimal pesanan QRISGate adalah Rp 1.
    const dbUnitPrice = Math.max(1, Number(creator.donationSettings?.minAmount) || 5000);
    const minAmount = 1;
    const maxAmount = Math.max(
      minAmount,
      Number(creator.donationSettings?.maxAmount) || 10000000
    );

    let computedAmount;
    if (Array.isArray(items) && items.length > 0) {
      // Hitung total dari harga satuan di DATABASE dikali kuantitas item
      let totalQuantity = 0;
      for (const item of items) {
        const qty = Number(item?.quantity ?? item?.qty ?? 1);
        if (!Number.isSafeInteger(qty) || qty < 1) {
          return res.status(400).json({ error: 'Kuantitas item harus bilangan bulat minimal 1' });
        }
        totalQuantity += qty;
      }
      computedAmount = totalQuantity * dbUnitPrice;
    } else {
      computedAmount = Number(amount);
    }

    if (!Number.isSafeInteger(computedAmount)) {
      return res.status(400).json({ error: 'Jumlah donasi harus bilangan bulat Rupiah' });
    }

    if (computedAmount < minAmount) {
      return res.status(400).json({
        error: `Minimal donasi adalah Rp ${minAmount.toLocaleString('id-ID')}`,
      });
    }

    if (computedAmount > maxAmount) {
      return res.status(400).json({
        error: `Maksimal donasi adalah Rp ${maxAmount.toLocaleString('id-ID')}`,
      });
    }

    const paymentMethod = normalizePaymentMethod(payment_method);
    if (!paymentMethod) {
      return res.status(400).json({
        error: 'Metode pembayaran tidak didukung. Gunakan QRIS atau BANK_TRANSFER.',
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

    const filteredWordsDoc = await FilteredWords.findOne({ creatorId: creator._id });
    const filteredWords = filteredWordsDoc?.words || [];
    const filteredMessage = filterMessage(String(message || ''), filteredWords);

    const externalOrderId = generateExternalOrderId();

    const donationData = {
      name: donorName,
      amount: computedAmount,
      message: filteredMessage,
      merchant_ref: externalOrderId,
      createdBy: creator._id,
      createdByUsername: creator.username,
      status: 'PENDING',
      paymentMethod,
      ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
    };

    if (mediaShare && mediaShare.enabled && mediaShare.youtubeUrl) {
      donationData.mediaShareRequest = {
        enabled: true,
        youtubeUrl: String(mediaShare.youtubeUrl).trim(),
        duration: mediaShare.duration || 30,
        processed: false,
      };
    }

    const donation = await Donation.create(donationData);

    let transaction;
    try {
      transaction = await createQrisgateTransaction({
        externalOrderId,
        amount: computedAmount,
        customerName: donorName,
        returnUrl: `${getRequestOrigin(req)}/order/${donation._id}`,
        paymentMethod,
        bankCode,
      });
    } catch (gatewayError) {
      await Donation.deleteOne({ _id: donation._id }).catch(() => {});

      console.error('[QRISGate] Gagal membuat transaksi checkout:', {
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
      checkout_url: transaction.checkout_url,
      data: {
        transaction_id: transaction.transaction_id,
        external_order_id: externalOrderId,
        checkout_url: transaction.checkout_url,
        total_amount: transaction.total_amount,
        unique_code: transaction.unique_code,
        qr_string: transaction.qr_string,
        expires_at: transaction.expires_at,
      },
      order: {
        id: donation._id,
        url: `/order/${donation._id}`,
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
        status: donation.status,
      },
      payment: {
        checkout_url: transaction.checkout_url,
        total_amount: transaction.total_amount,
        unique_code: transaction.unique_code,
        qr_string: transaction.qr_string,
        expires_at: transaction.expires_at,
      },
    });
  } catch (error) {
    console.error('[QRISGate] Checkout error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

