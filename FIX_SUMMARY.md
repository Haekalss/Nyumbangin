# Fix Summary: Auto Archive Donations Workflow

## ✅ Changes Made

### 1. Created `vercel.json` (NEW FILE)
**Purpose**: Configure Vercel deployment for proper API routing and CORS

Key configurations:
- CORS headers for all API routes
- 60 second maxDuration for cron functions
- Proper API routing configuration

### 2. Updated `pages/api/cron/archive-donations.js`
**Changes**:
- ✅ Added Vercel serverless function config (maxDuration: 60s)
- ✅ Added CORS headers
- ✅ Added OPTIONS handler for CORS preflight
- ✅ Enhanced logging with method and headers
- ✅ Better error messages

### 3. Updated `.github/workflows/archive-donations.yml`
**Changes**:
- ✅ Added verbose curl output for debugging
- ✅ Better response parsing
- ✅ More detailed logging
- ✅ Shows full request/response for troubleshooting

### 4. Created `pages/api/health.js` (NEW FILE)
**Purpose**: Simple health check endpoint to verify API is working

### 5. Created `test-archive.js` (NEW FILE)
**Purpose**: Local testing script for archive endpoint

### 6. Created `ARCHIVE_TROUBLESHOOTING.md` (NEW FILE)
**Purpose**: Comprehensive troubleshooting guide

### 7. Updated `README.md`
**Changes**:
- ✅ Added section about automated tasks and cron jobs
- ✅ Added link to troubleshooting guide

---

## 🚀 What You Need to Do Next

### Step 1: Verify Environment Variables

The workflow requires `CRON_SECRET` to be set in **TWO** places:

#### A. GitHub Secrets
1. Go to: `https://github.com/YOUR_USERNAME/Nyumbangin/settings/secrets/actions`
2. Check if `CRON_SECRET` exists
3. If not, add it: Click "New repository secret"
   - Name: `CRON_SECRET`
   - Value: (generate a secure random string, see below)

#### B. Vercel Environment Variables
1. Go to: Vercel Dashboard → Nyumbangin → Settings → Environment Variables
2. Check if `CRON_SECRET` exists
3. If not, add it:
   - Key: `CRON_SECRET`
   - Value: (use the SAME value as GitHub secret)
   - Environment: **Production** (check this box!)

**Generate Secret:**
```bash
node generate-secret.js
```
Or use this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 2: Deploy Changes

Commit and push all changes:
```bash
git add .
git commit -m "fix: Add Vercel config and improve archive workflow"
git push
```

This will trigger automatic deployment to Vercel.

---

### Step 3: Test the Workflow

#### Option A: Wait for Scheduled Run
The workflow runs automatically every 6 hours at:
- 07:00 WIB
- 13:00 WIB
- 19:00 WIB
- 01:00 WIB (next day)

#### Option B: Manual Trigger (Recommended)
1. Go to: `https://github.com/YOUR_USERNAME/Nyumbangin/actions`
2. Click "Auto Archive Donations" workflow
3. Click "Run workflow" button
4. Click green "Run workflow" button
5. Wait for it to complete (~1-2 minutes)
6. Check the logs for detailed output

---

### Step 4: Verify Success

If successful, you should see:
```
🚀 Triggering archive process...
✅ Archive completed successfully
```

If it fails, check the logs for:
- HTTP status code
- Error message
- Full response body

---

## 🧪 Testing Locally (Optional)

### Test Health Endpoint:
```bash
curl https://nyumbangin.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-28T...",
  "env": "production",
  "vercel": "yes"
}
```

### Test Archive Endpoint:
```bash
curl -X POST https://nyumbangin.vercel.app/api/cron/archive-donations \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: YOUR_SECRET_HERE"
```

### Run Local Test Script:
```bash
# Install axios if needed
npm install axios

# Run test
CRON_SECRET=your-secret-here BASE_URL=https://nyumbangin.vercel.app node test-archive.js
```

---

## 🔍 Common Errors and Solutions

### ❌ Error 405: Method Not Allowed
**Cause**: API route not properly deployed or CORS issue
**Solution**: 
- Make sure `vercel.json` is committed and pushed
- Redeploy the project
- Check that the endpoint is accessible

### ❌ Error 401: Unauthorized
**Cause**: CRON_SECRET mismatch or missing
**Solution**:
- Verify both GitHub and Vercel have the same secret
- Make sure Vercel secret is set for "Production" environment
- Redeploy after adding the secret

### ❌ Error 500: Internal Server Error
**Cause**: Database connection or code error
**Solution**:
- Check Vercel logs for detailed error
- Verify MongoDB connection string is set in Vercel
- Check if `MONGODB_URI` environment variable exists

### ❌ Workflow shows "Failed to get HTTP status"
**Cause**: Network issue or Vercel deployment problem
**Solution**:
- Check if the site is accessible: `https://nyumbangin.vercel.app`
- Test the health endpoint first
- Check Vercel deployment status

---

## 📚 Additional Resources

- **Vercel Logs**: Check real-time function logs at Vercel Dashboard
- **GitHub Actions Logs**: Detailed workflow execution logs
- **Troubleshooting Guide**: [ARCHIVE_TROUBLESHOOTING.md](./ARCHIVE_TROUBLESHOOTING.md)

---

## ✨ Expected Behavior After Fix

Once everything is set up correctly:

1. **Automatic Archiving**: Every 6 hours, the workflow will:
   - Archive donations older than 24 hours
   - Move them to `donation_history` collection
   - Update creator leaderboards
   - Log the number of archived donations

2. **Dashboard**: Creators will see:
   - Only recent donations (< 24 hours)
   - Cleaner donation list
   - Accurate statistics

3. **Performance**: 
   - Faster dashboard loading
   - Reduced database size for active donations
   - Historical data preserved in archive

---

## 🎯 Summary

The 405 error was caused by missing Vercel configuration. The fixes include:

1. ✅ Added `vercel.json` for proper API routing and CORS
2. ✅ Enhanced API endpoint with better error handling
3. ✅ Improved workflow with detailed logging
4. ✅ Created health check and test tools
5. ✅ Comprehensive troubleshooting documentation

**Next Action**: Set up `CRON_SECRET` in both GitHub and Vercel, then test!
