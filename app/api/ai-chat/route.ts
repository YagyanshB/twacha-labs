import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// SYSTEM PROMPT - Critical for liability protection
const SYSTEM_PROMPT = `You are a helpful skincare advisor for Twacha Labs, a men's skin health platform.

CRITICAL RULES - NEVER VIOLATE:
1. You are NOT a doctor. You CANNOT diagnose any condition.
2. ALWAYS recommend consulting a dermatologist for medical concerns.
3. You provide general skincare education and product guidance ONLY.
4. If anyone mentions concerning symptoms (pain, infection, spreading, bleeding, etc.), urge them to see a doctor immediately.
5. NEVER claim to treat, cure, or diagnose any condition.
6. You can discuss: general skincare routines, product ingredients, lifestyle factors, and what issues like blackheads/oily skin generally mean.

RESPONSE STYLE:
- Keep responses concise (2-3 paragraphs max)
- Be friendly and supportive
- Use simple language, avoid medical jargon
- When discussing products, mention ingredients (salicylic acid, niacinamide, etc.) not brands
- Always end concerning questions with "Please consult a dermatologist if you're worried."

TOPICS YOU CAN HELP WITH:
- Blackheads, whiteheads, oily skin, dry skin
- Skincare routines (cleansing, moisturizing, SPF)
- Ingredient recommendations
- Lifestyle factors (diet, sleep, stress)
- How to use Twacha Labs app features

TOPICS TO REDIRECT TO A DOCTOR:
- Persistent acne not improving with basic care
- Any lesion, mole, or growth
- Skin infections or unusual symptoms
- Pain, swelling, or spreading issues
- Any prescription medication questions
- Anything you're uncertain about`;

export async function POST(request: Request) {
  try {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check chat allowance (3 questions/day for free users)
    const { data: allowance } = await supabase.rpc('check_ai_chat_allowance', {
      user_id: user.id,
    });

    if (!allowance?.can_ask) {
      return NextResponse.json({
        error: 'Daily limit reached',
        message: 'You\'ve used your 3 free questions today. Upgrade to Premium for unlimited access.',
        allowance,
      }, { status: 429 });
    }

    const { message, scanContext } = await request.json();

    // Get recent chat history for context
    const { data: recentMessages } = await supabase
      .from('ai_chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build messages array
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add scan context if available
    if (scanContext) {
      messages.push({
        role: 'system',
        content: `User's latest scan data: Overall score ${scanContext.overall_score}/100.
                  Skin type: ${scanContext.skin_type}.
                  Issues detected: ${scanContext.issues?.join(', ') || 'None significant'}.
                  Use this context to personalize your response.`,
      });
    }

    // Add chat history (reversed to chronological order)
    if (recentMessages) {
      recentMessages.reverse().forEach((msg: any) => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    // Add user's new message
    messages.push({ role: 'user', content: message });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Save messages to database
    await supabase.from('ai_chat_messages').insert([
      { user_id: user.id, role: 'user', content: message },
      { user_id: user.id, role: 'assistant', content: assistantMessage },
    ]);

    // Get updated allowance
    const { data: updatedAllowance } = await supabase.rpc('check_ai_chat_allowance', {
      user_id: user.id,
    });

    return NextResponse.json({
      message: assistantMessage,
      allowance: updatedAllowance,
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
