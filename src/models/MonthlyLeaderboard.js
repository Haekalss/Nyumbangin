import mongoose from 'mongoose';

const MonthlyLeaderboardSchema = new mongoose.Schema({
  // Creator identifier
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Creator', 
    required: true 
  },
  creatorUsername: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // Time period
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  monthYear: { type: String, required: true }, // "2025-01"
  
  // Top donors leaderboard (top 10)
  topDonors: [{
    rank: { type: Number, required: true, min: 1, max: 10 },
    name: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    donationCount: { type: Number, required: true },
    avgDonationAmount: { type: Number, required: true },
    lastDonationAt: { type: Date, required: true },
    
    // Additional stats
    biggestDonation: { type: Number, default: 0 },
    firstDonationAt: { type: Date },
    
    // Badges/achievements for this month
    badges: [{
      type: String,
      enum: [
        'TOP_DONOR',          // #1 donor
        'CONSISTENT_DONOR',   // Multiple donations
        'BIG_SPENDER',       // Single large donation
        'LOYAL_SUPPORTER',   // Donated multiple months
        'FIRST_TIME',        // First time donor
        'COMEBACK'           // Returned after break
      ]
    }]
  }],
  
  // Monthly summary stats
  monthlyStats: {
    totalDonations: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    uniqueDonors: { type: Number, default: 0 },
    avgDonationAmount: { type: Number, default: 0 },
    biggestDonation: { type: Number, default: 0 },
    smallestDonation: { type: Number, default: 0 },
    
    // Daily breakdown
    dailyTotals: [{
      date: { type: Number, min: 1, max: 31 }, // Day of month
      amount: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }],
    
    // Peak activity
    peakDay: { type: Number }, // Day with most donations
    peakAmount: { type: Number, default: 0 }
  },
  
  // Growth metrics (compared to previous month)
  growthMetrics: {
    donationGrowth: { type: Number, default: 0 }, // Percentage change in count
    amountGrowth: { type: Number, default: 0 },   // Percentage change in amount
    donorGrowth: { type: Number, default: 0 },    // Percentage change in unique donors
    avgAmountGrowth: { type: Number, default: 0 } // Percentage change in avg amount
  },
  
  // Status
  isFinalized: { type: Boolean, default: false }, // True when month is complete
  lastUpdated: { type: Date, default: Date.now },
  
  // Auto-generated insights
  insights: [{
    type: {
      type: String,
      enum: [
        'GROWTH_SURGE',      // Significant increase
        'TOP_PERFORMER',     // Beat personal record
        'CONSISTENCY',       // Steady donations
        'NEW_SUPPORTERS',    // Many new donors
        'LOYAL_BASE'         // High repeat donors
      ]
    },
    message: String,
    value: Number // Supporting statistic
  }]
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
// Using monthYear (YYYY-MM format) is more efficient than separate year/month
MonthlyLeaderboardSchema.index({ creatorId: 1, monthYear: 1 }, { unique: true });
MonthlyLeaderboardSchema.index({ monthYear: 1, 'monthlyStats.totalAmount': -1 }); // For leaderboard
MonthlyLeaderboardSchema.index({ lastUpdated: -1 });

// Virtual for month name
MonthlyLeaderboardSchema.virtual('monthName').get(function() {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[this.month - 1];
});

// Virtual for formatted total amount
MonthlyLeaderboardSchema.virtual('formattedTotalAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.monthlyStats.totalAmount);
});

// Pre-save middleware to set monthYear
MonthlyLeaderboardSchema.pre('save', function(next) {
  if (!this.monthYear) {
    this.monthYear = `${this.year}-${this.month.toString().padStart(2, '0')}`;
  }
  this.lastUpdated = new Date();
  next();
});

// Static method to update or create leaderboard for current month
MonthlyLeaderboardSchema.statics.updateCurrentMonth = async function(creatorId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  return await this.updateMonthlyData(creatorId, year, month);
};

// Static method to update leaderboard data for specific month
MonthlyLeaderboardSchema.statics.updateMonthlyData = async function(creatorId, year, month) {
  const Donation = mongoose.models.Donation;
  const DonationHistory = mongoose.models.DonationHistory;
  
  if (!Donation && !DonationHistory) {
    throw new Error('Donation or DonationHistory model not found');
  }
  
  const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
  
  // Get data from current donations (if current month) and history
  let donations = [];
  
  // If current month, get from donations collection
  const now = new Date();
  if (year === now.getFullYear() && month === now.getMonth() + 1) {
    const currentMonthDonations = await Donation.find({
      createdBy: creatorId,
      status: 'PAID',
      createdAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      }
    });
    donations = donations.concat(currentMonthDonations);
  }
  
  // Get from history
  if (DonationHistory) {
    const historyDonations = await DonationHistory.find({
      createdBy: creatorId,
      monthYear: monthYear,
      status: 'PAID'
    });
    donations = donations.concat(historyDonations);
  }
  
  // Calculate top donors
  const donorMap = new Map();
  let totalAmount = 0;
  let totalCount = 0;
  const dailyTotals = Array.from({length: 31}, (_, i) => ({
    date: i + 1,
    amount: 0,
    count: 0
  }));
  
  donations.forEach(donation => {
    const donorName = donation.name;
    const amount = donation.amount;
    const createdAt = donation.originalCreatedAt || donation.createdAt;
    const day = createdAt.getDate();
    
    // Update donor totals
    if (!donorMap.has(donorName)) {
      donorMap.set(donorName, {
        name: donorName,
        totalAmount: 0,
        donationCount: 0,
        donations: [],
        lastDonationAt: createdAt,
        firstDonationAt: createdAt
      });
    }
    
    const donor = donorMap.get(donorName);
    donor.totalAmount += amount;
    donor.donationCount += 1;
    donor.donations.push(amount);
    donor.lastDonationAt = new Date(Math.max(donor.lastDonationAt, createdAt));
    donor.firstDonationAt = new Date(Math.min(donor.firstDonationAt, createdAt));
    
    // Update totals
    totalAmount += amount;
    totalCount += 1;
    
    // Update daily totals
    if (day >= 1 && day <= 31) {
      dailyTotals[day - 1].amount += amount;
      dailyTotals[day - 1].count += 1;
    }
  });
  
  // Create top donors list
  const topDonors = Array.from(donorMap.values())
    .map(donor => ({
      ...donor,
      avgDonationAmount: Math.round(donor.totalAmount / donor.donationCount),
      biggestDonation: Math.max(...donor.donations)
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((donor, index) => ({
      rank: index + 1,
      name: donor.name,
      totalAmount: donor.totalAmount,
      donationCount: donor.donationCount,
      avgDonationAmount: donor.avgDonationAmount,
      lastDonationAt: donor.lastDonationAt,
      biggestDonation: donor.biggestDonation,
      firstDonationAt: donor.firstDonationAt,
      badges: [] // TODO: Calculate badges based on behavior
    }));
  
  // Calculate stats
  const uniqueDonors = donorMap.size;
  const avgDonationAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
  const amounts = donations.map(d => d.amount);
  const biggestDonation = amounts.length > 0 ? Math.max(...amounts) : 0;
  const smallestDonation = amounts.length > 0 ? Math.min(...amounts) : 0;
  
  // Find peak day
  const peakDayIndex = dailyTotals.reduce((maxIndex, day, index) => 
    day.amount > dailyTotals[maxIndex].amount ? index : maxIndex, 0
  );
  const peakDay = peakDayIndex + 1;
  const peakAmount = dailyTotals[peakDayIndex].amount;
  
  // Update or create leaderboard
  const Creator = mongoose.models.Creator;
  const creator = await Creator.findById(creatorId);
  
  const updateData = {
    creatorId,
    creatorUsername: creator?.username || 'unknown',
    year,
    month,
    monthYear,
    topDonors,
    monthlyStats: {
      totalDonations: totalCount,
      totalAmount,
      uniqueDonors,
      avgDonationAmount,
      biggestDonation,
      smallestDonation,
      dailyTotals: dailyTotals.filter(day => day.amount > 0 || day.count > 0),
      peakDay,
      peakAmount
    },
    isFinalized: month < now.getMonth() + 1 || year < now.getFullYear()
  };
  
  return await this.findOneAndUpdate(
    { creatorId, year, month },
    updateData,
    { upsert: true, new: true, runValidators: true }
  );
};

// Method to finalize month (calculate final stats and growth)
MonthlyLeaderboardSchema.methods.finalize = async function() {
  if (this.isFinalized) return this;
  
  // Get previous month for growth calculation
  let prevYear = this.year;
  let prevMonth = this.month - 1;
  
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = this.year - 1;
  }
  
  const previousMonth = await this.constructor.findOne({
    creatorId: this.creatorId,
    year: prevYear,
    month: prevMonth
  });
  
  if (previousMonth) {
    // Calculate growth percentages
    const calcGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    this.growthMetrics = {
      donationGrowth: calcGrowth(this.monthlyStats.totalDonations, previousMonth.monthlyStats.totalDonations),
      amountGrowth: calcGrowth(this.monthlyStats.totalAmount, previousMonth.monthlyStats.totalAmount),
      donorGrowth: calcGrowth(this.monthlyStats.uniqueDonors, previousMonth.monthlyStats.uniqueDonors),
      avgAmountGrowth: calcGrowth(this.monthlyStats.avgDonationAmount, previousMonth.monthlyStats.avgDonationAmount)
    };
  }
  
  this.isFinalized = true;
  return await this.save();
};

export default mongoose.models.MonthlyLeaderboard || mongoose.model('MonthlyLeaderboard', MonthlyLeaderboardSchema);