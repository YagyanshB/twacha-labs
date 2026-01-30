import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('✅ Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email || session.customer_details?.email;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log('💳 Checkout complete for:', customerEmail);

  if (!customerEmail) {
    console.error('❌ No customer email found in session');
    return;
  }

  // Find user by email
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (findError || !profile) {
    console.error('❌ User not found:', customerEmail);
    return;
  }

  // Determine plan from session metadata or line items
  const plan = session.metadata?.plan || 'premium';

  // Update profile to premium
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      is_premium: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Error updating profile:', updateError);
    return;
  }

  // Create/update subscription record (if subscriptions table exists)
  try {
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: profile.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan: plan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (subError) {
      console.log('⚠️  Subscriptions table may not exist yet:', subError.message);
    }
  } catch (err) {
    console.log('⚠️  Subscriptions table may not exist yet');
  }

  console.log('✅ User upgraded to premium:', customerEmail);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;

  console.log('🔄 Subscription update:', customerId, status);

  // Find subscription by Stripe customer ID
  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!sub) {
      console.log('⚠️  Subscription not found for customer:', customerId);
      return;
    }

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);

    // Update profile is_premium based on status
    const isPremium = ['active', 'trialing'].includes(status);

    await supabase
      .from('profiles')
      .update({
        is_premium: isPremium,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.user_id);

    console.log('✅ Subscription updated for customer:', customerId);
  } catch (err) {
    console.log('⚠️  Subscriptions table may not exist yet');
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log('❌ Subscription canceled:', customerId);

  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!sub) return;

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);

    // Remove premium status
    await supabase
      .from('profiles')
      .update({
        is_premium: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.user_id);

    console.log('✅ Premium removed for customer:', customerId);
  } catch (err) {
    console.log('⚠️  Subscriptions table may not exist yet');
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('✅ Invoice paid:', invoice.customer_email);
  // Can add additional logic here like sending confirmation email
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Payment failed:', invoice.customer_email);
  // Can add logic to notify user of failed payment
}
