# 🚀 Quick Start - Donation Testing

## ❓ Kenapa Harus Pakai Ngrok/Script?

**Jawaban Singkat:** Karena Midtrans webhook **TIDAK BISA** hit `localhost`

### Sebelumnya (Tanpa Script)
- ✅ Testing di **production/staging** dengan URL public
- ✅ Webhook dari Midtrans bisa hit server
- ✅ Donasi otomatis update ke PAID

### Sekarang (Perlu Script/Ngrok)  
- ❌ Testing di **localhost** (`http://localhost:3000`)
- ❌ Midtrans server tidak bisa akses localhost
- ❌ Webhook tidak sampai → Donasi stuck PENDING

---

## ✅ Solusi 1: Setup Ngrok (PERMANENT - No Scripts!)

### Windows - Otomatis
```bash
# Jalankan setup helper
setup-dev.bat

# Pilih install method, script akan setup semua!
```

### Manual Setup
```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Terminal 1: Run server
npm run dev

# 3. Terminal 2: Run ngrok
ngrok http 3000

# 4. Copy URL: https://abc123.ngrok.io
# 5. Set di Midtrans: https://abc123.ngrok.io/api/webhook/midtrans
```

**Setelah setup ngrok:** Donation flow work **SEMPURNA** seperti production! ✅

---

## ✅ Solusi 2: Quick Testing (Pakai Script)

**Hanya untuk quick testing tanpa setup ngrok:**

```bash
# Buat donation (bayar di Midtrans)
# Kalau stuck PENDING, jalankan:
node scripts/fix-pending.js
```

⚠️ **Note:** Ini temporary fix, tidak recommended untuk development rutin.

---

## 🎯 Workflow Recommended

### Setup Awal (Sekali Saja)
```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Setup Midtrans webhook dengan ngrok URL
```

### Daily Development
```bash
# Terminal 1
npm run dev

# Terminal 2 
ngrok http 3000

# Test donation - semua otomatis! ✅
```

---

## 📊 Comparison

| Method | Setup Time | Development Experience | Scripts Needed |
|--------|-----------|----------------------|----------------|
| **Ngrok** | 5 min (sekali) | ⭐⭐⭐⭐⭐ Perfect | ❌ No |
| **Localtunnel** | 2 min | ⭐⭐⭐⭐ Good | ❌ No |
| **Scripts** | 0 min | ⭐⭐ OK | ✅ Yes (manual) |
| **Deploy Production** | 10 min | ⭐⭐⭐⭐⭐ Perfect | ❌ No |

---

## 🔧 Auto-Migration Feature

Code sudah di-update dengan **auto-migration**:
- Old payout fields (payoutBankName) → Auto copy to new structure
- No manual migration needed
- Works on first access

**Scripts Only Needed For:**
- ✅ One-time batch fixes
- ✅ Testing without ngrok
- ✅ Database maintenance

---

## 💡 Best Practice

**Development:**
```bash
ngrok + localhost = Production-like experience
```

**Production:**
```bash
Deploy to Vercel/Railway = Real webhooks
```

**Quick Test:**
```bash
Scripts = Emergency fallback only
```

---

## 📚 Full Documentation

- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Complete ngrok setup
- [TESTING.md](./TESTING.md) - All testing options
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure

---

## 🎉 TL;DR

**Mau donation flow work perfect tanpa script?**

```bash
npm install -g ngrok
npm run dev          # Terminal 1
ngrok http 3000      # Terminal 2
# Set webhook URL di Midtrans
# DONE! ✅
```
