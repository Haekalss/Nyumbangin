import mongoose from 'mongoose';

const PayoutHistorySchema = new mongoose.Schema({
  // Original payout data (copied from payouts collection)
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
  amount: { 
    type: Number, 
    required: true
  },
  
  // Final status (only completed payouts are archived)
  status: { 
    type: String, 
    enum: ['APPROVED', 'REJECTED', 'PROCESSED'], 
    required: true 
  },
  
  // Bank information (preserved from time of payout)
  bankInfo: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true }
  },
  
  // Admin who processed
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    required: true
  },
  adminNote: { 
    type: String,
    maxlength: 500 
  },
  
  // Fee information
  platformFee: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  
  // Reference numbers
  payoutReference: { type: String, required: true },
  bankTransferReference: { type: String }, // If transferred
  
  // Archive metadata
  originalPayoutId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    unique: true
  },
  archivedAt: { type: Date, default: Date.now },
  archivedReason: { 
    type: String, 
    enum: ['AUTO_30D', 'MANUAL_ADMIN', 'YEARLY_CLEANUP'],
    default: 'AUTO_30D' 
  },
  
  // Temporal indexing
  monthYear: { type: String, required: true }, // "2025-01"
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  
  // Original timestamps (from original payout)
  originalRequestedAt: { type: Date, required: true },
  originalProcessedAt: { type: Date, required: true },
  
  // Processing time metrics
  processingTimeHours: { type: Number }, // Hours from request to approval
  transferTimeHours: { type: Number },   // Hours from approval to transfer (if PROCESSED)
  
  // Success metrics for analytics
  isSuccessful: { type: Boolean, default: true }, // false only if REJECTED
  rejectionReason: { type: String }, // If status is REJECTED
  
  // Notification tracking
  wasNotified: { type: Boolean, default: false },
  notifiedAt: { type: Date }
  
}, { 
  timestamps: true, // Tracks when archived
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
PayoutHistorySchema.index({ creatorId: 1, monthYear: 1 });
PayoutHistorySchema.index({ creatorId: 1, originalProcessedAt: -1 });
PayoutHistorySchema.index({ processedBy: 1, originalProcessedAt: -1 });
PayoutHistorySchema.index({ status: 1, originalProcessedAt: -1 });
PayoutHistorySchema.index({ year: 1, month: 1 });
PayoutHistorySchema.index({ originalPayoutId: 1 }, { unique: true });
PayoutHistorySchema.index({ payoutReference: 1 });
PayoutHistorySchema.index({ archivedAt: -1 });

// Virtual for formatted amount
PayoutHistorySchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.amount);
});

// Virtual for formatted final amount
PayoutHistorySchema.virtual('formattedFinalAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.finalAmount);
});

// Virtual for status display
PayoutHistorySchema.virtual('statusDisplay').get(function() {
  switch(this.status) {
    case 'APPROVED': return 'Disetujui';
    case 'REJECTED': return 'Ditolak';
    case 'PROCESSED': return 'Telah Ditransfer';
    default: return this.status;
  }
});

// Virtual for month name
PayoutHistorySchema.virtual('monthName').get(function() {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[this.month - 1];
});

// Pre-save middleware to set temporal fields and calculate metrics
PayoutHistorySchema.pre('save', function(next) {
  if (this.isNew) {
    // Set temporal fields based on processed date
    if (this.originalProcessedAt) {
      const date = new Date(this.originalProcessedAt);
      this.year = date.getFullYear();
      this.month = date.getMonth() + 1;
      this.monthYear = `${this.year}-${this.month.toString().padStart(2, '0')}`;
    }
    
    // Calculate processing times
    if (this.originalRequestedAt && this.originalProcessedAt) {
      const diffMs = this.originalProcessedAt - this.originalRequestedAt;
      this.processingTimeHours = Math.round(diffMs / (1000 * 60 * 60) * 100) / 100;
    }
    
    // Set success status
    this.isSuccessful = this.status !== 'REJECTED';
    
    // Set rejection reason if rejected
    if (this.status === 'REJECTED' && this.adminNote) {
      this.rejectionReason = this.adminNote;
    }
  }
  next();
});

// Static method to archive payout
PayoutHistorySchema.statics.archivePayout = async function(payout, reason = 'AUTO_30D') {
  // Check if already archived
  const existing = await this.findOne({ originalPayoutId: payout._id });
  if (existing) {
    throw new Error('Payout already archived');
  }
  
  // Only archive completed payouts (APPROVED, REJECTED, PROCESSED)
  if (!['APPROVED', 'REJECTED', 'PROCESSED'].includes(payout.status)) {
    throw new Error('Can only archive completed payouts');
  }
  
  // Get admin info for populated processedBy
  const Admin = mongoose.models.Admin;
  let processedByAdmin = null;
  if (payout.processedBy && Admin) {
    processedByAdmin = await Admin.findById(payout.processedBy);
  }
  
  // Create archive record
  const archiveData = {
    // Copy payout fields
    creatorId: payout.creatorId,
    creatorUsername: payout.creatorUsername,
    amount: payout.amount,
    status: payout.status,
    bankInfo: payout.bankInfo,
    processedBy: payout.processedBy,
    adminNote: payout.adminNote,
    platformFee: payout.platformFee,
    finalAmount: payout.finalAmount,
    payoutReference: payout.payoutReference,
    
    // Archive metadata
    originalPayoutId: payout._id,
    archivedReason: reason,
    originalRequestedAt: payout.requestedAt || payout.createdAt,
    originalProcessedAt: payout.processedAt
  };
  
  return await this.create(archiveData);
};

// Static method to get monthly payout stats for creator
PayoutHistorySchema.statics.getMonthlyStats = async function(creatorId, year, month) {
  const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
  
  const stats = await this.aggregate([
    { 
      $match: { 
        creatorId: creatorId, 
        monthYear: monthYear
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFinalAmount: { $sum: '$finalAmount' },
        avgProcessingTime: { $avg: '$processingTimeHours' }
      }
    }
  ]);
  
  // Format results
  const result = {
    totalRequests: 0,
    approvedCount: 0,
    rejectedCount: 0,
    processedCount: 0,
    totalAmountRequested: 0,
    totalAmountApproved: 0,
    totalAmountTransferred: 0,
    avgProcessingTimeHours: 0,
    successRate: 0
  };
  
  stats.forEach(stat => {
    result.totalRequests += stat.count;
    result.totalAmountRequested += stat.totalAmount;
    
    switch(stat._id) {
      case 'APPROVED':
        result.approvedCount = stat.count;
        result.totalAmountApproved += stat.totalFinalAmount;
        break;
      case 'REJECTED':
        result.rejectedCount = stat.count;
        break;
      case 'PROCESSED':
        result.processedCount = stat.count;
        result.totalAmountTransferred += stat.totalFinalAmount;
        break;
    }
    
    if (stat.avgProcessingTime) {
      result.avgProcessingTimeHours = Math.round(stat.avgProcessingTime * 100) / 100;
    }
  });
  
  // Calculate success rate
  if (result.totalRequests > 0) {
    const successfulPayouts = result.approvedCount + result.processedCount;
    result.successRate = Math.round((successfulPayouts / result.totalRequests) * 100);
  }
  
  return result;
};

// Static method to get admin performance stats
PayoutHistorySchema.statics.getAdminStats = async function(adminId, startDate, endDate) {
  const match = {
    processedBy: adminId
  };
  
  if (startDate && endDate) {
    match.originalProcessedAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$finalAmount' },
        avgProcessingTime: { $avg: '$processingTimeHours' }
      }
    }
  ]);
  
  const result = {
    totalProcessed: 0,
    approvedCount: 0,
    rejectedCount: 0,
    processedCount: 0,
    totalAmountProcessed: 0,
    avgProcessingTimeHours: 0,
    approvalRate: 0
  };
  
  stats.forEach(stat => {
    result.totalProcessed += stat.count;
    result.totalAmountProcessed += stat.totalAmount;
    
    switch(stat._id) {
      case 'APPROVED':
        result.approvedCount = stat.count;
        break;
      case 'REJECTED':
        result.rejectedCount = stat.count;
        break;
      case 'PROCESSED':
        result.processedCount = stat.count;
        break;
    }
    
    if (stat.avgProcessingTime) {
      result.avgProcessingTimeHours = Math.round(stat.avgProcessingTime * 100) / 100;
    }
  });
  
  // Calculate approval rate
  if (result.totalProcessed > 0) {
    const approvedPayouts = result.approvedCount + result.processedCount;
    result.approvalRate = Math.round((approvedPayouts / result.totalProcessed) * 100);
  }
  
  return result;
};

// Static method for yearly payout summary
PayoutHistorySchema.statics.getYearlyStats = async function(creatorId, year) {
  return await this.aggregate([
    { 
      $match: { 
        creatorId: creatorId, 
        year: year
      }
    },
    {
      $group: {
        _id: {
          month: '$month',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$finalAmount' }
      }
    },
    {
      $group: {
        _id: '$_id.month',
        statusBreakdown: {
          $push: {
            status: '$_id.status',
            count: '$count',
            amount: '$totalAmount'
          }
        },
        totalRequests: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export default mongoose.models.PayoutHistory || mongoose.model('PayoutHistory', PayoutHistorySchema);