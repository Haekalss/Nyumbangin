# Testing Image Upload Feature

## ✅ Build Status
- **Build**: SUCCESS ✅
- **Server**: Running on http://localhost:3002 ✅

## 🔧 Perbaikan yang Dilakukan

### Problem
Error: `Cannot find module './8548.js'` - terjadi karena webpack tidak bisa handle `fs` dan `path` module di build time.

### Solution
1. **Menambahkan runtime config**: `runtime: 'nodejs'` di API config untuk memastikan API berjalan di Node.js runtime (bukan Edge)
2. **Dynamic Import**: Mengubah static import menjadi dynamic import untuk `fs` dan `path`
   ```javascript
   const fs = await import('fs');
   const path = await import('path');
   ```

### Files Modified
- `pages/api/contact.js` - API handler dengan dynamic imports

## 📝 Testing Steps

### 1. Test Form Contact (User Side)
1. Buka browser: http://localhost:3002/contact
2. Isi form:
   - Nama: "Test User"
   - Email: "test@email.com"
   - Subjek: "Test Upload Gambar"
   - Pesan: "Ini adalah test upload gambar"
3. Klik area "📷 Klik untuk upload gambar"
4. Pilih gambar (PNG/JPG, max 5MB)
5. Verify preview muncul
6. Klik "📧 Kirim Pesan"
7. Check toast notification sukses

### 2. Verify Image Saved
1. Cek folder: `C:\Nyumbangin\public\uploads\contact\`
2. Verify gambar tersimpan dengan format: `contact-{timestamp}-{random}.{ext}`

### 3. Test Admin Dashboard (Admin Side)
1. Login sebagai admin
2. Buka Admin Dashboard: http://localhost:3002/admin
3. Masuk ke section "Feedback & Saran"
4. Cari feedback yang baru dibuat
5. Verify ada badge "📷 Ada Gambar"
6. Klik feedback untuk detail
7. Verify gambar ditampilkan
8. Test link "🔗 Buka gambar di tab baru"

## ✅ Expected Results

### Database (MongoDB)
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@email.com",
  "subject": "Test Upload Gambar",
  "message": "Ini adalah test upload gambar",
  "imageUrl": "/uploads/contact/contact-1734272400000-abc123.png",
  "status": "unread",
  "createdAt": "2025-12-15T...",
  "updatedAt": "2025-12-15T..."
}
```

### File System
```
public/uploads/contact/
├── contact-1734272400000-abc123.png
├── contact-1734272401000-def456.jpg
└── ...
```

### Frontend
- ✅ Upload gambar berhasil
- ✅ Preview gambar muncul
- ✅ Form submit sukses
- ✅ Toast notification "Pesan berhasil dikirim!"

### Admin Dashboard
- ✅ Badge "📷 Ada Gambar" muncul di list
- ✅ Gambar ditampilkan di detail modal
- ✅ Link untuk buka gambar berfungsi

## 🐛 Troubleshooting

### Jika masih error setelah fix:
1. Clear build cache:
   ```powershell
   Remove-Item -Recurse -Force .next
   npm run build
   ```

2. Restart dev server:
   ```powershell
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. Check folder permissions:
   ```powershell
   # Pastikan folder uploads bisa di-write
   Test-Path "public\uploads\contact"
   ```

### Jika gambar tidak muncul di admin:
1. Verify imageUrl di database
2. Check path gambar: `/uploads/contact/...`
3. Verify file exists di folder public
4. Check browser console untuk error

## 🎯 Performance Notes

### Client-side Validations
- ✅ File type: image/* only
- ✅ File size: max 5MB
- ✅ Preview before upload

### Server-side Validations
- ✅ Base64 format check
- ✅ Image type validation
- ✅ File size limit (5MB)
- ✅ Unique filename generation

### Storage
- Location: `public/uploads/contact/`
- Format: `contact-{timestamp}-{random}.{ext}`
- Public accessible: Yes (via URL)

## ✨ Feature Summary

### User Benefits:
- 📷 Dapat melampirkan screenshot/gambar
- 👁️ Preview gambar sebelum kirim
- ⚡ Upload cepat dan mudah

### Admin Benefits:
- 📊 Lihat feedback dengan lampiran gambar
- 🔍 Badge indikator ada gambar
- 🖼️ Preview gambar langsung di modal
- 🔗 Link untuk buka full size

## 🚀 Next Steps (Optional Improvements)

1. **Image Compression**: Compress gambar otomatis untuk save storage
2. **Cloud Storage**: Migrate ke Cloudinary/AWS S3 untuk scalability
3. **Multiple Images**: Support upload multiple images
4. **Drag & Drop**: Better UX dengan drag & drop interface
5. **Image Crop**: Allow user crop/resize before upload
