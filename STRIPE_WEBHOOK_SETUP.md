# Stripe Webhook Setup Guide

## Overview
The Stripe webhook automatically upgrades users to Premium when they complete payment. This is **CRITICAL** for the payment flow to work.

## Step 1: Create Subscriptions Table

Run the SQL migration in your Supabase SQL Editor:

```bash
# Copy the contents of: supabase/migrations/create_subscriptions_table.sql
# Paste into Supabase SQL Editor and run
```

Or run directly:
```sql
-- See: supabase/migrations/create_subscriptions_table.sql
```

## Step 2: Set Environment Variables

Add these to your `.env.local` and production environment:

```bash
# Stripe Keys (from Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...

# Stripe Webhook Secret (from Stripe Dashboard → Developers → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Service Role Key (from Supabase → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Create Stripe Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)

2. Click **"Add endpoint"**

3. Set the endpoint URL:
   - **Local testing**: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
   - **Production**: `https://twachalabs.com/api/webhooks/stripe`

4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`

5. Click **"Add endpoint"**

6. Copy the **Signing secret** (starts with `whsec_...`)

7. Add it to your environment:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

## Step 4: Test the Webhook

### Local Testing with Stripe CLI

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# or
npm install -g stripe
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Trigger test payment:
```bash
stripe trigger checkout.session.completed
```

5. Check your terminal logs for:
```
✅ Stripe webhook event: checkout.session.completed
💳 Checkout complete for: test@example.com
✅ User upgraded to premium: test@example.com
```

### Production Testing

1. Use Stripe's test mode
2. Go to your pricing page
3. Click "Go Premium" or "Get Annual Plan"
4. Complete test payment with card: `4242 4242 4242 4242`
5. Check Supabase profiles table - `is_premium` should be `true`
6. Check Stripe Dashboard → Webhooks → Your endpoint → Logs

## How It Works

1. **User clicks "Go Premium"** → Redirects to Stripe Checkout
2. **User completes payment** → Stripe sends `checkout.session.completed` webhook
3. **Webhook handler**:
   - Finds user by email in `profiles` table
   - Sets `is_premium = true`
   - Creates record in `subscriptions` table
4. **User is now Premium** → Can use unlimited scans

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct
- Verify STRIPE_WEBHOOK_SECRET is set
- Check Stripe Dashboard → Webhooks → Logs for errors

### User not upgraded after payment
- Check server logs for errors
- Verify email in Stripe matches email in profiles table
- Check Supabase RLS policies allow service role access

### "Subscriptions table does not exist" error
- Run the SQL migration in Supabase
- Webhook will work for profile upgrades, subscriptions table is optional

## Pricing Configuration

Current Stripe links (in `app/pricing/page.tsx`):

```typescript
const STRIPE_LINKS = {
  monthly: 'https://buy.stripe.com/7sYeVd8gndhhckNghE24001',
  annual: 'https://buy.stripe.com/4gM9ATbsz0uvacFc1o24003',
};
```

Prices:
- **Monthly**: £8.99/month
- **Annual**: £89.99/year (£7.50/month, save 17%)

## Pro Kit

Pro Kit Stripe link: `YOUR_STRIPE_LINK_HERE` (add to Stripe Dashboard)

Price: £24.99
Features:
- 15x Magnification Lens
- Universal Fit (works with any phone)

## Security Notes

- ✅ Webhook signature verification prevents unauthorized requests
- ✅ Service role key has admin access to bypass RLS
- ✅ Never expose STRIPE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in client code
- ✅ Webhook endpoint is POST-only
- ✅ All webhook events are logged for debugging
