# Nyumbangin

Platform donasi digital untuk content creator dan live streamer Indonesia.

---

## 🎯 What (Apa itu Nyumbangin?)

**Nyumbangin** adalah platform donasi yang memungkinkan content creator menerima dukungan finansial dari audience mereka. Platform ini dilengkapi dengan notifikasi real-time yang bisa ditampilkan langsung di live streaming.

### Fitur Utama:
- 💰 **Link Donasi Personal** - Setiap creator punya link unik untuk menerima donasi
- 🎮 **Overlay Streaming** - Notifikasi donasi dan leaderboard yang bisa ditampilkan di OBS
- 📊 **Dashboard Creator** - Kelola donasi, lihat statistik, dan track performa
- 🔔 **Real-time Notification** - Donasi langsung muncul di stream dengan efek suara
- 🏆 **Leaderboard Donatur** - Top donatur bulanan untuk meningkatkan engagement

---

## 💡 Why (Kenapa Pakai Nyumbangin?)

### Untuk Creator:
- ✅ **Mudah Digunakan** - Setup cepat, langsung bisa terima donasi
- ✅ **Profesional** - Tampilan overlay yang menarik untuk streaming
- ✅ **Engagement Tinggi** - Leaderboard memotivasi audience untuk support lebih
- ✅ **Aman** - Sistem payment gateway terintegrasi dengan Midtrans
- ✅ **Gratis** - Tidak ada biaya bulanan untuk menggunakan platform

### Untuk Donatur:
- ✅ **Praktis** - Donasi via QRIS, Virtual Account, atau metode payment lainnya
- ✅ **Minimal Rp 1.000** - Bisa support creator dengan nominal kecil
- ✅ **Pesan Personal** - Bisa kirim pesan yang ditampilkan di stream
- ✅ **Transparansi** - Nama dan jumlah donasi langsung terlihat

---

## 👥 Who (Untuk Siapa?)

### Content Creator & Streamer:
- 🎮 **Gamers** - Streamer game di YouTube, Twitch, TikTok Live
- 🎤 **Podcaster** - Content creator audio/video
- 🎨 **Artist** - Digital artist, ilustrator yang live drawing
- 📚 **Educator** - Pengajar online, tutor
- 🎭 **Entertainer** - Comedian, performer, MC

### Audience/Donatur:
- Siapa saja yang ingin mendukung creator favorit mereka
- Penggemar setia yang ingin masuk leaderboard
- Komunitas yang ingin apresiasi konten berkualitas

---

## ⏰ When (Kapan Digunakan?)

### Saat Live Streaming:
- Tampilkan notifikasi donasi real-time di layar
- Motivasi audience dengan leaderboard donatur
- Berterima kasih langsung saat ada donasi masuk

### Setiap Hari:
- Share link donasi di bio social media
- Post donasi goal di Instagram Story
- Promosikan support link di video YouTube

### Event Khusus:
- Fundraising untuk project baru
- Charity stream untuk sosial
- Anniversary atau milestone celebration

---

## 🌐 Where (Dimana Bisa Diakses?)

### Website:
**https://nyumbangin.web.id**

### Halaman Penting:
- **Homepage**: `https://nyumbangin.web.id`
- **Registrasi**: `https://nyumbangin.web.id/creator/register`
- **Login**: `https://nyumbangin.web.id/login`
- **Link Donasi**: `https://nyumbangin.web.id/donate/[username]`

### Kompatibilitas:
- ✅ Desktop (untuk dashboard dan setup overlay)
- ✅ Mobile (untuk halaman donasi)
- ✅ OBS Studio (untuk streaming overlay)
- ✅ TikTok Live Studio
- ✅ Streamlabs OBS

---

## 🚀 How (Bagaimana Cara Menggunakannya?)

### 🔧 Setup Development:

#### 1️⃣ **Clone Repository**
```bash
git clone https://github.com/yourusername/nyumbangin.git
cd nyumbangin
```

#### 2️⃣ **Install Dependencies**
```bash
npm install
```

#### 3️⃣ **Setup Environment Variables**
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local dengan credentials kamu
```

📚 **Panduan Lengkap Dapat Credentials**

Minimal yang perlu diisi:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Generate: `node generate-secret.js`
- `MIDTRANS_*` - Payment gateway (sandbox)
- `SMTP_*` - Email service (opsional)

#### 4️⃣ **Run Development Server**
```bash
npm run dev
```
Buka: http://localhost:3000

---

### Untuk Creator:

#### 1️⃣ **Registrasi**
1. Kunjungi `https://nyumbangin.web.id/creator/register`
2. Pilih username unik (akan jadi link donasi kamu)
3. Isi data diri dan buat password
4. Verifikasi dan akun siap digunakan

#### 2️⃣ **Setup Dashboard**
1. Login di `https://nyumbangin.web.id/login`
2. Lihat statistik donasi, total pemasukan, jumlah donatur
3. Kelola donasi yang masuk
4. Download QR code untuk share di media sosial

#### 3️⃣ **Pasang Overlay di OBS**
1. Buka OBS Studio
2. Tambah **Browser Source**
3. Copy paste URL overlay dari dashboard:
   - Notifikasi: `/overlay/[username]/notifications`
   - Leaderboard: `/overlay/[username]/leaderboard`
4. Atur posisi dan ukuran sesuai layout stream

#### 4️⃣ **Promosikan Link Donasi**
1. Share link donasi: `https://nyumbangin.web.id/donate/[username]`
2. Pasang di bio Instagram, TikTok, YouTube
3. Promosikan saat live streaming
4. Post QR code di Instagram Story

### Untuk Donatur:

#### 1️⃣ **Buka Link Donasi**
- Klik link dari bio creator atau dari chat stream
- Format: `https://nyumbangin.web.id/donate/[username-creator]`

#### 2️⃣ **Isi Form Donasi**
- Masukkan nama (akan ditampilkan di stream)
- Pilih nominal atau input jumlah custom (min. Rp 1.000)
- Tulis pesan untuk creator (opsional)

#### 3️⃣ **Pilih Metode Pembayaran**
- QRIS (scan dengan e-wallet apapun)
- Virtual Account (Bank Transfer)
- E-wallet langsung
- Kartu Kredit/Debit

#### 4️⃣ **Selesaikan Pembayaran**
- Ikuti instruksi pembayaran
- Setelah sukses, donasi langsung muncul di stream creator
- Nama kamu masuk leaderboard (jika donasi cukup besar)

---

## � Email Notifications

Platform ini dilengkapi dengan sistem notifikasi email otomatis untuk payout:

### Fitur Email:
- ✅ **Auto-send saat payout approved** - Creator langsung dapat notifikasi via email
- ✅ **Auto-send saat payout rejected** - Dengan alasan penolakan yang jelas
- ✅ **Beautiful HTML template** - Email profesional dengan design menarik
- ✅ **Detail lengkap** - Jumlah, referensi, dan informasi bank

---

## �📞 Contact & Support

**Email**: admin@nyumbangin.web.id  
**Instagram**: @nyumbangin  

---

**Nyumbangin** - Empowering Indonesian Content Creators 🇮🇩

