# Debugging Vercel 500 Error

## Step 1: Check Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `twacha-labs-w1w5`
3. Go to **Settings** → **Environment Variables**
4. Verify these variables are set:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### ⚠️ Common Issues:

1. **NEXT_PUBLIC_SUPABASE_URL** should be a URL, NOT a key:
   - ✅ Correct: `https://sexyvysttphaosyewzmk.supabase.co`
   - ❌ Wrong: `sb_publishable_dPWUFUli5IicWzXy4gYr-g_I7ndKMo1`

2. **Make sure variables are set for Production, Preview, AND Development**

3. **After adding/updating variables, you MUST redeploy:**
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**

## Step 2: Check Vercel Function Logs

1. Go to **Deployments** tab
2. Click on the failed deployment
3. Click on **"Functions"** tab
4. Click on `/api/analyze`
5. Check the **"Logs"** section for detailed error messages

The logs will now show:
- Which environment variables are missing
- Detailed error messages at each step
- JSON parsing errors with full context

## Step 3: Test Locally First

Before deploying, test locally:

```bash
# Make sure .env.local has correct values
npm run dev

# Test the API
npm run test:api
```

## Step 4: Common Error Messages

### "Missing Supabase Keys"
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel
- Make sure `NEXT_PUBLIC_SUPABASE_URL` is a URL (starts with `https://`)

### "Invalid Supabase URL format"
- Your `NEXT_PUBLIC_SUPABASE_URL` is not a valid URL
- Should be: `https://xxxxx.supabase.co`
- NOT: `sb_publishable_...` (that's a key, not a URL)

### "Missing Google Gemini API Key"
- Check that `GOOGLE_GENERATIVE_AI_API_KEY` is set in Vercel

### Knowledge Base Errors
- Files should be in `/knowledge-base/` folder
- They're committed to git, so should be available in production
- If missing, API will still work but with less context

## Step 5: Get Your Supabase URL

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **"Project URL"** (not the keys)
5. It should look like: `https://xxxxx.supabase.co`

## Quick Fix Checklist

- [ ] All 3 environment variables set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is a URL (starts with `https://`)
- [ ] Variables are set for all environments (Production, Preview, Development)
- [ ] Redeployed after setting variables
- [ ] Checked Vercel function logs for detailed error
