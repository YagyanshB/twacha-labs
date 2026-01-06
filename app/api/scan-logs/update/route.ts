import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { email, imagePath } = await req.json();

    if (!email || !imagePath) {
      return NextResponse.json(
        { error: 'Email and imagePath are required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Update the most recent scan log with this image path to add the email
    const { error: updateError } = await supabase
      .from('scan_logs')
      .update({ user_email: email })
      .eq('image_path', imagePath)
      .is('user_email', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('❌ Failed to update scan log with email:', updateError);
      return NextResponse.json(
        { error: 'Failed to update scan log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('🔥 Update scan log error:', error);
    return NextResponse.json(
      { error: 'Failed to update scan log' },
      { status: 500 }
    );
  }
}
