// models/Donation.js
import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  // Donor information
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
    required: true,
    min: 1000, // Min Rp 1k
    max: 10000000 // Max Rp 10jt
  },
  message: { 
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Creator relation (changed from owner to createdBy)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator', // Changed from 'User' to 'Creator'
    required: true
  },
  createdByUsername: { 
    type: String,
    required: true,
    lowercase: true
  },
  
  // Payment gateway data
  merchant_ref: {
    type: String,
    unique: true,
    required: true
  },
  transactionId: String,
  paymentMethod: String,
  midtransData: {
    type: Object,
    default: {}
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  // Auto-archive flag (donations older than 24h will be moved to DonationHistory)
  isArchived: { type: Boolean, default: false },
  
  // Display settings for overlay
  isDisplayedInOverlay: { type: Boolean, default: false },
  displayedAt: Date
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
DonationSchema.index({ createdBy: 1, createdAt: -1 });
DonationSchema.index({ createdByUsername: 1, status: 1 });
DonationSchema.index({ status: 1, createdAt: -1 });
DonationSchema.index({ merchant_ref: 1 });
DonationSchema.index({ createdAt: -1 }); // For auto-archive queries

// Virtual for formatted amount
DonationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.amount);
});

// Virtual for time since donation
DonationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffHours >= 24) {
    return `${Math.floor(diffHours / 24)} hari yang lalu`;
  } else if (diffHours >= 1) {
    return `${diffHours} jam yang lalu`;
  } else {
    return `${diffMins} menit yang lalu`;
  }
});

// Method to check if donation should be archived (older than 24 hours)
DonationSchema.methods.shouldBeArchived = function() {
  const hoursAgo24 = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt < hoursAgo24 && this.status === 'PAID';
};

// Static method to get donations ready for archive
DonationSchema.statics.getReadyForArchive = function() {
  const hoursAgo24 = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.find({
    createdAt: { $lt: hoursAgo24 },
    status: 'PAID',
    isArchived: false
  });
};

// Method to mark as displayed in overlay
DonationSchema.methods.markAsDisplayed = function() {
  this.isDisplayedInOverlay = true;
  this.displayedAt = new Date();
  return this.save();
};

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
