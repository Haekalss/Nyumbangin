import mongoose from 'mongoose';

const MonthlyAnalyticsSchema = new mongoose.Schema({
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
  
  // Donation analytics
  donationAnalytics: {
    totalAmount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    uniqueDonors: { type: Number, default: 0 },
    avgAmount: { type: Number, default: 0 },
    medianAmount: { type: Number, default: 0 },
    
    // Amount ranges
    smallDonations: { type: Number, default: 0 },    // < 25k
    mediumDonations: { type: Number, default: 0 },   // 25k - 100k
    largeDonations: { type: Number, default: 0 },    // > 100k
    
    // Records
    biggestDonation: { type: Number, default: 0 },
    smallestDonation: { type: Number, default: 0 },
    
    // Time patterns
    peakDayOfMonth: { type: Number }, // 1-31
    peakHourOfDay: { type: Number },  // 0-23
    
    // Donor behavior
    newDonors: { type: Number, default: 0 },         // First time donors this month
    returningDonors: { type: Number, default: 0 },   // Donors who donated before
    repeatDonors: { type: Number, default: 0 },      // Donors who donated multiple times this month
    
    // Conversion rates
    donorRetentionRate: { type: Number, default: 0 }, // % of last month donors who donated again
    avgDonationsPerDonor: { type: Number, default: 0 }
  },
  
  // Payout analytics
  payoutAnalytics: {
    totalRequested: { type: Number, default: 0 },
    totalApproved: { type: Number, default: 0 },
    totalRejected: { type: Number, default: 0 },
    totalTransferred: { type: Number, default: 0 },
    
    requestCount: { type: Number, default: 0 },
    approvalRate: { type: Number, default: 0 }, // Percentage
    avgProcessingTimeHours: { type: Number, default: 0 },
    
    // Fees
    totalPlatformFees: { type: Number, default: 0 },
    netAmountReceived: { type: Number, default: 0 }
  },
  
  // Growth metrics (compared to previous month)
  growthMetrics: {
    donationGrowth: { type: Number, default: 0 },     // % change in donation count
    amountGrowth: { type: Number, default: 0 },       // % change in total amount
    donorGrowth: { type: Number, default: 0 },        // % change in unique donors
    avgAmountGrowth: { type: Number, default: 0 },    // % change in avg amount
    
    // Trend indicators
    trendDirection: { 
      type: String, 
      enum: ['UP', 'DOWN', 'STABLE'], 
      default: 'STABLE' 
    },
    trendStrength: { 
      type: String, 
      enum: ['WEAK', 'MODERATE', 'STRONG'], 
      default: 'WEAK' 
    }
  },
  
  // Daily breakdown (condensed)
  dailyBreakdown: [{
    date: { type: Number, min: 1, max: 31 },
    donations: {
      count: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      uniqueDonors: { type: Number, default: 0 }
    },
    payouts: {
      requested: { type: Number, default: 0 },
      approved: { type: Number, default: 0 }
    }
  }],
  
  // Hourly patterns (0-23)
  hourlyPatterns: [{
    hour: { type: Number, min: 0, max: 23 },
    avgDonations: { type: Number, default: 0 },
    avgAmount: { type: Number, default: 0 }
  }],
  
  // Performance insights
  insights: [{
    type: {
      type: String,
      enum: [
        'TOP_MONTH',          // Best month ever
        'GROWTH_SURGE',       // Significant growth
        'DONOR_MILESTONE',    // Reached donor milestone
        'AMOUNT_MILESTONE',   // Reached amount milestone
        'CONSISTENCY_GOOD',   // Consistent donations
        'PEAK_DAY_PATTERN',   // Identified peak day pattern
        'LOYAL_DONOR_BASE',   // High retention
        'NEW_AUDIENCE',       // Many new donors
        'PAYOUT_EFFICIENCY'   // Good payout approval rate
      ]
    },
    title: String,
    description: String,
    value: Number,        // Supporting number
    impact: {             // Business impact
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW']
    }
  }],
  
  // Recommendations for improvement
  recommendations: [{
    type: {
      type: String,
      enum: [
        'INCREASE_ENGAGEMENT',
        'OPTIMIZE_PEAK_HOURS',
        'DONOR_RETENTION',
        'PAYOUT_TIMING',
        'CONTENT_STRATEGY'
      ]
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW']
    },
    action: String,
    expectedImpact: String
  }],
  
  // Status
  isFinalized: { type: Boolean, default: false },
  lastCalculatedAt: { type: Date, default: Date.now },
  
  // Data quality metrics
  dataQuality: {
    donationDataPoints: { type: Number, default: 0 },
    payoutDataPoints: { type: Number, default: 0 },
    missingDataDays: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 100 } // 0-100%
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
MonthlyAnalyticsSchema.index({ creatorId: 1, year: 1, month: 1 }, { unique: true });
MonthlyAnalyticsSchema.index({ creatorId: 1, monthYear: 1 }, { unique: true });
MonthlyAnalyticsSchema.index({ year: 1, month: 1 });
MonthlyAnalyticsSchema.index({ lastCalculatedAt: -1 });

// Virtual for month name
MonthlyAnalyticsSchema.virtual('monthName').get(function() {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[this.month - 1];
});

// Virtual for formatted total amount
MonthlyAnalyticsSchema.virtual('formattedTotalAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.donationAnalytics.totalAmount);
});

// Virtual for performance score (0-100)
MonthlyAnalyticsSchema.virtual('performanceScore').get(function() {
  let score = 0;
  const weights = {
    amount: 30,
    donors: 25,
    retention: 20,
    consistency: 15,
    growth: 10
  };
  
  // Amount score (based on thresholds)
  const amount = this.donationAnalytics.totalAmount;
  if (amount >= 10000000) score += weights.amount;      // 10M+
  else if (amount >= 5000000) score += weights.amount * 0.8;  // 5M+
  else if (amount >= 1000000) score += weights.amount * 0.6;  // 1M+
  else if (amount >= 500000) score += weights.amount * 0.4;   // 500k+
  else if (amount >= 100000) score += weights.amount * 0.2;   // 100k+
  
  // Donor score
  const donors = this.donationAnalytics.uniqueDonors;
  if (donors >= 100) score += weights.donors;
  else if (donors >= 50) score += weights.donors * 0.8;
  else if (donors >= 20) score += weights.donors * 0.6;
  else if (donors >= 10) score += weights.donors * 0.4;
  else if (donors >= 5) score += weights.donors * 0.2;
  
  // Retention score
  const retention = this.donationAnalytics.donorRetentionRate;
  if (retention >= 80) score += weights.retention;
  else if (retention >= 60) score += weights.retention * 0.8;
  else if (retention >= 40) score += weights.retention * 0.6;
  else if (retention >= 20) score += weights.retention * 0.4;
  else if (retention >= 10) score += weights.retention * 0.2;
  
  // Consistency score (based on daily activity)
  const activeDays = this.dailyBreakdown.filter(day => day.donations.count > 0).length;
  const consistencyRate = activeDays / 30; // Assuming 30 days in month
  score += weights.consistency * consistencyRate;
  
  // Growth score
  const amountGrowth = this.growthMetrics.amountGrowth;
  if (amountGrowth >= 50) score += weights.growth;
  else if (amountGrowth >= 20) score += weights.growth * 0.8;
  else if (amountGrowth >= 10) score += weights.growth * 0.6;
  else if (amountGrowth >= 5) score += weights.growth * 0.4;
  else if (amountGrowth > 0) score += weights.growth * 0.2;
  
  return Math.round(score);
});

// Pre-save middleware
MonthlyAnalyticsSchema.pre('save', function(next) {
  if (!this.monthYear) {
    this.monthYear = `${this.year}-${this.month.toString().padStart(2, '0')}`;
  }
  this.lastCalculatedAt = new Date();
  next();
});

// Static method to calculate and update analytics for specific month
MonthlyAnalyticsSchema.statics.calculateMonthlyAnalytics = async function(creatorId, year, month) {
  const Donation = mongoose.models.Donation;
  const DonationHistory = mongoose.models.DonationHistory;
  const Payout = mongoose.models.Payout;
  const PayoutHistory = mongoose.models.PayoutHistory;
  
  const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  
  // Get creator info
  const Creator = mongoose.models.Creator;
  const creator = await Creator.findById(creatorId);
  
  // Collect donation data
  let donations = [];
  
  // Current month donations (from donations collection)
  if (isCurrentMonth && Donation) {
    const currentDonations = await Donation.find({
      createdBy: creatorId,
      status: 'PAID',
      createdAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      }
    });
    donations = donations.concat(currentDonations);
  }
  
  // Historical donations (from donation_history)
  if (DonationHistory) {
    const historyDonations = await DonationHistory.find({
      createdBy: creatorId,
      monthYear: monthYear,
      status: 'PAID'
    });
    donations = donations.concat(historyDonations);
  }
  
  // Calculate donation analytics
  const donationAnalytics = this.calculateDonationAnalytics(donations);
  
  // Calculate payout analytics
  let payoutAnalytics = { totalRequested: 0, totalApproved: 0, totalRejected: 0, totalTransferred: 0, requestCount: 0, approvalRate: 0, avgProcessingTimeHours: 0, totalPlatformFees: 0, netAmountReceived: 0 };
  
  // Collect payout data
  let payouts = [];
  
  if (isCurrentMonth && Payout) {
    const currentPayouts = await Payout.find({
      creatorId: creatorId,
      requestedAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      }
    });
    payouts = payouts.concat(currentPayouts);
  }
  
  if (PayoutHistory) {
    const historyPayouts = await PayoutHistory.find({
      creatorId: creatorId,
      monthYear: monthYear
    });
    payouts = payouts.concat(historyPayouts);
  }
  
  if (payouts.length > 0) {
    payoutAnalytics = this.calculatePayoutAnalytics(payouts);
  }
  
  // Calculate growth metrics
  const growthMetrics = await this.calculateGrowthMetrics(creatorId, year, month, donationAnalytics);
  
  // Generate insights and recommendations
  const insights = this.generateInsights(donationAnalytics, payoutAnalytics, growthMetrics);
  const recommendations = this.generateRecommendations(donationAnalytics, payoutAnalytics, growthMetrics);
  
  // Create/update analytics record
  const updateData = {
    creatorId,
    creatorUsername: creator?.username || 'unknown',
    year,
    month,
    monthYear,
    donationAnalytics,
    payoutAnalytics,
    growthMetrics,
    insights,
    recommendations,
    isFinalized: !isCurrentMonth,
    dataQuality: {
      donationDataPoints: donations.length,
      payoutDataPoints: payouts.length,
      missingDataDays: 0, // TODO: Calculate based on daily breakdown
      confidenceScore: donations.length > 0 ? 100 : 0
    }
  };
  
  return await this.findOneAndUpdate(
    { creatorId, year, month },
    updateData,
    { upsert: true, new: true, runValidators: true }
  );
};

// Helper method to calculate donation analytics
MonthlyAnalyticsSchema.statics.calculateDonationAnalytics = function(donations) {
  if (donations.length === 0) {
    return {
      totalAmount: 0, totalCount: 0, uniqueDonors: 0, avgAmount: 0, medianAmount: 0,
      smallDonations: 0, mediumDonations: 0, largeDonations: 0,
      biggestDonation: 0, smallestDonation: 0,
      newDonors: 0, returningDonors: 0, repeatDonors: 0,
      donorRetentionRate: 0, avgDonationsPerDonor: 0
    };
  }
  
  const amounts = donations.map(d => d.amount);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  const totalCount = donations.length;
  const avgAmount = Math.round(totalAmount / totalCount);
  
  // Calculate median
  const sortedAmounts = [...amounts].sort((a, b) => a - b);
  const mid = Math.floor(sortedAmounts.length / 2);
  const medianAmount = sortedAmounts.length % 2 === 0 
    ? (sortedAmounts[mid - 1] + sortedAmounts[mid]) / 2 
    : sortedAmounts[mid];
  
  // Categorize donations
  let smallDonations = 0, mediumDonations = 0, largeDonations = 0;
  amounts.forEach(amount => {
    if (amount < 25000) smallDonations++;
    else if (amount <= 100000) mediumDonations++;
    else largeDonations++;
  });
  
  // Donor analysis
  const donorMap = new Map();
  donations.forEach(donation => {
    const name = donation.name;
    if (!donorMap.has(name)) {
      donorMap.set(name, { count: 0, total: 0 });
    }
    donorMap.get(name).count++;
    donorMap.get(name).total += donation.amount;
  });
  
  const uniqueDonors = donorMap.size;
  const repeatDonors = Array.from(donorMap.values()).filter(donor => donor.count > 1).length;
  const avgDonationsPerDonor = totalCount / uniqueDonors;
  
  return {
    totalAmount,
    totalCount,
    uniqueDonors,
    avgAmount,
    medianAmount: Math.round(medianAmount),
    smallDonations,
    mediumDonations,
    largeDonations,
    biggestDonation: Math.max(...amounts),
    smallestDonation: Math.min(...amounts),
    newDonors: uniqueDonors, // TODO: Calculate based on history
    returningDonors: 0, // TODO: Calculate based on history
    repeatDonors,
    donorRetentionRate: 0, // TODO: Calculate based on previous month
    avgDonationsPerDonor: Math.round(avgDonationsPerDonor * 100) / 100
  };
};

// Helper method to calculate payout analytics
MonthlyAnalyticsSchema.statics.calculatePayoutAnalytics = function(payouts) {
  if (payouts.length === 0) {
    return {
      totalRequested: 0, totalApproved: 0, totalRejected: 0, totalTransferred: 0,
      requestCount: 0, approvalRate: 0, avgProcessingTimeHours: 0,
      totalPlatformFees: 0, netAmountReceived: 0
    };
  }
  
  let totalRequested = 0, totalApproved = 0, totalRejected = 0, totalTransferred = 0;
  let requestCount = payouts.length;
  let totalFees = 0, processingTimes = [];
  
  payouts.forEach(payout => {
    totalRequested += payout.amount;
    totalFees += payout.platformFee || 0;
    
    if (payout.processingTimeHours) {
      processingTimes.push(payout.processingTimeHours);
    }
    
    switch (payout.status) {
      case 'APPROVED':
        totalApproved += payout.finalAmount || payout.amount;
        break;
      case 'REJECTED':
        totalRejected += payout.amount;
        break;
      case 'PROCESSED':
        totalTransferred += payout.finalAmount || payout.amount;
        break;
    }
  });
  
  const approvedCount = payouts.filter(p => ['APPROVED', 'PROCESSED'].includes(p.status)).length;
  const approvalRate = Math.round((approvedCount / requestCount) * 100);
  
  const avgProcessingTimeHours = processingTimes.length > 0 
    ? Math.round((processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length) * 100) / 100
    : 0;
  
  return {
    totalRequested,
    totalApproved,
    totalRejected,
    totalTransferred,
    requestCount,
    approvalRate,
    avgProcessingTimeHours,
    totalPlatformFees: totalFees,
    netAmountReceived: totalApproved + totalTransferred
  };
};

// Helper method to calculate growth metrics
MonthlyAnalyticsSchema.statics.calculateGrowthMetrics = async function(creatorId, year, month, currentAnalytics) {
  // Get previous month
  let prevYear = year;
  let prevMonth = month - 1;
  
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }
  
  const previousMonth = await this.findOne({
    creatorId: creatorId,
    year: prevYear,
    month: prevMonth
  });
  
  if (!previousMonth) {
    return {
      donationGrowth: 0, amountGrowth: 0, donorGrowth: 0, avgAmountGrowth: 0,
      trendDirection: 'STABLE', trendStrength: 'WEAK'
    };
  }
  
  const calcGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  const prev = previousMonth.donationAnalytics;
  const curr = currentAnalytics;
  
  const donationGrowth = calcGrowth(curr.totalCount, prev.totalCount);
  const amountGrowth = calcGrowth(curr.totalAmount, prev.totalAmount);
  const donorGrowth = calcGrowth(curr.uniqueDonors, prev.uniqueDonors);
  const avgAmountGrowth = calcGrowth(curr.avgAmount, prev.avgAmount);
  
  // Determine trend
  const avgGrowth = (donationGrowth + amountGrowth + donorGrowth + avgAmountGrowth) / 4;
  let trendDirection = 'STABLE';
  let trendStrength = 'WEAK';
  
  if (avgGrowth > 5) trendDirection = 'UP';
  else if (avgGrowth < -5) trendDirection = 'DOWN';
  
  const absGrowth = Math.abs(avgGrowth);
  if (absGrowth > 30) trendStrength = 'STRONG';
  else if (absGrowth > 15) trendStrength = 'MODERATE';
  
  return {
    donationGrowth, amountGrowth, donorGrowth, avgAmountGrowth,
    trendDirection, trendStrength
  };
};

// Helper method to generate insights
MonthlyAnalyticsSchema.statics.generateInsights = function(donationAnalytics, payoutAnalytics, growthMetrics) {
  const insights = [];
  
  // Amount milestone
  if (donationAnalytics.totalAmount >= 10000000) {
    insights.push({
      type: 'AMOUNT_MILESTONE',
      title: 'Pencapaian Luar Biasa!',
      description: 'Total donasi bulan ini mencapai lebih dari Rp 10 juta',
      value: donationAnalytics.totalAmount,
      impact: 'HIGH'
    });
  }
  
  // Growth surge
  if (growthMetrics.amountGrowth >= 50) {
    insights.push({
      type: 'GROWTH_SURGE',
      title: 'Pertumbuhan Pesat',
      description: `Donasi meningkat ${growthMetrics.amountGrowth}% dari bulan lalu`,
      value: growthMetrics.amountGrowth,
      impact: 'HIGH'
    });
  }
  
  // Donor milestone
  if (donationAnalytics.uniqueDonors >= 100) {
    insights.push({
      type: 'DONOR_MILESTONE',
      title: 'Komunitas Berkembang',
      description: 'Berhasil mendapat dukungan dari 100+ donatur unik',
      value: donationAnalytics.uniqueDonors,
      impact: 'HIGH'
    });
  }
  
  // Payout efficiency
  if (payoutAnalytics.approvalRate >= 90 && payoutAnalytics.requestCount > 0) {
    insights.push({
      type: 'PAYOUT_EFFICIENCY',
      title: 'Pencairan Lancar',
      description: `${payoutAnalytics.approvalRate}% permintaan pencairan disetujui`,
      value: payoutAnalytics.approvalRate,
      impact: 'MEDIUM'
    });
  }
  
  return insights;
};

// Helper method to generate recommendations
MonthlyAnalyticsSchema.statics.generateRecommendations = function(donationAnalytics, payoutAnalytics, growthMetrics) {
  const recommendations = [];
  
  // Low donor retention
  if (donationAnalytics.donorRetentionRate < 30 && donationAnalytics.uniqueDonors > 10) {
    recommendations.push({
      type: 'DONOR_RETENTION',
      priority: 'HIGH',
      action: 'Tingkatkan interaksi dengan donatur melalui thank you message dan update konten',
      expectedImpact: 'Meningkatkan loyalitas donatur dan donation rate'
    });
  }
  
  // Low average donation
  if (donationAnalytics.avgAmount < 20000 && donationAnalytics.totalCount > 0) {
    recommendations.push({
      type: 'INCREASE_ENGAGEMENT',
      priority: 'MEDIUM',
      action: 'Buat konten premium atau milestone goals untuk mendorong donasi lebih besar',
      expectedImpact: 'Meningkatkan rata-rata donasi per transaksi'
    });
  }
  
  // Slow payout processing
  if (payoutAnalytics.avgProcessingTimeHours > 72) {
    recommendations.push({
      type: 'PAYOUT_TIMING',
      priority: 'MEDIUM',
      action: 'Lengkapi data bank dan ikuti guidelines untuk mempercepat proses pencairan',
      expectedImpact: 'Mempercepat proses pencairan dana'
    });
  }
  
  return recommendations;
};

export default mongoose.models.MonthlyAnalytics || mongoose.model('MonthlyAnalytics', MonthlyAnalyticsSchema);