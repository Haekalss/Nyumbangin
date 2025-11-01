import mongoose from 'mongoose';

const ProfileImageSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true,
    unique: true // Satu creator hanya punya satu profile image
  },
  imageData: {
    type: String, // Base64 encoded image data
    default: ''
  },
  mimeType: {
    type: String,
    default: 'image/png'
  },
  imageUrl: {
    type: String,
    trim: true,
    default: '' // Optional: external URL
  },
  imageType: {
    type: String,
    enum: ['url', 'upload', 'default'],
    default: 'upload'
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index untuk efficient query
ProfileImageSchema.index({ creatorId: 1 });
ProfileImageSchema.index({ isActive: 1 });

// Static method untuk get atau create default
ProfileImageSchema.statics.getOrCreateDefault = async function(creatorId) {
  let profileImage = await this.findOne({ creatorId });
  
  if (!profileImage) {
    // Create default profile image
    profileImage = await this.create({
      creatorId,
      imageUrl: '/default-avatar.png', // Default avatar
      imageType: 'default'
    });
  }
  
  return profileImage;
};

// Static method untuk update image
ProfileImageSchema.statics.updateImage = async function(creatorId, imageUrl, imageType = 'url', metadata = {}) {
  const profileImage = await this.findOneAndUpdate(
    { creatorId },
    {
      imageUrl,
      imageType,
      fileName: metadata.fileName || '',
      fileSize: metadata.fileSize || 0,
      uploadedAt: new Date(),
      isActive: true
    },
    { upsert: true, new: true }
  );
  
  return profileImage;
};

export default mongoose.models.ProfileImage || mongoose.model('ProfileImage', ProfileImageSchema);
