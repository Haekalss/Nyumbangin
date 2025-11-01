import mongoose from 'mongoose';

const CreatorSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  displayName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  bio: { 
    type: String, 
    maxlength: 500,
    default: ''
  },
  
  // Profile image (reference to ProfileImage collection)
  profileImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfileImage',
    default: null
  },
  
  // Social media links
  socialLinks: {
    twitch: { type: String, default: '', trim: true },
    youtube: { type: String, default: '', trim: true },
    instagram: { type: String, default: '', trim: true },
    tiktok: { type: String, default: '', trim: true },
    twitter: { type: String, default: '', trim: true }
  },
  
  // Payout/bank settings
  payoutSettings: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountName: { type: String, default: '' },
    minPayoutAmount: { type: Number, default: 100000 } // Rp 100k
  },
  
  // Donation settings
  donationSettings: {
    minAmount: { type: Number, default: 5000 }, // Rp 5k
    maxAmount: { type: Number, default: 10000000 }, // Rp 10jt
    isEnabled: { type: Boolean, default: true },
    customMessage: { type: String, default: 'Terima kasih atas dukungannya!' }
  },
  
  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  
  // Stats (akan dihitung dari collections lain)
  stats: {
    totalDonations: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now }
  },
  
  // Login tracking
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries (username and email already have unique: true)
CreatorSchema.index({ isActive: 1 });

// Virtual for donation URL
CreatorSchema.virtual('donationUrl').get(function() {
  return `/donate/${this.username}`;
});

// Virtual for overlay URL
CreatorSchema.virtual('overlayUrl').get(function() {
  return `/overlay/${this.username}`;
});

// Virtual fields for backward compatibility (flat fields → nested payoutSettings)
CreatorSchema.virtual('payoutBankName').get(function() {
  return this.payoutSettings?.bankName || '';
});

CreatorSchema.virtual('payoutAccountNumber').get(function() {
  return this.payoutSettings?.accountNumber || '';
});

CreatorSchema.virtual('payoutAccountHolder').get(function() {
  return this.payoutSettings?.accountName || '';
});

// Method to check if payout settings are complete
CreatorSchema.methods.hasCompletePayoutSettings = function() {
  // AUTO-MIGRATE: If old fields exist but new fields empty, auto-migrate data
  if (this.payoutBankName && this.payoutAccountNumber && this.payoutAccountHolder) {
    // Check if new structure is empty
    if (!this.payoutSettings?.bankName) {
      // Auto-migrate on-the-fly
      if (!this.payoutSettings) {
        this.payoutSettings = {};
      }
      this.payoutSettings.bankName = this.payoutBankName;
      this.payoutSettings.accountNumber = this.payoutAccountNumber;
      this.payoutSettings.accountName = this.payoutAccountHolder;
      
      // Save async in background (don't wait)
      this.save().catch(err => console.error('Auto-migration error:', err));
      
      return true;
    }
  }
  
  // Check new structure first (payoutSettings object)
  if (this.payoutSettings) {
    const accountName = this.payoutSettings.accountName || this.payoutSettings.accountHolder;
    const hasNewSettings = this.payoutSettings.bankName && 
                          this.payoutSettings.accountNumber && 
                          accountName;
    if (hasNewSettings) return true;
  }
  
  // Fallback to old structure (flat fields) - still check for safety
  const hasOldSettings = this.payoutBankName && 
                        this.payoutAccountNumber && 
                        this.payoutAccountHolder;
  
  return hasOldSettings;
};

// Method to update stats (will be called from other operations)
CreatorSchema.methods.updateStats = async function() {
  const Donation = mongoose.models.Donation;
  const Payout = mongoose.models.Payout;
  
  if (Donation) {
    const donationStats = await Donation.aggregate([
      { $match: { createdBy: this._id, status: 'PAID' } },
      { 
        $group: { 
          _id: null, 
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);
    
    if (donationStats.length > 0) {
      this.stats.totalDonations = donationStats[0].totalCount;
      this.stats.totalAmount = donationStats[0].totalAmount;
    }
  }
  
  if (Payout) {
    const payoutStats = await Payout.aggregate([
      { $match: { creatorId: this._id, status: 'APPROVED' } },
      { 
        $group: { 
          _id: null, 
          totalPayouts: { $sum: '$amount' }
        }
      }
    ]);
    
    if (payoutStats.length > 0) {
      this.stats.totalPayouts = payoutStats[0].totalPayouts;
    }
  }
  
  return this.save();
};

export default mongoose.models.Creator || mongoose.model('Creator', CreatorSchema);