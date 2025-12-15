# 📬 Sistem Feedback Admin - Nyumbangin

## 📋 Overview
Sistem feedback ini memungkinkan pengguna mengirim saran/masukan melalui halaman Contact, dan admin dapat mengelolanya melalui dashboard admin.

## 🎯 Fitur

### Untuk Pengguna:
- ✅ Form contact di `/contact` untuk mengirim saran/masukan
- ✅ Validasi input (nama, email, subjek, pesan)
- ✅ Notifikasi sukses/gagal saat mengirim

### Untuk Admin:
- ✅ Menu "Feedback" di sidebar admin
- ✅ Statistik feedback (Total, Belum Dibaca, Sudah Dibaca, Sudah Dibalas)
- ✅ Filter berdasarkan status
- ✅ Pencarian berdasarkan nama, email, atau subjek
- ✅ Detail view dengan modal
- ✅ Update status (Belum Dibaca → Sudah Dibaca → Sudah Dibalas)
- ✅ Menambah catatan admin (internal notes)
- ✅ Hapus feedback
- ✅ Button "Balas via Email" untuk langsung buka email client
- ✅ Auto-mark as read ketika dibuka

## 📁 File yang Dibuat/Dimodifikasi

### API Endpoints:
1. **`pages/api/contact.js`** - Endpoint untuk user submit feedback
   - Method: `POST`
   - Body: `{ name, email, subject, message }`
   - Response: Success message dengan data feedback

2. **`pages/api/admin/feedback.js`** - Endpoint untuk admin kelola feedback
   - `GET` - Ambil semua feedback dengan filter & pagination
   - `PUT` - Update status & admin notes
   - `DELETE` - Hapus feedback

### Models:
3. **`src/models/Contact.js`** - Updated dengan field `adminNotes`

### Components:
4. **`src/components/organisms/FeedbackSection.js`** - Main section untuk tampilan list feedback
5. **`src/components/organisms/FeedbackDetailModal.js`** - Modal untuk detail & aksi feedback
6. **`src/components/organisms/AdminSidebar.js`** - Updated dengan menu Feedback

### Pages & Hooks:
7. **`src/app/admin/page.js`** - Updated dengan FeedbackSection integration
8. **`src/hooks/useAdminData.js`** - Updated dengan fetch feedbacks function

## 🔄 Flow Kerja

### User Side:
1. User mengisi form di `/contact`
2. Submit → API `/api/contact` menyimpan ke database
3. Status default: `unread`
4. User mendapat notifikasi sukses

### Admin Side:
1. Admin login ke dashboard admin
2. Klik menu "Feedback" di sidebar
3. Melihat list feedback dengan badge status
4. Klik feedback untuk melihat detail
5. Otomatis mark as `read` jika status `unread`
6. Admin bisa:
   - Update status (unread/read/replied)
   - Tambah catatan internal
   - Balas via email
   - Hapus feedback

## 📊 Status Feedback

| Status | Emoji | Keterangan |
|--------|-------|------------|
| `unread` | 🔔 | Feedback baru yang belum dibaca |
| `read` | 👁️ | Sudah dibaca tapi belum dibalas |
| `replied` | ✅ | Sudah dibalas via email |

## 🎨 UI/UX Features

- **Auto-highlight**: Feedback unread memiliki background kuning
- **NEW badge**: Feedback unread ditandai dengan badge merah "NEW"
- **Stats cards**: 4 kartu statistik di atas list
- **Search & filter**: Real-time search dan filter berdasarkan status
- **Responsive design**: Bekerja di berbagai ukuran layar
- **Loading states**: Spinner saat loading data
- **Error handling**: Tampilan error yang user-friendly

## 🔒 Security

- ✅ Admin-only access (JWT verification)
- ✅ Input validation & sanitization
- ✅ SQL injection protection (Mongoose)
- ✅ XSS protection
- ✅ Rate limiting (recommended untuk production)

## 🚀 Usage

### Testing Flow:
1. Buka `/contact` sebagai user
2. Isi form dan submit
3. Login sebagai admin
4. Buka menu "Feedback"
5. Test semua fitur (view, update status, add notes, delete)

### Production Tips:
- Implementasi email notifications untuk admin saat ada feedback baru
- Tambah rate limiting di API contact
- Setup email auto-reply untuk user
- Backup data feedback secara berkala

## 📝 Notes
- Feedback disimpan di collection `contacts`
- IP address & user agent dicatat untuk tracking
- Admin notes bersifat internal (tidak dikirim ke user)
- Soft delete bisa diimplementasikan jika diperlukan
