import mongoose from 'mongoose';

const MediaShareHistorySchema = new mongoose.Schema({
  // Original media share ID
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Donation reference
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationHistory'
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
    required: true,
    trim: true,
    lowercase: true
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
  
  // Duration settings
  requestedDuration: {
    type: Number,
    required: true
  },
  actualDuration: {
    type: Number,
    default: 0
  },
  
  // Final status
  status: {
    type: String,
    enum: ['PENDING', 'PLAYING', 'PLAYED', 'SKIPPED'],
    required: true
  },
  
  // Timestamps
  playedAt: {
    type: Date
  },
  archivedAt: {
    type: Date,
    default: Date.now
  },
  originalCreatedAt: {
    type: Date,
    required: true
  },
  
  // Message from donor
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Moderation info
  isApproved: {
    type: Boolean,
    default: true
  },
  moderationNote: {
    type: String,
    maxlength: 200
  },
  
  // Reference
  merchant_ref: {
    type: String,
    required: true
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for queries
MediaShareHistorySchema.index({ createdBy: 1, archivedAt: -1 });
MediaShareHistorySchema.index({ createdByUsername: 1, archivedAt: -1 });
MediaShareHistorySchema.index({ originalId: 1 });
MediaShareHistorySchema.index({ merchant_ref: 1 });

// Virtual for formatted amount
MediaShareHistorySchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(this.amount);
});

export default mongoose.models.MediaShareHistory || mongoose.model('MediaShareHistory', MediaShareHistorySchema);
