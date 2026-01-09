# BAB 3: MODEL DATA PENTING

<div align="center">

**⏱️ Estimasi Waktu: 2-3 Jam**

</div>

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda akan:
- ✅ Memahami database schema design untuk platform donasi
- ✅ Menguasai Mongoose ODM (Object Data Modeling)
- ✅ Dapat membuat relasi antar collections
- ✅ Mampu menulis queries & aggregations
- ✅ Memahami indexes untuk performance optimization

---

## 3.1 Pengantar Database Schema

### Mengapa MongoDB (NoSQL)?

**Keuntungan untuk project ini**:
- ✅ **Flexible schema** - Easy to iterate during development
- ✅ **JSON-like documents** - Natural fit dengan JavaScript
- ✅ **Horizontal scalability** - Easy to shard jika traffic besar
- ✅ **Rich query language** - Aggregation pipeline powerful
- ✅ **Free tier generous** - MongoDB Atlas M0 cukup untuk MVP

**Trade-offs**:
- ❌ No ACID transactions across collections (solved di MongoDB 4+)
- ❌ No foreign key constraints (handled di application layer)
- ❌ Can lead to data duplication (denormalization)

---

### Mongoose ODM Basics

**Mongoose** = Object Data Modeling library untuk MongoDB & Node.js

**Fitur utama**:
- Schema definition dengan type validation
- Middleware (hooks)
- Virtual properties
- Query builders
- Population (joins)

**Basic example**:
```javascript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0, max: 120 },
}, {
  timestamps: true, // auto-add createdAt & updatedAt
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
```

---

## 3.2 Model Creator

### Schema Definition

```javascript
// src/models/Creator.js
import mongoose from 'mongoose';

const CreatorSchema = new mongoose.Schema({
  // Authentication
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, dash, and underscore'],
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default in queries
  },

  // Profile
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
  },
  
  profileImage: {
    type: String,
    default: '/default-avatar.png',
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  
  socialLinks: {
    youtube: String,
    twitch: String,
    instagram: String,
    twitter: String,
    tiktok: String,
  },

  // Statistics
  totalEarned: {
    type: Number,
    default: 0,
    min: [0, 'Total earned cannot be negative'],
  },
  
  totalDonations: {
    type: Number,
    default: 0,
    min: [0, 'Total donations cannot be negative'],
  },
  
  availableBalance: {
    type: Number,
    default: 0,
    min: [0, 'Available balance cannot be negative'],
  },

  // Payout Settings
  bankAccount: {
    bankName: {
      type: String,
      enum: ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB', 'Permata', 'Other'],
    },
    accountNumber: String,
    accountName: String,
  },
  
  minimumPayout: {
    type: Number,
    default: 50000, // Rp 50,000
    min: [10000, 'Minimum payout cannot be less than Rp 10,000'],
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  isSuspended: {
    type: Boolean,
    default: false,
  },
  
  suspensionReason: String,

  // Metadata
  lastLoginAt: Date,
  emailVerifiedAt: Date,

}, {
  timestamps: true, // createdAt, updatedAt
  collection: 'creators',
});

// Indexes for performance
CreatorSchema.index({ username: 1 });
CreatorSchema.index({ email: 1 });
CreatorSchema.index({ totalEarned: -1 }); // For leaderboard
CreatorSchema.index({ createdAt: -1 }); // For sorting new creators

// Virtual: Full profile URL
CreatorSchema.virtual('profileUrl').get(function() {
  return `/donate/${this.username}`;
});

// Instance method: Calculate available balance
CreatorSchema.methods.calculateAvailableBalance = async function() {
  const Donation = mongoose.model('Donation');
  
  const result = await Donation.aggregate([
    {
      $match: {
        creatorId: this._id,
        status: 'PAID',
        isPaidOut: false,
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  this.availableBalance = result[0]?.total || 0;
  return this.availableBalance;
};

// Static method: Get leaderboard
CreatorSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ isActive: true, isSuspended: false })
    .sort({ totalEarned: -1 })
    .limit(limit)
    .select('username displayName profileImage totalEarned totalDonations');
};

export default mongoose.models.Creator || mongoose.model('Creator', CreatorSchema);
```

---

### Field Explanations

| Field | Type | Purpose |
|-------|------|---------|
| `username` | String | Unique identifier untuk URL `/donate/username` |
| `email` | String | Untuk login & notifications |
| `password` | String | Hashed password (bcrypt) |
| `displayName` | String | Nama yang ditampilkan di publik |
| `profileImage` | String | URL avatar/photo |
| `bio` | String | Deskripsi creator |
| `socialLinks` | Object | Links ke platform lain |
| `totalEarned` | Number | Total rupiah yang diterima (all time) |
| `totalDonations` | Number | Jumlah donasi yang diterima |
| `availableBalance` | Number | Saldo yang belum dicairkan |
| `bankAccount` | Object | Info rekening untuk payout |
| `isActive` | Boolean | Apakah account aktif |
| `isVerified` | Boolean | Email verified? |
| `isSuspended` | Boolean | Di-suspend oleh admin? |

---

### Usage Examples

```javascript
import Creator from '@/models/Creator';

// Create new creator
const creator = new Creator({
  username: 'johndoe',
  email: 'john@example.com',
  password: hashedPassword,
  displayName: 'John Doe',
  bankAccount: {
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountName: 'JOHN DOE',
  }
});
await creator.save();

// Find by username
const creator = await Creator.findOne({ username: 'johndoe' });

// Get leaderboard
const topCreators = await Creator.getLeaderboard(10);

// Calculate available balance
await creator.calculateAvailableBalance();
await creator.save();
```

---

## 3.3 Model Donation

### Schema Definition

```javascript
// src/models/donations.js
import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  // References
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true,
    index: true,
  },

  // Transaction Details
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [10000, 'Minimum donation is Rp 10,000'],
  },

  // Supporter Info
  supporterName: {
    type: String,
    default: 'Anonymous',
  },
  
  supporterEmail: {
    type: String,
  },
  
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },

  // Payment Status
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  },
  
  paymentMethod: {
    type: String,
    enum: ['qris', 'bank_transfer', 'gopay', 'shopeepay', 'credit_card', 'other'],
  },
  
  // Midtrans Response Data
  transactionId: String, // Midtrans transaction_id
  transactionStatus: String, // Midtrans transaction_status
  fraudStatus: String,
  paymentType: String,
  vaNumber: String, // For Virtual Account
  billKey: String,
  billerCode: String,

  // Payout Tracking
  isPaidOut: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
  },
  
  paidOutAt: Date,

  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  
  isPublic: {
    type: Boolean,
    default: true, // Show in public leaderboard
  },
  
  isNotified: {
    type: Boolean,
    default: false, // Email sent to creator?
  },

  // Webhook Data (for debugging)
  webhookData: {
    type: Object,
    select: false, // Don't return by default
  },

}, {
  timestamps: true,
  collection: 'donations',
});

// Compound indexes
DonationSchema.index({ creatorId: 1, status: 1 });
DonationSchema.index({ creatorId: 1, isPaidOut: 1 });
DonationSchema.index({ createdAt: -1 }); // For sorting recent donations

// Virtual: Amount in formatted Rupiah
DonationSchema.virtual('amountFormatted').get(function() {
  return `Rp ${this.amount.toLocaleString('id-ID')}`;
});

// Static method: Get recent donations for creator
DonationSchema.statics.getRecentForCreator = function(creatorId, limit = 10) {
  return this.find({ creatorId, status: 'PAID' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('supporterName message amount createdAt isAnonymous');
};

// Static method: Calculate total earned for creator
DonationSchema.statics.calculateTotalEarned = async function(creatorId) {
  const result = await this.aggregate([
    {
      $match: {
        creatorId: new mongoose.Types.ObjectId(creatorId),
        status: 'PAID',
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalCount: { $sum: 1 },
      }
    }
  ]);
  
  return result[0] || { totalAmount: 0, totalCount: 0 };
};

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
```

---

### Status Flow Diagram

```
PENDING ──────────► PAID ──────────► [isPaidOut = true]
   │                                         │
   │                                         ▼
   ├────► EXPIRED                     (Processed Payout)
   │
   ├────► FAILED
   │
   └────► CANCELLED
```

---

### Usage Examples

```javascript
import Donation from '@/models/donations';

// Create new donation
const donation = new Donation({
  creatorId: creator._id,
  orderId: 'TRX-1704729600-abc123',
  amount: 50000,
  supporterName: 'Jane Smith',
  supporterEmail: 'jane@example.com',
  message: 'Keep up the good work!',
  status: 'PENDING',
});
await donation.save();

// Update status after payment
await Donation.findOneAndUpdate(
  { orderId: 'TRX-xxx' },
  { 
    status: 'PAID',
    transactionId: 'xxxxx',
    paymentMethod: 'qris',
  }
);

// Get recent donations
const recentDonations = await Donation.getRecentForCreator(creatorId, 5);

// Calculate total earned
const stats = await Donation.calculateTotalEarned(creatorId);
console.log(`Total: Rp ${stats.totalAmount}, Count: ${stats.totalCount}`);

// Get unpaid donations (for payout)
const unpaidDonations = await Donation.find({
  creatorId: creator._id,
  status: 'PAID',
  isPaidOut: false,
});
```

---

## 3.4 Model Payout

### Schema Definition

```javascript
// src/models/payout.js
import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema({
  // Reference
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true,
    index: true,
  },

  // Amount
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [10000, 'Minimum payout is Rp 10,000'],
  },
  
  // Bank Details (copied from creator at request time)
  bankAccount: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
  },

  // Status Flow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed', 'failed'],
    default: 'pending',
    index: true,
  },

  // Donation References
  donations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
  }],

  // Admin Actions
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  
  approvedAt: Date,
  
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  
  rejectedAt: Date,
  
  rejectionReason: String,
  
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  
  processedAt: Date,

  // Transfer Details
  transferProof: String, // URL to receipt/proof image
  transferReference: String, // Bank reference number
  transferDate: Date,

  // Metadata
  notes: String, // Admin notes
  creatorNotes: String, // Creator's note when requesting

}, {
  timestamps: true,
  collection: 'payouts',
});

// Indexes
PayoutSchema.index({ status: 1, createdAt: -1 });
PayoutSchema.index({ creatorId: 1, status: 1 });

// Virtual: Amount formatted
PayoutSchema.virtual('amountFormatted').get(function() {
  return `Rp ${this.amount.toLocaleString('id-ID')}`;
});

// Static method: Get pending payouts
PayoutSchema.statics.getPending = function(limit = 50) {
  return this.find({ status: 'pending' })
    .populate('creatorId', 'username displayName email')
    .sort({ createdAt: 1 }) // Oldest first (FIFO)
    .limit(limit);
};

// Instance method: Approve payout
PayoutSchema.methods.approve = async function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  
  await this.save();
  
  // Send email notification
  // ... (will be implemented in Bab 5)
  
  return this;
};

// Instance method: Reject payout
PayoutSchema.methods.reject = async function(adminId, reason) {
  this.status = 'rejected';
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  
  await this.save();
  
  // Send email notification
  // ... (will be implemented in Bab 5)
  
  return this;
};

// Instance method: Mark as processed
PayoutSchema.methods.markProcessed = async function(adminId, transferDetails) {
  const Donation = mongoose.model('Donation');
  
  this.status = 'processed';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.transferProof = transferDetails.proof;
  this.transferReference = transferDetails.reference;
  this.transferDate = transferDetails.date || new Date();
  
  await this.save();
  
  // Mark donations as paid out
  await Donation.updateMany(
    { _id: { $in: this.donations } },
    { 
      isPaidOut: true,
      payoutId: this._id,
      paidOutAt: new Date(),
    }
  );
  
  // Send email notification
  // ... (will be implemented in Bab 5)
  
  return this;
};

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema);
```

---

### Status Flow Diagram

```
             ┌─────────────┐
             │   PENDING   │ ◄─── Creator requests payout
             └──────┬──────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
  ┌────────────┐        ┌────────────┐
  │  APPROVED  │        │  REJECTED  │
  └──────┬─────┘        └────────────┘
         │
         │ Admin transfers money
         │
         ▼
  ┌────────────┐
  │ PROCESSED  │ ──► Donations marked as isPaidOut: true
  └────────────┘
```

---

### Usage Examples

```javascript
import Payout from '@/models/payout';
import Donation from '@/models/donations';

// Creator requests payout
const unpaidDonations = await Donation.find({
  creatorId: creator._id,
  status: 'PAID',
  isPaidOut: false,
});

const totalAmount = unpaidDonations.reduce((sum, d) => sum + d.amount, 0);

const payout = new Payout({
  creatorId: creator._id,
  amount: totalAmount,
  bankAccount: creator.bankAccount,
  donations: unpaidDonations.map(d => d._id),
  creatorNotes: 'Monthly payout request',
});
await payout.save();

// Admin approves
await payout.approve(adminId);

// Admin marks as processed
await payout.markProcessed(adminId, {
  proof: 'https://example.com/transfer-proof.jpg',
  reference: 'TRF123456789',
  date: new Date(),
});

// Get pending payouts
const pendingPayouts = await Payout.getPending(20);
```

---

## 3.5 Model Admin

### Schema Definition

```javascript
// src/models/Admin.js
import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  
  password: {
    type: String,
    required: true,
    select: false,
  },

  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin',
  },

  permissions: [{
    type: String,
    enum: [
      'ALL',
      'VIEW_CREATORS',
      'MANAGE_CREATORS',
      'VIEW_DONATIONS',
      'VIEW_PAYOUTS',
      'APPROVE_PAYOUTS',
      'PROCESS_PAYOUTS',
      'VIEW_STATS',
    ],
  }],

  isActive: {
    type: Boolean,
    default: true,
  },

  lastLoginAt: Date,

}, {
  timestamps: true,
  collection: 'admins',
});

// Check permission
AdminSchema.methods.hasPermission = function(permission) {
  if (this.permissions.includes('ALL')) return true;
  return this.permissions.includes(permission);
};

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
```

---

## 3.6 Model Notification

### Schema Definition

```javascript
// src/models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  
  recipientModel: {
    type: String,
    enum: ['Creator', 'Admin'],
    required: true,
  },

  type: {
    type: String,
    enum: [
      'NEW_DONATION',
      'PAYOUT_APPROVED',
      'PAYOUT_REJECTED',
      'PAYOUT_PROCESSED',
      'ACCOUNT_VERIFIED',
      'ACCOUNT_SUSPENDED',
    ],
    required: true,
  },

  title: String,
  message: String,

  relatedDonationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
  },
  
  relatedPayoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  readAt: Date,

}, {
  timestamps: true,
  collection: 'notifications',
});

// Indexes
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
```

---

## 3.7 Relasi Antar Model

### Entity Relationship Diagram

```
┌─────────────┐
│   Creator   │
└──────┬──────┘
       │ 1
       │
       │ N
       ▼
┌─────────────┐       N        ┌─────────────┐
│  Donation   │ ──────────────► │   Payout    │
└──────┬──────┘  donations[]    └──────┬──────┘
       │                               │
       │ N                             │ 1
       │                               │
       ▼                               ▼
┌─────────────┐                ┌─────────────┐
│Notification │                │    Admin    │
└─────────────┘                └─────────────┘
```

---

### Mongoose Population

```javascript
// Get donation with creator info
const donation = await Donation.findById(id)
  .populate('creatorId', 'username displayName profileImage');

console.log(donation.creatorId.displayName); // Access populated data

// Get payout with creator & donations
const payout = await Payout.findById(id)
  .populate('creatorId', 'username email')
  .populate('donations', 'amount supporterName createdAt')
  .populate('approvedBy', 'username');

// Get creator with recent donations
const creator = await Creator.findById(id);
const donations = await Donation.find({ creatorId: creator._id })
  .sort({ createdAt: -1 })
  .limit(10);
```

---

## 3.8 Queries & Aggregations Umum

### Query 1: Calculate Available Balance

```javascript
async function calculateAvailableBalance(creatorId) {
  const result = await Donation.aggregate([
    {
      $match: {
        creatorId: new mongoose.Types.ObjectId(creatorId),
        status: 'PAID',
        isPaidOut: false,
      }
    },
    {
      $group: {
        _id: null,
        totalAvailable: { $sum: '$amount' },
        count: { $sum: 1 },
      }
    }
  ]);
  
  return result[0] || { totalAvailable: 0, count: 0 };
}
```

---

### Query 2: Leaderboard dengan Stats

```javascript
async function getCreatorLeaderboard(limit = 10) {
  const creators = await Creator.aggregate([
    {
      $match: {
        isActive: true,
        isSuspended: false,
      }
    },
    {
      $lookup: {
        from: 'donations',
        let: { creatorId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$creatorId', '$$creatorId'] },
                  { $eq: ['$status', 'PAID'] },
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              totalCount: { $sum: 1 },
            }
          }
        ],
        as: 'stats'
      }
    },
    {
      $addFields: {
        totalEarned: { $ifNull: [{ $arrayElemAt: ['$stats.totalAmount', 0] }, 0] },
        totalDonations: { $ifNull: [{ $arrayElemAt: ['$stats.totalCount', 0] }, 0] },
      }
    },
    {
      $sort: { totalEarned: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        username: 1,
        displayName: 1,
        profileImage: 1,
        totalEarned: 1,
        totalDonations: 1,
      }
    }
  ]);
  
  return creators;
}
```

---

### Query 3: Recent Donations dengan Creator Info

```javascript
async function getRecentDonations(limit = 20) {
  return await Donation.find({ status: 'PAID' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('creatorId', 'username displayName profileImage')
    .select('amount supporterName message createdAt isAnonymous')
    .lean(); // Returns plain JavaScript objects (faster)
}
```

---

### Query 4: Platform Statistics

```javascript
async function getPlatformStats() {
  const [
    totalCreators,
    totalDonations,
    totalRevenue,
    pendingPayouts,
  ] = await Promise.all([
    Creator.countDocuments({ isActive: true }),
    
    Donation.countDocuments({ status: 'PAID' }),
    
    Donation.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    
    Payout.countDocuments({ status: 'pending' }),
  ]);
  
  return {
    totalCreators,
    totalDonations,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingPayouts,
  };
}
```

---

## 3.9 Seeding Data untuk Development

### Seed Script

```javascript
// dev-tools/seed-database.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Creator = require('../src/models/Creator');
const Donation = require('../src/models/donations');
const Admin = require('../src/models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  console.log('🌱 Seeding database...');
  
  // Clear existing data
  await Promise.all([
    Creator.deleteMany({}),
    Donation.deleteMany({}),
    Admin.deleteMany({}),
  ]);
  
  // Create admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await Admin.create({
    email: 'admin@nyumbangin.com',
    username: 'superadmin',
    password: hashedPassword,
    role: 'super_admin',
    permissions: ['ALL'],
  });
  console.log('✓ Admin created');
  
  // Create creators
  const creators = await Creator.create([
    {
      username: 'johndoe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      displayName: 'John Doe',
      bio: 'Streamer & content creator',
      profileImage: '/avatars/john.jpg',
      bankAccount: {
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountName: 'JOHN DOE',
      },
    },
    {
      username: 'janedoe',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      displayName: 'Jane Doe',
      bio: 'YouTuber & educator',
      profileImage: '/avatars/jane.jpg',
      bankAccount: {
        bankName: 'Mandiri',
        accountNumber: '0987654321',
        accountName: 'JANE DOE',
      },
    },
  ]);
  console.log('✓ Creators created');
  
  // Create donations
  const donations = [];
  for (let i = 0; i < 20; i++) {
    const creator = creators[i % creators.length];
    donations.push({
      creatorId: creator._id,
      orderId: `TRX-${Date.now()}-${i}`,
      amount: Math.floor(Math.random() * 90000) + 10000, // Random 10k-100k
      supporterName: ['Alice', 'Bob', 'Charlie', 'Diana'][i % 4],
      supporterEmail: `supporter${i}@example.com`,
      message: 'Keep up the great work!',
      status: 'PAID',
      paymentMethod: ['qris', 'bank_transfer', 'gopay'][i % 3],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
    });
  }
  
  await Donation.insertMany(donations);
  console.log('✓ Donations created');
  
  // Update creator stats
  for (const creator of creators) {
    const stats = await Donation.calculateTotalEarned(creator._id);
    creator.totalEarned = stats.totalAmount;
    creator.totalDonations = stats.totalCount;
    await creator.calculateAvailableBalance();
    await creator.save();
  }
  console.log('✓ Creator stats updated');
  
  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin: admin@nyumbangin.com / admin123');
  console.log('  Creator 1: johndoe / password123');
  console.log('  Creator 2: janedoe / password123');
  
  await mongoose.disconnect();
}

seed().catch(console.error);
```

**Run**:
```bash
node dev-tools/seed-database.js
```

---

## 3.10 Latihan: Membuat Query Sendiri

### Latihan 1: Top Supporters

Buat query untuk mendapatkan top 10 supporters berdasarkan total donation amount.

<details>
<summary>💡 Hint</summary>

```javascript
await Donation.aggregate([
  { $match: { status: 'PAID', isAnonymous: false } },
  { $group: { 
    _id: '$supporterEmail',
    name: { $first: '$supporterName' },
    totalDonated: { $sum: '$amount' },
    count: { $sum: 1 },
  }},
  { $sort: { totalDonated: -1 } },
  { $limit: 10 },
]);
```
</details>

---

### Latihan 2: Monthly Revenue Trend

Buat query untuk mendapatkan total revenue per bulan (last 6 months).

<details>
<summary>💡 Hint</summary>

```javascript
await Donation.aggregate([
  {
    $match: {
      status: 'PAID',
      createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      },
      totalRevenue: { $sum: '$amount' },
      totalCount: { $sum: 1 },
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } },
]);
```
</details>

---

### Latihan 3: Creators Needing Payout

Buat query untuk mendapatkan creators yang available balance >= minimum payout.

<details>
<summary>💡 Hint</summary>

```javascript
const creators = await Creator.find({
  isActive: true,
  isSuspended: false,
});

const needingPayout = [];
for (const creator of creators) {
  await creator.calculateAvailableBalance();
  if (creator.availableBalance >= creator.minimumPayout) {
    needingPayout.push(creator);
  }
}
```
</details>

---

## ✅ Checklist Pemahaman

- [ ] Paham struktur schema Mongoose
- [ ] Bisa membuat relasi dengan `ref` & `populate`
- [ ] Memahami indexes untuk performance
- [ ] Bisa menulis aggregation queries
- [ ] Paham perbedaan `find()` vs `aggregate()`
- [ ] Tahu kapan pakai `.lean()` untuk performance

---

## 📚 Referensi

- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB Aggregation](https://docs.mongodb.com/manual/aggregation/)
- [Schema Design Best Practices](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-summary/)

---

<div align="center">

**Navigasi**

[⬅️ Bab 2: Arsitektur](Bab-02-Arsitektur-Struktur.md) | [Bab 4: Autentikasi ➡️](Bab-04-Autentikasi-Otorisasi.md)

</div>
