# BAB 1: PENGENALAN & SETUP

<div align="center">

**⏱️ Estimasi Waktu: 2-3 Jam**

</div>

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda akan:
- ✅ Memahami konsep & fitur platform Nyumbangin
- ✅ Menginstall semua tools yang dibutuhkan
- ✅ Setup environment variables dengan benar
- ✅ Menjalankan aplikasi di localhost
- ✅ Membuat account admin & creator pertama
- ✅ Test donation flow di sandbox mode

---

## 1.1 Tentang Platform Nyumbangin

### Apa itu Nyumbangin?

**Nyumbangin** adalah platform donasi digital yang memungkinkan **content creator Indonesia** (streamer, YouTuber, TikToker, podcaster, dll) menerima dukungan finansial dari fans/followers dengan mudah dan aman.

### Masalah yang Diselesaikan

#### Problem 1: Payment Gateway Internasional Susah untuk Audience Indonesia
Platform seperti Ko-fi, Buy Me a Coffee menggunakan Stripe/PayPal yang:
- ❌ Tidak semua orang Indonesia punya kartu kredit internasional
- ❌ Proses verifikasi PayPal ribet untuk first-time user
- ❌ Fee conversion USD-IDR mahal

**Solusi Nyumbangin**:
- ✅ Integrasi Midtrans (payment gateway lokal)
- ✅ Support QRIS, Virtual Account BCA/Mandiri/BNI, GoPay, OVO, ShopeePay
- ✅ Nominal dalam Rupiah, familiar untuk audience lokal

#### Problem 2: Fee Tinggi & Tidak Transparan
Banyak platform internasional:
- ❌ Platform fee 5-10%
- ❌ Payment processing fee 2-3%
- ❌ Withdrawal fee $2-5 per transaksi
- ❌ Total bisa 15-20% terpotong!

**Solusi Nyumbangin**:
- ✅ Platform fee transparan (misal: 5% flat)
- ✅ Midtrans fee kompetitif (~2-3%)
- ✅ Minimum withdrawal Rp 50.000 (wajar untuk creator kecil)

#### Problem 3: Dashboard & Analytics Minim
**Solusi Nyumbangin**:
- ✅ Dashboard untuk creator (track donations, earnings, payouts)
- ✅ Admin panel untuk manage platform
- ✅ Email notifications untuk setiap transaksi
- ✅ Real-time overlay untuk streaming (show donations live)

---

### Fitur Utama Platform

#### 🎨 Untuk Creator

1. **Halaman Donasi Personal**
   - URL: `nyumbangin.com/donate/username`
   - Customizable: avatar, bio, social links
   - Embed-able di website/link tree

2. **Dashboard Creator**
   - Riwayat donasi real-time
   - Total earnings & available balance
   - Request payout (minimal Rp 50K)
   - Notification history

3. **Overlay untuk Streaming** (Bonus)
   - Real-time donation alerts
   - Customizable display (OBS integration)
   - Show supporter name & message

#### 💝 Untuk Supporter (Donatur)

1. **Mudah Berdonasi**
   - Isi amount + optional message
   - Pilih payment method (QRIS/VA/E-wallet)
   - Bayar dalam 1-2 klik

2. **Konfirmasi Otomatis**
   - Notifikasi instant setelah bayar
   - Email receipt
   - Terlihat di public leaderboard (optional)

#### 🛠️ Untuk Admin Platform

1. **Manage Creators**
   - Approve/reject registrations
   - Suspend/activate accounts
   - View creator statistics

2. **Manage Payouts**
   - List pending payout requests
   - Approve/reject dengan catatan
   - Mark as processed setelah transfer
   - Bulk operations

3. **Platform Analytics**
   - Total transactions
   - Revenue tracking
   - Top creators leaderboard
   - Payment method breakdown

---

### User Roles & Permissions

| Role | Akses | Contoh Aksi |
|------|-------|-------------|
| **Supporter** | Public | Donate, view leaderboard |
| **Creator** | Authenticated | View donations, request payout, manage profile |
| **Admin** | Authenticated + Permission | Manage creators, approve payouts, view stats |
| **Super Admin** | Full access | Manage admins, platform settings, database access |

---

## 1.2 Prasyarat

### Hardware Minimum

- **CPU**: Dual-core 2.0 GHz
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 10 GB free space
- **Internet**: Stable connection untuk install dependencies

### Software yang Harus Diinstall

#### 1. Node.js (v18 atau lebih baru)

**Check versi**:
```bash
node --version
# Output harus: v18.x.x atau lebih
```

**Belum install?** Download di: https://nodejs.org/

**Rekomendasi**: Install versi **LTS** (Long Term Support)

---

#### 2. npm (biasanya otomatis terinstall dengan Node.js)

**Check versi**:
```bash
npm --version
# Output harus: 9.x.x atau lebih
```

**Update npm** (jika perlu):
```bash
npm install -g npm@latest
```

---

#### 3. Git (untuk version control)

**Check versi**:
```bash
git --version
# Output: git version 2.x.x
```

**Belum install?** Download di: https://git-scm.com/

---

#### 4. Code Editor (Rekomendasi: VS Code)

Download di: https://code.visualstudio.com/

**Extensions yang berguna**:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- GitLens
- Thunder Client (API testing alternative Postman)

---

#### 5. MongoDB (Pilih salah satu)

**Opsi A: MongoDB Atlas (Cloud) - RECOMMENDED**
- Gratis tier: 512 MB storage
- Tidak perlu install di local
- Signup di: https://www.mongodb.com/cloud/atlas

**Opsi B: MongoDB Community (Local)**
- Download di: https://www.mongodb.com/try/download/community
- Install & jalankan sebagai service

**Opsi C: MongoDB via Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

### Pengetahuan yang Dibutuhkan

**Wajib Paham**:
- ✅ JavaScript ES6+ (arrow functions, async/await, destructuring)
- ✅ Dasar React (components, props, state, hooks)
- ✅ Dasar HTTP & REST API (GET, POST, PUT, DELETE)
- ✅ JSON format

**Nice to Have**:
- MongoDB/NoSQL basics
- JWT authentication concept
- Payment gateway concept
- Terminal/command line basics

**Tidak Perlu Paham** (akan dijelaskan di buku):
- Next.js App Router (kita akan belajar dari awal)
- Mongoose ODM (akan dijelaskan detail)
- Midtrans integration (step-by-step guide)
- Webhook handling (explained thoroughly)

---

## 1.3 Clone Repository & Install Dependencies

### Step 1: Clone Repository

```bash
# Buat folder project (optional)
mkdir ~/projects
cd ~/projects

# Clone repository
git clone <repository-url> nyumbangin-tutorial
cd nyumbangin-tutorial

# Check struktur folder
ls -la
```

**Output yang diharapkan**:
```
.
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── next.config.mjs
├── pages/
├── src/
├── public/
└── ... (files lainnya)
```

---

### Step 2: Install Dependencies

```bash
# Install semua dependencies
npm install

# Tunggu hingga selesai (2-5 menit tergantung koneksi)
```

**Proses ini akan**:
1. Download semua packages dari `package.json`
2. Membuat folder `node_modules/` (~300MB)
3. Generate `package-lock.json`

---

### Step 3: Verifikasi Instalasi

```bash
# Check dependencies terinstall
ls node_modules/ | wc -l
# Output: ~500-800 packages (normal untuk project Next.js)

# Check Next.js version
npx next --version
# Output: 14.x.x atau lebih
```

---

### Dependencies Utama yang Ter-install

Buka `package.json` dan lihat:

```json
{
  "dependencies": {
    "next": "^14.x.x",              // Framework utama
    "react": "^18.x.x",              // Library UI
    "react-dom": "^18.x.x",
    "mongoose": "^8.x.x",            // MongoDB ODM
    "jsonwebtoken": "^9.x.x",        // JWT authentication
    "bcryptjs": "^2.x.x",            // Password hashing
    "midtrans-client": "^1.x.x",     // Midtrans SDK
    "nodemailer": "^6.x.x",          // Email sending
    "react-hot-toast": "^2.x.x",     // Toast notifications
    // ... dan banyak lagi
  }
}
```

---

## 1.4 Setup Environment Variables

Environment variables menyimpan **konfigurasi sensitif** seperti database URI, API keys, secrets.

### Step 1: Copy Template

```bash
# Copy file .env.example menjadi .env
cp .env.example .env

# Windows Command Prompt:
copy .env.example .env

# Windows PowerShell:
Copy-Item .env.example .env
```

---

### Step 2: Edit File `.env`

Buka file `.env` dengan code editor:

```bash
code .env
# atau
nano .env
# atau buka manual di VS Code
```

---

### Konfigurasi yang Harus Diisi

#### 🔹 1. MongoDB URI

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nyumbangin?retryWrites=true&w=majority
```

**Cara mendapatkan (MongoDB Atlas)**:

1. Buat akun di https://www.mongodb.com/cloud/atlas
2. Klik "Build a Database" → Pilih **FREE** tier (M0)
3. Pilih region terdekat (Singapore/Mumbai untuk Indonesia)
4. Buat cluster (tunggu 3-5 menit)
5. Klik "Connect" → "Connect your application"
6. Copy connection string
7. **Ganti `<password>`** dengan password database Anda
8. **Ganti `test`** dengan `nyumbangin` (nama database)

**Contoh hasil**:
```
MONGO_URI=mongodb+srv://haekal:MySecureP@ss123@cluster0.abc123.mongodb.net/nyumbangin?retryWrites=true&w=majority
```

**⚠️ Troubleshooting**:
- **Error: "Authentication failed"** → Password salah, buat user baru
- **Error: "Network timeout"** → Whitelist IP address Anda di MongoDB Atlas:
  1. Klik "Network Access"
  2. Klik "Add IP Address"
  3. Pilih "Allow Access from Anywhere" (0.0.0.0/0) untuk development

---

#### 🔹 2. JWT Secrets

```bash
JWT_SECRET=your_super_secret_key_here_minimum_32_characters
NEXTAUTH_SECRET=another_different_secret_key_also_32_chars
```

**Cara generate secret yang aman**:

```bash
# Method 1: Node.js crypto (RECOMMENDED)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 2: OpenSSL (Mac/Linux)
openssl rand -base64 32

# Method 3: Online (HANYA untuk development)
# https://generate-secret.now.sh/32
```

**Contoh output**:
```
9EmF+Xc7CSLBeaNf1RHuB5hBEnyAJ58GL4KPZfNJLDQ=
```

Copy dan paste ke [`.env`](.env ):
```bash
JWT_SECRET=9EmF+Xc7CSLBeaNf1RHuB5hBEnyAJ58GL4KPZfNJLDQ=
NEXTAUTH_SECRET=anotherDifferentSecret123456789abcdefgh=
```

**⚠️ PENTING**:
- Jangan gunakan secret yang sama untuk `JWT_SECRET` dan `NEXTAUTH_SECRET`
- Jangan commit secrets ke Git
- Generate secrets baru untuk production

---

#### 🔹 3. Midtrans Keys (Payment Gateway)

```bash
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxx
MIDTRANS_PRODUCTION=false
```

**Cara mendapatkan**:

1. Daftar di https://dashboard.midtrans.com/register
2. Verifikasi email Anda
3. Login ke dashboard
4. Klik menu **Settings** → **Access Keys**
5. Tab **Sandbox** → Copy:
   - **Server Key** → paste ke `MIDTRANS_SERVER_KEY`
   - **Client Key** → paste ke `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`

**Contoh**:
```bash
MIDTRANS_SERVER_KEY=SB-Mid-server-y-THSaIMsktpOkASLzkvU6mO
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-4wN9Lvafs3h9caqE
MIDTRANS_PRODUCTION=false
```

**⚠️ Catatan**:
- `SB-` prefix = Sandbox (testing mode)
- Untuk production nanti, ganti dengan Production keys (tanpa `SB-`)
- `NEXT_PUBLIC_` prefix = accessible di frontend (client-side)

---

#### 🔹 4. NextAuth URL

```bash
NEXTAUTH_URL=http://localhost:3000
```

**Development**: `http://localhost:3000`  
**Production nanti**: `https://yourdomain.com`

---

#### 🔹 5. Google OAuth (Optional - untuk login dengan Google)

```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Cara setup** (skip jika tidak perlu Google login):

1. Buka https://console.cloud.google.com/
2. Buat project baru
3. Enable "Google+ API"
4. Credentials → Create OAuth 2.0 Client ID
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID & Client Secret

**Untuk sekarang: SKIP** (tidak wajib untuk tutorial dasar)

---

#### 🔹 6. SMTP Email Configuration

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

**Cara setup Gmail SMTP**:

1. **Enable 2-Step Verification** di Google Account:
   - https://myaccount.google.com/security
   - Aktifkan "2-Step Verification"

2. **Generate App Password**:
   - https://myaccount.google.com/apppasswords
   - Pilih "Mail" dan "Other (Custom name)"
   - Generate → Copy password 16 karakter

3. **Paste ke** `.env`:
```bash
SMTP_USER=nyumbangin8@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # 16 karakter dari Google
```

**⚠️ Troubleshooting**:
- **Error: "Invalid login"** → Pastikan 2-Step Verification aktif
- **Error: "Less secure apps"** → Gunakan App Password, BUKAN password Gmail biasa
- **Alternative**: Gunakan SMTP provider lain (SendGrid, Mailgun, AWS SES)

**Untuk testing awal: Email boleh skip dulu** (tidak akan error, hanya tidak kirim email)

---

#### 🔹 7. Cron Job Secret

```bash
CRON_SECRET=another_random_secret_for_cron_jobs
```

Generate dengan cara yang sama seperti JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

#### 🔹 8. Test Email (Optional)

```bash
TEST_EMAIL=your_personal_email@example.com
```

Email untuk menerima test notifications saat development.

---

### Step 3: Verifikasi File `.env`

Check bahwa semua variable terisi:

```bash
# Count lines in .env
cat .env | grep -v "^#" | grep -v "^$" | wc -l
# Harus minimal ~15 lines (non-comment)

# Check specific vars
grep "MONGO_URI" .env
grep "JWT_SECRET" .env
grep "MIDTRANS" .env
```

---

## 1.5 Menjalankan Development Server

### Step 1: Start Server

```bash
# Jalankan development server
npm run dev
```

**Output yang diharapkan**:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 3.2s
○ Compiling / ...
✓ Compiled / in 2.5s
```

**⚠️ Troubleshooting**:

| Error | Solusi |
|-------|--------|
| `Port 3000 already in use` | Kill process: `npx kill-port 3000` atau ganti port: `PORT=3001 npm run dev` |
| `Cannot find module` | `rm -rf node_modules && npm install` |
| `Unexpected token` | Check syntax error di file yang disebutkan |

---

### Step 2: Buka Browser

Buka: **http://localhost:3000**

**Yang harus terlihat**:
- ✅ Homepage dengan logo "Nyumbangin"
- ✅ Navbar dengan button "Login" dan "Mulai Sebagai Creator"
- ✅ Section hero/banner
- ✅ Carousel creator (mungkin kosong)
- ✅ Footer

**Yang TIDAK boleh ada**:
- ❌ Error page
- ❌ "Cannot connect to database" message
- ❌ White screen/blank page

**Check Console Browser**:
1. Buka DevTools (F12)
2. Tab "Console"
3. Tidak boleh ada error merah (warning kuning OK)

---

## 1.6 Verifikasi Koneksi Database

### Test 1: Health Check API

```bash
# Method 1: curl (Mac/Linux/Git Bash)
curl http://localhost:3000/api/health

# Method 2: PowerShell (Windows)
Invoke-WebRequest -Uri http://localhost:3000/api/health | Select-Object -ExpandProperty Content

# Method 3: Buka di browser
# http://localhost:3000/api/health
```

**Response yang diharapkan**:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2026-01-08T10:30:00.000Z"
}
```

---

### Test 2: MongoDB Compass (Optional)

Jika sudah install MongoDB Compass:

1. Buka MongoDB Compass
2. Paste `MONGO_URI` dari [`.env`](.env )
3. Klik "Connect"
4. Check database `nyumbangin` exist
5. Seharusnya ada collections: `creators`, `admins`, `donations`, dll

---

### Troubleshooting Database Connection

#### Error: "MongooseError: buffering timed out"

**Cause**: Tidak bisa connect ke MongoDB

**Solutions**:
1. Check `MONGO_URI` format benar
2. Whitelist IP di MongoDB Atlas:
   - Network Access → Add IP Address → 0.0.0.0/0
3. Check internet connection
4. Try ping MongoDB:
   ```bash
   ping cluster0.abc123.mongodb.net
   ```

#### Error: "Authentication failed"

**Solutions**:
1. Check username & password di URI
2. Buat database user baru di MongoDB Atlas:
   - Database Access → Add New User
   - Username & Password → Save
3. Update [`.env`](.env ) dengan credentials baru

---

## 1.7 Membuat Admin & Creator Pertama

### Membuat Admin Account

#### Method 1: Via Script (RECOMMENDED)

```bash
# Jalankan script setup admin
node dev-tools/fix-admin-permissions.js
```

Follow prompts:
```
Enter admin email: admin@nyumbangin.com
Enter admin username: superadmin
Enter admin password: [type secure password]
```

**Output**:
```
✓ Admin created successfully!
Email: admin@nyumbangin.com
Username: superadmin
Role: super_admin
```

---

#### Method 2: Manual via MongoDB

1. Buka MongoDB Compass
2. Database `nyumbangin` → Collection `admins`
3. Insert Document:

```json
{
  "email": "admin@nyumbangin.com",
  "username": "superadmin",
  "password": "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890",
  "role": "super_admin",
  "permissions": ["ALL"],
  "createdAt": {"$date": "2026-01-08T00:00:00.000Z"}
}
```

**⚠️ Password harus di-hash**. Generate hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('your_password', 10))"
```

---

### Membuat Creator Account

1. **Buka halaman registrasi**: http://localhost:3000/creator/register

2. **Isi form**:
   - Username: `johndoe` (unique, lowercase, no spaces)
   - Email: `john@example.com`
   - Password: (minimal 6 karakter)
   - Display Name: `John Doe`
   - Bank Account Info (untuk payout nanti)

3. **Submit** → Auto login & redirect ke dashboard

4. **Verifikasi**:
   - Check URL: `http://localhost:3000/creator/dashboard`
   - Lihat stats (semua masih 0)
   - Sidebar ada menu: Dashboard, Donations, Profile, Request Payout

---

## 1.8 Testing Donasi di Sandbox Mode

### Step 1: Buka Halaman Donasi Creator

```
http://localhost:3000/donate/johndoe
```

Replace `johndoe` dengan username yang Anda buat tadi.

---

### Step 2: Isi Form Donasi

- **Amount**: Minimal Rp 10.000
- **Name**: Nama supporter (optional)
- **Message**: Pesan untuk creator (optional)
- **Email**: Email supporter (untuk receipt)

Klik **"Donate Now"** atau **"Donasi Sekarang"**

---

### Step 3: Pilih Payment Method

Akan redirect ke Midtrans payment page. Pilih salah satu:

#### 🔹 QRIS (Recommended untuk testing)
1. Scan QR code
2. Di app simulator, approve payment
3. Done!

#### 🔹 Virtual Account (BCA/Mandiri/BNI)
1. Pilih bank
2. Copy VA number: `80777xxxxx`
3. **Auto-paid** dalam sandbox (tidak perlu transfer manual)

#### 🔹 GoPay / ShopeePay
1. Pilih e-wallet
2. Masukkan phone: `0812345678xxx`
3. Di simulator, approve payment

#### 🔹 Credit Card
```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp: 01/30
3D Secure OTP: 112233
```

**Full test cards**: https://docs.midtrans.com/docs/testing-payment

---

### Step 4: Verifikasi Payment Success

Setelah bayar berhasil:

1. **Redirect** kembali ke success page
2. **Check email** (jika SMTP configured) - ada email "New Donation"
3. **Check creator dashboard**:
   - Total donations: +1
   - Total earned: +Rp XX.XXX
   - Recent donations: muncul donasi baru

4. **Check database** (MongoDB Compass):
   - Collection `donations` → ada document baru
   - Field `status`: `"PAID"`
   - Field `isPaidOut`: `false`

---

### Troubleshooting Testing

#### Payment tidak redirect ke success page

**Check**:
1. Midtrans keys correct?
2. Webhook URL configured? (Bab 5 akan jelaskan detail)
3. Check server logs untuk error

#### Email tidak terkirim

**Normal** jika SMTP belum configured. Email notifications optional untuk testing awal.

#### Donation status stuck di PENDING

**Possible causes**:
1. Webhook not firing (check Midtrans dashboard logs)
2. Signature verification failed
3. Database write error

**Debug**:
```bash
# Check donation status di database
# MongoDB Compass → Collection: donations → Find by orderId
```

---

## 1.9 Troubleshooting Setup Umum

### 1. Error: "Cannot find module '@/...'"

**Cause**: Path alias tidak dikenali

**Solution**:
Check `jsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Restart dev server: `Ctrl+C` → `npm run dev`

---

### 2. Error: "Hydration failed"

**Cause**: Server-rendered HTML tidak match dengan client

**Common causes**:
- Using `localStorage` in server component
- Date formatting inconsistency
- Conditional rendering based on client-side state

**Solution**:
- Use `'use client'` directive untuk client components
- Check console for specific mismatch details

---

### 3. Styles tidak muncul

**Check**:
1. Tailwind configured? (`tailwind.config.js` exist?)
2. Global CSS imported? (check `src/app/layout.js`)
3. PostCSS configured? (`postcss.config.mjs` exist?)

**Restart dev server** setelah config changes.

---

### 4. API route returns 404

**Check**:
1. File location correct? (`pages/api/` NOT `src/api/`)
2. File exported default function?
3. URL path matches file structure?

Example:
- File: `pages/api/donate/index.js`
- URL: `http://localhost:3000/api/donate`

---

### 5. Database writes tidak persist

**Check**:
1. Connection string includes database name?
   ```
   mongodb://...net/nyumbangin?...
                      ^^^^^^^^^ database name
   ```
2. Await Mongoose operations?
   ```javascript
   await donation.save(); // MUST await!
   ```

---

## 1.10 Latihan & Checklist

### ✅ Checklist Setup

Sebelum lanjut ke Bab 2, pastikan:

- [ ] Node.js v18+ terinstall (`node --version`)
- [ ] Project di-clone & dependencies terinstall
- [ ] File [`.env`](.env ) configured (minimal MongoDB, JWT, Midtrans)
- [ ] Dev server running without errors (`npm run dev`)
- [ ] Database connection success (`/api/health` returns OK)
- [ ] Admin account created
- [ ] Creator account created
- [ ] Test donation berhasil sampai status PAID
- [ ] Creator dashboard shows donation data

---

### 🎯 Latihan Mandiri

#### Latihan 1: Membuat Creator Kedua
1. Register creator baru dengan username berbeda
2. Test donate ke creator pertama & kedua
3. Verifikasi stats terpisah per creator

#### Latihan 2: Test Multiple Payment Methods
1. Test QRIS payment
2. Test Virtual Account (BCA)
3. Test GoPay
4. Compare payment flow & speed

#### Latihan 3: Explore Database Structure
1. Buka MongoDB Compass
2. Explore semua collections
3. Lihat fields di masing-masing document
4. Coba query manual: "Find donations where status = PAID"

#### Latihan 4: Break & Fix
1. Intentionally break `.env` (typo in MONGO_URI)
2. See error message
3. Fix & verify connection restored
4. **Goal**: Familiar dengan common errors

---

### 📝 Quiz Pemahaman

1. Apa perbedaan `JWT_SECRET` vs `NEXTAUTH_SECRET`?
2. Mengapa Midtrans keys ada yang prefix `NEXT_PUBLIC_`?
3. Apa yang terjadi jika `MONGO_URI` salah?
4. Apa perbedaan Sandbox vs Production mode di Midtrans?
5. Di collection mana data donation disimpan?

**Jawaban** di akhir bab (scroll down)

---

### 🎉 Selamat!

Anda berhasil setup development environment lengkap!

**Next**: [Bab 2 - Arsitektur & Struktur Proyek](Bab-02-Arsitektur-Struktur.md)

Di Bab 2, kita akan deep dive ke:
- Struktur folder & routing
- Aliran data dari frontend → backend → database
- Konvensi naming & best practices

---

## 📚 Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Setup](https://docs.mongodb.com/guides/atlas/getting-started/)
- [Midtrans Testing Guide](https://docs.midtrans.com/docs/testing-payment)
- [JWT.io - Debug Tokens](https://jwt.io/)

---

## 📋 Jawaban Quiz

1. **JWT_SECRET**: untuk sign/verify JWT tokens di API authentication  
   **NEXTAUTH_SECRET**: untuk NextAuth.js session encryption (OAuth)

2. Variabel dengan prefix `NEXT_PUBLIC_` accessible di browser (client-side).  
   Client Key Midtrans perlu di frontend untuk render Snap popup.

3. Aplikasi tidak bisa connect ke database → API routes error → data tidak bisa disimpan/dibaca.

4. **Sandbox**: testing mode, fake transactions, test credentials.  
   **Production**: real transactions, real money, production credentials.

5. Collection `donations` di database `nyumbangin`.

---

<div align="center">

**Navigasi**

[⬅️ Cara Pakai Buku](00-Cara-Pakai-Buku.md) | [Bab 2: Arsitektur ➡️](Bab-02-Arsitektur-Struktur.md)

</div>
