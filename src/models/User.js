import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // Link unik seperti /donate/username
  displayName: { type: String, required: true }, // Nama untuk ditampilkan
  description: { type: String, default: '' }, // Deskripsi creator
  role: { type: String, enum: ['admin', 'user'], default: 'admin' } // Default admin karena semua user adalah creator
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
