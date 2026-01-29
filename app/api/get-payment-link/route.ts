import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const STRIPE_LINKS = {
  monthly: 'https://buy.stripe.com/7sYeVd8gndhhckNghE24001',
  annual: 'https://buy.stripe.com/4gM9ATbsz0uvacFc1o24003',
  earlyBird: 'https://buy.stripe.com/3cI28r2W37WX0C5ghE24004',
};

const EARLY_BIRD_LIMIT = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan'); // 'monthly', 'annual', or 'earlyBird'

  // If requesting early bird, check availability
  if (plan === 'earlyBird') {
    const { count, error } = await supabase
      .from('early_bird_signups')
      .select('*', { count: 'exact', head: true });

    const spotsTaken = count || 0;
    const spotsRemaining = EARLY_BIRD_LIMIT - spotsTaken;

    if (spotsTaken >= EARLY_BIRD_LIMIT) {
      // Early bird sold out - redirect to regular plans
      return NextResponse.json({
        available: false,
        message: 'Early bird offer has ended! Choose from our regular plans.',
        spotsTaken,
        spotsRemaining: 0,
        redirectTo: null, // Let frontend show plan options
        links: {
          monthly: STRIPE_LINKS.monthly,
          annual: STRIPE_LINKS.annual,
        },
      });
    }

    // Early bird still available
    return NextResponse.json({
      available: true,
      spotsTaken,
      spotsRemaining,
      link: STRIPE_LINKS.earlyBird,
    });
  }

  // Regular plans
  if (plan === 'monthly' || plan === 'annual') {
    return NextResponse.json({
      link: STRIPE_LINKS[plan],
    });
  }

  return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
}
