// Test the archive endpoint locally
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-here';

async function testHealth() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testArchive() {
  console.log('\n🔍 Testing archive endpoint...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/cron/archive-donations`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': CRON_SECRET
        }
      }
    );
    console.log('✅ Archive response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Archive failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    return false;
  }
}

async function main() {
  console.log('=== TESTING ARCHIVE ENDPOINTS ===');
  console.log('Base URL:', BASE_URL);
  console.log('Secret:', CRON_SECRET ? '[SET]' : '[MISSING]');
  console.log('');

  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ Health check failed - server might not be running');
    process.exit(1);
  }

  const archiveOk = await testArchive();
  if (!archiveOk) {
    console.log('\n❌ Archive test failed');
    process.exit(1);
  }

  console.log('\n✅ All tests passed!');
}

main();
