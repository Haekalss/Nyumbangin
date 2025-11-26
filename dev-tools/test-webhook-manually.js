const axios = require('axios');

async function triggerWebhookManually() {
  try {
    console.log('🧪 Testing webhook manually...\n');
    
    // Get the latest donation with media share request
    const mongoose = require('mongoose');
    require('dotenv').config();
    
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const donation = await db.collection('donations').findOne({
      'mediaShareRequest.enabled': true,
      'mediaShareRequest.processed': false,
      status: 'PAID'
    });
    
    if (!donation) {
      console.log('❌ No unprocessed media share donation found');
      process.exit(1);
    }
    
    console.log('📋 Found donation:', donation.merchant_ref);
    console.log('Name:', donation.name);
    console.log('Amount:', donation.amount);
    console.log('YouTube URL:', donation.mediaShareRequest.youtubeUrl);
    console.log('Status:', donation.status);
    console.log('');
    
    // Simulate Midtrans webhook payload
    const webhookPayload = {
      order_id: donation.merchant_ref,
      transaction_status: 'settlement',
      status_code: '200',
      gross_amount: donation.amount.toString(),
      transaction_id: 'TEST_' + Date.now(),
      payment_type: 'bank_transfer'
    };
    
    console.log('📡 Sending webhook to: http://localhost:3000/api/webhook/midtrans');
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));
    console.log('');
    
    const response = await axios.post('http://localhost:3000/api/webhook/midtrans', webhookPayload);
    
    console.log('✅ Webhook response:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if media share was created
    console.log('\n📹 Checking media shares...');
    const mediaShare = await db.collection('mediashares').findOne({
      donationId: donation._id
    });
    
    if (mediaShare) {
      console.log('✅ Media share created!');
      console.log('Video ID:', mediaShare.videoId);
      console.log('Status:', mediaShare.status);
      console.log('Queue Position:', mediaShare.queuePosition);
    } else {
      console.log('❌ Media share NOT created');
    }
    
    // Check if notification was created
    console.log('\n📢 Checking notifications...');
    const notification = await db.collection('notifications').findOne({
      donationId: donation._id
    });
    
    if (notification) {
      console.log('⚠️ Notification was created (should NOT happen for media share)');
      console.log('Type:', notification.type);
      console.log('Message:', notification.message);
    } else {
      console.log('✅ No notification created (correct for media share)');
    }
    
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
