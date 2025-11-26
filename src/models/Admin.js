import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30
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
  fullName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Role (simplified - only ADMIN role used)
  role: { 
    type: String, 
    enum: ['ADMIN'], 
    default: 'ADMIN' 
  },
  permissions: [{
    type: String,
    enum: [
      'MANAGE_PAYOUTS',     // Approve/reject payouts
      'MANAGE_CREATORS',    // View/edit creator accounts
      'VIEW_ANALYTICS',     // Access to analytics dashboard
      'DELETE_DONATIONS',   // Delete donation records
      'VIEW_CONTACTS'       // View contact form submissions
    ]
  }],
  
  // Account status
  isActive: { type: Boolean, default: true },
  
  // Login tracking
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  
  // Activity stats
  stats: {
    joinedAt: { type: Date, default: Date.now }
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes are created automatically from field definitions (unique: true)
// username and email already have unique: true, so no need to add manual index
AdminSchema.index({ isActive: 1 });

// Virtual for role display
AdminSchema.virtual('roleDisplay').get(function() {
  return 'Administrator';
});

// Method to check if admin has specific permission
AdminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Static method to get default permissions
AdminSchema.statics.getDefaultPermissions = function() {
  // All admins have same permissions
  return [
    'MANAGE_PAYOUTS', 
    'MANAGE_CREATORS', 
    'VIEW_ANALYTICS', 
    'DELETE_DONATIONS', 
    'VIEW_CONTACTS'
  ];
};

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);