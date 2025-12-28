# Auto Archive Troubleshooting

## Issue: GitHub Actions workflow failing with 405 error

### Changes Made:

1. **Added Vercel Configuration** (`vercel.json`)
   - Configured proper CORS headers for API routes
   - Set maxDuration for cron functions (60 seconds)
   - Ensured proper API routing

2. **Updated Archive API** (`pages/api/cron/archive-donations.js`)
   - Added Vercel serverless function config
   - Added CORS headers
   - Added OPTIONS handler for preflight requests
   - Enhanced logging to debug issues
   - Better error messages

3. **Improved Workflow** (`.github/workflows/archive-donations.yml`)
   - Added verbose curl output for debugging
   - Better response parsing
   - More detailed logging

4. **Added Health Check** (`pages/api/health.js`)
   - Simple endpoint to test if API is working

### Required: Check Vercel Environment Variables

The workflow needs `CRON_SECRET` to be set in both:
1. **GitHub Secrets**: `CRON_SECRET`
2. **Vercel Environment Variables**: `CRON_SECRET`

Both should have the SAME value.

### How to Fix:

#### Step 1: Verify GitHub Secret
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Check if `CRON_SECRET` exists
3. If not, create it with a secure random string (e.g., generated with: `node generate-secret.js`)

#### Step 2: Verify Vercel Environment Variable
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `CRON_SECRET` exists
3. If not, add it with the SAME value as GitHub secret
4. Make sure it's available for "Production" environment

#### Step 3: Redeploy
After adding `vercel.json`, you need to redeploy:
```bash
git add .
git commit -m "fix: Add Vercel config and improve archive workflow"
git push
```

#### Step 4: Test the Workflow
1. Go to GitHub → Actions → Auto Archive Donations
2. Click "Run workflow" manually
3. Check the logs for detailed output

### Testing Endpoints Manually:

Test health check (should return 200):
```bash
curl https://nyumbangin.vercel.app/api/health
```

Test archive endpoint (requires secret):
```bash
curl -X POST https://nyumbangin.vercel.app/api/cron/archive-donations \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: YOUR_SECRET_HERE"
```

### Common Issues:

1. **405 Method Not Allowed**
   - API route not properly deployed → Fixed with vercel.json
   - Wrong HTTP method → Fixed with OPTIONS handler

2. **401 Unauthorized**
   - CRON_SECRET mismatch or missing
   - Check both GitHub and Vercel secrets

3. **500 Internal Server Error**
   - Database connection issue
   - Check MongoDB connection string in Vercel env vars

4. **Timeout**
   - Too many donations to archive
   - Increased maxDuration to 60 seconds
