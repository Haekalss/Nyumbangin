# LAMPIRAN C: TROUBLESHOOTING GUIDE

<div align="center">

**🔧 Common Issues & Solutions**

*Panduan mengatasi masalah yang sering terjadi*

</div>

---

## 📋 Table of Contents

1. [Database Issues](#database-issues)
2. [Authentication Problems](#authentication-problems)
3. [Payment Gateway Issues](#payment-gateway-issues)
4. [Email Sending Failures](#email-sending-failures)
5. [Deployment Errors](#deployment-errors)
6. [Performance Issues](#performance-issues)
7. [Frontend Issues](#frontend-issues)
8. [API Route Errors](#api-route-errors)

---

# DATABASE ISSUES

## ❌ Error: "MongooseServerSelectionError: connection timed out"

**Symptoms**: App cannot connect to MongoDB

**Possible Causes & Solutions**:

### 1. IP Not Whitelisted (MongoDB Atlas)

**Check**:
```
MongoDB Atlas → Network Access → IP Access List
```

**Fix**:
- Development: Add your current IP or `0.0.0.0/0` (all IPs)
- Production: Add Vercel IPs or use connection string filtering

**Get your IP**:
```bash
curl ifconfig.me
```

---

### 2. Wrong Connection String

**Check** [`.env.local`](.env.local):
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true
```

**Common mistakes**:
- ❌ `<username>` not replaced
- ❌ `<password>` contains special chars (encode with `encodeURIComponent`)
- ❌ Missing database name before `?`
- ❌ Wrong cluster address

**Fix special characters in password**:
```javascript
// If password is: P@ssw0rd!
const encoded = encodeURIComponent('P@ssw0rd!'); // P%40ssw0rd%21
// Use in connection string
```

---

### 3. MongoDB Cluster Paused

**Check**: MongoDB Atlas dashboard → Cluster status

**Fix**: Resume cluster (may take 1-2 minutes)

---

## ❌ Error: "Authentication failed"

**Cause**: Wrong username/password

**Fix**:
1. Go to Database Access in MongoDB Atlas
2. Edit user → Reset password
3. Update `MONGO_URI` in [`.env.local`](.env.local)
4. Restart server

---

## ❌ Error: "Cannot read property '_id' of null"

**Cause**: Database query returned no results

**Debug**:
```javascript
const creator = await Creator.findOne({ username: 'johndoe' });
console.log('Creator found:', creator); // null if not found

if (!creator) {
  return res.status(404).json({ error: 'Creator not found' });
}
```

**Fix**: Add null checks before accessing properties

---

## ❌ Slow Database Queries

**Symptoms**: API responses taking >2 seconds

**Diagnose**:
```javascript
const start = Date.now();
const donations = await Donation.find({ creatorId });
console.log(`Query took ${Date.now() - start}ms`);
```

**Solutions**:

### 1. Add Indexes
```javascript
// In model definition
CreatorSchema.index({ username: 1 });
DonationSchema.index({ creatorId: 1, status: 1 });
DonationSchema.index({ orderId: 1 });
```

### 2. Use `lean()` for read-only queries
```javascript
// Slower (returns Mongoose documents)
const donations = await Donation.find({ status: 'PAID' });

// Faster (returns plain JS objects)
const donations = await Donation.find({ status: 'PAID' }).lean();
```

### 3. Limit fields with `select()`
```javascript
// Get only needed fields
const creators = await Creator.find()
  .select('username displayName totalEarned')
  .lean();
```

---

# AUTHENTICATION PROBLEMS

## ❌ Error: "Invalid or expired token"

**Possible Causes**:

### 1. Token Expired

**Check expiry**:
```javascript
import jwt from 'jsonwebtoken';

const decoded = jwt.decode(token);
console.log('Token expires at:', new Date(decoded.exp * 1000));
console.log('Current time:', new Date());
```

**Fix**: Implement token refresh or ask user to login again

---

### 2. Wrong JWT_SECRET

**Check**: Development and production use different secrets?

**Fix**: 
- Ensure `JWT_SECRET` in Vercel matches what was used to sign tokens
- If changed, users need to re-login

---

### 3. Token Malformed

**Check**:
```javascript
const token = req.headers.authorization?.replace('Bearer ', '');
console.log('Token:', token); // Should be: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Common mistakes**:
- Token includes "Bearer " prefix
- Token has extra whitespace
- Token split incorrectly

---

## ❌ Error: "Unauthorized" on protected routes

**Diagnose**:
```javascript
// In middleware
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  console.log('Authorization header:', req.headers.authorization);
  console.log('Extracted token:', token);
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Fix**: Check frontend sends token correctly:
```javascript
// Frontend
fetch('/api/creator/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`, // Space after Bearer!
  },
});
```

---

## ❌ Google OAuth not working

**Symptoms**: Redirect loops, "redirect_uri_mismatch" error

**Check**:
1. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` correct
2. `NEXTAUTH_URL` matches actual URL
3. Authorized redirect URIs in Google Console include:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

**Fix**: Update Google Cloud Console → Credentials → OAuth 2.0 Client

---

# PAYMENT GATEWAY ISSUES

## ❌ Payments stuck at PENDING status

**Possible Causes**:

### 1. Webhook Not Configured

**Check**: Midtrans Dashboard → Settings → Configuration

**Should be**:
```
Payment Notification URL: https://yourdomain.com/api/webhook/midtrans
```

**Test webhook**:
```bash
curl -X POST http://localhost:3000/api/webhook/midtrans \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_status": "settlement",
    "order_id": "TRX-TEST",
    "gross_amount": "50000"
  }'
```

---

### 2. Webhook Signature Verification Failing

**Debug**:
```javascript
// In webhook handler
console.log('Received notification:', req.body);
console.log('Received signature:', notification.signature_key);

const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
const computedHash = crypto
  .createHash('sha512')
  .update(signatureString)
  .digest('hex');

console.log('Computed signature:', computedHash);
console.log('Signatures match:', computedHash === notification.signature_key);
```

**Fix**: Ensure using correct `MIDTRANS_SERVER_KEY`

---

### 3. Webhook URL Not Accessible

**Check**: Is your localhost/server reachable from internet?

**For local testing**:
- Use ngrok: `ngrok http 3000`
- Update webhook URL to: `https://abc123.ngrok.io/api/webhook/midtrans`

**For production**: Ensure server is running and domain resolves

---

## ❌ Error: "Midtrans API Error: 401 Unauthorized"

**Cause**: Wrong server key or not base64 encoded

**Check**:
```javascript
// In lib/midtrans.js
const authString = Buffer.from(serverKey + ':').toString('base64');
console.log('Auth string:', authString);
```

**Fix**: Ensure `MIDTRANS_SERVER_KEY` is correct (Sandbox: `SB-Mid-server-...`)

---

## ❌ Snap popup not showing

**Check**:
1. `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` set correctly
2. Snap script loaded:
   ```html
   <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>
   ```
3. Token received from backend

**Debug**:
```javascript
// Frontend
const response = await fetch('/api/donate/johndoe', { ... });
const data = await response.json();
console.log('Snap token:', data.token); // Should not be undefined

window.snap.pay(data.token, {
  onSuccess: (result) => console.log('Success:', result),
  onError: (error) => console.error('Error:', error),
});
```

---

## ❌ Payment success but donation not updated

**Diagnose**:
1. Check webhook logs in Midtrans Dashboard
2. Check server logs for webhook processing errors
3. Verify webhook signature validation

**Debug webhook handler**:
```javascript
// pages/api/webhook/midtrans.js
export default async function handler(req, res) {
  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Body:', req.body);
  
  try {
    // ... verification logic
    
    const donation = await Donation.findOne({ orderId });
    console.log('Donation found:', donation);
    
    // ... update logic
    
    console.log('Updated donation status:', donation.status);
  } catch (error) {
    console.error('Webhook error:', error);
    // IMPORTANT: Still return 200 to avoid Midtrans retries
    return res.status(200).json({ success: false });
  }
  
  res.status(200).json({ success: true });
}
```

---

# EMAIL SENDING FAILURES

## ❌ Error: "Invalid login: 535 Authentication failed"

**Cause**: Wrong SMTP credentials

**For Gmail**:
1. Check 2FA is enabled
2. Generate new App Password: https://myaccount.google.com/apppasswords
3. Use 16-character password (no spaces) in `SMTP_PASS`

**Test credentials**:
```javascript
// dev-tools/test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('✅ SMTP Config Valid');
  }
});
```

---

## ❌ Emails go to spam

**Solutions**:

### 1. Set up SPF Record
Add TXT record to DNS:
```
v=spf1 include:_spf.google.com ~all
```

### 2. Set up DKIM
Enable in Gmail settings or email provider

### 3. Use verified "From" address
For AWS SES, verify domain or email

### 4. Improve email content
- Avoid spam words ("free", "click here", etc.)
- Include unsubscribe link
- Use proper HTML structure
- Balance text/image ratio

---

## ❌ Emails not received at all

**Check**:
1. Spam folder
2. Email address correct (no typos)
3. SMTP logs for errors:
   ```javascript
   transporter.sendMail(mailOptions, (error, info) => {
     if (error) {
       console.error('Email error:', error);
     } else {
       console.log('Email sent:', info.messageId);
       console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
     }
   });
   ```

**Test with Ethereal Email** (fake SMTP for testing):
```javascript
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
// Emails will appear at https://ethereal.email/messages
```

---

# DEPLOYMENT ERRORS

## ❌ Build fails on Vercel

**Symptoms**: "Build failed" in deployment logs

**Common Causes**:

### 1. ESLint Errors
```bash
npm run lint
```
Fix all errors or disable strict mode temporarily:
```javascript
// next.config.mjs
export default {
  eslint: {
    ignoreDuringBuilds: true, // NOT RECOMMENDED
  },
};
```

### 2. Missing Dependencies
```bash
npm install
```
Ensure all packages in `package.json`

### 3. TypeScript Errors (if using TS)
```bash
npx tsc --noEmit
```

### 4. Environment Variables Not Set
Check Vercel dashboard → Settings → Environment Variables

---

## ❌ Error: "Module not found" in production

**Cause**: Import path issues

**Check**:
```javascript
// ❌ Bad (case-sensitive on Linux/Vercel)
import Creator from '@/models/creator';

// ✅ Good
import Creator from '@/models/Creator';
```

**Fix**: Match exact filename case

---

## ❌ 500 Internal Server Error in production

**Diagnose**:
1. Check Vercel function logs: Project → Deployments → Latest → Functions
2. Look for errors in logs

**Common issues**:
- Database connection (check `MONGO_URI`)
- Missing environment variables
- Timeout (functions timeout after 10s on free tier)

---

## ❌ API routes work locally but not in production

**Check**:
1. Route filename (must be lowercase for dynamic routes)
2. Environment variables set in Vercel
3. MongoDB IP whitelist includes 0.0.0.0/0 or Vercel IPs

---

# PERFORMANCE ISSUES

## ❌ Slow page loads

**Diagnose with Vercel Analytics**:
- Project → Analytics → Web Vitals
- Check TTFB (Time to First Byte)

**Optimize**:

### 1. Image Optimization
```javascript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/profile.jpg"
  width={100}
  height={100}
  alt="Profile"
  priority={isAboveFold} // true for images above fold
/>
```

### 2. Code Splitting
```javascript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Don't render on server
});
```

### 3. API Response Caching
```javascript
// pages/api/stats.js
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  // ... response
}
```

---

## ❌ High database load

**Symptoms**: Slow queries, connection timeouts

**Solutions**:

### 1. Add Indexes
```javascript
// Check slow queries in MongoDB Atlas → Performance Advisor
```

### 2. Implement Caching
```javascript
// Example with node-cache
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min

export default async function handler(req, res) {
  const cacheKey = 'platform-stats';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const stats = await getPlatformStats();
  cache.set(cacheKey, stats);
  res.json(stats);
}
```

### 3. Use Aggregation Instead of Multiple Queries
```javascript
// ❌ Slow (N+1 queries)
const donations = await Donation.find();
for (const d of donations) {
  d.creator = await Creator.findById(d.creatorId);
}

// ✅ Fast (1 query with aggregation)
const donations = await Donation.aggregate([
  {
    $lookup: {
      from: 'creators',
      localField: 'creatorId',
      foreignField: '_id',
      as: 'creator',
    },
  },
]);
```

---

# FRONTEND ISSUES

## ❌ "Hydration failed" error

**Cause**: Server-rendered HTML doesn't match client-rendered HTML

**Common mistakes**:
```javascript
// ❌ Bad (Date will differ between server and client)
<div>{new Date().toLocaleString()}</div>

// ✅ Good (client-only rendering)
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return null;
return <div>{new Date().toLocaleString()}</div>;
```

---

## ❌ "localStorage is not defined"

**Cause**: Accessing `localStorage` during SSR

**Fix**:
```javascript
// ❌ Bad
const token = localStorage.getItem('token');

// ✅ Good
const token = typeof window !== 'undefined' 
  ? localStorage.getItem('token') 
  : null;
```

Or use `useEffect`:
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  setToken(token);
}, []);
```

---

## ❌ Infinite re-render loop

**Cause**: Setting state in render without condition

**Debug**:
```javascript
useEffect(() => {
  console.log('Component rendered');
});
```

**Common mistake**:
```javascript
// ❌ Infinite loop
const Component = () => {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Called on every render!
  return <div>{count}</div>;
};

// ✅ Fixed
const Component = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1); // Only once on mount
  }, []); // Empty dependency array
  
  return <div>{count}</div>;
};
```

---

# API ROUTE ERRORS

## ❌ Error: "API resolved without sending response"

**Cause**: Missing `return` before `res.json()`

**Bad**:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' }); // Missing return!
  }
  
  // This still executes!
  res.status(200).json({ success: true });
}
```

**Good**:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return res.status(200).json({ success: true });
}
```

---

## ❌ CORS errors

**Symptoms**: "Access-Control-Allow-Origin" error in browser

**Fix** (if needed):
```javascript
// middleware/cors.js
export const cors = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};
```

**Note**: Not needed if frontend and API are same domain

---

## ❌ Request body is undefined

**Cause**: Not parsing JSON in API route

**Check**:
```javascript
export default async function handler(req, res) {
  console.log('Body:', req.body); // undefined?
  
  // Next.js auto-parses JSON, but check:
  console.log('Content-Type:', req.headers['content-type']);
  // Should be: application/json
}
```

**Fix** (if needed):
```javascript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
```

---

## FAQ

### Q: How to reset MongoDB database?

```bash
# Drop database
mongosh "mongodb+srv://..." --eval "db.dropDatabase()"

# Or in MongoDB Compass: Connect → Collections → Drop Database
```

### Q: How to clear all donations?

```javascript
// dev-tools/clear-donations.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const Donation = require('../src/models/donations');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Donation.deleteMany({});
  console.log('All donations deleted');
  process.exit(0);
});
```

### Q: How to create admin user manually?

```javascript
// dev-tools/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
const Admin = require('../src/models/Admin');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = new Admin({
    email: 'admin@example.com',
    password: hashedPassword,
    name: 'Admin User',
    permissions: ['user_manage', 'payout_approve', 'payout_process'],
  });
  
  await admin.save();
  console.log('Admin created:', admin.email);
  process.exit(0);
});
```

---

## Getting Help

### Check Documentation
1. [Next.js Docs](https://nextjs.org/docs)
2. [MongoDB Docs](https://docs.mongodb.com)
3. [Midtrans Docs](https://docs.midtrans.com)

### Search for Errors
Copy exact error message and search:
- Stack Overflow
- GitHub Issues
- Official documentation

### Enable Debug Mode
```bash
# Development
DEBUG=* npm run dev

# Check detailed error stack traces
NODE_ENV=development npm run dev
```

### Ask for Help
Include in your question:
1. Exact error message
2. Code snippet (minimal reproducible example)
3. What you've tried
4. Environment (Node version, OS)

---

<div align="center">

**Navigasi**

[⬅️ Lampiran B: Environment Variables](Lampiran-B-Environment-Variables.md) | [Lampiran D: Cheat Sheets ➡️](Lampiran-D-Cheat-Sheets.md)

</div>
