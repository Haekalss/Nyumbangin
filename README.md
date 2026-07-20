# Nyumbangin — Digital Donation & Real-Time Stream Overlay Platform

Nyumbangin adalah platform donasi digital modern dan agregator stream overlay interaktif berbasis full-stack (Next.js, TypeScript, dan MongoDB). Platform ini memungkinkan penerimaan donasi instan, pemrosesan pembayaran otomatis via payment gateway, serta integrasi alert real-time ke perangkat lunak penyiaran seperti OBS Studio dan Streamlabs.

## Apa & Untuk Apa Repositori Ini?

Repositori ini berisi seluruh kode sumber (source code) sistem Nyumbangin yang berfungsi sebagai pusat pengembangan untuk tiga domain utama:

- **Monetisasi Kreator**: Menyediakan antarmuka transaksi bagi pendukung untuk memberikan donasi ke streamer menggunakan payment gateway (Midtrans) dengan dukungan pembayaran lokal (QRIS, E-Wallet, Virtual Account).

- **Notifikasi Interaktif Real-Time**: Menyediakan widget browser source untuk OBS Studio/Streamlabs yang memicu notifikasi visual, pesan pendukung, progress goal, dan efek suara (audio alert) secara instan saat transaksi terverifikasi.

- **Manajemen & Penarikan Dana**: Menyediakan dashboard bagi creator untuk memantau pendapatan, mengelola target kampanye, dan mengajukan penarikan saldo (payout/withdrawal) secara transparan.

## Executive Summary (5W + 1H)

| Aspek | Penjelasan |
|-------|-----------|
| **What** | Platform monetisasi dan notifikasi donasi interaktif berbasis web untuk streamer dan content creator. |
| **Why** | Memangkas kompleksitas integrasi pembayaran lokal dan memberikan pengalaman apresiasi audiens secara instan dan transparan. |
| **Who** | Ditujukan bagi Streamers/Creators (penerima donasi), Supporters/Donators (pendukung), serta Admins (pengelola sistem & verifikasi payout). |
| **Where** | Aplikasi web terdistribusi dengan browser source widget yang kompatibel dengan OBS Studio, Streamlabs, dan vMix. |
| **When** | Beroperasi 24/7 dengan arsitektur pemrosesan transaksi real-time berbasis webhooks dan websockets. |
| **How** | Transaksi diinisiasi pendukung → Divalidasi oleh Midtrans Payment Gateway → Server memicu event Socket.io → Overlay di layar stream memperbarui tampilan secara real-time. |

## Fitur Utama

### Streamer & Creator Features

- **Live Overlay Alerts**: Widget customizable (pesan, gambar, animasi, dan audio trigger) untuk OBS/Streamlabs via WebSocket.
- **Campaign & Milestone Goals**: Lacak target penggalangan dana secara visual (progress bar dinamis).
- **Payout Management**: Sistem pengajuan penarikan saldo donasi (withdrawal) ke rekening bank lokal maupun e-wallet.
- **Transaction History & Analytics**: Dashboard rinci untuk memantau ringkasan pendapatan dan daftar pendukung.

### Donator Features

- **Multi-Payment Gateway Integration**: Memproses transaksi via QRIS, GoPay, OVO, ShopeePay, Virtual Account, dan Transfer Bank.
- **Interactive Media Messages**: Mendukung pengiriman pesan khusus, Text-to-Speech (TTS), dan lampiran media saat berdonasi.
- **Guest & Anonymous Mode**: Kemudahan berdonasi tanpa kewajiban pendaftaran akun.

### Administrative & System Features

- **Role-Based Access Control (RBAC)**: Pembagian hak akses yang ketat antara Admin, Creator, dan User.
- **Payout Audit & Verification**: Panel validasi manual/otomatis untuk setiap pengajuan pencairan dana.
- **Audit Logging**: Pencatatan histori transaksi dan webhook events untuk keamanan audit keuangan.

## Arsitektur & Webhook Flow

### Data Flow Diagram

```
[ Donator ] ──( 1. Buat Donasi )──> [ Next.js Frontend ]
                                        │
                                        ▼ ( 2. Request Transaction )
                                [ Midtrans Gateway ]
                                        │
                                        ▼ ( 3. Pembayaran Sukses )
                              [ Webhook Handler API ]
                                        │
                        ┌───────────────────────┬───────────────────────┐
                        ▼                       ▼
         [ Save Transaction DB ]     [ Emit Socket.io Event ]
                                                │
                                                ▼
                                        [ OBS / Streamlabs ]
```

### Payment Webhook Contract (POST /api/webhooks/midtrans)

Menerima callback otomatis dari Midtrans untuk pembaruan status transaksi.

- **Headers**: `Content-Type: application/json`

**Trigger Process**:
1. Validasi signature_key berbasis SHA-512.
2. Jika status settlement atau capture, ubah status donasi di DB menjadi PAID.
3. Emit pesan ke namespace Socket.io `/overlay` untuk memicu alert di OBS.

## Keamanan & Moderasi Konten

- **Profanity & Bad Word Filter**: Penyaringan otomatis terhadap kata-kata kasar atau sensitif pada pesan donasi dan Text-to-Speech (TTS) sebelum ditampilkan di stream overlay.

- **Signature Verification**: Validasi keamanan berbasis hashing pada setiap payload webhook untuk mencegah manipulasi data transaksi.

- **Rate Limiting**: Proteksi endpoint formulir donasi dari serangan DDoS dan transaksi buatan (spam).

- **RBAC Protection**: Pembatasan akses berbasis peran (ADMIN, CREATOR, USER) pada endpoint sensitif seperti pencairan dana.

## Struktur Direktori Proyek

```
Nyumbangin/
├── public/                 # Aset statis (logo, audio alerts, gambar)
├── src/
│   ├── components/         # UI Components (UI Kit, Modals, Forms)
│   ├── config/             # Konfigurasi Midtrans, Database, & Auth
│   ├── lib/                # Helper functions, DB connection, & Utilities
│   ├── models/             # Schema Mongoose (User, Donation, Campaign, Payout)
│   ├── pages/              # Next.js Pages & API Routes
│   │   ├── api/            # REST API & Webhook Handlers
│   │   ├── dashboard/      # Panel kontrol Creator & Admin
│   │   └── overlay/        # Browser Source Widgets untuk OBS
│   ├── styles/             # Global CSS & Tailwind Configuration
│   └── types/              # TypeScript Interfaces & Definitions
├── .env.example            # Template Environment Variables
├── package.json
└── README.md
```

## Panduan Memulai (Getting Started)

### Prasyarat

- **Node.js**: v18.x atau lebih baru
- **Package Manager**: npm atau pnpm
- **Database**: MongoDB (Lokal atau MongoDB Atlas)
- **Payment Gateway**: Akun Sandbox/Production Midtrans

### 1. Cloning Repositori

```bash
git clone https://github.com/Haekalss/Nyumbangin.git
cd Nyumbangin
```

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` berdasarkan templat `.env.example`:

```bash
cp .env.example .env.local
```

Isi variabel berikut sesuai lingkungan pengembangan Anda:

| Variabel | Deskripsi | Contoh |
|----------|-----------|--------|
| `NEXT_PUBLIC_APP_URL` | Base URL aplikasi | `http://localhost:3000` |
| `MONGODB_URI` | Connection string MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/nyumbangin` |
| `NEXTAUTH_SECRET` | Secret key untuk autentikasi | `super-secret-key-32-chars` |
| `MIDTRANS_SERVER_KEY` | Server Key dari Dashboard Midtrans | `SB-Mid-server-XXXXX` |
| `MIDTRANS_CLIENT_KEY` | Client Key dari Dashboard Midtrans | `SB-Mid-client-XXXXX` |
| `NEXT_PUBLIC_SOCKET_URL` | Endpoint Server WebSocket | `http://localhost:3000` |

### 4. Menjalankan Mode Pengembangan

```bash
npm run dev
```

Aplikasi dapat diakses melalui `http://localhost:3000`.

## Troubleshooting & FAQ

### Q: Mengapa Overlay di OBS tidak muncul saat ada donasi di mode Sandbox?

**Solusi**: Pastikan URL WebSockets di `.env.local` (`NEXT_PUBLIC_SOCKET_URL`) dapat diakses oleh browser OBS, dan pastikan konfigurasi Midtrans di server lokal sudah terhubung dengan ngrok atau webhook URL yang valid.

### Q: Mengapa Audio Alert tidak terdengar di OBS Studio?

**Solusi**: Pada OBS Studio, klik kanan pada Source Browser Overlay → Properties → Centang opsi "Control audio via OBS" atau sesuaikan preferensi audio output pada Audio Mixer.

## Kontribusi

Kontribusi selalu terbuka! Silakan ikuti alur berikut:

1. Fork repositori ini.
2. Buat feature branch baru (`git checkout -b feature/AmazingFeature`).
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`).
4. Push ke branch tersebut (`git push origin feature/AmazingFeature`).
5. Buat Pull Request.

## Lisensi

Proyek ini dilindungi di bawah lisensi MIT. Lihat file LICENSE untuk informasi lebih lanjut.
