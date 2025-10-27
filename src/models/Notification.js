import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  // Target creator
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Creator', 
    required: true 
  },
  
  // Related objects (optional, depends on notification type)
  donationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Donation' 
  },
  payoutId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payout' 
  },
  
  // Notification content
  type: { 
    type: String, 
    enum: [
      'DONATION',           // New donation received
      'DONATION_LARGE',     // Large donation (> certain amount)
      'PAYOUT_APPROVED',    // Payout request approved
      'PAYOUT_REJECTED',    // Payout request rejected
      'PAYOUT_PROCESSED',   // Payout has been transferred
      'SYSTEM',             // System announcements
      'WARNING',            // Account warnings
      'ACHIEVEMENT',        // Milestones reached
      'MONTHLY_SUMMARY'     // Monthly stats summary
    ], 
    required: true 
  },
  
  title: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  
  // Display settings for overlay
  overlayData: {
    donorName: String,
    amount: Number,
    message: String,
    duration: { type: Number, default: 5000 }, // ms
    soundEnabled: { type: Boolean, default: true },
    animationType: { type: String, default: 'slide' }
  },
  
  // Status tracking
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  
  // Overlay display tracking
  isDisplayedInOverlay: { type: Boolean, default: false },
  displayedAt: { type: Date },
  
  // Priority for sorting/filtering
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 
    default: 'MEDIUM' 
  },
  
  // Additional metadata
  metadata: {
    type: Object,
    default: {}
  },
  
  // Auto-expire notifications after certain time
  expiresAt: { 
    type: Date,
    default: function() {
      // Expire after 7 days for most notifications
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
NotificationSchema.index({ creatorId: 1, createdAt: -1 });
NotificationSchema.index({ creatorId: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ priority: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

// Virtual for time ago
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 1) {
    return `${diffDays} hari yang lalu`;
  } else if (diffHours >= 1) {
    return `${diffHours} jam yang lalu`;
  } else if (diffMins >= 1) {
    return `${diffMins} menit yang lalu`;
  } else {
    return 'Baru saja';
  }
});

// Virtual for icon based on type
NotificationSchema.virtual('icon').get(function() {
  switch(this.type) {
    case 'DONATION':
    case 'DONATION_LARGE':
      return '💰';
    case 'PAYOUT_APPROVED':
      return '✅';
    case 'PAYOUT_REJECTED':
      return '❌';
    case 'PAYOUT_PROCESSED':
      return '🏦';
    case 'SYSTEM':
      return '🔧';
    case 'WARNING':
      return '⚠️';
    case 'ACHIEVEMENT':
      return '🏆';
    case 'MONTHLY_SUMMARY':
      return '📊';
    default:
      return '📢';
  }
});

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as displayed in overlay
NotificationSchema.methods.markAsDisplayed = function() {
  this.isDisplayedInOverlay = true;
  this.displayedAt = new Date();
  return this.save();
};

// Static method to create donation notification
NotificationSchema.statics.createDonationNotification = async function(donation) {
  const isLargeDonation = donation.amount >= 100000; // Rp 100k+
  
  return await this.create({
    creatorId: donation.createdBy,
    donationId: donation._id,
    type: isLargeDonation ? 'DONATION_LARGE' : 'DONATION',
    title: isLargeDonation ? 'Donasi Besar!' : 'Donasi Baru!',
    message: `${donation.name} memberikan ${donation.formattedAmount}${donation.message ? ': ' + donation.message : ''}`,
    priority: isLargeDonation ? 'HIGH' : 'MEDIUM',
    overlayData: {
      donorName: donation.name,
      amount: donation.amount,
      message: donation.message,
      duration: isLargeDonation ? 8000 : 5000,
      soundEnabled: true,
      animationType: isLargeDonation ? 'bounce' : 'slide'
    }
  });
};

// Static method to create payout notification
NotificationSchema.statics.createPayoutNotification = async function(payout, type) {
  const titles = {
    'PAYOUT_APPROVED': 'Pencairan Disetujui!',
    'PAYOUT_REJECTED': 'Pencairan Ditolak',
    'PAYOUT_PROCESSED': 'Pencairan Berhasil!'
  };
  
  const messages = {
    'PAYOUT_APPROVED': `Permintaan pencairan ${payout.formattedAmount} telah disetujui.`,
    'PAYOUT_REJECTED': `Permintaan pencairan ${payout.formattedAmount} ditolak. ${payout.adminNote || ''}`,
    'PAYOUT_PROCESSED': `Pencairan ${payout.formattedAmount} telah ditransfer ke rekening Anda.`
  };
  
  return await this.create({
    creatorId: payout.creatorId,
    payoutId: payout._id,
    type: type,
    title: titles[type],
    message: messages[type],
    priority: type === 'PAYOUT_REJECTED' ? 'HIGH' : 'MEDIUM'
  });
};

// Static method to get unread count for creator
NotificationSchema.statics.getUnreadCount = async function(creatorId) {
  return await this.countDocuments({
    creatorId: creatorId,
    isRead: false
  });
};

// Static method to get recent notifications for overlay
NotificationSchema.statics.getForOverlay = async function(creatorId, limit = 10) {
  return await this.find({
    creatorId: creatorId,
    type: { $in: ['DONATION', 'DONATION_LARGE'] },
    isDisplayedInOverlay: false
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);