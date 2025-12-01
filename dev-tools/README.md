# Development & Maintenance Tools

Folder ini berisi script manual untuk maintenance, debugging, dan development. Script ini **tidak dijalankan otomatis** dan hanya digunakan oleh developer saat diperlukan.

## 📂 Kategori Script

### Cleanup & Archive
- `archive-old-donations.js` - Arsip donasi lama ke collection history
- `cleanup-old-notifications.js` - Hapus notifikasi kadaluarsa
- `cleanup-mediashare-notifications.js` - Bersihkan notifikasi mediashare
- `cleanup-profile-images.js` - Hapus gambar profil yang tidak terpakai

### Fix & Debug
- `fix-admin-permissions.js` - Perbaiki permission admin
- `fix-donations-paidout.js` - Perbaiki flag isPaidOut pada donasi
- `fix-pending.js` - Perbaiki status pending yang stuck
- `fix-processed-payouts.js` - Perbaiki status payout processed
- `debug-payout.js` - Debug masalah payout

### Creator Stats & Leaderboard Tools
- `check-creator-stats.js` - Cek stats creator (tanpa update)
  ```bash
  node dev-tools/check-creator-stats.js <username>
  ```
- `update-creator-stats.js` - Update stats creator secara manual
  ```bash
  node dev-tools/update-creator-stats.js <username>
  ```
- `check-creator-leaderboard.js` - Cek leaderboard bulanan creator
  ```bash
  node dev-tools/check-creator-leaderboard.js <username> [year] [month]
  # Example: node dev-tools/check-creator-leaderboard.js johndoe 2025 12
  ```
- `update-creator-leaderboard.js` - Update leaderboard bulanan creator
  ```bash
  node dev-tools/update-creator-leaderboard.js <username> [year] [month]
  ```

### Testing & Development
- `test-mediashare-api.js` - Test API mediashare
- `test-webhook-manually.js` - Simulasi webhook Midtrans manual
- `create-test-mediashare.js` - Buat data test mediashare
- `check-last-donation.js` - Cek donasi terakhir
- `check-latest-real-donation.js` - Cek donasi terakhir yang valid
- `check-mediashare-username.js` - Cek mediashare berdasarkan username
- `reprocess-mediashare.js` - Proses ulang mediashare
- `reprocess-failed-mediashare.js` - Proses ulang mediashare yang gagal

## 🚀 Cara Menggunakan

### Setup Environment
Pastikan file `.env` sudah dikonfigurasi dengan benar:
```bash
MONGO_URI=mongodb://...
CRON_SECRET=...
# dll
```

### Menjalankan Script

**Via npm script:**
```bash
npm run archive
```

**Direct execution:**
```bash
node dev-tools/archive-old-donations.js
node dev-tools/fix-admin-permissions.js
node dev-tools/cleanup-old-notifications.js
```

## ⚠️ Perhatian

- Script ini memodifikasi database secara langsung
- **Selalu backup database** sebelum menjalankan fix/cleanup script
- Script hanya untuk development/staging, tidak untuk production (kecuali archive)
- Pastikan memahami script sebelum menjalankan

## 📝 Maintenance Schedule (Opsional)

Script yang bisa dijadwalkan secara periodik:
- `archive-old-donations.js` - Bulanan
- `cleanup-old-notifications.js` - Mingguan
- `cleanup-profile-images.js` - Bulanan

## 🔒 Security

Beberapa script memerlukan environment variable khusus:
- `CRON_SECRET` - untuk script yang dipanggil via cron
- `MONGO_URI` - koneksi database

Jangan commit nilai environment variable ke repository.
