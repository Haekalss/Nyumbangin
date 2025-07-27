# Nyumbangin - Platform Donasi Multi-Tenant

Platform donasi digital yang memungkinkan banyak creator untuk memiliki halaman donasi personal masing-masing dengan sistem multi-tenant.

## 🎯 **Konsep Multi-Tenant System**

Setiap creator memiliki:
- **Username unik** sebagai identifier
- **Link donasi personal**: `/donate/username`  
- **Dashboard admin pribadi** untuk mengelola donasi mereka sendiri
- **Statistik terpisah** dari creator lain

## Fitur Utama

### � **System Architecture**
1. **Multi-Creator Platform**
   - Setiap creator daftar dengan username unik
   - Link donasi personal: `/donate/{username}`
   - Statistik dan donasi terpisah per creator

2. **Creator Registration** (`/creator/register`)
   - Username unik (akan jadi link donasi)
   - Display name untuk tampilan
   - Email dan password untuk login
   - Deskripsi creator (opsional)

3. **Creator Login & Dashboard** (`/login` & `/dashboard`)
   - Login dengan email/password
   - Dashboard khusus menampilkan donasi creator tersebut
   - Statistik personal (bukan platform-wide)

### 💰 **Donation Flow**
1. **Halaman Donasi per Creator** (`/donate/{username}`)
   - Profil creator (nama, deskripsi)
   - Form donasi tanpa perlu login
   - Statistik donasi creator tersebut
   - Daftar donasi terbaru (hanya yang PAID)

2. **Creator Dashboard** (`/dashboard`)
   - Kelola semua donasi yang masuk ke creator tersebut
   - Update status UNPAID → PAID
   - Hapus donasi
   - Statistik personal creator

### 🔧 **Backend API yang Terintegrasi**
1. **Auth API**
   - `POST /api/auth/register` - Registrasi creator (dengan username)
   - `POST /api/auth/login` - Login creator

2. **Donation API per Creator**
   - `GET /api/donate/[username]` - Ambil profil creator & donasi publik
   - `POST /api/donate/[username]` - Buat donasi untuk creator tertentu

3. **Creator Stats API**
   - `GET /api/stats` - Statistik creator (dengan auth)

### 🎨 **Frontend Pages**
- **Homepage** (`/`) - Landing page platform
- **Creator Register** (`/creator/register`) - Daftar creator baru
- **Login** (`/login`) - Login creator
- **Creator Dashboard** (`/dashboard`) - Panel admin creator
- **Donation Page** (`/donate/[username]`) - Halaman donasi per creator

## Database Models

### User Model (Creator)
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  username: String (required, unique), // Username untuk link donasi
  displayName: String (required), // Nama yang ditampilkan
  description: String, // Deskripsi creator
  role: String (default: 'admin') // Semua user adalah creator/admin
}
```

### Donation Model
```javascript
{
  name: String, // Nama donatur
  amount: Number, // Jumlah donasi
  message: String, // Pesan donatur
  status: String (enum: ['UNPAID', 'PAID'], default: 'UNPAID'),
  merchant_ref: String (unique, required),
  owner: ObjectId (ref: 'User'), // Creator yang menerima donasi
  ownerUsername: String, // Username creator (untuk query cepat)
  createdAt: Date,
  updatedAt: Date
}
```

## Cara Menjalankan

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   Buat file `.env.local`:
   ```
   MONGO_URI=mongodb://localhost:27017/nyumbangin
   JWT_SECRET=your-jwt-secret-key
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   ```

## Flow Aplikasi

### Creator Registration Flow
1. Creator daftar di `/creator/register`
   - Input: email, password, username, displayName, description
   - Username akan jadi link donasi: `/donate/username`
2. Redirect ke login page

### Creator Dashboard Flow  
1. Creator login di `/login`
2. Akses dashboard di `/dashboard`
3. Melihat donasi yang masuk ke creator tersebut saja
4. Kelola status donasi (UNPAID → PAID)
5. Lihat statistik personal

### Donation Flow (Public)
1. User kunjungi `/donate/{username}`
2. Lihat profil creator dan statistik donasi
3. Isi form donasi (tanpa perlu daftar)
4. Donasi masuk ke database dengan `owner` = creator tersebut
5. Creator bisa lihat donasi baru di dashboard

### Key Differences dari Sistem Sebelumnya
- ✅ **Multi-tenant**: Setiap creator punya ruang terpisah
- ✅ **Personal links**: `/donate/{username}` bukan `/donate` umum  
- ✅ **Isolated stats**: Statistik per creator, bukan platform-wide
- ✅ **Creator-focused**: Dashboard menampilkan donasi creator tersebut saja
- ✅ **Scalable**: Bisa menampung ribuan creator

## URL Structure

```
/ - Homepage platform
/creator/register - Daftar creator baru
/login - Login creator
/dashboard - Dashboard creator (setelah login)
/donate/{username} - Halaman donasi creator tertentu
```

## Contoh Usage

1. **Creator "johndoe" daftar**:
   - Link donasi: `/donate/johndoe`
   - Dashboard: `/dashboard` (setelah login sebagai johndoe)

2. **Creator "janedoe" daftar**:
   - Link donasi: `/donate/janedoe` 
   - Dashboard: `/dashboard` (setelah login sebagai janedoe)

3. **Donatur mau donasi ke johndoe**:
   - Kunjungi `/donate/johndoe`
   - Isi form donasi → masuk ke database dengan `ownerUsername: "johndoe"`

4. **johndoe login**:
   - Dashboard hanya menampilkan donasi yang `ownerUsername: "johndoe"`
   - Statistik hanya untuk donasi johndoe

---

**Status**: ✅ **Multi-Tenant System Fully Implemented**

Sistem sekarang mendukung banyak creator dengan isolasi data yang tepat, mirip dengan platform donasi modern.
