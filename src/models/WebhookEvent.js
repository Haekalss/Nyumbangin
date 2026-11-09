import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema(
  {
    // X-QRISGate-Delivery-Id. Same value for every retry of the same event.
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    event: String,
    transactionId: String,
    externalOrderId: String,
    payload: {
      type: Object,
      default: {},
    },
    processed: {
      type: Boolean,
      default: false,
    },
    processedAt: Date,
    error: String,
  },
  { timestamps: true }
);

WebhookEventSchema.index({ externalOrderId: 1, event: 1 });

export default mongoose.models.WebhookEvent ||
  mongoose.model('WebhookEvent', WebhookEventSchema);
