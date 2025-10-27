# 🧪 Testing Guide - Notifikasi & Archive

## Quick Test Commands

### 1. Test Notifikasi
Cek apakah notifikasi dibuat saat donasi PAID:
```bash
npm run test:notif
```
atau
```bash
node scripts/test-notifications.js
```

**Expected Output:**
```
✅ NOTIFICATION EXISTS:
   Type: DONATION
   Title: Donasi Baru!
   Message: John memberikan Rp 50.000: Semangat!
```

### 2. Test Archive Manual
Archive donasi yang sudah > 24 jam:
```bash
npm run archive
```
atau
```bash
node scripts/archive-old-donations.js
```

**Expected Output:**
```
📦 Found 5 donations to archive
✅ Archived: DON-12345 | username | Rp 50.000
✅ Archived: DON-67890 | username | Rp 100.000
📊 Successfully archived: 5
```

### 3. Test Cron Endpoint (Local Development)

**Windows (cmd):**
```cmd
curl -X POST http://localhost:3000/api/cron/archive-donations -H "x-cron-secret: nyumbangin_cron_secret_2025_secure_key_12345"
```

**PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/archive-donations" -Method POST -Headers @{"x-cron-secret"="nyumbangin_cron_secret_2025_secure_key_12345"}
```

**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2025-10-27T10:00:00.000Z",
  "total": 5,
  "archived": 5,
  "failed": 0
}
```

## Troubleshooting

### ❌ Notifikasi tidak dibuat?

1. **Cek webhook Midtrans:**
   - Logs di console saat payment berhasil
   - Harus ada log: `✅ Notification created for donation: ...`

2. **Test manual di MongoDB:**
   ```javascript
   db.notifications.find({ type: "DONATION" }).sort({ createdAt: -1 })
   ```

3. **Verify model import:**
   - File: `pages/api/webhook/midtrans.js`
   - Import: `import Notification from '@/models/Notification';`

### ❌ Archive tidak jalan?

1. **Cek donasi eligible untuk archive:**
   ```javascript
   db.donations.find({ 
     status: 'PAID', 
     createdAt: { $lt: new Date(Date.now() - 24*60*60*1000) }
   })
   ```

2. **Run manual script:**
   ```bash
   node scripts/archive-old-donations.js
   ```

3. **Check environment variable:**
   - `.env` harus punya `CRON_SECRET`

### ❌ Cron endpoint unauthorized?

1. **Verify header:**
   - Header: `x-cron-secret`
   - Value harus match dengan `.env`

2. **Check .env file:**
   ```env
   CRON_SECRET=nyumbangin_cron_secret_2025_secure_key_12345
   ```

## Production Testing

### Setup Cron Job di cron-job.org

1. **URL:** `https://your-domain.vercel.app/api/cron/archive-donations`
2. **Schedule:** `0 */6 * * *` (every 6 hours)
3. **Headers:**
   ```
   x-cron-secret: your-secret-here
   ```

### Monitor Logs

**Vercel:**
- Dashboard → Your Project → Functions → Logs
- Filter: `archive-donations`

**Check Response:**
```json
{
  "success": true,
  "archived": 10,
  "failed": 0
}
```

## Verification Checklist

- [ ] Webhook Midtrans membuat notifikasi saat PAID
- [ ] Notifikasi tersimpan di collection `notifications`
- [ ] Archive manual script berfungsi
- [ ] Cron endpoint protected dengan secret
- [ ] Donasi terarchive ke `donation_history`
- [ ] Original donations terhapus setelah archive
- [ ] Cron job setup dan berjalan (production)

## Database Queries

### Check Notifications
```javascript
// Count notifications
db.notifications.countDocuments({ type: "DONATION" })

// Recent notifications
db.notifications.find({}).sort({ createdAt: -1 }).limit(10)

// Unread notifications for creator
db.notifications.find({ creatorId: ObjectId("..."), isRead: false })
```

### Check Archives
```javascript
// Count archived donations
db.donation_history.countDocuments({ archivedReason: "AUTO_24H" })

// Recent archives
db.donation_history.find({}).sort({ archivedAt: -1 }).limit(10)

// Monthly stats
db.donation_history.find({ 
  createdBy: ObjectId("..."), 
  monthYear: "2025-10" 
})
```

### Verify Archive Integrity
```javascript
// Check if donation exists in both collections (should be 0)
const donationId = ObjectId("...");
db.donations.find({ _id: donationId })
db.donation_history.find({ originalDonationId: donationId })
// Only one should return result
```

---

**Need Help?** Check `ARCHIVE_SETUP.md` for detailed documentation.
