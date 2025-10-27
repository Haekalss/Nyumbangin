# Setup Development dengan Webhook Support

## 🎯 Masalah

Midtrans webhook **TIDAK BISA** hit localhost karena Midtrans server tidak bisa akses komputer lokal Anda.

## ✅ Solusi 1: Ngrok (RECOMMENDED untuk Development)

### Install Ngrok
```bash
# Download dari https://ngrok.com/download
# Atau via chocolatey (Windows)
choco install ngrok

# Atau via npm
npm install -g ngrok
```

### Setup
```bash
# 1. Jalankan Next.js server
npm run dev

# 2. Di terminal baru, jalankan ngrok
ngrok http 3000

# Output:
# Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Update Midtrans Webhook URL
1. Login ke https://dashboard.sandbox.midtrans.com/
2. Go to Settings > Configuration
3. Set **Notification URL**: `https://abc123.ngrok.io/api/webhook/midtrans`
4. Save

### Test Donation
Sekarang webhook dari Midtrans akan otomatis hit ngrok URL dan forward ke localhost!

---

## ✅ Solusi 2: Localtunnel (Free, No Account)

```bash
# Install
npm install -g localtunnel

# Run server
npm run dev

# Di terminal baru
lt --port 3000

# Output: your url is: https://xyz.loca.lt
```

Set webhook URL: `https://xyz.loca.lt/api/webhook/midtrans`

---

## ✅ Solusi 3: Cloudflare Tunnel (Free, Production-like)

```bash
# Install
# Windows: Download dari https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Run
cloudflared tunnel --url http://localhost:3000

# Output URL dan set sebagai webhook
```

---

## ✅ Solusi 4: Deploy ke Vercel/Railway (Production)

### Deploy ke Vercel (EASIEST)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Output: https://your-app.vercel.app
```

Set webhook: `https://your-app.vercel.app/api/webhook/midtrans`

**Keuntungan:**
- ✅ Real production environment
- ✅ Webhook work perfectly
- ✅ Fast deployment
- ✅ Free tier available

---

## 🔧 Auto-Migration Feature

Code sudah di-update dengan **auto-migration** pada `hasCompletePayoutSettings()`:

```javascript
// Ketika method dipanggil:
1. Check old fields (payoutBankName, dll)
2. Jika ada tapi new fields kosong
3. AUTO-COPY ke payoutSettings
4. Save in background
5. Return true
```

**Artinya:** Data akan otomatis migrate saat creator pertama kali donate/access!

---

## 🎯 Recommended Workflow

### Development (Local Testing)
```bash
# Terminal 1: Run Next.js
npm run dev

# Terminal 2: Run ngrok
ngrok http 3000

# Update Midtrans webhook dengan ngrok URL
```

### Production
```bash
# Deploy ke Vercel
vercel --prod

# Set webhook ke production URL
```

---

## 📝 No More Scripts Needed!

Dengan auto-migration, Anda **TIDAK PERLU** lagi:
- ❌ `fix-pending.js` (webhook akan otomatis update)
- ❌ `migrate-payout.js` (auto-migrate saat access)
- ❌ Manual intervention

**Scripts hanya diperlukan untuk:**
- 🔧 One-time data fix
- 🧪 Development testing tanpa ngrok
- 📊 Batch operations

---

## 🚀 Quick Start (Best Practice)

```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start server
npm run dev

# 3. Start ngrok (terminal baru)
ngrok http 3000

# 4. Copy ngrok URL (https://abc123.ngrok.io)

# 5. Set di Midtrans dashboard:
# https://abc123.ngrok.io/api/webhook/midtrans

# 6. Test donation - webhook akan otomatis work! ✅
```

---

## 💡 Why This Happened

Sebelumnya mungkin Anda:
1. Testing di production environment (webhook work)
2. Atau punya ngrok/tunnel setup
3. Atau testing payment di production

Setelah tambah models, migration issue muncul + testing di localhost tanpa tunnel.

**Solusi:** Setup tunnel (ngrok) + auto-migration = No scripts needed!
