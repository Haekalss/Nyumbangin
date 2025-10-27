# Nyumbangin Database Schema - 10 Collections

## 📊 **Database Structure Overview**

Database Name: `nyumbangin`
Total Collections: 10

## 🗄️ **10 Collections & Relationships**

### **1. `creators`** - Creator/Streamer Accounts
**File**: `/src/models/Creator.js`
**Purpose**: Main creator accounts with profile, settings, and stats
**Key Fields**:
- username, email, password, displayName
- socialLinks (twitch, youtube, instagram, tiktok)
- payoutSettings (bankName, accountNumber, minPayoutAmount)
- donationSettings (minAmount, maxAmount, customMessage)
- stats (totalDonations, totalAmount, totalPayouts)

**Relations**:
- Has many → donations, payouts, notifications, monthly leaderboards, analytics

---

### **2. `admins`** - Administrator Accounts  
**File**: `/src/models/Admin.js`
**Purpose**: Admin accounts with role-based permissions
**Key Fields**:
- username, email, password, fullName
- role (SUPER_ADMIN, ADMIN, MODERATOR)
- permissions (MANAGE_PAYOUTS, MANAGE_CREATORS, VIEW_ANALYTICS, etc.)
- stats (payoutsProcessed, payoutsApproved, totalAmountApproved)

**Relations**:
- Processes → payouts, payout_history

---

### **3. `donations`** - Current Donation Records (24h)
**File**: `/src/models/donations.js` (Updated)
**Purpose**: Recent donations (auto-archived after 24h)
**Key Fields**:
- name, email, amount, message, status
- createdBy (ObjectId → creators), createdByUsername
- merchant_ref, transactionId, paymentMethod
- isDisplayedInOverlay, displayedAt

**Relations**:
- Belongs to → creators
- Can generate → notifications
- Auto-archived to → donation_history

---

### **4. `payouts`** - Current Payout Requests
**File**: `/src/models/payout.js` (Updated)
**Purpose**: Active payout requests (auto-archived after processed)
**Key Fields**:
- creatorId (ObjectId → creators), creatorUsername
- amount, status (PENDING, APPROVED, REJECTED, PROCESSED)
- bankInfo, processedBy (ObjectId → admins)
- payoutReference, platformFee, finalAmount

**Relations**:
- Belongs to → creators
- Processed by → admins
- Auto-archived to → payout_history

---

### **5. `notifications`** - Real-time Notifications
**File**: `/src/models/Notification.js`
**Purpose**: Real-time notifications for overlay & dashboard
**Key Fields**:
- creatorId (ObjectId → creators), donationId, payoutId
- type (DONATION, PAYOUT_APPROVED, SYSTEM, etc.)
- title, message, overlayData
- isRead, isDisplayedInOverlay, priority

**Relations**:
- Belongs to → creators
- Related to → donations, payouts

---

### **6. `contacts`** - Contact Form Submissions
**File**: `/src/models/Contact.js` (Existing)
**Purpose**: Contact form messages from users
**Key Fields**:
- name, email, subject, message
- status, ipAddress, userAgent

**Relations**: Standalone

---

### **7. `donation_history`** - Archived Donations
**File**: `/src/models/DonationHistory.js`
**Purpose**: Archive donations older than 24h for analytics
**Key Fields**:
- All fields from donations + archive metadata
- originalDonationId, archivedAt, archivedReason
- monthYear, year, month (for efficient queries)
- originalCreatedAt, wasDisplayedInOverlay

**Relations**:
- Archived from → donations
- Belongs to → creators
- Used by → monthly_leaderboards, monthly_analytics

---

### **8. `monthly_leaderboards`** - Monthly Top Donors
**File**: `/src/models/MonthlyLeaderboard.js`
**Purpose**: Top 10 donors per month per creator (auto-updated)
**Key Fields**:
- creatorId, year, month, monthYear
- topDonors[] (rank, name, totalAmount, donationCount, badges)
- monthlyStats (totalDonations, totalAmount, uniqueDonors)
- growthMetrics, insights

**Relations**:
- Belongs to → creators
- Calculated from → donations + donation_history

---

### **9. `payout_history`** - Archived Payouts
**File**: `/src/models/PayoutHistory.js`
**Purpose**: Archive processed/rejected payouts after 30 days
**Key Fields**:
- All fields from payouts + archive metadata
- originalPayoutId, archivedAt, processingTimeHours
- monthYear, year, month
- isSuccessful, rejectionReason

**Relations**:
- Archived from → payouts
- Belongs to → creators, admins
- Used by → monthly_analytics

---

### **10. `monthly_analytics`** - Monthly Statistics
**File**: `/src/models/MonthlyAnalytics.js`
**Purpose**: Comprehensive monthly analytics with insights
**Key Fields**:
- creatorId, year, month, monthYear
- donationAnalytics (totalAmount, uniqueDonors, avgAmount, etc.)
- payoutAnalytics (totalRequested, approvalRate, etc.)
- growthMetrics, insights[], recommendations[]
- performanceScore (virtual)

**Relations**:
- Belongs to → creators
- Calculated from → donations, donation_history, payouts, payout_history

---

## 🔗 **Database Relationship Flow**

```
CREATORS (1)
├── has many → DONATIONS (many) ──auto-archive(24h)──→ DONATION_HISTORY
├── has many → PAYOUTS (many) ──auto-archive(30d)──→ PAYOUT_HISTORY  
├── has many → NOTIFICATIONS (many)
├── has many → MONTHLY_LEADERBOARDS (per month)
└── has many → MONTHLY_ANALYTICS (per month)

ADMINS (1) 
├── processes → PAYOUTS (many)
└── processes → PAYOUT_HISTORY (many)

DONATIONS → generates → NOTIFICATIONS
DONATIONS + DONATION_HISTORY → calculates → MONTHLY_LEADERBOARDS
ALL COLLECTIONS → calculates → MONTHLY_ANALYTICS
```

## 🤖 **Auto-Processing Features**

### **Daily Jobs (Cron)**:
1. **Archive old donations** (>24h) → `donation_history`
2. **Update leaderboards** → `monthly_leaderboards`
3. **Generate notifications** → `notifications`

### **Monthly Jobs**:
1. **Finalize leaderboards** → Previous month data
2. **Calculate analytics** → `monthly_analytics`  
3. **Archive old payouts** → `payout_history`

### **Real-time Updates**:
1. **New donation** → Create notification + Update leaderboard
2. **Payout approved** → Create notification + Update analytics
3. **Overlay display** → Mark notification as displayed

## 📈 **Advanced Features**

### **Analytics & Insights**:
- Monthly performance scoring (0-100)
- Growth trend analysis (UP/DOWN/STABLE)
- Donor behavior patterns
- Revenue forecasting
- Automated recommendations

### **Leaderboard System**:
- Top 10 donors per month
- Donor badges (TOP_DONOR, LOYAL_SUPPORTER, etc.)
- Historical comparisons
- Growth metrics

### **Notification System**:
- Real-time overlay integration
- Priority-based queuing
- Auto-expire after 7 days
- Type-specific formatting

### **Archive System**:
- Auto-cleanup for performance
- Historical data preservation
- Efficient temporal queries
- Data integrity maintenance

## 🎯 **Business Value**

1. **Performance**: Current data stays small, historical data archived
2. **Analytics**: Deep insights into creator performance & growth
3. **Engagement**: Real-time notifications & leaderboards
4. **Scalability**: Efficient data structure for growth
5. **Compliance**: Complete audit trail & data retention

## 📊 **Query Examples**

```javascript
// Get current month leaderboard
const leaderboard = await MonthlyLeaderboard.findOne({
  creatorId: creatorId,
  year: 2025,
  month: 1
});

// Get donation analytics for last 6 months
const analytics = await MonthlyAnalytics.find({
  creatorId: creatorId,
  year: { $gte: 2024 }
}).sort({ year: -1, month: -1 }).limit(6);

// Get real-time notifications for overlay
const notifications = await Notification.getForOverlay(creatorId, 5);

// Archive old donations (automated)
const oldDonations = await Donation.getReadyForArchive();
for (let donation of oldDonations) {
  await DonationHistory.archiveDonation(donation);
  await donation.remove();
}
```

---

**Status**: ✅ **All 10 collections implemented and ready for production**
**Database**: `nyumbangin`
**Total Models**: 10 files created/updated
**Relationships**: Fully connected with proper indexing
**Auto-processing**: Ready for cron job implementation