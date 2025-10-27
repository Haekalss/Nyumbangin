import mongoose from 'mongoose';

const DonationHistorySchema = new mongoose.Schema({
  // Original donation data (copied from donations collection)
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  amount: { 
    type: Number, 
    required: true
  },
  message: { 
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  
  // Creator relation (preserved from original)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true
  },
  createdByUsername: { 
    type: String,
    required: true,
    lowercase: true
  },
  
  // Payment data (preserved from original)
  status: {
    type: String,
    enum: ['PAID', 'FAILED'], // Only successful or failed donations are archived
    required: true
  },
  merchant_ref: {
    type: String,
    required: true
  },
  transactionId: String,
  paymentMethod: String,
  midtransData: Object,
  
  // Archive metadata
  originalDonationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    unique: true // Each donation can only be archived once
  },
  archivedAt: { type: Date, default: Date.now },
  archivedReason: { 
    type: String, 
    enum: ['AUTO_24H', 'MANUAL_ADMIN', 'MONTHLY_CLEANUP'],
    default: 'AUTO_24H' 
  },
  
  // Temporal indexing for efficient queries
  monthYear: { 
    type: String, 
    required: true 
  }, // Format: "2025-01"
  year: { 
    type: Number, 
    required: true 
  },
  month: { 
    type: Number, 
    required: true 
  },
  
  // Original timestamps (preserved from original donation)
  originalCreatedAt: { type: Date, required: true },
  originalUpdatedAt: { type: Date, required: true },
  
  // Overlay display data (if was displayed)
  wasDisplayedInOverlay: { type: Boolean, default: false },
  displayedAt: Date,
  
  // Metadata
  ipAddress: String,
  userAgent: String
  
}, { 
  timestamps: true, // This tracks when it was archived
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient historical queries
DonationHistorySchema.index({ createdBy: 1, monthYear: 1 });
DonationHistorySchema.index({ createdBy: 1, originalCreatedAt: -1 });
DonationHistorySchema.index({ monthYear: 1, status: 1 });
DonationHistorySchema.index({ year: 1, month: 1 });
DonationHistorySchema.index({ originalDonationId: 1 }, { unique: true });
DonationHistorySchema.index({ archivedAt: -1 });

// Virtual for formatted amount
DonationHistorySchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.amount);
});

// Virtual for month name
DonationHistorySchema.virtual('monthName').get(function() {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[this.month - 1];
});

// Pre-save middleware to set temporal fields
DonationHistorySchema.pre('save', function(next) {
  if (this.isNew && this.originalCreatedAt) {
    const date = new Date(this.originalCreatedAt);
    this.year = date.getFullYear();
    this.month = date.getMonth() + 1;
    this.monthYear = `${this.year}-${this.month.toString().padStart(2, '0')}`;
  }
  next();
});

// Static method to archive donation
DonationHistorySchema.statics.archiveDonation = async function(donation, reason = 'AUTO_24H') {
  // Check if already archived
  const existing = await this.findOne({ originalDonationId: donation._id });
  if (existing) {
    throw new Error('Donation already archived');
  }
  
  // Create archive record
  const archiveData = {
    // Copy all donation fields
    name: donation.name,
    email: donation.email,
    amount: donation.amount,
    message: donation.message,
    createdBy: donation.createdBy,
    createdByUsername: donation.createdByUsername,
    status: donation.status,
    merchant_ref: donation.merchant_ref,
    transactionId: donation.transactionId,
    paymentMethod: donation.paymentMethod,
    midtransData: donation.midtransData,
    ipAddress: donation.ipAddress,
    userAgent: donation.userAgent,
    
    // Archive metadata
    originalDonationId: donation._id,
    archivedReason: reason,
    originalCreatedAt: donation.createdAt,
    originalUpdatedAt: donation.updatedAt,
    wasDisplayedInOverlay: donation.isDisplayedInOverlay,
    displayedAt: donation.displayedAt
  };
  
  return await this.create(archiveData);
};

// Static method to get monthly stats for creator
DonationHistorySchema.statics.getMonthlyStats = async function(creatorId, year, month) {
  const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
  
  const stats = await this.aggregate([
    { 
      $match: { 
        createdBy: creatorId, 
        monthYear: monthYear,
        status: 'PAID'
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        maxAmount: { $max: '$amount' },
        minAmount: { $min: '$amount' },
        uniqueDonors: { $addToSet: '$name' }
      }
    },
    {
      $project: {
        totalAmount: 1,
        totalDonations: 1,
        avgAmount: { $round: ['$avgAmount', 0] },
        maxAmount: 1,
        minAmount: 1,
        uniqueDonorCount: { $size: '$uniqueDonors' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    totalAmount: 0,
    totalDonations: 0,
    avgAmount: 0,
    maxAmount: 0,
    minAmount: 0,
    uniqueDonorCount: 0
  };
};

// Static method to get top donors for a month
DonationHistorySchema.statics.getTopDonors = async function(creatorId, year, month, limit = 10) {
  const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
  
  return await this.aggregate([
    { 
      $match: { 
        createdBy: creatorId, 
        monthYear: monthYear,
        status: 'PAID'
      }
    },
    {
      $group: {
        _id: '$name',
        totalAmount: { $sum: '$amount' },
        donationCount: { $sum: 1 },
        lastDonation: { $max: '$originalCreatedAt' },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        name: '$_id',
        totalAmount: 1,
        donationCount: 1,
        lastDonation: 1,
        avgAmount: { $round: ['$avgAmount', 0] },
        _id: 0
      }
    }
  ]);
};

// Static method for yearly summary
DonationHistorySchema.statics.getYearlyStats = async function(creatorId, year) {
  return await this.aggregate([
    { 
      $match: { 
        createdBy: creatorId, 
        year: year,
        status: 'PAID'
      }
    },
    {
      $group: {
        _id: '$month',
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        uniqueDonors: { $addToSet: '$name' }
      }
    },
    {
      $project: {
        month: '$_id',
        totalAmount: 1,
        totalDonations: 1,
        uniqueDonorCount: { $size: '$uniqueDonors' }
      }
    },
    {
      $sort: { month: 1 }
    }
  ]);
};

export default mongoose.models.DonationHistory || mongoose.model('DonationHistory', DonationHistorySchema);