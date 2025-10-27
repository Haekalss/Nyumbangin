# Testing Donation Flow - Development Guide

## ❓ Kenapa Sekarang Perlu Script?

**Sebelumnya:** Anda mungkin testing di production/staging dengan URL public → Webhook work ✅

**Sekarang:** Testing di localhost → Midtrans **TIDAK BISA** hit `http://localhost:3000` ❌

## 🎯 Solusi PERMANENT (Tanpa Script)

### **Opsi 1: Gunakan Ngrok (RECOMMENDED)**

```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000
# Copy URL: https://abc123.ngrok.io

# Set webhook di Midtrans dashboard:
# https://abc123.ngrok.io/api/webhook/midtrans
```

**Dengan ngrok:** Webhook otomatis work, tidak perlu script! ✅

Lihat [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) untuk detail lengkap.

---

## 🧪 Testing Tanpa Ngrok (Development Only)

### **Opsi 1: Auto-Check Payment Status (RECOMMENDED)**

Frontend sudah di-update untuk automatically check payment status setelah pembayaran:

1. Buat donasi baru
2. Bayar di Midtrans Sandbox
3. **Close popup Midtrans**
4. Frontend akan otomatis check status dan update ke database

### **Opsi 2: Manual Update via Script**

Jika donasi masih pending setelah bayar:

```bash
node scripts/fix-pending.js
```

Script ini akan:
- List semua donasi PENDING
- Update semua ke status PAID
- Cocok untuk quick testing

### **Opsi 3: Manual Webhook Simulation**

Gunakan endpoint test webhook:

```bash
curl -X POST http://localhost:3000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"merchant_ref": "DON1234567890", "transaction_status": "settlement"}'
```

### **Opsi 4: Check Payment Status via API**

Check status spesifik donation:

```bash
curl -X POST http://localhost:3000/api/check-payment-status \
  -H "Content-Type: application/json" \
  -d '{"merchant_ref": "DON1234567890"}'
```

## 🚀 Production Setup

Di production dengan domain public (bukan localhost):

1. **Deploy aplikasi** ke hosting (Vercel, Railway, dll)
2. **Set Midtrans Webhook URL** di dashboard Midtrans:
   ```
   https://yourdomain.com/api/webhook/midtrans
   ```
3. **Webhook akan otomatis work** karena Midtrans bisa hit domain public

## 🧪 Testing di Midtrans Sandbox

1. **Login ke Midtrans Dashboard**: https://dashboard.sandbox.midtrans.com/
2. **Lihat Transactions** untuk list semua pembayaran
3. **Click transaction** untuk lihat detail dan force update status
4. **Gunakan test cards**:
   - Success: `4811 1111 1111 1114`
   - Deny: `4911 1111 1111 1113`
   - CVV: `123`
   - Exp: Any future date

## 📊 Monitoring Donations

Check donations di database:

```bash
node scripts/check-structure.js
```

Check creator payout settings:

```bash
node scripts/check-creators.js
```

## ⚠️ Important Notes

1. **XHR poll error** di browser console adalah normal untuk Next.js development (webpack HMR)
2. **Socket.io notifications** hanya work jika server socket.io running
3. **Midtrans Sandbox** tidak perlu verifikasi merchant, langsung bisa digunakan
4. **Production webhook** memerlukan SSL/HTTPS

## 🔧 Troubleshooting

### Donasi stuck di PENDING (Development only)
```bash
node scripts/fix-pending.js
```

### Test donation API
```bash
curl http://localhost:3000/api/donate/[username]
```

**Note:** Auto-migration untuk payout settings sudah terintegrasi di code, tidak perlu script manual.

## 📝 Files Structure

```
pages/api/
  ├── donate/[username].js       # Create donation + get creator
  ├── webhook/midtrans.js        # Midtrans webhook handler
  └── check-payment-status.js    # Check payment status (used in production)

scripts/
  └── fix-pending.js             # Emergency fix for pending donations (dev only)
```

## 🎉 Happy Testing!
