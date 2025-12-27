import mongoose from 'mongoose';

const DonationShareSchema = new mongoose.Schema({
  // Creator information
  creatorUsername: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // Platform where shared
  platform: {
    type: String,
    enum: ['whatsapp', 'twitter', 'facebook', 'telegram', 'copy', 'other'],
    required: true
  },
  
  // Donation reference (optional, for tracking which donation triggered the share)
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  
  // Date tracking (for daily reset)
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Auto-delete after 30 days
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
DonationShareSchema.index({ creatorUsername: 1, date: 1 });
DonationShareSchema.index({ creatorUsername: 1, createdAt: -1 });

export default mongoose.models.DonationShare || mongoose.model('DonationShare', DonationShareSchema);
