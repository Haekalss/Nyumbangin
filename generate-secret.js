// Generate NEXTAUTH_SECRET untuk production
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');
console.log('\n🔑 NEXTAUTH_SECRET untuk production:');
console.log(secret);
console.log('\nCopy secret di atas dan paste ke environment variables production Anda');
console.log('Minimal 32 karakter required!\n');
