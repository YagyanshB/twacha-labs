# Vercel Environment Variables Setup Guide

## Required Environment Variables

Your Twacha Labs application requires the following environment variables to be set in Vercel:

### 1. Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **What it is**: Your Supabase project URL
- **Format**: `https://xxxxx.supabase.co`
- **Where to find it**: 
  - Go to your Supabase Dashboard
  - Select your project
  - Go to Settings → API
  - Copy the "Project URL" (NOT the anon key)
- **Important**: This must be a URL, not an API key

#### `SUPABASE_SERVICE_ROLE_KEY`
- **What it is**: Your Supabase Service Role Key (for server-side operations)
- **Format**: Long string starting with `eyJ...`
- **Where to find it**:
  - Go to your Supabase Dashboard
  - Select your project
  - Go to Settings → API
  - Copy the "service_role" key (⚠️ Keep this secret!)
- **Important**: This is different from the anon key. Use the service_role key.

### 2. OpenAI Configuration

#### `OPENAI_API_KEY`
- **What it is**: Your OpenAI API key for GPT-4o
- **Format**: `sk-...`
- **Where to find it**: 
  - Go to https://platform.openai.com/api-keys
  - Create a new API key or copy an existing one

## How to Add Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your Twacha Labs project

### Step 2: Navigate to Environment Variables
1. Click on **Settings** (in the top navigation)
2. Click on **Environment Variables** (in the left sidebar)

### Step 3: Add Each Variable
For each variable above:
1. Click **Add New**
2. Enter the **Name** (exactly as shown above)
3. Enter the **Value** (paste from your Supabase/OpenAI dashboard)
4. Select the **Environments**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional, for local testing)
5. Click **Save**

### Step 4: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Or push a new commit to trigger automatic deployment

## Verify Environment Variables

After deployment, check the Vercel logs:
1. Go to **Deployments** → Select latest deployment
2. Click **View Function Logs**
3. Look for the log line: `🔍 Environment Variables Check:`
4. You should see:
   - `NEXT_PUBLIC_SUPABASE_URL: ✅ Set (...chars...)`
   - `SUPABASE_SERVICE_ROLE_KEY: ✅ Set (...chars)`
   - `OPENAI_API_KEY: ✅ Set (...chars)`

## Local Development Setup

For local development, create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

**Important**: 
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Use `vercel env pull` to sync environment variables from Vercel to local

## Sync Vercel Environment Variables Locally

To pull environment variables from Vercel to your local `.env.local`:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Pull environment variables
vercel env pull .env.local
```

This will create/update your `.env.local` file with all environment variables from Vercel.

## Troubleshooting

### Error: "Missing Supabase Keys"
- **Check**: Are both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set?
- **Solution**: Add missing variables in Vercel Dashboard and redeploy

### Error: "Invalid Supabase URL format"
- **Check**: Is `NEXT_PUBLIC_SUPABASE_URL` actually a URL (starts with `https://`)?
- **Solution**: Make sure you copied the Project URL, not the API key

### Error: "Missing OpenAI API Key"
- **Check**: Is `OPENAI_API_KEY` set?
- **Solution**: Add it in Vercel Dashboard and redeploy

### Variables not updating after adding them
- **Solution**: You must redeploy after adding/changing environment variables
- Variables are only loaded at build time, not runtime

## Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added in Vercel (Production, Preview)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added in Vercel (Production, Preview)
- [ ] `OPENAI_API_KEY` added in Vercel (Production, Preview)
- [ ] All variables have correct values (URL vs Key)
- [ ] Redeployed after adding variables
- [ ] Checked deployment logs to verify variables are loaded

## Need Help?

If you're still seeing errors:
1. Check the Vercel deployment logs for detailed error messages
2. Verify variable names match exactly (case-sensitive)
3. Ensure you redeployed after adding variables
4. Check that variables are enabled for the correct environments (Production/Preview)
