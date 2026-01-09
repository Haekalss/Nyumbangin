# LATIHAN & STUDI KASUS

<div align="center">

**🎯 Exercises & Advanced Case Studies**

*Practice projects untuk memperdalam pemahaman*

</div>

---

## 📋 Table of Contents

1. [Latihan Per Bab](#latihan-per-bab)
2. [Mini Projects](#mini-projects)
3. [Advanced Case Studies](#advanced-case-studies)
4. [Challenge Projects](#challenge-projects)

---

# LATIHAN PER BAB

## Bab 1: Setup & Pengenalan

### Latihan 1.1: Verifikasi Environment
**Tujuan**: Memastikan semua tools terinstall dengan benar

**Tasks**:
1. Check versi Node.js dan npm
2. Verify MongoDB connection (local atau Atlas)
3. Test Midtrans sandbox credentials
4. Send test email via SMTP

**Expected Output**:
```bash
✅ Node.js: v18.x.x
✅ npm: v9.x.x
✅ MongoDB: Connected to nyumbangin
✅ Midtrans: Credentials valid
✅ SMTP: Test email sent successfully
```

**Hint**: Buat script `dev-tools/verify-setup.js`

---

### Latihan 1.2: First Admin User
**Tujuan**: Membuat admin user pertama via script

**Tasks**:
1. Create `dev-tools/create-first-admin.js`
2. Hash password dengan bcrypt
3. Set permissions: `['user_manage', 'payout_approve', 'payout_process']`
4. Save ke database
5. Test login via API

**Expected Output**:
```
✅ Admin created: admin@nyumbangin.com
✅ Login successful, token: eyJhbGci...
```

---

## Bab 2: Arsitektur & Struktur

### Latihan 2.1: Custom API Route
**Tujuan**: Membuat API route sederhana

**Tasks**:
Create `pages/api/hello.js`:
```javascript
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Hello from Nyumbangin API',
    timestamp: new Date().toISOString()
  });
}
```

Test dengan curl atau Thunder Client.

---

### Latihan 2.2: Dynamic Route
**Tujuan**: Memahami dynamic routing

**Tasks**:
Create `pages/api/user/[id].js`:
```javascript
export default function handler(req, res) {
  const { id } = req.query;
  res.json({ userId: id });
}
```

Test: `GET /api/user/123` → `{ userId: "123" }`

---

## Bab 3: Database & Models

### Latihan 3.1: Custom Model
**Tujuan**: Membuat Mongoose model baru

**Task**: Buat model `Badge` untuk achievement badges

**Schema**:
```javascript
{
  name: String (required, unique),
  icon: String (emoji atau URL),
  description: String,
  requirements: {
    type: String, // 'donation_count' | 'total_earned'
    value: Number,
  },
}
```

**Bonus**: Add badges field ke Creator model (array of Badge references)

---

### Latihan 3.2: Complex Aggregation
**Tujuan**: Menulis aggregation query

**Task**: Hitung statistik per creator:
- Total donations
- Average donation amount
- Highest single donation
- Latest donation date

**Expected Output**:
```javascript
[
  {
    _id: ObjectId('...'),
    username: 'johndoe',
    stats: {
      totalDonations: 25,
      avgAmount: 65000,
      maxAmount: 500000,
      latestDonation: ISODate('2026-01-08')
    }
  }
]
```

---

## Bab 4: Autentikasi & Otorisasi

### Latihan 4.1: Protected Route
**Tujuan**: Implementasi middleware authentication

**Task**: Create protected route `pages/api/profile.js`:
1. Check JWT token di header
2. Verify token
3. Return user profile
4. Handle errors (missing token, expired, invalid)

**Test Cases**:
- ✅ Valid token → 200 dengan user data
- ❌ No token → 401 Unauthorized
- ❌ Invalid token → 401 Invalid token
- ❌ Expired token → 401 Token expired

---

### Latihan 4.2: Role Middleware
**Tujuan**: Implementasi RBAC

**Task**: Create `requireRole` middleware:
```javascript
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};
```

**Usage**:
```javascript
app.use('/api/admin', requireAuth, requireRole(['admin']));
```

---

## Bab 5: Donasi & Payout

### Latihan 5.1: Donation Notification
**Tujuan**: Send real-time notification

**Task**: Implement Server-Sent Events (SSE) untuk live donation feed

**API**: `GET /api/notifications/stream`
**Client**: EventSource untuk listen updates

**Bonus**: Show toast notification di frontend saat ada donasi baru

---

### Latihan 5.2: Payout Report
**Tujuan**: Generate payout report PDF

**Task**: Create `pages/api/admin/payout/[id]/report.pdf.js`:
1. Get payout details dari database
2. Generate PDF dengan library (pdfkit atau jsPDF)
3. Include: Creator info, amount, bank details, approval info
4. Return PDF file

**Test**: Download PDF dan verify content

---

## Bab 6: Testing & Deployment

### Latihan 6.1: Unit Test
**Tujuan**: Write test untuk utility function

**Task**: Test `utils/format.js`:
```javascript
// __tests__/utils/format.test.js
import { formatCurrency, formatDate } from '@/utils/format';

describe('formatCurrency', () => {
  it('formats Indonesian Rupiah correctly', () => {
    expect(formatCurrency(50000)).toBe('Rp50,000');
  });
  
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('Rp0');
  });
});
```

---

### Latihan 6.2: Integration Test
**Tujuan**: Test API route end-to-end

**Task**: Test donation creation flow:
1. Mock MongoDB
2. Mock Midtrans API
3. Call `POST /api/donate/johndoe`
4. Assert response contains token
5. Verify donation saved to database

---

# MINI PROJECTS

## Project 1: Notification System 🔔

**Objective**: Implement in-app notification system

**Features**:
1. **Model**: Notification schema
   ```javascript
   {
     userId: ObjectId,
     type: 'donation' | 'payout' | 'system',
     title: String,
     message: String,
     isRead: Boolean,
     createdAt: Date,
   }
   ```

2. **API Endpoints**:
   - `GET /api/notifications` - Get user notifications
   - `POST /api/notifications/:id/read` - Mark as read
   - `DELETE /api/notifications/:id` - Delete notification

3. **Frontend**:
   - Notification bell icon dengan badge (unread count)
   - Dropdown list notifications
   - Mark all as read button

**Bonus**:
- Real-time updates dengan SSE atau WebSocket
- Push notifications (Web Push API)

---

## Project 2: Analytics Dashboard 📊

**Objective**: Build comprehensive analytics

**Features**:
1. **Creator Analytics**:
   - Revenue over time (line chart)
   - Donations by payment method (pie chart)
   - Top supporters (table)
   - Donation heatmap (calendar view)

2. **Admin Analytics**:
   - Platform growth metrics
   - Creator leaderboard
   - Payment method distribution
   - Payout trends

3. **Charts**: Use Chart.js atau Recharts

**Bonus**:
- Export data to CSV
- Date range filter
- Compare multiple creators

---

## Project 3: Comment System 💬

**Objective**: Allow supporters to leave comments on creator profile

**Features**:
1. **Model**: Comment schema
   ```javascript
   {
     creatorId: ObjectId,
     donationId: ObjectId (optional),
     supporterName: String,
     supporterEmail: String,
     message: String,
     isApproved: Boolean,
     createdAt: Date,
   }
   ```

2. **API**:
   - `POST /api/creator/:username/comments` - Add comment
   - `GET /api/creator/:username/comments` - Get approved comments
   - `PUT /api/creator/comments/:id/approve` - Approve comment (creator only)

3. **Frontend**:
   - Comment form di creator page
   - List comments dengan pagination
   - Moderation panel untuk creator

**Bonus**:
- Reply system (nested comments)
- Like/reaction system
- Spam filter

---

# ADVANCED CASE STUDIES

## Case Study 1: Subscription Feature 🔄

**Problem**: Creators want recurring monthly donations (subscription model)

**Requirements**:
1. **Subscription Model**:
   ```javascript
   {
     creatorId: ObjectId,
     supporterId: ObjectId,
     amount: Number,
     interval: 'monthly',
     status: 'active' | 'paused' | 'cancelled',
     nextBillingDate: Date,
     cardToken: String (from Midtrans),
   }
   ```

2. **Midtrans Integration**:
   - Save credit card token (one-click payment)
   - Recurring transaction API

3. **Cron Job** (`/api/cron/process-subscriptions`):
   - Run daily
   - Check due subscriptions
   - Create donation + charge card
   - Handle failures (retry logic)

4. **Frontend**:
   - Subscription plans (Rp 50k, 100k, 250k/month)
   - Manage subscription page
   - Cancel/pause subscription

**Challenge**:
- Handle failed payments (email notification, retry 3x, auto-cancel)
- Proration for plan upgrades
- Gift subscription feature

---

## Case Study 2: Multi-Currency Support 💱

**Problem**: Support donations in USD, EUR, SGD (international supporters)

**Requirements**:
1. **Database**:
   - Add `currency` field to Donation model
   - Store `amountIDR` (converted) for consistency

2. **Exchange Rate API**:
   - Integrate https://exchangerate-api.com (free tier)
   - Cache rates (update daily)
   - Display rates to user

3. **Midtrans**:
   - Configure multi-currency in dashboard
   - Handle different currency codes

4. **Frontend**:
   - Currency selector di donation form
   - Display amount in selected currency
   - Show equivalent IDR

**Challenge**:
- Creator earnings always in IDR
- Historical exchange rate for reports
- Handle currency-specific payment methods

---

## Case Study 3: Goal/Milestone Feature 🎯

**Problem**: Creators want to set funding goals (e.g., "Save for new camera: Rp 10,000,000")

**Requirements**:
1. **Model**:
   ```javascript
   {
     creatorId: ObjectId,
     title: String,
     description: String,
     targetAmount: Number,
     currentAmount: Number,
     deadline: Date (optional),
     status: 'active' | 'completed' | 'expired',
     isPublic: Boolean,
   }
   ```

2. **API**:
   - CRUD endpoints for goals
   - Auto-update `currentAmount` when donation paid
   - Mark completed when target reached

3. **Frontend**:
   - Goal card di creator page (progress bar)
   - List all goals
   - Confetti animation saat goal complete

**Bonus**:
- Multiple active goals (split donation between goals)
- Goal categories (equipment, charity, project)
- Supporter dapat pilih goal untuk donate

---

## Case Study 4: Live Stream Integration 🎥

**Problem**: Show donations live during streaming (OBS overlay)

**Requirements**:
1. **Widget URL**: `https://nyumbangin.com/widget/:username`
   - Simple HTML page untuk OBS browser source
   - Display latest donation (name, amount, message)
   - Auto-refresh atau SSE

2. **Customization**:
   - Colors, fonts, animations
   - Sound alert (ding.mp3)
   - Text-to-speech untuk message

3. **API**:
   - `GET /api/widget/:username/latest` - Latest donation
   - SSE stream untuk real-time updates

4. **Admin Panel** untuk creator:
   - Widget settings (theme, sound, etc)
   - Test widget button

**Challenge**:
- Handle high traffic during live stream
- Profanity filter for messages
- Multiple alert types (donation, subscription, goal reached)

---

## Case Study 5: Affiliate/Referral Program 🤝

**Problem**: Creators want to invite other creators (earn commission)

**Requirements**:
1. **Model**:
   ```javascript
   {
     referrerId: ObjectId (creator who invites),
     referredId: ObjectId (new creator),
     commissionRate: Number (e.g., 0.05 for 5%),
     totalEarned: Number,
     status: 'active' | 'expired',
   }
   ```

2. **Logic**:
   - Referrer earns 5% of referred creator's earnings (for 6 months)
   - Calculate commission when payout processed
   - Add to referrer's balance

3. **API**:
   - `GET /api/creator/referral-code` - Get unique code
   - `POST /api/auth/register?ref=CODE` - Register dengan referral

4. **Frontend**:
   - Referral dashboard (invited users, earnings)
   - Share referral link

**Challenge**:
- Prevent self-referral
- Multi-level referral (pyramid scheme concerns)
- Tax implications

---

# CHALLENGE PROJECTS

## Challenge 1: Mobile App (React Native) 📱

**Objective**: Build mobile app dengan React Native

**Features**:
- Browse creators
- Donate (use Midtrans Mobile SDK)
- Push notifications
- Creator dashboard

**Tech Stack**:
- React Native / Expo
- Same backend API

---

## Challenge 2: Microservices Architecture 🏗️

**Objective**: Refactor monolithic app ke microservices

**Services**:
1. **Auth Service** - Handle authentication
2. **User Service** - Creator/Admin management
3. **Payment Service** - Donation + Midtrans
4. **Payout Service** - Payout management
5. **Notification Service** - Email + push

**Tech**:
- API Gateway (Kong atau custom)
- Message Queue (RabbitMQ)
- Docker containers

---

## Challenge 3: GraphQL API 🔷

**Objective**: Replace REST API dengan GraphQL

**Schema Example**:
```graphql
type Creator {
  id: ID!
  username: String!
  displayName: String!
  bio: String
  donations: [Donation!]!
  totalEarned: Float!
}

type Query {
  creator(username: String!): Creator
  creators(limit: Int): [Creator!]!
}

type Mutation {
  createDonation(input: DonationInput!): Donation!
}
```

**Tech**:
- Apollo Server
- Apollo Client (frontend)

---

## Challenge 4: Blockchain Integration ⛓️

**Objective**: Accept crypto donations (ETH, BTC)

**Features**:
1. Wallet integration (MetaMask)
2. Smart contract untuk donations
3. Convert crypto to IDR (via exchange API)
4. Blockchain explorer untuk transparency

**Tech**:
- Web3.js / ethers.js
- Solidity (smart contracts)
- Infura (Ethereum node)

---

## Challenge 5: AI Features 🤖

**Objective**: Add AI-powered features

**Ideas**:
1. **Content Moderation**:
   - Auto-detect inappropriate messages (OpenAI Moderation API)
   - Spam detection

2. **Smart Recommendations**:
   - Recommend creators to supporters based on donation history
   - Suggest donation amounts

3. **Chatbot**:
   - Help supporters with questions
   - Guide new creators through setup

**Tech**:
- OpenAI API
- TensorFlow.js (client-side ML)

---

# PROJECT EVALUATION CHECKLIST

Use checklist ini untuk evaluate project Anda:

## Functionality ✅
- [ ] All core features working
- [ ] No critical bugs
- [ ] Error handling proper
- [ ] Edge cases covered

## Code Quality 💻
- [ ] Clean, readable code
- [ ] Proper naming conventions
- [ ] Comments where needed
- [ ] No code duplication (DRY principle)

## Security 🔒
- [ ] Input validation
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secrets not exposed

## Performance ⚡
- [ ] Fast load times (<3s)
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] No memory leaks

## Testing 🧪
- [ ] Unit tests written
- [ ] Integration tests
- [ ] Manual testing done
- [ ] Edge cases tested

## Documentation 📚
- [ ] README comprehensive
- [ ] API documented
- [ ] Setup instructions clear
- [ ] Comments in code

## Deployment 🚀
- [ ] Deployed to production
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Monitoring enabled

---

# SUBMISSION GUIDELINES

Untuk submit project challenge:

1. **GitHub Repository**:
   - Clear README
   - .env.example file
   - License file

2. **Demo Video** (optional):
   - 3-5 minutes
   - Show key features
   - Explain architecture decisions

3. **Documentation**:
   - Architecture diagram
   - API documentation
   - Setup guide

---

# RESOURCES FOR FURTHER LEARNING

## Online Courses
- [Next.js Crash Course](https://www.youtube.com/watch?v=mTz0GXj8NN0)
- [MongoDB University](https://university.mongodb.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Books
- "You Don't Know JS" - Kyle Simpson
- "Eloquent JavaScript" - Marijn Haverbeke
- "Clean Code" - Robert C. Martin

## Communities
- Stack Overflow
- Dev.to
- Reddit r/webdev
- Discord servers (Reactiflux, Nodeiflux)

---

<div align="center">

**Navigasi**

[⬅️ Lampiran E: Glossary](Lampiran-E-Glossary.md) | [Kembali ke Daftar Isi](00-Daftar-Isi.md)

---

## 🎉 SELAMAT! 🎉

Anda telah menyelesaikan **Panduan Lengkap Platform Donasi Nyumbangin**!

**What's Next?**
1. ✅ Complete exercises per bab
2. 🚀 Build one mini project
3. 💪 Tackle advanced case study
4. 🌟 Share your project!

**Keep Learning, Keep Building! 💻**

---

*"The best way to learn is by doing."*

**Happy Coding! 🚀**

</div>
