import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  notes: { type: String },
});

export default mongoose.models.Payout || mongoose.model('Payout', payoutSchema);
