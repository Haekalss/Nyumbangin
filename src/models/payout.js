import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema({
  // Creator relation (changed from creator to creatorId)
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Creator', // Changed from 'User' to 'Creator'
    required: true 
  },
  creatorUsername: { 
    type: String, 
    required: true,
    lowercase: true
  },
  
  // Payout details
  amount: { 
    type: Number, 
    required: true,
    min: 50000 // Min payout Rp 50k
  },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'], 
    default: 'PENDING' 
  },
  
  // Bank information at time of request
  bankInfo: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true }
  },
  
  // Admin processing
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  adminNote: { 
    type: String,
    maxlength: 500 
  },
  
  // Timestamps
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  
  // Fee calculation (if applicable)
  platformFee: { type: Number, default: 0 },
  finalAmount: { type: Number }, // Amount after fee deduction
  
  // Reference for tracking
  payoutReference: { type: String, unique: true },
  
  // Archive flag
  isArchived: { type: Boolean, default: false }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries (payoutReference already has unique: true)
PayoutSchema.index({ creatorId: 1, status: 1 });
PayoutSchema.index({ creatorUsername: 1, requestedAt: -1 });
PayoutSchema.index({ status: 1, requestedAt: -1 });
PayoutSchema.index({ processedBy: 1, processedAt: -1 });

// Virtual for formatted amount
PayoutSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.amount);
});

// Virtual for formatted final amount
PayoutSchema.virtual('formattedFinalAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR', 
    minimumFractionDigits: 0
  }).format(this.finalAmount || this.amount);
});

// Virtual for status display
PayoutSchema.virtual('statusDisplay').get(function() {
  switch(this.status) {
    case 'PENDING': return 'Menunggu Persetujuan';
    case 'APPROVED': return 'Disetujui';
    case 'REJECTED': return 'Ditolak';
    case 'PROCESSED': return 'Telah Diproses';
    default: return this.status;
  }
});

// Pre-save middleware to generate reference and calculate final amount
PayoutSchema.pre('save', function(next) {
  // Generate unique reference if not exists
  if (!this.payoutReference && this.isNew) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.payoutReference = `PO-${timestamp}-${random}`.toUpperCase();
  }
  
  // Calculate final amount (deduct platform fee if applicable)
  if (!this.finalAmount) {
    this.finalAmount = this.amount - this.platformFee;
  }
  
  next();
});

// Method to approve payout
PayoutSchema.methods.approve = function(adminId, note = '') {
  this.status = 'APPROVED';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.adminNote = note;
  return this.save();
};

// Method to reject payout
PayoutSchema.methods.reject = function(adminId, note = '') {
  this.status = 'REJECTED';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.adminNote = note;
  return this.save();
};

// Method to mark as processed (after bank transfer)
PayoutSchema.methods.markAsProcessed = function(adminId, note = '') {
  this.status = 'PROCESSED';
  this.processedBy = adminId;
  this.processedAt = new Date();
  this.adminNote = note;
  return this.save();
};

// Static method to get payouts ready for archive (processed/rejected older than 30 days)
PayoutSchema.statics.getReadyForArchive = function() {
  const daysAgo30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.find({
    processedAt: { $lt: daysAgo30 },
    status: { $in: ['PROCESSED', 'REJECTED'] },
    isArchived: false
  });
};

// Method to check if should be archived
PayoutSchema.methods.shouldBeArchived = function() {
  if (!this.processedAt) return false;
  const daysAgo30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.processedAt < daysAgo30 && ['PROCESSED', 'REJECTED'].includes(this.status);
};

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema);
