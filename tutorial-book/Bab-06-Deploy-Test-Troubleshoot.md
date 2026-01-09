# BAB 6: DEPLOY, TESTING & TROUBLESHOOTING

<div align="center">

**⏱️ Estimasi Waktu: 3-4 Jam**

</div>

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan bab ini, Anda akan:
- ✅ Dapat menulis tests untuk components & API routes
- ✅ Memahami deployment ke Vercel
- ✅ Setup MongoDB Atlas untuk production
- ✅ Configure Midtrans production mode
- ✅ Implement logging & monitoring
- ✅ Troubleshoot common production issues

---

# PART A: TESTING

## 6.1 Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \       ← Few, expensive, slow
     /______\
    /        \
   /  Integration \  ← Some, moderate cost
  /______________\
 /                \
/   Unit Tests     \ ← Many, cheap, fast
/__________________\
```

**For this project**:
- **Unit Tests** (70%): Components, utilities, pure functions
- **Integration Tests** (25%): API routes, database operations
- **E2E Tests** (5%): Critical user flows (optional untuk MVP)

---

## 6.2 Jest Setup

### Configuration

Project sudah include `jest.config.js`:

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './', // Path to Next.js app
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'pages/api/**/*.js',
    '!src/**/*.test.{js,jsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

---

### Jest Setup File

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock environment variables
process.env.MONGO_URI = 'mongodb://localhost:27017/nyumbangin-test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-test';
process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY = 'SB-Mid-client-test';
process.env.SMTP_HOST = 'smtp.example.com';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'testpass';

// Mock fetch globally
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      pathname: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));
```

---

## 6.3 Testing Components

### Example: Button Component Test

```javascript
// __tests__/components/Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/Button';

describe('Button Component', () => {
  it('renders with children text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText('Primary');
    
    expect(button).toHaveClass('bg-blue-600');
  });

  it('applies secondary variant styles when specified', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    
    expect(button).toHaveClass('bg-gray-200');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

---

### Example: DonationCard Component Test

```javascript
// __tests__/components/DonationCard.test.js
import { render, screen } from '@testing-library/react';
import DonationCard from '@/components/DonationCard';

describe('DonationCard Component', () => {
  const mockDonation = {
    supporterName: 'John Doe',
    amount: 50000,
    message: 'Great content!',
    createdAt: new Date('2026-01-08T10:00:00Z'),
  };

  it('renders donation information correctly', () => {
    render(<DonationCard donation={mockDonation} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/50,000/)).toBeInTheDocument(); // Currency formatted
    expect(screen.getByText('Great content!')).toBeInTheDocument();
  });

  it('shows "Anonymous" when supporter name is not provided', () => {
    const anonymousDonation = { ...mockDonation, supporterName: '' };
    render(<DonationCard donation={anonymousDonation} />);
    
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('hides message section when message is empty', () => {
    const noMessageDonation = { ...mockDonation, message: '' };
    render(<DonationCard donation={noMessageDonation} />);
    
    expect(screen.queryByText('Great content!')).not.toBeInTheDocument();
  });
});
```

---

## 6.4 Testing API Routes

### Mock Database & External APIs

```javascript
// __tests__/lib/mockDb.js
import mongoose from 'mongoose';

// Mock Mongoose connection
export const mockDbConnect = () => {
  mongoose.connect = jest.fn().mockResolvedValue(true);
};

// Mock Mongoose disconnect
export const mockDbDisconnect = () => {
  mongoose.disconnect = jest.fn().mockResolvedValue(true);
};
```

---

### Example: Donation API Test

```javascript
// __tests__/pages/api/donate/[username].test.js
import handler from '@/pages/api/donate/[username]';
import Creator from '@/models/Creator';
import Donation from '@/models/donations';
import { createMidtransTransaction } from '@/lib/midtrans';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/models/Creator');
jest.mock('@/models/donations');
jest.mock('@/lib/midtrans');

describe('POST /api/donate/[username]', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'POST',
      query: { username: 'johndoe' },
      body: {
        amount: 50000,
        supporterName: 'Jane',
        supporterEmail: 'jane@example.com',
        message: 'Keep it up!',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  it('creates donation successfully', async () => {
    // Mock creator exists
    const mockCreator = {
      _id: 'creator123',
      username: 'johndoe',
      displayName: 'John Doe',
      isActive: true,
      isSuspended: false,
    };
    Creator.findOne = jest.fn().mockResolvedValue(mockCreator);

    // Mock Midtrans response
    createMidtransTransaction.mockResolvedValue({
      token: 'mock-token-abc123',
      redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-token-abc123',
    });

    // Mock donation save
    const mockSave = jest.fn().mockResolvedValue(true);
    Donation.mockImplementation(() => ({
      save: mockSave,
      _id: 'donation123',
      orderId: 'TRX-123',
      amount: 50000,
    }));

    await handler(req, res);

    // Assertions
    expect(Creator.findOne).toHaveBeenCalledWith({
      username: 'johndoe',
      isActive: true,
      isSuspended: false,
    });

    expect(createMidtransTransaction).toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: expect.any(String),
        paymentUrl: expect.any(String),
      })
    );
  });

  it('returns 400 for amount below minimum', async () => {
    req.body.amount = 5000; // Below 10,000 minimum

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Minimum'),
      })
    );
  });

  it('returns 404 when creator not found', async () => {
    Creator.findOne = jest.fn().mockResolvedValue(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Creator not found'),
      })
    );
  });

  it('returns 405 for non-POST methods', async () => {
    req.method = 'GET';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
```

---

## 6.5 Code Coverage

### Run Tests with Coverage

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.js

# Run tests in watch mode (development)
npm test -- --watch
```

---

### Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage

# Open coverage/lcov-report/index.html in browser
```

**Coverage Metrics**:
- **Statements**: % of statements executed
- **Branches**: % of if/else branches taken
- **Functions**: % of functions called
- **Lines**: % of lines executed

**Target**: Aim for 70-80% coverage (100% not necessary!)

---

# PART B: DEPLOYMENT

## 6.6 Pre-Deployment Checklist

### Environment Variables Audit

```bash
# Required for production:
✅ MONGO_URI (MongoDB Atlas production cluster)
✅ JWT_SECRET (NEW secret, not from development!)
✅ NEXTAUTH_SECRET (NEW secret)
✅ NEXTAUTH_URL (https://yourdomain.com)
✅ MIDTRANS_SERVER_KEY (Production key, not SB-)
✅ NEXT_PUBLIC_MIDTRANS_CLIENT_KEY (Production)
✅ MIDTRANS_PRODUCTION=true
✅ SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
✅ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (if using OAuth)
```

---

### Security Checklist

- [ ] **Regenerate all secrets** (JWT_SECRET, NEXTAUTH_SECRET, CRON_SECRET)
- [ ] **Use production Midtrans keys** (no SB- prefix)
- [ ] **Enable HTTPS only** (automatic on Vercel)
- [ ] **Whitelist specific IPs** in MongoDB Atlas (not 0.0.0.0/0)
- [ ] **Remove console.log** statements with sensitive data
- [ ] **Rate limiting** implemented for login/register
- [ ] **Input validation** on all API routes
- [ ] **CORS configured** properly (if needed)

---

### Database Indexes

Ensure indexes are created for performance:

```javascript
// Check indexes in MongoDB Compass or mongosh
db.creators.getIndexes()
db.donations.getIndexes()
db.payouts.getIndexes()

// Should have indexes on:
// - creators: username, email, totalEarned
// - donations: orderId, creatorId, status, isPaidOut, createdAt
// - payouts: creatorId, status, createdAt
```

---

## 6.7 Deploy ke Vercel

### Step 1: Prepare Repository

```bash
# Commit all changes
git add .
git commit -m "Ready for production deployment"

# Push to GitHub
git push origin main
```

---

### Step 2: Import Project ke Vercel

1. **Login** to https://vercel.com
2. **Click** "Add New Project"
3. **Import** your GitHub repository
4. **Framework Preset**: Next.js (auto-detected)
5. **Root Directory**: `.` (default)
6. **Build Command**: `npm run build` (default)
7. **Output Directory**: `.next` (default)

---

### Step 3: Configure Environment Variables

Di Vercel dashboard → Settings → Environment Variables:

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=<new-generated-secret>
NEXTAUTH_SECRET=<new-generated-secret>
NEXTAUTH_URL=https://your-app.vercel.app
MIDTRANS_SERVER_KEY=Mid-server-xxx (PRODUCTION)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxx (PRODUCTION)
MIDTRANS_PRODUCTION=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=<app-password>
CRON_SECRET=<new-secret>
```

**Important**: Set environment untuk **Production**, **Preview**, dan **Development**

---

### Step 4: Deploy

Click **"Deploy"** → Wait 2-5 minutes → Done! 🎉

Your app akan live di: `https://your-app.vercel.app`

---

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain: `nyumbangin.com`
3. Add DNS records (Vercel will show instructions):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~5-60 minutes)
5. Vercel auto-generates SSL certificate (HTTPS)

---

## 6.8 MongoDB Atlas Production Setup

### Step 1: Create Production Cluster

1. Login to MongoDB Atlas
2. Create **new cluster** (don't use development cluster!)
3. Cluster name: `nyumbangin-prod`
4. Region: Choose closest to your users
5. Tier: M0 (Free) or M10+ (Paid, for production traffic)

---

### Step 2: Security Configuration

#### Network Access

1. Go to Network Access
2. **Don't use 0.0.0.0/0 in production!**
3. Add Vercel IPs or use Connection String IP filtering:
   - For Vercel: Allow all (Vercel uses dynamic IPs) or use Vercel's IP ranges
   - Alternative: Use MongoDB Atlas Data API + API key

#### Database Users

1. Go to Database Access
2. Create new user dengan strong password
3. Role: "Atlas Admin" or custom role dengan minimal permissions
4. Authentication: SCRAM (default)

---

### Step 3: Backup & Monitoring

1. Enable **Continuous Backup** (paid tier):
   - Cluster → Backup → Configure
   - Retention: 7-30 days

2. Set up **Alerts**:
   - Alerts → Create Alert
   - Metrics: Connections, Disk Space, CPU usage
   - Notifications: Email/Slack

---

## 6.9 Midtrans Production Mode

### Step 1: Request Production Access

1. Login ke https://dashboard.midtrans.com
2. Complete **merchant verification**:
   - Business information
   - Legal documents (SIUP/NIB)
   - Bank account
   - Website/app details

**Processing time**: 1-7 business days

---

### Step 2: Get Production Keys

After approval:

1. Go to Settings → Access Keys
2. Tab **Production**
3. Copy:
   - Server Key: `Mid-server-xxxxx` (no `SB-` prefix)
   - Client Key: `Mid-client-xxxxx`

---

### Step 3: Configure Webhook URL

1. Go to Settings → Configuration
2. **Payment Notification URL**: `https://yourdomain.com/api/webhook/midtrans`
3. **Finish Redirect URL**: `https://yourdomain.com/donate/success`
4. **Error Redirect URL**: `https://yourdomain.com/donate/failed`
5. **Unfinish Redirect URL**: `https://yourdomain.com/donate/pending`

---

### Step 4: Update Environment Variables

Di Vercel:

```
MIDTRANS_SERVER_KEY=Mid-server-xxxxx (PRODUCTION KEY)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxx (PRODUCTION KEY)
MIDTRANS_PRODUCTION=true
```

**Redeploy** setelah update environment variables.

---

### Step 5: Test Production Payment

⚠️ **WARNING**: Production mode uses REAL MONEY!

1. Test dengan amount kecil (Rp 10,000)
2. Use your own bank account/e-wallet
3. Verify webhook received
4. Check donation status updated
5. Refund test transaction if needed

---

## 6.10 Email Production Setup

### Option 1: Gmail SMTP (Simple, not recommended for high volume)

Already configured. Just ensure using App Password.

**Limits**: ~500 emails/day

---

### Option 2: SendGrid (Recommended)

1. Signup di https://sendgrid.com (Free tier: 100 emails/day)
2. Create API Key
3. Update [`.env`](.env ):
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=<your-sendgrid-api-key>
   ```

---

### Option 3: AWS SES (Cheapest for high volume)

1. Setup AWS SES
2. Verify domain/email
3. Get SMTP credentials
4. Update SMTP config

**Cost**: $0.10 per 1,000 emails

---

### Email Best Practices

- ✅ **SPF/DKIM Records**: Set up for better deliverability
- ✅ **Unsubscribe Link**: Include in marketing emails
- ✅ **Rate Limiting**: Don't send too fast
- ✅ **Error Handling**: Queue failed emails for retry
- ✅ **Templates**: Use HTML templates with fallback text

---

# PART C: MONITORING & MAINTENANCE

## 6.11 Logging & Monitoring

### Vercel Analytics (Built-in)

1. Go to Project → Analytics
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Devices/browsers

**Free tier**: Basic analytics

---

### Error Tracking with Sentry

```bash
# Install Sentry
npm install @sentry/nextjs
```

```javascript
// next.config.mjs
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // your config
};

export default withSentryConfig(nextConfig, {
  org: "your-org",
  project: "nyumbangin",
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
});
```

**Benefits**:
- Real-time error alerts
- Stack traces
- User context
- Performance monitoring

---

### Custom Logging

```javascript
// src/lib/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

module.exports = logger;
```

**Usage**:
```javascript
import logger from '@/lib/logger';

logger.info('Donation created', { orderId, amount });
logger.error('Payment failed', { error: error.message, orderId });
```

---

## 6.12 Performance Optimization

### Image Optimization

```javascript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={creator.profileImage}
  alt={creator.displayName}
  width={100}
  height={100}
  priority={false} // true for above-the-fold images
/>
```

**Benefits**: Auto-optimization, lazy loading, WebP format

---

### API Response Caching

```javascript
// pages/api/stats.js
export default async function handler(req, res) {
  // Cache for 5 minutes
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  
  const stats = await getPlatformStats();
  res.json(stats);
}
```

---

### Database Query Optimization

```javascript
// BAD: N+1 query problem
const donations = await Donation.find({ status: 'PAID' });
for (const donation of donations) {
  const creator = await Creator.findById(donation.creatorId); // N queries!
}

// GOOD: Use populate
const donations = await Donation.find({ status: 'PAID' })
  .populate('creatorId', 'username displayName'); // 1 query

// BETTER: Use aggregation for complex queries
const result = await Donation.aggregate([
  { $match: { status: 'PAID' } },
  {
    $lookup: {
      from: 'creators',
      localField: 'creatorId',
      foreignField: '_id',
      as: 'creator'
    }
  }
]);
```

---

## 6.13 Backup Strategy

### MongoDB Backups

1. **Automated** (MongoDB Atlas):
   - Continuous backup (paid tier)
   - Point-in-time recovery
   - Retention: 7-30 days

2. **Manual** (Free tier):
   ```bash
   # Export database
   mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)
   
   # Restore database
   mongorestore --uri="mongodb+srv://..." backup-20260108/
   ```

3. **Schedule with cron** (server/GitHub Actions):
   ```yaml
   # .github/workflows/backup.yml
   name: Database Backup
   on:
     schedule:
       - cron: '0 2 * * *' # Daily at 2 AM UTC
   
   jobs:
     backup:
       runs-on: ubuntu-latest
       steps:
         - name: Backup MongoDB
           run: |
             mongodump --uri="${{ secrets.MONGO_URI }}" --archive > backup.gz
         - name: Upload to S3
           run: |
             aws s3 cp backup.gz s3://your-bucket/backups/$(date +%Y%m%d).gz
   ```

---

### Code Backups

- ✅ Git repository (GitHub/GitLab)
- ✅ Regular commits
- ✅ Protected main branch
- ✅ Tags untuk releases

---

## 6.14 CI/CD Pipeline

### GitHub Actions for Automated Testing

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

### Auto-Deploy on Push

Vercel automatically deploys on push to main/production branch.

**Configure**:
1. Vercel dashboard → Project → Settings → Git
2. **Production Branch**: `main`
3. **Preview Branches**: `develop`, `staging`
4. **Auto-deploy**: Enabled

---

# PART D: TROUBLESHOOTING

## 6.15 Common Issues & Solutions

### Issue 1: Database Connection Timeout

**Symptoms**:
```
MongooseServerSelectionError: connection timed out
```

**Solutions**:
1. Check `MONGO_URI` correct
2. Whitelist IP in MongoDB Atlas
3. Check network/firewall
4. Verify MongoDB cluster running

---

### Issue 2: Payment Webhook Not Firing

**Symptoms**: Donation stuck di PENDING status

**Debug Steps**:
1. Check Midtrans webhook URL configured:
   - Dashboard → Settings → Configuration
   - URL: `https://yourdomain.com/api/webhook/midtrans`

2. Check webhook logs di Midtrans dashboard:
   - Transactions → Select transaction → Notification History

3. Test webhook manually:
   ```bash
   curl -X POST https://yourdomain.com/api/webhook/midtrans \
     -H "Content-Type: application/json" \
     -d '{...webhook payload...}'
   ```

4. Check signature verification:
   ```javascript
   console.log('Received signature:', notification.signature_key);
   console.log('Computed signature:', computedHash);
   ```

---

### Issue 3: Email Not Sending

**Symptoms**: No email received after donation/payout

**Debug**:
1. Check SMTP credentials:
   ```javascript
   import { testEmailConfig } from '@/lib/email';
   testEmailConfig(); // Run in dev-tools script
   ```

2. Check spam folder

3. Verify email template rendering:
   ```javascript
   const html = templates['new-donation']({ ...testData });
   console.log(html); // Inspect HTML output
   ```

4. Check Nodemailer logs:
   ```javascript
   transporter.sendMail({...}, (error, info) => {
     if (error) console.error('Email error:', error);
     else console.log('Email sent:', info.messageId);
   });
   ```

---

### Issue 4: Token Expiry Issues

**Symptoms**: "Invalid or expired token" error

**Solutions**:
1. Check token expiry time:
   ```javascript
   const decoded = jwt.decode(token);
   console.log('Expires at:', new Date(decoded.exp * 1000));
   ```

2. Implement token refresh:
   ```javascript
   // Client-side
   if (error.message === 'Token expired') {
     const newToken = await refreshToken();
     // Retry request with new token
   }
   ```

3. Clear old tokens:
   ```javascript
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   ```

---

### Issue 5: Build Errors on Vercel

**Symptoms**: Deployment fails with build errors

**Common Causes**:
1. **Missing dependencies**:
   ```bash
   npm install --save <missing-package>
   ```

2. **Environment variables not set**:
   - Check Vercel dashboard → Settings → Environment Variables

3. **TypeScript errors** (if using TS):
   ```bash
   npm run type-check
   ```

4. **ESLint errors**:
   ```bash
   npm run lint
   ```

**Debug locally**:
```bash
npm run build
```

---

### Issue 6: Slow API Responses

**Symptoms**: API calls taking >2 seconds

**Diagnose**:
```javascript
// Add timing logs
const start = Date.now();

// ... your code ...

console.log(`Operation took ${Date.now() - start}ms`);
```

**Common fixes**:
1. Add database indexes
2. Use `lean()` for read-only queries
3. Implement caching
4. Optimize aggregation pipelines
5. Use connection pooling

---

## 6.16 Debugging Techniques

### Server Logs (Vercel)

1. Go to Project → Deployments
2. Click latest deployment
3. View **Function Logs**
4. Filter by severity (info/warn/error)

---

### Browser DevTools

**Network Tab**:
- Inspect API requests/responses
- Check status codes
- View request payload
- Check response time

**Console Tab**:
- View console.log output
- See JavaScript errors
- Check state values

**Application Tab**:
- Inspect localStorage
- View cookies
- Check service workers

---

### API Testing Tools

**Thunder Client** (VS Code extension):
- Test API routes locally
- Save request collections
- Environment variables

**Postman**:
- More features for complex testing
- Mock servers
- Automated testing

---

## 6.17 Support & Maintenance Plan

### Regular Maintenance Tasks

**Weekly**:
- [ ] Check error logs (Sentry)
- [ ] Review pending payouts
- [ ] Monitor server uptime

**Monthly**:
- [ ] Database backup verification
- [ ] Update dependencies (`npm outdated`)
- [ ] Security audit (`npm audit`)
- [ ] Review analytics/metrics

**Quarterly**:
- [ ] Update Node.js/Next.js versions
- [ ] Performance audit
- [ ] Cost optimization review

---

### Documentation for Support

Create internal docs:
1. **Common Issues FAQ**
2. **Admin Procedures** (approve payout, etc)
3. **API Documentation**
4. **Database Schema Reference**
5. **Contact Information** (support email, Slack)

---

## ✅ Final Checklist

Before going live:

- [ ] All tests passing
- [ ] Code coverage >70%
- [ ] Production environment variables set
- [ ] MongoDB production cluster configured
- [ ] Midtrans production mode enabled
- [ ] Email sending working
- [ ] Webhook URL configured
- [ ] Custom domain set up (optional)
- [ ] SSL certificate active (auto on Vercel)
- [ ] Error tracking enabled (Sentry)
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Support channels ready

---

## 🎉 Congratulations!

Anda telah menyelesaikan **Panduan Lengkap Membangun Platform Donasi Digital Nyumbangin**!

**What you've built**:
✅ Full-stack Next.js application  
✅ Payment gateway integration (Midtrans)  
✅ Authentication & authorization system  
✅ Admin panel with payout management  
✅ Email notification system  
✅ Production-ready deployment  

**Next steps**:
1. Launch your platform!
2. Gather user feedback
3. Iterate & improve
4. Scale when needed
5. Share your success story

---

## 📚 Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Midtrans Production Guide](https://docs.midtrans.com/en/after-payment/overview)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)

---

<div align="center">

**Navigasi**

[⬅️ Bab 5: Donasi & Payout](Bab-05-Donasi-Payout.md) | [Lampiran A: API Reference ➡️](Lampiran-A-Referensi-API.md)

---

**Terima kasih telah belajar bersama! 🙏**

*Happy Coding & Good Luck! 🚀*

</div>
