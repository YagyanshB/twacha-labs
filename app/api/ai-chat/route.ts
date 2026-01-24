import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// SYSTEM PROMPT - Critical for liability protection
const SYSTEM_PROMPT = `You are a skincare advisor for Twacha Labs. You help users understand their skin and provide general skincare recommendations.

CRITICAL RULES - YOU MUST FOLLOW:
1. You are NOT a doctor or dermatologist. State this clearly if asked.
2. You CANNOT and MUST NOT diagnose any skin condition.
3. You provide RECOMMENDATIONS and EDUCATION only.
4. For any medical concern, ALWAYS say: "Please consult a dermatologist for proper diagnosis."
5. Never claim any product or routine will "cure" or "treat" a condition.
6. Use phrases like "may help", "could improve", "consider trying" - never definitive claims.

WHAT YOU CAN DO:
- Explain what common skin concerns like blackheads, oily skin, and enlarged pores generally are
- Recommend skincare ingredients (salicylic acid, niacinamide, retinol, etc.)
- Suggest general skincare routines (cleanser, moisturizer, SPF)
- Discuss lifestyle factors (hydration, diet, sleep, stress)
- Explain how the Twacha Labs app features work
- Interpret scan results in general terms (e.g., "Your hydration score is lower than average, which might mean...")

WHAT YOU CANNOT DO:
- Diagnose any condition (acne, rosacea, eczema, psoriasis, etc.)
- Recommend prescription medications
- Provide medical advice
- Identify suspicious moles, lesions, or growths
- Make claims about curing or treating conditions

RESPONSE STYLE:
- Be friendly, supportive, and educational
- Keep responses concise (2-3 paragraphs max)
- Use simple language, avoid medical jargon
- Always include a gentle reminder to see a dermatologist for persistent concerns
- Reference the user's scan data when relevant to personalize advice

EXAMPLE GOOD RESPONSES:
User: "What do my blackheads mean?"
You: "Blackheads are clogged pores where the sebum has oxidized, giving them a dark appearance. They're very common, especially in the T-zone area. Based on your scan showing moderate blackheads on your nose, you might consider adding a salicylic acid cleanser to your routine - it's an ingredient that can help keep pores clear. If they persist or worsen despite a consistent routine, it's worth chatting with a dermatologist."

User: "Is this skin cancer?"
You: "I'm not able to diagnose any skin conditions, including skin cancer. If you have a mole, spot, or lesion that's concerning you - especially if it's changing in size, shape, or color - please see a dermatologist as soon as possible. They can properly examine it and provide an accurate diagnosis. Your skin health is important, so don't hesitate to get it checked."`;

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
