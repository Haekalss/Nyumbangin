# LAMPIRAN B: ENVIRONMENT VARIABLES

<div align="center">

**🔐 Complete Environment Configuration Guide**

*Daftar lengkap semua environment variables untuk Nyumbangin*

</div>

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Configuration](#database-configuration)
3. [Authentication & Security](#authentication--security)
4. [Payment Gateway (Midtrans)](#payment-gateway-midtrans)
5. [Email Configuration](#email-configuration)
6. [OAuth (Google)](#oauth-google)
7. [Deployment Settings](#deployment-settings)
8. [Optional Features](#optional-features)
9. [Development vs Production](#development-vs-production)
10. [Security Best Practices](#security-best-practices)

---

## Overview

Environment variables disimpan di file [`.env.local`](.env.local) (development) atau di platform dashboard (production).

**⚠️ NEVER commit `.env.local` to Git!**

---

## Database Configuration

### MONGO_URI

**Required**: ✅ Yes  
**Type**: String (MongoDB connection string)  
**Example**:
```bash
# Development (Local MongoDB)
MONGO_URI=mongodb://localhost:27017/nyumbangin

# Development (MongoDB Atlas - FREE)
MONGO_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/nyumbangin?retryWrites=true&w=majority

# Production (MongoDB Atlas)
MONGO_URI=mongodb+srv://produser:strongpassword@prod-cluster.xyz789.mongodb.net/nyumbangin-prod?retryWrites=true&w=majority
```

**How to get**:
1. Sign up at https://cloud.mongodb.com
2. Create cluster (M0 free tier or higher)
3. Database Access → Add user → Create strong password
4. Network Access → Add IP (0.0.0.0/0 for development, specific IPs for production)
5. Connect → Drivers → Copy connection string
6. Replace `<username>`, `<password>`, `<dbname>`

**Common Issues**:
- ❌ `connection timed out` → Check Network Access whitelist
- ❌ `authentication failed` → Check username/password
- ❌ `database name not specified` → Add `/dbname` before `?`

---

## Authentication & Security

### JWT_SECRET

**Required**: ✅ Yes  
**Type**: String (random secret key)  
**Example**:
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

**How to generate**:
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: Using dev-tools script
node dev-tools/generate-secret.js
```

**Output example**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**⚠️ CRITICAL**:
- Must be at least 32 characters
- Use different secret for development and production
- Never share or commit to Git
- Changing this will invalidate all existing tokens

---

### NEXTAUTH_SECRET

**Required**: ✅ Yes (if using NextAuth.js for OAuth)  
**Type**: String (random secret key)  
**Example**:
```bash
NEXTAUTH_SECRET=another-super-secret-key-for-nextauth-32-chars-minimum
```

**How to generate**: Same as JWT_SECRET (use different value)

**Note**: Required for NextAuth.js session encryption

---

### NEXTAUTH_URL

**Required**: ✅ Yes (if using NextAuth.js)  
**Type**: String (full URL of your app)  
**Example**:
```bash
# Development
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://nyumbangin.com
```

**Important**: Must match your actual domain (no trailing slash)

---

## Payment Gateway (Midtrans)

### MIDTRANS_SERVER_KEY

**Required**: ✅ Yes  
**Type**: String  
**Example**:
```bash
# Development (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server-abc123xyz789

# Production
MIDTRANS_SERVER_KEY=Mid-server-abc123xyz789
```

**How to get**:
1. Sign up at https://dashboard.midtrans.com
2. Go to Settings → Access Keys
3. Tab: **Sandbox** (for development) or **Production**
4. Copy **Server Key**

**⚠️ WARNING**: 
- Sandbox keys start with `SB-`
- Production keys start with `Mid-`
- NEVER expose server key to frontend!

---

### NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

**Required**: ✅ Yes  
**Type**: String (public key, safe to expose)  
**Example**:
```bash
# Development (Sandbox)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-abc123xyz789

# Production
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-abc123xyz789
```

**How to get**: Same location as Server Key (Settings → Access Keys)

**Note**: Prefix `NEXT_PUBLIC_` makes it available in browser

---

### MIDTRANS_PRODUCTION

**Required**: ❌ No (default: false)  
**Type**: Boolean  
**Example**:
```bash
# Development
MIDTRANS_PRODUCTION=false

# Production
MIDTRANS_PRODUCTION=true
```

**Purpose**: Switch between sandbox and production API endpoints

**API Endpoints**:
- Sandbox: `https://api.sandbox.midtrans.com`
- Production: `https://api.midtrans.com`

---

### MIDTRANS_MERCHANT_ID

**Required**: ❌ No (optional, for verification)  
**Type**: String  
**Example**:
```bash
MIDTRANS_MERCHANT_ID=G123456789
```

**How to get**: Dashboard → Settings → General Settings

---

## Email Configuration

### SMTP_HOST

**Required**: ✅ Yes (if sending emails)  
**Type**: String  
**Example**:
```bash
# Gmail
SMTP_HOST=smtp.gmail.com

# Outlook
SMTP_HOST=smtp-mail.outlook.com

# SendGrid
SMTP_HOST=smtp.sendgrid.net

# AWS SES (us-east-1)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
```

---

### SMTP_PORT

**Required**: ✅ Yes  
**Type**: Number  
**Example**:
```bash
# TLS (recommended)
SMTP_PORT=587

# SSL
SMTP_PORT=465

# Plain (not recommended)
SMTP_PORT=25
```

**Common Ports**:
- `587` - STARTTLS (most common)
- `465` - SSL/TLS
- `25` - Plain (often blocked by ISPs)

---

### SMTP_USER

**Required**: ✅ Yes  
**Type**: String (email address or username)  
**Example**:
```bash
# Gmail
SMTP_USER=your-email@gmail.com

# SendGrid
SMTP_USER=apikey

# AWS SES
SMTP_USER=AKIAIOSFODNN7EXAMPLE
```

---

### SMTP_PASS

**Required**: ✅ Yes  
**Type**: String (password or app-specific password)  
**Example**:
```bash
# Gmail App Password (16 characters, no spaces)
SMTP_PASS=abcdabcdabcdabcd

# SendGrid API Key
SMTP_PASS=SG.abc123xyz789

# AWS SES SMTP Password
SMTP_PASS=BPFtR...
```

**How to get**:

#### Gmail:
1. Enable 2FA on Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Copy 16-character password (format: xxxx xxxx xxxx xxxx)
5. Use without spaces in `.env`

#### SendGrid:
1. Create API Key at https://app.sendgrid.com/settings/api_keys
2. Permissions: "Mail Send" (full access)
3. Copy key (starts with `SG.`)

#### AWS SES:
1. Verify email/domain in SES Console
2. Create SMTP credentials
3. Copy username and password

---

### SMTP_FROM_EMAIL

**Required**: ❌ No (default: SMTP_USER)  
**Type**: String  
**Example**:
```bash
SMTP_FROM_EMAIL=noreply@nyumbangin.com
```

**Note**: Must be verified email (especially for AWS SES)

---

### SMTP_FROM_NAME

**Required**: ❌ No (default: "Nyumbangin")  
**Type**: String  
**Example**:
```bash
SMTP_FROM_NAME=Nyumbangin Platform
```

---

## OAuth (Google)

### GOOGLE_CLIENT_ID

**Required**: ❌ No (only if using Google Sign-In)  
**Type**: String  
**Example**:
```bash
GOOGLE_CLIENT_ID=123456789012-abc123xyz789.apps.googleusercontent.com
```

**How to get**:
1. Go to https://console.cloud.google.com
2. Create project or select existing
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
7. Copy Client ID

---

### GOOGLE_CLIENT_SECRET

**Required**: ❌ No (only if using Google Sign-In)  
**Type**: String  
**Example**:
```bash
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

**How to get**: Same location as Client ID (will be shown after creation)

**⚠️ Keep secret!** Don't expose to frontend.

---

## Deployment Settings

### NODE_ENV

**Required**: ❌ No (auto-set by Next.js)  
**Type**: String  
**Values**: `development`, `production`, `test`  
**Example**:
```bash
NODE_ENV=production
```

**Note**: Next.js automatically sets this based on command:
- `npm run dev` → `development`
- `npm run build` → `production`
- `npm test` → `test`

---

### NEXT_PUBLIC_APP_URL

**Required**: ❌ No (useful for redirects)  
**Type**: String  
**Example**:
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://nyumbangin.com
```

**Usage**: Base URL for email links, social sharing, etc.

---

## Optional Features

### CRON_SECRET

**Required**: ❌ No (for scheduled jobs via Vercel Cron)  
**Type**: String (random secret)  
**Example**:
```bash
CRON_SECRET=cron-secret-key-abc123xyz789
```

**Purpose**: Verify cron job requests are from trusted sources

**How to generate**: Same as JWT_SECRET

**Usage**:
```javascript
// pages/api/cron/update-stats.js
export default async function handler(req, res) {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... cron job logic
}
```

---

### ADMIN_EMAIL

**Required**: ❌ No (for admin notifications)  
**Type**: String  
**Example**:
```bash
ADMIN_EMAIL=admin@nyumbangin.com
```

**Usage**: Send alerts for critical events (new payout requests, errors)

---

### SENTRY_DSN

**Required**: ❌ No (for error tracking)  
**Type**: String  
**Example**:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
```

**How to get**:
1. Sign up at https://sentry.io
2. Create project (Next.js)
3. Copy DSN from Settings → Client Keys

---

### VERCEL_URL

**Required**: ❌ No (auto-provided by Vercel)  
**Type**: String  
**Example**:
```bash
VERCEL_URL=your-app-abc123.vercel.app
```

**Note**: Automatically available in Vercel deployments (preview & production)

---

## Development vs Production

### Complete `.env.local` Example (Development)

```bash
# ========================================
# DATABASE
# ========================================
MONGO_URI=mongodb://localhost:27017/nyumbangin
# OR for MongoDB Atlas (free tier):
# MONGO_URI=mongodb+srv://devuser:devpass@cluster0.abc123.mongodb.net/nyumbangin-dev?retryWrites=true&w=majority

# ========================================
# AUTHENTICATION
# ========================================
JWT_SECRET=dev-jwt-secret-min-32-chars-abc123xyz789
NEXTAUTH_SECRET=dev-nextauth-secret-min-32-chars-abc123xyz789
NEXTAUTH_URL=http://localhost:3000

# ========================================
# PAYMENT GATEWAY (MIDTRANS SANDBOX)
# ========================================
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SANDBOX_SERVER_KEY
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY
MIDTRANS_PRODUCTION=false
MIDTRANS_MERCHANT_ID=G123456789

# ========================================
# EMAIL (GMAIL)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-16-chars
SMTP_FROM_EMAIL=noreply@localhost
SMTP_FROM_NAME=Nyumbangin Dev

# ========================================
# OAUTH (OPTIONAL)
# ========================================
GOOGLE_CLIENT_ID=123456789012-abc123xyz789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789

# ========================================
# OTHER
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=dev-cron-secret-abc123xyz789
ADMIN_EMAIL=admin@localhost
```

---

### Production Environment Variables (Vercel)

⚠️ **IMPORTANT**: Generate NEW secrets for production!

```bash
# ========================================
# DATABASE (PRODUCTION CLUSTER)
# ========================================
MONGO_URI=mongodb+srv://produser:STRONG_PASSWORD@prod-cluster.xyz789.mongodb.net/nyumbangin-prod?retryWrites=true&w=majority

# ========================================
# AUTHENTICATION (NEW SECRETS!)
# ========================================
JWT_SECRET=NEWLY_GENERATED_PRODUCTION_SECRET_MIN_32_CHARS
NEXTAUTH_SECRET=NEWLY_GENERATED_NEXTAUTH_SECRET_MIN_32_CHARS
NEXTAUTH_URL=https://nyumbangin.com

# ========================================
# PAYMENT GATEWAY (MIDTRANS PRODUCTION)
# ========================================
MIDTRANS_SERVER_KEY=Mid-server-YOUR_PRODUCTION_SERVER_KEY
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-YOUR_PRODUCTION_CLIENT_KEY
MIDTRANS_PRODUCTION=true
MIDTRANS_MERCHANT_ID=G987654321

# ========================================
# EMAIL (SENDGRID OR AWS SES)
# ========================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.YOUR_SENDGRID_API_KEY
SMTP_FROM_EMAIL=noreply@nyumbangin.com
SMTP_FROM_NAME=Nyumbangin

# ========================================
# OAUTH
# ========================================
GOOGLE_CLIENT_ID=987654321098-xyz789abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz789abc123

# ========================================
# OTHER
# ========================================
NEXT_PUBLIC_APP_URL=https://nyumbangin.com
CRON_SECRET=NEWLY_GENERATED_CRON_SECRET
ADMIN_EMAIL=admin@nyumbangin.com
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
```

---

## Security Best Practices

### ✅ DO:

1. **Generate strong secrets**:
   ```bash
   # Minimum 32 characters, random
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use different secrets for dev/prod**:
   - Development: `dev-jwt-secret-...`
   - Production: `prod-jwt-secret-...` (DIFFERENT!)

3. **Restrict MongoDB access**:
   - Development: Whitelist your IP
   - Production: Whitelist Vercel IPs or use VPN

4. **Use app-specific passwords**:
   - Gmail: App Passwords (not main password)
   - SendGrid: API Keys (not account password)

5. **Set proper CORS origins** (if needed):
   ```bash
   NEXT_PUBLIC_ALLOWED_ORIGINS=https://nyumbangin.com,https://www.nyumbangin.com
   ```

6. **Keep `.env.local` out of Git**:
   ```bash
   # .gitignore
   .env.local
   .env*.local
   ```

7. **Rotate secrets periodically**:
   - Change JWT_SECRET every 3-6 months
   - Change MIDTRANS keys if compromised

---

### ❌ DON'T:

1. **Never commit secrets to Git**:
   ```bash
   # BAD: Hardcoded in code
   const secret = 'my-secret-key';
   
   # GOOD: From environment
   const secret = process.env.JWT_SECRET;
   ```

2. **Don't use weak secrets**:
   ```bash
   # BAD
   JWT_SECRET=123456
   JWT_SECRET=mysecret
   
   # GOOD
   JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

3. **Don't use production keys in development**:
   - Always use Midtrans Sandbox keys locally
   - Use test MongoDB cluster

4. **Don't expose server keys to frontend**:
   ```javascript
   // BAD: Exposed to browser
   const serverKey = process.env.MIDTRANS_SERVER_KEY;
   
   // GOOD: Only use client key in browser
   const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
   ```

5. **Don't use `0.0.0.0/0` for production MongoDB**:
   - Only allow specific IPs
   - Use VPN or IP whitelisting

---

## Verifying Environment Variables

### Check if variables are loaded:

```javascript
// pages/api/check-env.js (DELETE BEFORE PRODUCTION!)
export default function handler(req, res) {
  const vars = {
    MONGO_URI: !!process.env.MONGO_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    MIDTRANS_SERVER_KEY: !!process.env.MIDTRANS_SERVER_KEY,
    SMTP_HOST: !!process.env.SMTP_HOST,
    // ... check others
  };
  
  res.json(vars); // true/false for each (doesn't expose actual values)
}
```

Access: `http://localhost:3000/api/check-env`

**⚠️ DELETE this endpoint before deploying to production!**

---

### Test script:

```javascript
// dev-tools/test-env.js
require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'MIDTRANS_SERVER_KEY',
  'NEXT_PUBLIC_MIDTRANS_CLIENT_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
];

console.log('Checking environment variables...\n');

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const preview = value ? `${value.substring(0, 10)}...` : 'MISSING';
  
  console.log(`${status} ${varName}: ${preview}`);
});

const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.log(`\n❌ Missing variables: ${missing.join(', ')}`);
  process.exit(1);
} else {
  console.log('\n✅ All required variables present!');
}
```

Run:
```bash
node dev-tools/test-env.js
```

---

## Troubleshooting

### Issue: "Cannot find module 'dotenv'"

**Solution**:
```bash
npm install dotenv
```

---

### Issue: Environment variables not loaded

**Check**:
1. File named `.env.local` (not `.env` in Next.js)
2. Located in project root (same level as `package.json`)
3. No quotes needed around values (unless value has spaces)
4. Restart dev server after changing `.env.local`

---

### Issue: Variables undefined in browser

**Remember**:
- Only `NEXT_PUBLIC_*` variables available in browser
- Server-side variables (no prefix) only in API routes

---

### Issue: Midtrans payments not working

**Check**:
1. Using correct keys (Sandbox vs Production)
2. `MIDTRANS_PRODUCTION` matches keys (false for SB- keys)
3. Webhook URL configured in Midtrans dashboard
4. Server key not exposed to frontend

---

<div align="center">

**Navigasi**

[⬅️ Lampiran A: API Reference](Lampiran-A-Referensi-API.md) | [Lampiran C: Troubleshooting ➡️](Lampiran-C-Troubleshooting.md)

</div>
