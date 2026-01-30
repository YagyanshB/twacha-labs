import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// CRITICAL: Ensure profile exists for user (auth trigger is disabled)
async function ensureProfileExists(supabase: any, user: any) {
  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  // Create if missing
  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      monthly_scans_used: 0,
      total_scans: 0,
      is_premium: false,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating profile:', error);
    } else {
      console.log('✅ Created profile for:', user.email);
    }
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // CRITICAL: Ensure profile exists (auth trigger is disabled)
    await ensureProfileExists(supabase, user);

    // Check if user completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    // If first time user, redirect to onboarding
    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Otherwise go to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
