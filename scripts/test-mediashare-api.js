const axios = require('axios');

async function testMediaShareAPI() {
  try {
    console.log('🧪 Testing Media Share API...\n');
    
    const username = 'peacemaker';
    const baseUrl = 'http://localhost:3000';
    
    console.log(`📡 Fetching queue for: ${username}`);
    console.log(`URL: ${baseUrl}/api/mediashare/${username}\n`);
    
    const response = await axios.get(`${baseUrl}/api/mediashare/${username}`);
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.length > 0) {
      console.log('\n📹 Media shares in queue:');
      response.data.data.forEach((ms, idx) => {
        console.log(`\n${idx + 1}. ${ms.donorName}`);
        console.log(`   YouTube: ${ms.youtubeUrl}`);
        console.log(`   Video ID: ${ms.videoId}`);
        console.log(`   Duration: ${ms.requestedDuration}s`);
        console.log(`   Status: ${ms.status}`);
        console.log(`   Queue Position: ${ms.queuePosition}`);
      });
    } else {
      console.log('\n⚠️ No media shares in queue');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testMediaShareAPI();
