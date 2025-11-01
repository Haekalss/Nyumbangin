import mongoose from 'mongoose';

const MediaShareSchema = new mongoose.Schema({
  // Donation reference
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  
  // Creator info
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
  
  // Donor info
  donorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  donorEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: 'anonymous@nyumbangin.com'
  },
  
  // Donation amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // YouTube video info
  youtubeUrl: {
    type: String,
    required: true,
    trim: true
  },
  videoId: {
    type: String,
    required: true,
    trim: true
  },
  
  // Duration settings (in seconds)
  requestedDuration: {
    type: Number,
    required: true,
    min: 10,
    max: 300 // Max 5 minutes
  },
  actualDuration: {
    type: Number,
    default: 0
  },
  
  // Playback tracking
  status: {
    type: String,
    enum: ['PENDING', 'PLAYING', 'PLAYED', 'SKIPPED'],
    default: 'PENDING'
  },
  playedAt: {
    type: Date
  },
  
  // Message from donor (optional)
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Moderation
  isApproved: {
    type: Boolean,
    default: true // Auto-approve by default, creator can set to manual review
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator'
  },
  moderationNote: {
    type: String,
    maxlength: 200
  },
  
  // Queue position
  queuePosition: {
    type: Number,
    default: 0
  },
  
  // Archive flag
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Reference for tracking
  merchant_ref: {
    type: String,
    required: true
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
MediaShareSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
MediaShareSchema.index({ createdByUsername: 1, status: 1, queuePosition: 1 });
MediaShareSchema.index({ donationId: 1 });
MediaShareSchema.index({ status: 1, isApproved: 1 });
MediaShareSchema.index({ createdAt: -1 }); // For auto-archive queries

// Virtual for YouTube embed URL
MediaShareSchema.virtual('embedUrl').get(function() {
  return `https://www.youtube.com/embed/${this.videoId}?autoplay=1&start=0&end=${this.requestedDuration}`;
});

// Virtual for formatted amount
MediaShareSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.amount);
});

// Method to extract video ID from YouTube URL
MediaShareSchema.statics.extractVideoId = function(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Method to validate YouTube URL
MediaShareSchema.statics.isValidYoutubeUrl = function(url) {
  return this.extractVideoId(url) !== null;
};

// Method to calculate max duration based on donation amount
MediaShareSchema.statics.calculateMaxDuration = function(amount) {
  // Rp 10.000 = 30 detik
  // Rp 20.000 = 60 detik (1 menit)
  // Rp 50.000 = 120 detik (2 menit)
  // Rp 100.000+ = 300 detik (5 menit)
  
  if (amount >= 100000) return 300; // 5 minutes
  if (amount >= 50000) return 120;  // 2 minutes
  if (amount >= 20000) return 60;   // 1 minute
  if (amount >= 10000) return 30;   // 30 seconds
  return 15; // 15 seconds minimum
};

// Method to mark as played
MediaShareSchema.methods.markAsPlayed = function() {
  this.status = 'PLAYED';
  this.playedAt = new Date();
  return this.save();
};

// Method to mark as skipped
MediaShareSchema.methods.markAsSkipped = function(reason = '') {
  this.status = 'SKIPPED';
  this.playedAt = new Date();
  this.moderationNote = reason;
  return this.save();
};

// Static method to get ready for archive (played/skipped older than 6 hours)
MediaShareSchema.statics.getReadyForArchive = function() {
  const hoursAgo6 = new Date(Date.now() - 6 * 60 * 60 * 1000);
  return this.find({
    playedAt: { $lt: hoursAgo6 },
    status: { $in: ['PLAYED', 'SKIPPED'] },
    isArchived: false
  });
};

export default mongoose.models.MediaShare || mongoose.model('MediaShare', MediaShareSchema);
