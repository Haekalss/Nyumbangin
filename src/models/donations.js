// models/Donation.js
import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  message: String,
  status: {
    type: String,
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID', // Akan diubah menjadi PAID via webhook Midtrans setelah settlement
  },
  merchant_ref: {
    type: String,
    unique: true,
    required: true
  },
  owner: { // Admin yang menerima donasi
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerUsername: { // Username admin untuk query lebih cepat
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
