// Script untuk fix admin permissions di database
// Jalankan sekali untuk update semua admin dengan permission yang benar

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  console.log('💡 Make sure .env file exists with MONGO_URI');
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  fullName: String,
  role: String,
  permissions: [String],
  isActive: Boolean,
  stats: Object
}, { 
  timestamps: true,
  strict: false
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function fixAdminPermissions() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all admins
    const admins = await Admin.find({});
    console.log(`📋 Found ${admins.length} admin(s)\n`);

    for (const admin of admins) {
      console.log(`👤 Processing: ${admin.username} (${admin.email})`);
      console.log(`   Current role: ${admin.role}`);
      console.log(`   Current permissions:`, admin.permissions);
      
      // Fix role if lowercase or invalid
      let newRole = admin.role;
      if (admin.role === 'super_admin' || admin.role === 'SUPER_ADMIN') {
        newRole = 'SUPER_ADMIN';
      } else if (admin.role === 'admin' || admin.role === 'ADMIN') {
        newRole = 'ADMIN';
      } else if (admin.role === 'moderator' || admin.role === 'MODERATOR') {
        newRole = 'MODERATOR';
      } else {
        console.log(`   ⚠️  Invalid role "${admin.role}", defaulting to ADMIN`);
        newRole = 'ADMIN';
      }
      
      // Get correct permissions for role
      let correctPermissions = [];
      
      switch(newRole) {
        case 'SUPER_ADMIN':
          correctPermissions = [
            'MANAGE_PAYOUTS', 'MANAGE_CREATORS', 'VIEW_ANALYTICS', 
            'MANAGE_SYSTEM', 'DELETE_DONATIONS', 'VIEW_CONTACTS', 'MANAGE_ADMINS'
          ];
          break;
        case 'ADMIN':
          correctPermissions = [
            'MANAGE_PAYOUTS', 'MANAGE_CREATORS', 'VIEW_ANALYTICS', 
            'DELETE_DONATIONS', 'VIEW_CONTACTS'
          ];
          break;
        case 'MODERATOR':
          correctPermissions = ['VIEW_ANALYTICS', 'VIEW_CONTACTS'];
          break;
        default:
          correctPermissions = [];
      }

      // Update role and permissions
      admin.role = newRole;
      admin.permissions = correctPermissions;
      
      // Ensure fullName exists (required field)
      if (!admin.fullName) {
        admin.fullName = admin.username || 'Admin User';
      }
      
      await admin.save();
      
      console.log(`   ✅ Updated to:`);
      console.log(`      Role: ${newRole}`);
      console.log(`      Permissions:`, correctPermissions);
      console.log('');
    }

    console.log('🎉 All admin permissions updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixAdminPermissions();
