# BAB 2: ARSITEKTUR & STRUKTUR PROYEK

<div align="center">

**⏱️ Estimasi Waktu: 1.5-2 Jam**

</div>

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda akan:
- ✅ Memahami arsitektur monolithic full-stack Next.js
- ✅ Mengetahui struktur folder & file organization
- ✅ Memahami perbedaan Pages Router vs App Router
- ✅ Dapat tracing alur request end-to-end
- ✅ Memahami konvensi penamaan & best practices

---

## 2.1 Overview Arsitektur

### Arsitektur Monolithic Full-Stack

Nyumbangin menggunakan **monolithic architecture** dimana frontend & backend dalam satu project Next.js:

```
┌─────────────────────────────────────────────────┐
│              CLIENT (Browser)                   │
│  React Components, Pages, Client-side Logic     │
└───────────────────┬─────────────────────────────┘
                    │ HTTP Request (fetch/axios)
                    ▼
┌─────────────────────────────────────────────────┐
│         NEXT.JS APPLICATION SERVER              │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │      Frontend (App Router/Pages)        │   │
│  │  • Server Components (RSC)              │   │
│  │  • Client Components                    │   │
│  │  • Page Rendering                       │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼──────────────────────┐   │
│  │         API Routes                      │   │
│  │  • /api/donate                          │   │
│  │  • /api/auth                            │   │
│  │  • /api/admin                           │   │
│  │  • /api/webhook                         │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼──────────────────────┐   │
│  │      Business Logic Layer               │   │
│  │  • Authentication (JWT)                 │   │
│  │  • Authorization (RBAC)                 │   │
│  │  • Payment Integration (Midtrans)       │   │
│  │  • Email Service (Nodemailer)           │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼──────────────────────┐   │
│  │      Data Access Layer (Mongoose)       │   │
│  │  • Models (Schema definitions)          │   │
│  │  • Queries & Aggregations               │   │
│  └──────────────────┬──────────────────────┘   │
└────────────────────┼──────────────────────────┘
                     │ MongoDB Driver
                     ▼
         ┌───────────────────────┐
         │   MongoDB Database    │
         │  • creators           │
         │  • donations          │
         │  • payouts            │
         │  • admins             │
         │  • notifications      │
         └───────────────────────┘
```

---

### Keuntungan Monolithic untuk Project Ini

✅ **Simple Deployment** - Deploy 1 aplikasi ke Vercel  
✅ **Shared Code** - Utility functions bisa dipakai frontend & backend  
✅ **Type Safety** - TypeScript types shared across layers  
✅ **Fast Development** - Tidak perlu setup CORS, API gateway, dll  
✅ **Cost Effective** - 1 server instead of separate frontend + backend  

---

### Alur Request End-to-End

#### Contoh: User Melakukan Donasi

```
1. USER ACTION (Browser)
   └─> Click "Donate Now" button
   └─> Fill form: amount, message, email

2. FRONTEND (React Component)
   └─> Validate input client-side
   └─> POST /api/donate
       Body: { username, amount, message, email }

3. API ROUTE (pages/api/donate/[username].js)
   └─> Verify request method (POST)
   └─> Validate input server-side
   └─> Check creator exists in database

4. BUSINESS LOGIC (lib/midtrans.js)
   └─> Create Midtrans transaction
       {
         transaction_details: { order_id, gross_amount },
         customer_details: { email, name }
       }
   └─> Get payment token/URL

5. DATA ACCESS (models/donations.js)
   └─> Create donation document
       {
         creatorId: ObjectId,
         amount: 50000,
         status: "PENDING",
         orderId: "TRX-xxx",
         ...
       }
   └─> Save to MongoDB

6. RESPONSE TO CLIENT
   └─> Return payment URL
   └─> Frontend redirect ke Midtrans

7. USER PAYS (External - Midtrans)
   └─> Select payment method
   └─> Complete payment (QRIS/VA/E-wallet)

8. WEBHOOK (pages/api/webhook/midtrans.js)
   └─> Midtrans sends notification
   └─> Verify signature
   └─> Update donation status → "PAID"
   └─> Send email to creator
   └─> Trigger overlay notification

9. FRONTEND POLLING (Optional)
   └─> Poll /api/check-payment-status
   └─> Update UI when status = PAID
   └─> Show success message
```

---

## 2.2 Struktur Folder Utama

```
Nyumbangin/
│
├── 📁 pages/                    # Pages Router (Next.js routing)
│   ├── 📁 api/                 # Backend API routes
│   │   ├── 📁 admin/           # Admin-only endpoints
│   │   │   ├── payouts.js      # Manage payouts (GET/PUT)
│   │   │   ├── creators.js     # Manage creators
│   │   │   └── stats.js        # Platform statistics
│   │   │
│   │   ├── 📁 auth/            # Authentication
│   │   │   ├── login.js        # POST login (JWT)
│   │   │   ├── register.js     # POST register creator
│   │   │   └── verify-token.js # GET verify JWT
│   │   │
│   │   ├── 📁 creator/         # Creator endpoints
│   │   │   ├── profile.js      # GET/PUT profile
│   │   │   ├── donations.js    # GET donation history
│   │   │   └── request-payout.js # POST payout request
│   │   │
│   │   ├── 📁 donate/          # Donation processing
│   │   │   └── [username].js   # Dynamic route for donations
│   │   │
│   │   ├── 📁 webhook/         # External webhooks
│   │   │   └── midtrans.js     # POST from Midtrans
│   │   │
│   │   ├── health.js           # Health check endpoint
│   │   ├── stats.js            # Public stats
│   │   └── ...
│   │
│   └── _app.js                 # (If using Pages Router pages)
│
├── 📁 src/
│   ├── 📁 app/                 # App Router (Next.js 14+)
│   │   ├── page.js             # Homepage (/)
│   │   ├── layout.js           # Root layout
│   │   ├── globals.css         # Global styles
│   │   ├── not-found.js        # 404 page
│   │   │
│   │   ├── 📁 donate/          # Donation pages
│   │   │   └── 📁 [username]/  # /donate/johndoe
│   │   │       └── page.js
│   │   │
│   │   ├── 📁 creator/         # Creator pages
│   │   │   ├── 📁 dashboard/   # /creator/dashboard
│   │   │   ├── 📁 register/    # /creator/register
│   │   │   └── ...
│   │   │
│   │   ├── 📁 admin/           # Admin pages
│   │   │   ├── 📁 dashboard/
│   │   │   ├── 📁 payouts/
│   │   │   └── ...
│   │   │
│   │   └── ...
│   │
│   ├── 📁 components/          # React components
│   │   ├── AdminDashboard.js
│   │   ├── Button.js
│   │   ├── DonationCard.js
│   │   ├── Header.js
│   │   ├── Modal.js
│   │   └── ...
│   │
│   ├── 📁 lib/                 # Utility libraries
│   │   ├── db.js               # MongoDB connection
│   │   ├── jwt.js              # JWT helpers
│   │   ├── midtrans.js         # Midtrans SDK wrapper
│   │   ├── email.js            # Email sending functions
│   │   └── ...
│   │
│   ├── 📁 models/              # Mongoose schemas
│   │   ├── Creator.js          # Creator model
│   │   ├── donations.js        # Donation model
│   │   ├── payout.js           # Payout model
│   │   ├── Admin.js            # Admin model
│   │   ├── Notification.js     # Notification model
│   │   └── ...
│   │
│   ├── 📁 utils/               # Helper functions
│   │   ├── format.js           # Format currency, date, etc
│   │   ├── sessionManager.js   # Session utilities
│   │   └── ...
│   │
│   ├── 📁 constants/           # Constants & configs
│   │   └── ...
│   │
│   └── 📁 hooks/               # Custom React hooks
│       └── ...
│
├── 📁 public/                  # Static files (served as /)
│   ├── logo.png
│   ├── maskot.png
│   ├── favicon.ico
│   └── ...
│
├── 📁 dev-tools/               # Developer scripts
│   ├── fix-admin-permissions.js
│   ├── test-email-service.js
│   ├── check-creator-stats.js
│   └── ...
│
├── 📁 __tests__/               # Jest tests
│   ├── 📁 components/
│   ├── 📁 lib/
│   └── 📁 utils/
│
├── 📄 .env                     # Environment variables (SECRET!)
├── 📄 .env.example             # Template environment
├── 📄 .gitignore
├── 📄 package.json
├── 📄 next.config.mjs          # Next.js configuration
├── 📄 tailwind.config.js       # Tailwind CSS config
├── 📄 jest.config.js           # Jest configuration
├── 📄 jsconfig.json            # Path aliases (@/...)
└── 📄 README.md
```

---

## 2.3 Penjelasan Folder Penting

### 📁 `pages/api/` - Backend API Routes

**Konsep**: Setiap file = 1 API endpoint

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ status: 'OK' });
}

// Accessible at: GET http://localhost:3000/api/health
```

#### Routing Rules

| File Path | URL | HTTP Methods |
|-----------|-----|--------------|
| `pages/api/health.js` | `/api/health` | All (GET, POST, etc) |
| `pages/api/donate/[username].js` | `/api/donate/johndoe` | Dynamic username |
| `pages/api/admin/payouts.js` | `/api/admin/payouts` | Usually GET & PUT |

#### Dynamic Routes

```javascript
// pages/api/donate/[username].js
export default function handler(req, res) {
  const { username } = req.query;
  // username akan berisi "johndoe" jika request ke /api/donate/johndoe
}
```

---

### 📁 `src/app/` - Frontend Pages (App Router)

**Next.js 14 App Router** menggunakan file `page.js` untuk routing:

```
src/app/
├── page.js                    → /
├── donate/
│   └── [username]/
│       └── page.js            → /donate/:username
├── creator/
│   ├── dashboard/
│   │   └── page.js            → /creator/dashboard
│   └── register/
│       └── page.js            → /creator/register
```

#### Server vs Client Components

```javascript
// Server Component (default)
// src/app/page.js
export default function HomePage() {
  // Runs on server, can directly query database
  return <div>Homepage</div>;
}

// Client Component (needs 'use client')
// src/app/donate/[username]/page.js
'use client';
import { useState } from 'react';

export default function DonatePage() {
  const [amount, setAmount] = useState(0);
  return <form>...</form>;
}
```

**Rule of thumb**:
- Use **Server Component** jika tidak perlu state/interactivity
- Use **Client Component** jika perlu `useState`, `useEffect`, event handlers

---

### 📁 `src/components/` - Reusable Components

```javascript
// src/components/Button.js
export default function Button({ children, onClick, variant = 'primary' }) {
  const baseClass = 'px-4 py-2 rounded-lg font-medium';
  const variantClass = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  
  return (
    <button className={`${baseClass} ${variantClass}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

**Usage**:
```javascript
import Button from '@/components/Button';

<Button onClick={handleDonate}>Donate Now</Button>
<Button variant="secondary">Cancel</Button>
```

---

### 📁 `src/lib/` - Utility Libraries

#### Example: `lib/db.js` - MongoDB Connection

```javascript
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
```

**Usage di API route**:
```javascript
import dbConnect from '@/lib/db';

export default async function handler(req, res) {
  await dbConnect(); // Ensure DB connected
  // ... rest of code
}
```

---

#### Example: `lib/jwt.js` - JWT Helpers

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
```

**Usage**:
```javascript
import { signToken, verifyToken } from '@/lib/jwt';

// Generate token saat login
const token = signToken({ userId: creator._id, role: 'creator' });

// Verify token di protected route
const decoded = verifyToken(token);
if (!decoded) {
  return res.status(401).json({ error: 'Invalid token' });
}
```

---

### 📁 `src/models/` - Mongoose Schemas

```javascript
// src/models/Creator.js
import mongoose from 'mongoose';

const CreatorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  profileImage: { type: String },
  totalEarned: { type: Number, default: 0 },
  // ... more fields
}, {
  timestamps: true, // createdAt, updatedAt
});

export default mongoose.models.Creator || mongoose.model('Creator', CreatorSchema);
```

**Usage**:
```javascript
import Creator from '@/models/Creator';

// Find creator by username
const creator = await Creator.findOne({ username: 'johndoe' });

// Create new creator
const newCreator = new Creator({
  username: 'janedoe',
  email: 'jane@example.com',
  password: hashedPassword,
});
await newCreator.save();
```

---

### 📁 `dev-tools/` - Developer Scripts

Scripts untuk maintenance & debugging:

```bash
# Check creator statistics
node dev-tools/check-creator-stats.js

# Test email service
node dev-tools/test-email-service.js

# Fix admin permissions
node dev-tools/fix-admin-permissions.js

# Cleanup old notifications
node dev-tools/cleanup-old-notifications.js
```

**Example script**:
```javascript
// dev-tools/check-creator-stats.js
require('dotenv').config();
const mongoose = require('mongoose');
const Creator = require('../src/models/Creator');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const creators = await Creator.find();
  console.log(`Total Creators: ${creators.length}`);
  
  for (const creator of creators) {
    console.log(`${creator.username}: Rp ${creator.totalEarned.toLocaleString()}`);
  }
  
  await mongoose.disconnect();
}

main();
```

---

## 2.4 Routing & Navigation

### Pages Router vs App Router

Project ini menggunakan **Hybrid** approach:

| Feature | Router | Location |
|---------|--------|----------|
| **API Routes** | Pages Router | `pages/api/` |
| **Frontend Pages** | App Router | `src/app/` |

#### Mengapa Hybrid?

- ✅ **API routes** lebih stable di Pages Router
- ✅ **App Router** lebih modern untuk frontend (RSC, streaming, etc)
- ✅ Best of both worlds!

---

### API Route Patterns

#### Pattern 1: Simple GET Endpoint

```javascript
// pages/api/stats.js
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const totalCreators = await Creator.countDocuments();
    
    res.status(200).json({ totalCreators });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

#### Pattern 2: Protected Route (JWT)

```javascript
// pages/api/creator/profile.js
import { verifyToken } from '@/lib/jwt';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  // 1. Extract & verify token
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Check role
  if (decoded.role !== 'creator') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 3. Handle methods
  if (req.method === 'GET') {
    const creator = await Creator.findById(decoded.userId);
    return res.status(200).json(creator);
  }

  if (req.method === 'PUT') {
    const updates = req.body;
    const creator = await Creator.findByIdAndUpdate(
      decoded.userId,
      updates,
      { new: true }
    );
    return res.status(200).json(creator);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

---

#### Pattern 3: Dynamic Route with Validation

```javascript
// pages/api/donate/[username].js
import Donation from '@/models/donations';
import Creator from '@/models/Creator';
import { createTransaction } from '@/lib/midtrans';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;
  const { amount, message, email, name } = req.body;

  // 1. Validation
  if (!amount || amount < 10000) {
    return res.status(400).json({ error: 'Minimum donation is Rp 10,000' });
  }

  // 2. Check creator exists
  const creator = await Creator.findOne({ username });
  if (!creator) {
    return res.status(404).json({ error: 'Creator not found' });
  }

  // 3. Create Midtrans transaction
  const orderId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const midtransResponse = await createTransaction({
    orderId,
    amount,
    customerEmail: email,
    customerName: name,
  });

  // 4. Save to database
  const donation = new Donation({
    creatorId: creator._id,
    orderId,
    amount,
    message,
    supporterName: name,
    supporterEmail: email,
    status: 'PENDING',
  });
  await donation.save();

  // 5. Return payment URL
  res.status(201).json({
    paymentUrl: midtransResponse.redirect_url,
    token: midtransResponse.token,
  });
}
```

---

## 2.5 Aliran Data End-to-End

### Case Study: Donation Flow

```
┌──────────────────────────────────────────────────────┐
│ 1. USER: Opens /donate/johndoe                       │
│    • App Router: src/app/donate/[username]/page.js   │
│    • Fetch creator data dari API                     │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 2. API: GET /api/creators/johndoe                    │
│    • pages/api/creators/[username].js                │
│    • Query MongoDB: Creator.findOne({ username })    │
│    • Return creator data (name, avatar, stats)       │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 3. USER: Fill form & click "Donate Now"              │
│    • Client Component validates input                │
│    • POST /api/donate/johndoe                        │
│      Body: { amount, message, email, name }          │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 4. API: POST /api/donate/johndoe                     │
│    • Validate input (amount, email format)           │
│    • Verify creator exists                           │
│    • Call Midtrans API (createTransaction)           │
│    • Save donation to DB (status: PENDING)           │
│    • Return payment URL                              │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 5. REDIRECT: User ke Midtrans payment page           │
│    • window.location.href = paymentUrl               │
│    • Or: Snap.pay(token) for popup                   │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 6. USER: Completes payment (QRIS/VA/E-wallet)        │
│    • External: Midtrans handles payment              │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 7. WEBHOOK: Midtrans → POST /api/webhook/midtrans    │
│    • Verify signature (security check)               │
│    • Extract: orderId, status, transaction_status    │
│    • Update donation: status = "PAID"                │
│    • Update creator stats: totalEarned += amount     │
│    • Send email notification to creator              │
│    • Trigger overlay notification (if applicable)    │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│ 8. REDIRECT: User back to success page               │
│    • Show "Payment successful" message               │
│    • Display receipt & thank you message             │
│    • Option to donate again                          │
└──────────────────────────────────────────────────────┘
```

---

## 2.6 Konvensi Penamaan & Best Practices

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| **React Component** | PascalCase | `DonationCard.js` |
| **Utility File** | camelCase | `format.js`, `sessionManager.js` |
| **Model** | PascalCase | `Creator.js`, `Donation.js` |
| **API Route** | kebab-case | `request-payout.js`, `check-status.js` |
| **Page** | kebab-case folder + `page.js` | `creator/dashboard/page.js` |

---

### Variable Naming

```javascript
// Constants: UPPER_SNAKE_CASE
const MAX_DONATION_AMOUNT = 10000000;
const DEFAULT_PAGE_SIZE = 20;

// Variables: camelCase
const donationAmount = 50000;
const creatorUsername = 'johndoe';

// Functions: camelCase (verb + noun)
function calculateTotal() {}
function fetchDonations() {}
async function sendEmail() {}

// Classes/Components: PascalCase
class PaymentProcessor {}
function DonationCard() {}

// Private/internal: prefix with underscore
function _internalHelper() {}
const _privateVar = 'secret';
```

---

### API Response Format

**Success**:
```json
{
  "success": true,
  "data": {
    "donation": { ... },
    "creator": { ... }
  }
}
```

**Error**:
```json
{
  "success": false,
  "error": "Creator not found",
  "code": "CREATOR_NOT_FOUND"
}
```

**Pagination**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### Error Handling Pattern

```javascript
// API Route Error Handling
export default async function handler(req, res) {
  try {
    await dbConnect();
    
    // ... business logic
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    
    // Specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    
    if (error.code === 11000) { // MongoDB duplicate key
      return res.status(409).json({ 
        success: false, 
        error: 'Resource already exists' 
      });
    }
    
    // Generic error
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
```

---

## 2.7 Latihan: Tracing Request Flow

### Latihan 1: Trace Login Flow

Buka files berikut dan trace alur login:

1. **Frontend**: `src/app/login/page.js` (atau wherever login form is)
2. **API**: `pages/api/auth/login.js`
3. **Model**: `src/models/Creator.js`
4. **Utility**: `src/lib/jwt.js`

**Pertanyaan**:
- Apa yang di-validate di frontend?
- Apa yang di-validate di backend?
- Bagaimana password di-verify?
- Apa isi JWT payload?
- Kemana token disimpan setelah login?

---

### Latihan 2: Trace Payout Request

Follow alur creator request payout:

1. Creator clicks "Request Payout" di dashboard
2. API route mana yang dipanggil?
3. Validasi apa yang dilakukan?
4. Document apa yang dibuat di database?
5. Email apa yang dikirim ke siapa?

**Hint**: Start dari `src/app/creator/dashboard/page.js` (atau component terkait)

---

### Latihan 3: Diagram Your Own Flow

Buat diagram (bisa di kertas/whiteboard/mermaid) untuk:
- User registrasi sebagai creator
- Admin approve payout
- Webhook notification flow

Use format yang sama seperti diagram di section 2.5.

---

## ✅ Checklist Pemahaman

Sebelum lanjut ke Bab 3:

- [ ] Paham perbedaan Pages Router vs App Router
- [ ] Tahu dimana letak API routes vs frontend pages
- [ ] Bisa trace alur request dari frontend → API → database
- [ ] Memahami cara kerja dynamic routes `[param]`
- [ ] Paham konvensi naming files & variables
- [ ] Tahu kapan pakai Server vs Client Component

---

## 🎯 Quiz Singkat

1. File mana yang handle GET request ke `/api/health`?
2. Bagaimana cara akses username dari URL `/api/donate/johndoe`?
3. Kapan harus pakai `'use client'` directive?
4. Dimana letak Mongoose models?
5. Apa fungsi file `lib/db.js`?

**Jawaban** di akhir bab.

---

## 📚 Referensi

- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

## 📋 Jawaban Quiz

1. `pages/api/health.js`
2. `const { username } = req.query;` di file `pages/api/donate/[username].js`
3. Saat perlu `useState`, `useEffect`, event handlers, atau browser APIs
4. `src/models/` folder
5. Membuat & me-manage koneksi MongoDB menggunakan Mongoose, dengan caching untuk performa

---

<div align="center">

**Navigasi**

[⬅️ Bab 1: Setup](Bab-01-Pengenalan-Setup.md) | [Bab 3: Model Data ➡️](Bab-03-Model-Data.md)

</div>
