# BAB 5: ALUR DONASI & PAYOUT (END-TO-END)

<div align="center">

**⏱️ Estimasi Waktu: 3-4 Jam**

</div>

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda akan:
- ✅ Memahami complete donation flow dari form hingga payment
- ✅ Implementasi Midtrans payment gateway integration
- ✅ Menangani webhook verification dengan signature
- ✅ Memahami payout request flow
- ✅ Implementasi email notification system
- ✅ Mengelola marking donations sebagai paid out

---

# PART A: ALUR DONASI

## 5.1 Overview Donation Flow

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│ 1. USER: Browse /donate/username                     │
│    • Fetch creator data                              │
│    • Display profile & donation form                 │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 2. USER: Fill Form & Submit                          │
│    • Amount: Rp 50,000                               │
│    • Name: "Jane Supporter"                          │
│    • Message: "Keep it up!"                          │
│    • Email: jane@example.com                         │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 3. API: POST /api/donate/[username]                  │
│    • Validate input                                  │
│    • Check creator exists & active                   │
│    • Generate order_id: TRX-{timestamp}-{random}     │
│    • Call Midtrans Snap API                          │
│    • Save donation (status: PENDING)                 │
│    • Return payment_url & token                      │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 4. MIDTRANS: Payment Page                            │
│    • User selects method (QRIS/VA/E-wallet)          │
│    • User completes payment                          │
│    • Midtrans processes transaction                  │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 5. WEBHOOK: Midtrans → POST /api/webhook/midtrans    │
│    • Verify signature (security)                     │
│    • Extract transaction data                        │
│    • Find donation by order_id                       │
│    • Update status: PENDING → PAID                   │
│    • Update creator stats                            │
│    • Send email to creator                           │
│    • Trigger overlay notification                    │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 6. USER: Redirected to Success Page                  │
│    • Show "Payment Successful"                       │
│    • Display receipt                                 │
│    • Thank you message                               │
└──────────────────────────────────────────────────────┘
```

---

### Status Lifecycle

```
PENDING ──► PAID ──► [isPaidOut: false] ──► [isPaidOut: true]
   │                                              (After payout)
   ├──► EXPIRED (24 hours no payment)
   ├──► FAILED (payment rejected)
   └──► CANCELLED (user cancelled)
```

---

## 5.2 Halaman Donasi `/donate/[username]`

### Frontend Component

```javascript
// src/app/donate/[username]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DonatePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username;

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    email: '',
    message: '',
  });

  // Fetch creator data
  useEffect(() => {
    fetch(`/api/creators/${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCreator(data.creator);
        } else {
          toast.error('Creator not found');
          router.push('/');
        }
      })
      .catch(() => toast.error('Failed to load creator'))
      .finally(() => setLoading(false));
  }, [username, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Client-side validation
    const amount = parseInt(formData.amount);
    if (amount < 10000) {
      toast.error('Minimum donation is Rp 10,000');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/donate/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          supporterName: formData.name || 'Anonymous',
          supporterEmail: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Donation failed');
      }

      // Redirect to Midtrans payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.token) {
        // Or open Snap popup
        window.snap.pay(data.token, {
          onSuccess: function(result) {
            toast.success('Payment successful!');
            router.push(`/donate/${username}/success?order_id=${result.order_id}`);
          },
          onPending: function(result) {
            toast.info('Payment pending. Complete your payment.');
          },
          onError: function(result) {
            toast.error('Payment failed. Please try again.');
          },
          onClose: function() {
            toast.error('Payment cancelled');
          }
        });
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!creator) {
    return <div>Creator not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Creator Profile */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={creator.profileImage || '/default-avatar.png'}
              alt={creator.displayName}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{creator.displayName}</h1>
              <p className="text-gray-600">@{creator.username}</p>
            </div>
          </div>

          {creator.bio && (
            <p className="text-gray-700 mb-4">{creator.bio}</p>
          )}

          <div className="flex gap-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">{creator.totalDonations || 0}</span> donations
            </div>
            <div>
              <span className="font-semibold">
                Rp {(creator.totalEarned || 0).toLocaleString('id-ID')}
              </span> earned
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6">Support {creator.displayName}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Donation Amount (Rp) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                min="10000"
                step="1000"
                placeholder="50000"
                className="w-full px-4 py-3 border rounded-lg text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: Rp 10,000</p>

              {/* Quick amount buttons */}
              <div className="flex gap-2 mt-3">
                {[10000, 25000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    {(amt / 1000)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Anonymous"
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">For payment receipt</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Message (optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength={500}
                rows={3}
                placeholder="Say something nice..."
                className="w-full px-4 py-3 border rounded-lg resize-none"
              />
              <p className="text-xs text-gray-500 text-right">
                {formData.message.length}/500
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : `Donate Rp ${parseInt(formData.amount || 0).toLocaleString('id-ID')}`}
            </button>
          </form>
        </div>

        {/* Recent Donations (Optional) */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <h3 className="font-bold mb-4">Recent Supporters</h3>
          {/* List recent donations */}
        </div>
      </div>

      {/* Load Midtrans Snap */}
      <script
        src={process.env.NEXT_PUBLIC_MIDTRANS_PRODUCTION === 'true'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      ></script>
    </div>
  );
}
```

---

## 5.3 Create Donation API

```javascript
// pages/api/donate/[username].js
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';
import { createMidtransTransaction } from '@/lib/midtrans';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { username } = req.query;
    const { amount, supporterName, supporterEmail, message } = req.body;

    // 1. Validation
    if (!amount || amount < 10000) {
      return res.status(400).json({ 
        error: 'Minimum donation is Rp 10,000' 
      });
    }

    if (!supporterEmail || !/^\S+@\S+\.\S+$/.test(supporterEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // 2. Find creator
    const creator = await Creator.findOne({ 
      username: username.toLowerCase(),
      isActive: true,
      isSuspended: false,
    });

    if (!creator) {
      return res.status(404).json({ error: 'Creator not found or inactive' });
    }

    // 3. Generate unique order ID
    const orderId = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 4. Create Midtrans transaction
    const midtransResponse = await createMidtransTransaction({
      orderId,
      amount,
      customerDetails: {
        first_name: supporterName || 'Anonymous',
        email: supporterEmail,
      },
      itemDetails: {
        name: `Donation to ${creator.displayName}`,
        price: amount,
        quantity: 1,
      },
    });

    // 5. Save donation to database
    const donation = new Donation({
      creatorId: creator._id,
      orderId,
      amount,
      supporterName: supporterName || 'Anonymous',
      supporterEmail,
      message: message || '',
      status: 'PENDING',
      isAnonymous: !supporterName,
    });

    await donation.save();

    // 6. Return payment URL/token
    res.status(201).json({
      success: true,
      orderId,
      paymentUrl: midtransResponse.redirect_url,
      token: midtransResponse.token,
      donation: {
        id: donation._id,
        orderId: donation.orderId,
        amount: donation.amount,
      },
    });

  } catch (error) {
    console.error('Donation creation error:', error);

    // Handle Midtrans errors
    if (error.httpStatusCode) {
      return res.status(error.httpStatusCode).json({
        error: 'Payment gateway error',
        details: error.ApiResponse?.status_message || error.message,
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## 5.4 Payment Gateway Integration (Midtrans)

### Midtrans Utility Library

```javascript
// src/lib/midtrans.js
import midtransClient from 'midtrans-client';

const isProduction = process.env.MIDTRANS_PRODUCTION === 'true';

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

/**
 * Create Midtrans transaction
 * @param {Object} params - Transaction parameters
 * @returns {Promise<Object>} Midtrans response with token & redirect_url
 */
export async function createMidtransTransaction({
  orderId,
  amount,
  customerDetails,
  itemDetails,
}) {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerDetails.first_name,
      email: customerDetails.email,
    },
    item_details: [{
      id: 'DONATION',
      price: itemDetails.price,
      quantity: itemDetails.quantity,
      name: itemDetails.name,
    }],
    callbacks: {
      finish: `${process.env.NEXTAUTH_URL}/donate/success?order_id=${orderId}`,
      error: `${process.env.NEXTAUTH_URL}/donate/failed?order_id=${orderId}`,
      pending: `${process.env.NEXTAUTH_URL}/donate/pending?order_id=${orderId}`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return transaction;
  } catch (error) {
    console.error('Midtrans transaction error:', error);
    throw error;
  }
}

/**
 * Get transaction status from Midtrans
 * @param {String} orderId - Order ID to check
 * @returns {Promise<Object>} Transaction status
 */
export async function getTransactionStatus(orderId) {
  try {
    const status = await snap.transaction.status(orderId);
    return status;
  } catch (error) {
    console.error('Get transaction status error:', error);
    throw error;
  }
}

/**
 * Verify Midtrans webhook signature
 * @param {Object} notification - Webhook notification object
 * @returns {Boolean} Is signature valid
 */
export function verifySignature(notification) {
  const crypto = require('crypto');
  
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
  } = notification;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  
  // SHA512(order_id + status_code + gross_amount + server_key)
  const hash = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');

  return hash === signature_key;
}
```

---

## 5.5 Webhook Verification

### Webhook Handler

```javascript
// pages/api/webhook/midtrans.js
import dbConnect from '@/lib/db';
import Donation from '@/models/donations';
import Creator from '@/models/Creator';
import { verifySignature } from '@/lib/midtrans';
import { sendEmail } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const notification = req.body;

    console.log('Webhook received:', notification);

    // 1. Verify signature (CRITICAL for security!)
    const isValid = verifySignature(notification);
    
    if (!isValid) {
      console.error('Invalid signature:', notification);
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // 2. Extract data
    const {
      order_id,
      transaction_status,
      transaction_id,
      fraud_status,
      payment_type,
      gross_amount,
      va_numbers,
      bill_key,
      biller_code,
    } = notification;

    // 3. Find donation
    const donation = await Donation.findOne({ orderId: order_id });

    if (!donation) {
      console.error('Donation not found:', order_id);
      return res.status(404).json({ error: 'Donation not found' });
    }

    // 4. Determine status
    let newStatus = donation.status;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'PAID';
      }
    } else if (transaction_status === 'pending') {
      newStatus = 'PENDING';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
      newStatus = 'FAILED';
    } else if (transaction_status === 'expire') {
      newStatus = 'EXPIRED';
    }

    // 5. Update donation
    donation.status = newStatus;
    donation.transactionId = transaction_id;
    donation.transactionStatus = transaction_status;
    donation.fraudStatus = fraud_status;
    donation.paymentType = payment_type;

    // Store VA number if applicable
    if (va_numbers && va_numbers.length > 0) {
      donation.vaNumber = va_numbers[0].va_number;
    }
    if (bill_key) donation.billKey = bill_key;
    if (biller_code) donation.billerCode = biller_code;

    // Store full webhook data for debugging
    donation.webhookData = notification;

    await donation.save();

    // 6. If payment successful, update creator stats
    if (newStatus === 'PAID' && donation.status !== 'PAID') {
      const creator = await Creator.findById(donation.creatorId);
      
      if (creator) {
        creator.totalEarned += donation.amount;
        creator.totalDonations += 1;
        await creator.calculateAvailableBalance();
        await creator.save();

        // 7. Send email notification to creator
        if (!donation.isNotified) {
          try {
            await sendEmail({
              to: creator.email,
              subject: `New Donation: Rp ${donation.amount.toLocaleString('id-ID')}`,
              template: 'new-donation',
              data: {
                creatorName: creator.displayName,
                supporterName: donation.supporterName,
                amount: donation.amount,
                message: donation.message,
                donationUrl: `${process.env.NEXTAUTH_URL}/creator/dashboard`,
              },
            });

            donation.isNotified = true;
            await donation.save();
          } catch (emailError) {
            console.error('Email notification error:', emailError);
            // Don't fail webhook if email fails
          }
        }
      }
    }

    // 8. Respond success (important for Midtrans retry logic)
    res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully',
      orderId: order_id,
      status: newStatus,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return 200 to prevent Midtrans retry on permanent errors
    // Return 500 for temporary errors (Midtrans will retry)
    res.status(500).json({ 
      success: false, 
      error: 'Webhook processing failed' 
    });
  }
}
```

---

### Testing Webhook Locally

**Problem**: Midtrans can't reach `localhost`

**Solutions**:

#### Option 1: ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Output:
# Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

**Configure Midtrans**:
1. Go to Midtrans Dashboard → Settings → Notification URL
2. Set: `https://abc123.ngrok.io/api/webhook/midtrans`

#### Option 2: Manual Testing

```bash
# Test webhook dengan curl
curl -X POST http://localhost:3000/api/webhook/midtrans \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TRX-xxx",
    "transaction_status": "settlement",
    "transaction_id": "test-123",
    "fraud_status": "accept",
    "payment_type": "qris",
    "gross_amount": "50000",
    "status_code": "200",
    "signature_key": "computed_signature_here"
  }'
```

---

## 5.6 Email Notification System

### Email Utility Library

```javascript
// src/lib/email.js
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const templates = {
  'new-donation': (data) => ({
    subject: `🎉 New Donation: Rp ${data.amount.toLocaleString('id-ID')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Donation Received!</h2>
        <p>Hi ${data.creatorName},</p>
        <p>You just received a donation from <strong>${data.supporterName}</strong>!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2563eb;">
            Rp ${data.amount.toLocaleString('id-ID')}
          </p>
        </div>

        ${data.message ? `
          <div style="background: #fff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${data.message}"</p>
          </div>
        ` : ''}

        <p>
          <a href="${data.donationUrl}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View in Dashboard
          </a>
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated notification from Nyumbangin.<br>
          © 2026 Nyumbangin. All rights reserved.
        </p>
      </div>
    `,
  }),

  'payout-approved': (data) => ({
    subject: '✅ Payout Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Payout Approved!</h2>
        <p>Hi ${data.creatorName},</p>
        <p>Good news! Your payout request has been <strong>approved</strong>.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> Rp ${data.amount.toLocaleString('id-ID')}</p>
          <p style="margin: 0 0 10px 0;"><strong>Bank:</strong> ${data.bankName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Account:</strong> ${data.accountNumber}</p>
          <p style="margin: 0;"><strong>Status:</strong> <span style="color: #10b981;">Approved</span></p>
        </div>

        <p>The funds will be transferred to your account within 1-3 business days.</p>
        <p>You'll receive another notification once the transfer is completed.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">© 2026 Nyumbangin</p>
      </div>
    `,
  }),

  'payout-processed': (data) => ({
    subject: '💰 Payout Completed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Payout Completed!</h2>
        <p>Hi ${data.creatorName},</p>
        <p>Your payout has been <strong>successfully transferred</strong>!</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> Rp ${data.amount.toLocaleString('id-ID')}</p>
          <p style="margin: 0 0 10px 0;"><strong>Bank:</strong> ${data.bankName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Account:</strong> ${data.accountNumber}</p>
          <p style="margin: 0 0 10px 0;"><strong>Reference:</strong> ${data.reference}</p>
          <p style="margin: 0;"><strong>Status:</strong> <span style="color: #10b981;">Completed</span></p>
        </div>

        <p>Please check your bank account. The funds should arrive within a few hours.</p>
        <p>Thank you for using Nyumbangin!</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">© 2026 Nyumbangin</p>
      </div>
    `,
  }),

  'payout-rejected': (data) => ({
    subject: '❌ Payout Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Payout Rejected</h2>
        <p>Hi ${data.creatorName},</p>
        <p>Unfortunately, your payout request has been <strong>rejected</strong>.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> Rp ${data.amount.toLocaleString('id-ID')}</p>
          <p style="margin: 0 0 10px 0;"><strong>Reason:</strong> ${data.reason}</p>
        </div>

        <p>If you have questions, please contact our support team.</p>
        <p>Email: support@nyumbangin.com</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">© 2026 Nyumbangin</p>
      </div>
    `,
  }),
};

/**
 * Send email using template
 * @param {Object} params - Email parameters
 */
export async function sendEmail({ to, template, data }) {
  try {
    const templateFn = templates[template];
    
    if (!templateFn) {
      throw new Error(`Template '${template}' not found`);
    }

    const { subject, html } = templateFn(data);

    const info = await transporter.sendMail({
      from: `"Nyumbangin" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Send email error:', error);
    throw error;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig() {
  try {
    await transporter.verify();
    console.log('✓ SMTP configuration is correct');
    return true;
  } catch (error) {
    console.error('✗ SMTP configuration error:', error);
    return false;
  }
}
```

---

# PART B: ALUR PAYOUT

## 5.7 Overview Payout Flow

```
┌──────────────────────────────────────────────────────┐
│ 1. CREATOR: Check Available Balance                  │
│    • Dashboard shows unpaid donations                │
│    • Calculate total available                       │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 2. CREATOR: Click "Request Payout"                   │
│    • Confirm bank account details                    │
│    • Enter amount (min Rp 50,000)                    │
│    • Submit request                                  │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 3. API: POST /api/creator/request-payout             │
│    • Validate amount >= minimum                      │
│    • Check available balance                         │
│    • Create payout document (status: pending)        │
│    • Link related donations                          │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 4. ADMIN: Review Pending Payouts                     │
│    • GET /api/admin/payouts?status=pending           │
│    • View creator info & bank details                │
│    • Verify legitimacy                               │
└──────────────────┬───────────────────────────────────┘
                   ▼
        ┌──────────┴──────────┐
        ▼                     ▼
 ┌─────────────┐       ┌─────────────┐
 │   APPROVE   │       │   REJECT    │
 └──────┬──────┘       └──────┬──────┘
        │                     │
        │                     ▼
        │              Send rejection email
        │              (status: rejected)
        ▼
┌──────────────────────────────────────────────────────┐
│ 5. ADMIN: Transfer Money via Bank                    │
│    • Manually transfer to creator's bank             │
│    • Get transfer reference number                   │
│    • Upload proof (optional)                         │
└──────────────────┬───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────────────────────┐
│ 6. ADMIN: Mark as Processed                          │
│    • PUT /api/admin/payouts (action: processed)      │
│    • Enter transfer reference                        │
│    • Update payout status: processed                 │
│    • Mark all related donations: isPaidOut = true    │
│    • Send completion email to creator                │
└──────────────────────────────────────────────────────┘
```

---

## 5.8 Creator Request Payout

### Request Payout API

```javascript
// pages/api/creator/request-payout.js
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';
import Payout from '@/models/payout';
import { requireRole } from '@/lib/middleware/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  // Authenticate & check role
  const authCheck = requireRole(['creator'])(req, res);
  if (authCheck.error) {
    return res.status(authCheck.status).json({ error: authCheck.error });
  }

  try {
    const creatorId = req.user.userId;
    const { amount, notes } = req.body;

    // 1. Get creator
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // 2. Check bank account configured
    if (!creator.bankAccount?.bankName || !creator.bankAccount?.accountNumber) {
      return res.status(400).json({ 
        error: 'Please configure your bank account first',
        code: 'BANK_ACCOUNT_MISSING',
      });
    }

    // 3. Calculate available balance
    await creator.calculateAvailableBalance();

    // 4. Validate amount
    if (!amount || amount < creator.minimumPayout) {
      return res.status(400).json({
        error: `Minimum payout is Rp ${creator.minimumPayout.toLocaleString('id-ID')}`,
        minimumPayout: creator.minimumPayout,
      });
    }

    if (amount > creator.availableBalance) {
      return res.status(400).json({
        error: 'Insufficient balance',
        availableBalance: creator.availableBalance,
        requestedAmount: amount,
      });
    }

    // 5. Check if there's already pending payout
    const pendingPayout = await Payout.findOne({
      creatorId,
      status: 'pending',
    });

    if (pendingPayout) {
      return res.status(409).json({
        error: 'You already have a pending payout request',
        existingPayout: pendingPayout,
      });
    }

    // 6. Get unpaid donations
    const unpaidDonations = await Donation.find({
      creatorId,
      status: 'PAID',
      isPaidOut: false,
    }).sort({ createdAt: 1 });

    // Select donations up to requested amount
    let totalAmount = 0;
    const selectedDonations = [];

    for (const donation of unpaidDonations) {
      if (totalAmount + donation.amount <= amount) {
        selectedDonations.push(donation._id);
        totalAmount += donation.amount;
      } else {
        break;
      }
    }

    if (totalAmount === 0) {
      return res.status(400).json({
        error: 'No eligible donations found',
      });
    }

    // 7. Create payout request
    const payout = new Payout({
      creatorId,
      amount: totalAmount,
      bankAccount: creator.bankAccount,
      donations: selectedDonations,
      creatorNotes: notes || '',
      status: 'pending',
    });

    await payout.save();

    // 8. Return success
    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      payout: {
        id: payout._id,
        amount: payout.amount,
        status: payout.status,
        donationCount: selectedDonations.length,
        createdAt: payout.createdAt,
      },
    });

  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## 5.9 Admin Payout Management

### Admin Payouts API

File lengkap sudah ada di attachment `pages/api/admin/payouts.js`. Berikut highlights:

```javascript
// pages/api/admin/payouts.js (simplified)
import { requirePermission } from '@/lib/middleware/auth';
import Payout from '@/models/payout';
import { sendEmail } from '@/lib/email';

export default async function handler(req, res) {
  await dbConnect();

  // GET - List payouts
  if (req.method === 'GET') {
    const authCheck = await requirePermission('VIEW_PAYOUTS')(req, res);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const { status = 'pending' } = req.query;
    
    const payouts = await Payout.find({ status })
      .populate('creatorId', 'username displayName email')
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, payouts });
  }

  // PUT - Approve/Reject/Process payout
  if (req.method === 'PUT') {
    const authCheck = await requirePermission('APPROVE_PAYOUTS')(req, res);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ error: authCheck.error });
    }

    const { payoutId, action, reason, transferDetails } = req.body;

    const payout = await Payout.findById(payoutId).populate('creatorId');
    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    if (action === 'approve') {
      await payout.approve(req.user.userId);
      
      // Send email
      await sendEmail({
        to: payout.creatorId.email,
        template: 'payout-approved',
        data: {
          creatorName: payout.creatorId.displayName,
          amount: payout.amount,
          bankName: payout.bankAccount.bankName,
          accountNumber: payout.bankAccount.accountNumber,
        },
      });
    } 
    else if (action === 'reject') {
      await payout.reject(req.user.userId, reason);
      
      // Send email
      await sendEmail({
        to: payout.creatorId.email,
        template: 'payout-rejected',
        data: {
          creatorName: payout.creatorId.displayName,
          amount: payout.amount,
          reason,
        },
      });
    }
    else if (action === 'processed') {
      await payout.markProcessed(req.user.userId, transferDetails);
      
      // Send email
      await sendEmail({
        to: payout.creatorId.email,
        template: 'payout-processed',
        data: {
          creatorName: payout.creatorId.displayName,
          amount: payout.amount,
          bankName: payout.bankAccount.bankName,
          accountNumber: payout.bankAccount.accountNumber,
          reference: transferDetails.reference,
        },
      });
    }

    return res.status(200).json({ success: true, payout });
  }
}
```

---

## 5.10 Marking Donations as Paid Out

Sudah diimplementasikan di `Payout.markProcessed()` method:

```javascript
// Instance method in src/models/payout.js
PayoutSchema.methods.markProcessed = async function(adminId, transferDetails) {
  const Donation = mongoose.model('Donation');
  
  this.status = 'processed';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.transferProof = transferDetails.proof;
  this.transferReference = transferDetails.reference;
  this.transferDate = transferDetails.date || new Date();
  
  await this.save();
  
  // ✅ Mark all related donations as paid out
  await Donation.updateMany(
    { _id: { $in: this.donations } },
    { 
      isPaidOut: true,
      payoutId: this._id,
      paidOutAt: new Date(),
    }
  );
  
  return this;
};
```

**Penting**: Ini mencegah **double payout** karena donations dengan `isPaidOut: true` tidak akan dihitung lagi di available balance.

---

## 5.12 Reconciliation & Reporting

### Get Payout Report

```javascript
// pages/api/admin/reports/payouts.js
import dbConnect from '@/lib/db';
import Payout from '@/models/payout';
import { requirePermission } from '@/lib/middleware/auth';

export default async function handler(req, res) {
  await dbConnect();

  const authCheck = await requirePermission('VIEW_STATS')(req, res);
  if (authCheck.error) {
    return res.status(authCheck.status).json({ error: authCheck.error });
  }

  const { startDate, endDate, status } = req.query;

  const match = {};
  
  if (status) {
    match.status = status;
  }
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const report = await Payout.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  const summary = {
    pending: { count: 0, totalAmount: 0 },
    approved: { count: 0, totalAmount: 0 },
    processed: { count: 0, totalAmount: 0 },
    rejected: { count: 0, totalAmount: 0 },
  };

  report.forEach(item => {
    summary[item._id] = {
      count: item.count,
      totalAmount: item.totalAmount,
    };
  });

  res.status(200).json({ success: true, summary, details: report });
}
```

---

## 5.13 Latihan: Test Complete Flow

### Checklist Testing

- [ ] **Donation Flow**:
  - [ ] Create donation di sandbox
  - [ ] Payment dengan QRIS
  - [ ] Webhook diterima & status PAID
  - [ ] Creator stats terupdate
  - [ ] Email notification sent

- [ ] **Payout Flow**:
  - [ ] Creator request payout
  - [ ] Admin approve payout
  - [ ] Mark as processed
  - [ ] Donations marked isPaidOut
  - [ ] Email notifications sent

- [ ] **Edge Cases**:
  - [ ] Request payout dengan insufficient balance
  - [ ] Double payout attempt
  - [ ] Webhook dengan invalid signature
  - [ ] Expired donation status

---

## ✅ Checklist Pemahaman

- [ ] Paham complete donation flow end-to-end
- [ ] Bisa integrate Midtrans Snap API
- [ ] Memahami webhook verification & signature
- [ ] Bisa implement email notifications
- [ ] Paham payout approval workflow
- [ ] Tahu cara prevent double payout
- [ ] Bisa test webhook locally dengan ngrok

---

## 📚 Referensi

- [Midtrans Snap API](https://docs.midtrans.com/en/snap/overview)
- [Midtrans Webhook](https://docs.midtrans.com/en/after-payment/http-notification)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

<div align="center">

**Navigasi**

[⬅️ Bab 4: Autentikasi](Bab-04-Autentikasi-Otorisasi.md) | [Bab 6: Deploy & Test ➡️](Bab-06-Deploy-Test-Troubleshoot.md)

</div>
