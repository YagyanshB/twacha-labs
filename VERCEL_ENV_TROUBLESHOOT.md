# Troubleshooting Vercel Environment Variables Not Loading

## Issue: Variable shows as missing even though it's set

If you've added `SUPABASE_SERVICE_ROLE_KEY` but it still shows as missing, try these steps:

### Step 1: Verify Variable Name (Exact Match)

The variable name must be **exactly**:
```
SUPABASE_SERVICE_ROLE_KEY
```

Common mistakes:
- ❌ `SUPABASE_SERVICE_ROLE` (missing `_KEY`)
- ❌ `supabase_service_role_key` (lowercase - won't work)
- ❌ `SUPABASE_SERVICE_ROLE_KEY ` (trailing space)
- ❌ ` SUPABASE_SERVICE_ROLE_KEY` (leading space)

### Step 2: Check All Environments

In Vercel, when adding/editing the variable:
1. Make sure you select **ALL** environments:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

If you only set it for "Production" but your deployment is a "Preview" deployment, it won't be available.

### Step 3: Verify Variable Value

1. Go to Vercel → Settings → Environment Variables
2. Click on `SUPABASE_SERVICE_ROLE_KEY`
3. Make sure the value:
   - Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Has no leading/trailing spaces
   - Is the full key (not truncated)
   - Matches your `.env.local` value exactly

### Step 4: Redeploy After Adding Variable

**IMPORTANT:** After adding/updating environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Wait for deployment to complete

**OR** push a new commit to trigger a new deployment.

### Step 5: Check Which Environment Your Deployment Is

1. Go to **Deployments** tab
2. Look at the deployment that's failing
3. Check if it says "Production" or "Preview"
4. Make sure the variable is set for that specific environment

### Step 6: Delete and Re-add the Variable

Sometimes Vercel caches environment variables. Try:

1. Delete `SUPABASE_SERVICE_ROLE_KEY` from Vercel
2. Wait 30 seconds
3. Add it again with the exact name and value
4. Select ALL environments
5. Redeploy

### Step 7: Verify in Vercel Function Logs

After redeploying, check the logs:
1. Go to **Deployments** → Latest deployment
2. Click **Functions** → `/api/analyze`
3. Check **Logs** tab
4. Look for the environment variable check logs

You should see:
```
SUPABASE_SERVICE_ROLE_KEY: ✅ Set (219 chars)
```

If it still shows `❌ Missing`, the variable isn't being read.

### Step 8: Check for Variable Name Conflicts

Make sure you don't have:
- Multiple variables with similar names
- Old/deprecated variable names still set

### Quick Checklist

- [ ] Variable name is exactly `SUPABASE_SERVICE_ROLE_KEY` (no typos, no spaces)
- [ ] Variable is set for ALL environments (Production, Preview, Development)
- [ ] Variable value matches your `.env.local` exactly
- [ ] Redeployed after adding/updating the variable
- [ ] Checked the deployment environment (Production vs Preview)
- [ ] Verified in function logs that it's still missing

### Still Not Working?

If it's still not working after all these steps:

1. Check Vercel's environment variable documentation
2. Try setting it via Vercel CLI:
   ```bash
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```
3. Contact Vercel support with your deployment logs
