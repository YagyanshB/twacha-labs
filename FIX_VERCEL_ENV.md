# Fix Vercel Environment Variables

## ❌ Current Issue
Your `NEXT_PUBLIC_SUPABASE_URL` is set to a **key** instead of a **URL**.

## ✅ How to Fix

### Step 1: Get Your Correct Supabase URL

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find **"Project URL"** (NOT the keys)
5. It should look like: `https://sexyvysttphaosyewzmk.supabase.co`

### Step 2: Get Your Google Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Create a new API key or copy an existing one
3. It should start with something like: `AIza...`

### Step 3: Set Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: `twacha-labs-w1w5`
3. Go to **Settings** → **Environment Variables**
4. Add/Update these 3 variables:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://sexyvysttphaosyewzmk.supabase.co` (your actual Supabase URL)
- **Environment:** Select all (Production, Preview, Development)

#### Variable 2: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full service role key)
- **Environment:** Select all (Production, Preview, Development)

#### Variable 3: GOOGLE_GENERATIVE_AI_API_KEY
- **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
- **Value:** `AIza...` (your Gemini API key)
- **Environment:** Select all (Production, Preview, Development)

### Step 4: Fix Your Local .env.local

Update your local `.env.local` file:

```env
# Supabase - MUST be a URL, not a key!
NEXT_PUBLIC_SUPABASE_URL=https://sexyvysttphaosyewzmk.supabase.co

# Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### Step 5: Redeploy

After setting variables in Vercel:
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

Or just push a new commit to trigger a redeploy.

## ⚠️ Important Notes

- `NEXT_PUBLIC_SUPABASE_URL` must start with `https://`
- It should end with `.supabase.co`
- It should NOT be `sb_publishable_...` (that's a key, not a URL)
- Make sure to select ALL environments when adding variables (Production, Preview, Development)

## Verify It's Working

After redeploying, check the Vercel function logs:
1. Go to **Deployments** → Latest deployment
2. Click **Functions** → `/api/analyze`
3. Check **Logs** - you should see:
   - ✅ Set (46 chars, starts with: https://sexyvystt...)
   - ✅ Set (219 chars)
   - ✅ Set (XX chars)

If you still see "❌ Missing", the variable wasn't set correctly.
