const axios = require('axios');
const crypto = require('crypto');

async function triggerWebhookManually() {
  try {
    console.log('🧪 Testing QRISGate webhook manually...\n');

    const mongoose = require('mongoose');
    require('dotenv').config();

    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const donation = await db.collection('donations').findOne(
      { status: 'PENDING' },
      { sort: { createdAt: -1 } }
    );

    if (!donation) {
      console.log('❌ No PENDING donation found');
      process.exit(1);
    }

    console.log('📋 Found donation:', donation.merchant_ref);
    console.log('Name:', donation.name);
    console.log('Amount:', donation.amount);
    console.log('Total Amount:', donation.totalAmount || donation.amount);
    console.log('Status:', donation.status);
    console.log('');

    const timestamp = Math.floor(Date.now() / 1000);
    const deliveryId = `evt_manual_${timestamp}`;
    const webhookPayload = {
      event_id: deliveryId,
      event: 'payment.paid',
      transaction_id: donation.transactionId || `trx_${timestamp}`,
      external_order_id: donation.merchant_ref,
      base_amount: donation.amount,
      unique_code: donation.uniqueCode || 0,
      total_amount: donation.totalAmount || donation.amount,
      paid_at: new Date().toISOString(),
    };

    const rawBody = JSON.stringify(webhookPayload);
    const secret = process.env.QRISGATE_WEBHOOK_SECRET || '';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    console.log('📡 Sending webhook to: http://localhost:3000/api/webhooks/qrisgate');
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));
    console.log('');

    const response = await axios.post('http://localhost:3000/api/webhooks/qrisgate', rawBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-qrisgate-timestamp': String(timestamp),
        'x-qrisgate-signature': signature,
        'x-qrisgate-delivery-id': deliveryId,
      },
    });

    console.log('✅ Webhook response:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

triggerWebhookManually();
