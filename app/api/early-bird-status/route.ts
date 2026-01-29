import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const EARLY_BIRD_LIMIT = 100;

export async function GET() {
  const { count, error } = await supabase
    .from('early_bird_signups')
    .select('*', { count: 'exact', head: true });

  const spotsTaken = count || 0;
  const spotsRemaining = Math.max(0, EARLY_BIRD_LIMIT - spotsTaken);
  const percentageTaken = Math.round((spotsTaken / EARLY_BIRD_LIMIT) * 100);

  return NextResponse.json({
    available: spotsTaken < EARLY_BIRD_LIMIT,
    spotsTaken,
    spotsRemaining,
    percentageTaken,
    limit: EARLY_BIRD_LIMIT,
  });
}
