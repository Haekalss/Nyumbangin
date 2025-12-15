# Fitur Upload Gambar di Contact Form

## Overview
Fitur ini memungkinkan pengguna untuk melampirkan gambar/screenshot saat mengirim pesan melalui form "Hubungi Kami". Gambar yang diupload akan tersimpan dan ditampilkan di halaman admin feedback.

## Fitur yang Ditambahkan

### 1. Model Database
**File:** `src/models/Contact.js`
- Menambahkan field `imageUrl` untuk menyimpan path gambar

### 2. API Backend
**File:** `pages/api/contact.js`
- Menambahkan handler untuk menerima dan menyimpan gambar
- Validasi gambar (format dan ukuran max 5MB)
- Konversi base64 ke file dan simpan di `public/uploads/contact/`
- Filename format: `contact-{timestamp}-{random}.{extension}`

### 3. Contact Form (Frontend)
**File:** `src/app/contact/page.js`
- Menambahkan input file untuk upload gambar
- Preview gambar sebelum submit
- Validasi client-side (tipe file dan ukuran)
- Tombol hapus gambar jika ingin dibatalkan

### 4. Admin Feedback Display
**File:** `src/components/organisms/FeedbackSection.js`
- Menambahkan badge "📷 Ada Gambar" pada list feedback yang memiliki lampiran

**File:** `src/components/organisms/FeedbackDetailModal.js`
- Menampilkan gambar dalam modal detail feedback
- Link untuk membuka gambar di tab baru

## Validasi

### Client-side (Frontend)
- ✅ File harus berupa gambar (image/*)
- ✅ Ukuran maksimal 5MB
- ✅ Preview sebelum upload

### Server-side (Backend)
- ✅ Validasi format base64
- ✅ Validasi tipe gambar (PNG, JPG, GIF, dll)
- ✅ Validasi ukuran maksimal 5MB
- ✅ Generate unique filename

## File Structure

```
public/
  uploads/
    contact/           # Folder untuk menyimpan gambar contact
      contact-*.png
      contact-*.jpg
      ...
```

**Note:** Folder `public/uploads/` sudah ditambahkan ke `.gitignore` agar gambar upload tidak masuk ke repository.

## Cara Penggunaan

### Untuk User:
1. Buka halaman "Hubungi Kami" 
2. Isi form seperti biasa (nama, email, subjek, pesan)
3. **(Optional)** Klik area upload untuk memilih gambar
4. Preview gambar akan muncul
5. Klik "Kirim Pesan"

### Untuk Admin:
1. Buka halaman Admin Dashboard
2. Masuk ke section "Feedback & Saran"
3. Feedback dengan gambar akan memiliki badge "📷 Ada Gambar"
4. Klik feedback untuk melihat detail
5. Gambar akan ditampilkan di bagian "📷 Lampiran Gambar"
6. Klik "🔗 Buka gambar di tab baru" untuk melihat gambar ukuran penuh

## Technical Details

### Image Processing Flow:
1. User selects image → File converted to base64
2. Base64 sent to API via POST request
3. API validates and decodes base64
4. Save as file in `public/uploads/contact/`
5. Save path to MongoDB
6. Admin can view image from saved path

### Security Considerations:
- ✅ File type validation
- ✅ File size limit (5MB)
- ✅ Unique filename generation (prevent overwrite)
- ✅ Stored in public folder (accessible but not executable)

## Improvements yang Bisa Dilakukan:
1. Kompresi gambar otomatis untuk mengurangi ukuran file
2. Integration dengan cloud storage (Cloudinary, AWS S3, dll)
3. Multiple image upload
4. Drag & drop interface
5. Image crop/resize sebelum upload
