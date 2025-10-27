# 🔄 Auto-Archive Donations Setup

## Overview
Sistem ini otomatis memindahkan donasi yang sudah lebih dari 24 jam dari collection `donations` ke `donation_history` untuk menjaga performa database.

## 📋 Fitur yang Diperbaiki

### ✅ 1. Notifikasi Otomatis
- **Webhook Midtrans** sekarang otomatis membuat notifikasi saat donasi berhasil (PAID)
- Notifikasi tersimpan di collection `notifications`
- Mendukung notifikasi besar (> Rp 100.000) dengan prioritas HIGH

### ✅ 2. Auto-Archive Donations
- Donasi PAID yang > 24 jam otomatis diarsipkan ke `donation_history`
- Data asli dihapus dari `donations` collection
- Metadata lengkap tersimpan (termasuk overlay display status)

## 🚀 Setup Cron Job

### Opsi 1: Vercel Cron (Recommended untuk Production)

Jika deploy di Vercel, cron job sudah dikonfigurasi di `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/archive-donations",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule:** Berjalan setiap 6 jam sekali

**Vercel akan otomatis menjalankan** endpoint `/api/cron/archive-donations` sesuai schedule.

### Opsi 2: External Cron Service (cron-job.org)

Jika tidak menggunakan Vercel Cron:

1. **Daftar di** [cron-job.org](https://cron-job.org) atau service sejenis
2. **Buat cron job baru:**
   - **URL:** `https://your-domain.com/api/cron/archive-donations`
   - **Schedule:** `0 */6 * * *` (setiap 6 jam)
   - **Method:** `GET` atau `POST`
   - **Headers:** 
     ```
     x-cron-secret: nyumbangin_cron_secret_2025_secure_key_12345
     ```

3. **Test endpoint** dengan curl:
   ```bash
   curl -X POST https://your-domain.com/api/cron/archive-donations \
     -H "x-cron-secret: nyumbangin_cron_secret_2025_secure_key_12345"
   ```

### Opsi 3: Manual Testing (Development)

Jalankan script manual untuk test:

```bash
node scripts/archive-old-donations.js
```

Script ini akan:
- ✅ Connect ke database
- ✅ Cari donasi PAID > 24 jam
- ✅ Archive ke `donation_history`
- ✅ Hapus dari `donations`
- ✅ Tampilkan summary

## 🔐 Security

### Environment Variables Required

```env
CRON_SECRET=nyumbangin_cron_secret_2025_secure_key_12345
```

**PENTING:** Ganti `CRON_SECRET` dengan value yang aman di production!

### API Endpoint Protection

Endpoint `/api/cron/archive-donations` protected dengan:
- Header `x-cron-secret` harus match dengan `CRON_SECRET` di `.env`
- Request tanpa secret yang benar akan ditolak (401 Unauthorized)

## 📊 Monitoring

### Cron Response Format

**Success:**
```json
{
  "success": true,
  "timestamp": "2025-10-27T10:00:00.000Z",
  "total": 15,
  "archived": 15,
  "failed": 0
}
```

**With Errors:**
```json
{
  "success": true,
  "timestamp": "2025-10-27T10:00:00.000Z",
  "total": 15,
  "archived": 13,
  "failed": 2,
  "errors": [
    "Failed to archive DON-12345: Duplicate key error",
    "Failed to archive DON-67890: Connection timeout"
  ]
}
```

### Logs Location

Logs dapat dilihat di:
- **Vercel:** Dashboard → Project → Functions → Logs
- **Terminal local:** Output dari `node scripts/archive-old-donations.js`
- **Server logs:** Check console output di server

## 🧪 Testing

### 1. Test Notifikasi

Setelah donasi berhasil (PAID), cek di MongoDB:

```javascript
db.notifications.find({ type: "DONATION" }).sort({ createdAt: -1 }).limit(5)
```

Expected: Notification document with donation details

### 2. Test Archive Manual

```bash
# Jalankan script
node scripts/archive-old-donations.js

# Expected output:
# ✅ Archived: DON-XXX | username | Rp 50.000
# ✅ Archived: DON-YYY | username | Rp 100.000
# 📊 Successfully archived: 2
```

### 3. Test Cron Endpoint (Local)

```bash
# Windows (cmd)
curl -X POST http://localhost:3000/api/cron/archive-donations ^
  -H "x-cron-secret: nyumbangin_cron_secret_2025_secure_key_12345"

# Linux/Mac
curl -X POST http://localhost:3000/api/cron/archive-donations \
  -H "x-cron-secret: nyumbangin_cron_secret_2025_secure_key_12345"
```

### 4. Verify Archive in Database

```javascript
// Check donation_history collection
db.donation_history.find({}).sort({ archivedAt: -1 }).limit(5)

// Check original donations are deleted
db.donations.find({ merchant_ref: "DON-XXX" })  // Should be empty
```

## 📈 Performance Impact

### Before Auto-Archive
- ❌ `donations` collection terus membesar
- ❌ Query lambat karena data terlalu banyak
- ❌ Overlay performance menurun

### After Auto-Archive
- ✅ `donations` hanya berisi data < 24 jam (lebih cepat)
- ✅ `donation_history` untuk data historis
- ✅ Query lebih efisien dengan temporal indexing

## 🔄 Archive Process Flow

```
1. Cron job triggered (every 6 hours)
   ↓
2. Find donations with:
   - status = 'PAID'
   - createdAt < (now - 24 hours)
   ↓
3. For each donation:
   - Create record in donation_history
   - Add temporal fields (year, month, monthYear)
   - Copy all original data
   ↓
4. Delete from donations collection
   ↓
5. Return summary (archived/failed count)
```

## 📝 Database Collections

### `donations` (Active)
- Donasi aktif (< 24 jam)
- Used by overlay, dashboard
- Automatically cleaned by cron

### `donation_history` (Archive)
- Donasi historis (> 24 jam)
- Used for analytics, reports
- Indexed by month/year for efficient queries

### `notifications`
- Real-time notifications
- Created automatically when donation PAID
- Auto-expire after 7 days (TTL index)

## 🚨 Troubleshooting

### Notifikasi tidak muncul?
1. Cek webhook Midtrans berhasil: Logs di `/api/webhook/midtrans`
2. Cek status donation berubah ke PAID
3. Query manual: `db.notifications.find({ donationId: ObjectId("...") })`

### Archive tidak berjalan?
1. Cek cron job aktif (Vercel Dashboard atau cron-job.org)
2. Test manual: `node scripts/archive-old-donations.js`
3. Verify `CRON_SECRET` match di environment & request header

### Donasi hilang?
1. Cek di `donation_history`: `db.donation_history.find({ merchant_ref: "..." })`
2. Archive reason: `AUTO_24H` = cron, `MANUAL_SCRIPT` = manual
3. Original donation ID tersimpan di `originalDonationId`

## 💡 Best Practices

1. **Monitor cron job logs** regularly untuk detect errors
2. **Backup database** sebelum menjalankan archive pertama kali
3. **Test di development** sebelum enable di production
4. **Set alert** jika cron job failed (via Vercel/cron-job.org)
5. **Review archived data** periodically untuk ensure data integrity

## 📞 Support

Jika ada masalah:
1. Check logs di Vercel Dashboard
2. Run manual script untuk debug
3. Verify database connections
4. Check environment variables

---

**Last Updated:** October 27, 2025
**Version:** 1.0.0
