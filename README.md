# Nyumbangin - Platform Donasi untuk Content Creator & Live Streamer

**Nyumbangin** adalah platform donasi digital yang dirancang khusus untuk content creator, streamer, dan influencer Indonesia. Platform ini memungkinkan creator untuk menerima donasi dari audience dengan fitur notifikasi real-time yang dapat diintegrasikan langsung ke dalam live streaming atau konten mereka.

## 🎯 Apa itu Nyumbangin?

Nyumbangin adalah solusi lengkap untuk creator yang ingin:
- **Menerima donasi** dari audience dengan mudah
- **Menampilkan notifikasi donasi** secara real-time di live stream (OBS, TikTok Live Studio, dll)
- **Mengelola donasi** melalui dashboard yang user-friendly
- **Melihat leaderboard donatur** untuk engagement yang lebih baik
- **Memiliki link donasi personal** yang mudah dibagikan

## 🚀 Fitur Utama

### 💰 **Sistem Donasi Multi-Creator**
- Setiap creator memiliki **username unik** dan **link donasi personal** (`/donate/username`)
- Donasi langsung masuk tanpa perlu approval manual
- Minimal donasi Rp 1.000 dengan sistem yang aman
- Statistik donasi terpisah per creator

### 🎮 **Overlay untuk Live Streaming**
- **Notifikasi Donasi Real-time**: Tampilkan nama donatur, jumlah, dan pesan secara otomatis
- **Leaderboard Donatur**: Tampilkan top donatur bulan ini dengan ranking
- **Kompatibel dengan OBS**: Browser source yang siap pakai untuk streaming
- **Efek Suara**: Notifikasi audio otomatis saat ada donasi masuk
- **Konfigurasi Fleksibel**: Atur ukuran, posisi, dan tampilan overlay

### 📊 **Dashboard Creator**
- **Manajemen Donasi**: Lihat, kelola, dan hapus donasi
- **Statistik Real-time**: Total donasi, jumlah donatur, dan analytics
- **Riwayat Harian**: Filter donasi berdasarkan tanggal
- **Leaderboard Bulanan**: Lihat donatur terbaik yang reset setiap bulan
- **Session Timeout**: Keamanan dengan auto-logout setelah 3 jam

### 🔔 **Notifikasi Real-time**
- **WebSocket Integration**: Notifikasi instan saat ada donasi baru
- **Sound Effects**: Efek suara kustomisasi untuk setiap donasi
- **Animasi Smooth**: Transisi yang menarik untuk overlay
- **Auto-hide**: Notifikasi hilang otomatis setelah beberapa detik

## 🎨 Halaman & Fitur

### **Untuk Creator:**
- **`/creator/register`** - Registrasi creator baru dengan username unik
- **`/login`** - Login ke dashboard creator
- **`/dashboard`** - Panel kontrol lengkap untuk mengelola donasi
- **`/overlay/{username}/notifications`** - Halaman overlay notifikasi untuk OBS
- **`/overlay/{username}/leaderboard`** - Halaman overlay leaderboard untuk OBS

### **Untuk Donatur (Public):**
- **`/donate/{username}`** - Halaman donasi creator dengan profil dan form donasi
- **`/`** - Homepage platform dengan informasi umum

## 🛠️ Teknologi yang Digunakan

### **Frontend:**
- **Next.js 14** - React framework dengan App Router
- **Tailwind CSS** - Styling yang responsive dan modern
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client untuk API calls
- **React Hot Toast** - Notifikasi yang elegant

### **Backend:**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - Database NoSQL untuk menyimpan data
- **Mongoose** - ODM untuk MongoDB
- **JWT** - Authentication dengan session timeout 3 jam
- **Socket.io** - Real-time WebSocket server
- **bcryptjs** - Password hashing yang aman

### **External Services:**
- **Railway Socket Server** - External WebSocket server untuk reliability
- **MongoDB Atlas** - Cloud database (opsional)

## 📱 Cara Penggunaan

### **Untuk Creator:**

1. **Daftar sebagai Creator**
   ```
   1. Kunjungi /creator/register
   2. Isi email, password, username unik, dan display name
   3. Username akan menjadi link donasi: /donate/username
   ```

2. **Setup Live Streaming**
   ```
   1. Login ke dashboard
   2. Copy link overlay notifikasi dan leaderboard
   3. Tambahkan sebagai Browser Source di OBS
   4. Atur posisi dan ukuran sesuai kebutuhan
   ```

3. **Kelola Donasi**
   ```
   1. Monitor donasi real-time di dashboard
   2. Lihat statistik dan leaderboard donatur
   3. Kelola riwayat donasi harian/bulanan
   ```

### **Untuk Donatur:**

1. **Berdonasi ke Creator**
   ```
   1. Kunjungi /donate/{username-creator}
   2. Isi nama, jumlah donasi (min. Rp 1.000), dan pesan
   3. Klik "Kirim Donasi"
   4. Donasi langsung masuk dan muncul di overlay creator
   ```

## 🔧 Instalasi & Setup

### **Prerequisites:**
- Node.js 18+ 
- MongoDB (local atau cloud)
- Git


## 📊 Database Schema

### **User (Creator) Model:**
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  username: String (unique, required), // untuk link donasi
  displayName: String (required),      // nama tampilan
  description: String,                 // bio creator
  role: String (default: 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

### **Donation Model:**
```javascript
{
  name: String (required),           // nama donatur
  amount: Number (required),         // jumlah donasi
  message: String,                   // pesan donatur
  status: String (default: 'PAID'), // status donasi
  merchant_ref: String (unique),     // referensi unik
  owner: ObjectId (ref: 'User'),     // creator penerima
  ownerUsername: String,             // username creator
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Use Cases

### **Content Creator YouTube/TikTok:**
- Tampilkan notifikasi donasi di video live streaming
- Leaderboard donatur untuk meningkatkan engagement
- Link donasi di bio untuk monetisasi konten

### **Live Streamer Gaming:**
- Notifikasi donasi real-time saat streaming game
- Sound effect kustomisasi untuk setiap donasi
- Dashboard untuk tracking performa donasi

### **Influencer & KOL:**
- Platform donasi personal yang profesional
- Analytics donasi untuk laporan sponsor
- Engagement tools dengan leaderboard donatur

## 🔒 Keamanan & Privasi

- **JWT Authentication** dengan session timeout 3 jam
- **Password Hashing** menggunakan bcryptjs
- **Data Isolation** per creator (multi-tenant)
- **Input Validation** untuk mencegah injection attacks
- **Auto-logout** untuk keamanan session


## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---

**Nyumbangin** - Empowering Indonesian Content Creators 🇮🇩

*Made with ❤️ for Indonesian Creator Community*
