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
  
  // Role & permissions
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'], 
    default: 'ADMIN' 
  },
  permissions: [{
    type: String,
    enum: [
      'MANAGE_PAYOUTS',     // Approve/reject payouts
      'MANAGE_CREATORS',    // View/edit creator accounts
      'VIEW_ANALYTICS',     // Access to analytics dashboard
      'MANAGE_SYSTEM',      // System settings
      'DELETE_DONATIONS',   // Delete donation records
      'VIEW_CONTACTS',      // View contact form submissions
      'MANAGE_ADMINS'       // Manage other admin accounts (SUPER_ADMIN only)
    ]
  }],
  
  // Account status
  isActive: { type: Boolean, default: true },
  
  // Login tracking
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  
  // Activity stats
  stats: {
    payoutsProcessed: { type: Number, default: 0 },
    payoutsApproved: { type: Number, default: 0 },
    payoutsRejected: { type: Number, default: 0 },
    totalAmountApproved: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now }
  },
  
  // Security
  twoFactorEnabled: { type: Boolean, default: false },
  lastPasswordChange: { type: Date, default: Date.now }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes are created automatically from field definitions (unique: true)
// username and email already have unique: true, so no need to add manual index
// Only add compound or non-unique indexes here
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });

// Virtual for role display
AdminSchema.virtual('roleDisplay').get(function() {
  switch(this.role) {
    case 'SUPER_ADMIN': return 'Super Admin';
    case 'ADMIN': return 'Administrator';
    case 'MODERATOR': return 'Moderator';
    default: return this.role;
  }
});

// Method to check if admin has specific permission
AdminSchema.methods.hasPermission = function(permission) {
  // Super admin has all permissions
  if (this.role === 'SUPER_ADMIN') return true;
  
  return this.permissions.includes(permission);
};

// Method to check if admin can manage payouts
AdminSchema.methods.canManagePayouts = function() {
  return this.hasPermission('MANAGE_PAYOUTS');
};

// Method to check if admin can manage creators
AdminSchema.methods.canManageCreators = function() {
  return this.hasPermission('MANAGE_CREATORS');
};

// Method to update payout stats
AdminSchema.methods.updatePayoutStats = async function() {
  const Payout = mongoose.models.Payout;
  
  if (Payout) {
    const stats = await Payout.aggregate([
      { $match: { processedBy: this._id } },
      { 
        $group: { 
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    let approved = 0, rejected = 0, totalAmount = 0;
    
    stats.forEach(stat => {
      if (stat._id === 'APPROVED' || stat._id === 'PROCESSED') {
        approved += stat.count;
        totalAmount += stat.totalAmount;
      } else if (stat._id === 'REJECTED') {
        rejected = stat.count;
      }
    });
    
    this.stats.payoutsApproved = approved;
    this.stats.payoutsRejected = rejected;
    this.stats.payoutsProcessed = approved + rejected;
    this.stats.totalAmountApproved = totalAmount;
    
    return this.save();
  }
};

// Static method to get default permissions for role
AdminSchema.statics.getDefaultPermissions = function(role) {
  switch(role) {
    case 'SUPER_ADMIN':
      return [
        'MANAGE_PAYOUTS', 'MANAGE_CREATORS', 'VIEW_ANALYTICS', 
        'MANAGE_SYSTEM', 'DELETE_DONATIONS', 'VIEW_CONTACTS', 'MANAGE_ADMINS'
      ];
    case 'ADMIN':
      return [
        'MANAGE_PAYOUTS', 'MANAGE_CREATORS', 'VIEW_ANALYTICS', 
        'DELETE_DONATIONS', 'VIEW_CONTACTS'
      ];
    case 'MODERATOR':
      return ['VIEW_ANALYTICS', 'VIEW_CONTACTS'];
    default:
      return [];
  }
};

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);