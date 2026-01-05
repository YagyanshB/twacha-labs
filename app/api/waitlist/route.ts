import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email, created_at: new Date().toISOString() }])
      .select();

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: 'Successfully added to waitlist', data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to add email to waitlist' },
      { status: 500 }
    );
  }
}
