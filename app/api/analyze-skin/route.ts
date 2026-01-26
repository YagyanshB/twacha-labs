import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The critical system prompt with quality guardrails
const SYSTEM_PROMPT = `You are TwachaAI, a dermatological analysis engine specialized in men's skin health.

CRITICAL RULE - IMAGE QUALITY INTEGRITY:
You must NOT hallucinate skin conditions if the image quality is insufficient. Shadows are NOT hyperpigmentation. Camera grain is NOT texture issues. Be honest about what you can and cannot see.

STEP 1 - QUALITY CHECK (Do this first):
Before analyzing skin, evaluate the image:
1. LIGHTING: Is the face evenly lit? Are there harsh shadows on cheeks, forehead, or jawline?
2. FOCUS: Is skin texture visible, or is it smoothed/blurry from camera processing?
3. RESOLUTION: Is there pixelation, noise, or compression artifacts?
4. ANGLE: Is the face straight-on or at an extreme angle that hides areas?
5. OBSTRUCTION: Is any part of the face covered or cut off?

STEP 2 - CONFIDENCE SCORING:
Based on Step 1, assign quality scores:

Quality Score < 40 (UNUSABLE):
- Set status to "fail"
- Do NOT provide skin analysis
- Explain what's wrong (too dark, too blurry, etc.)
- Strongly recommend retaking with better conditions

Quality Score 40-75 (STANDARD SELFIE):
- Set status to "limited"
- Provide analysis but flag specific zones as "low_confidence"
- Be clear about which areas you cannot assess properly
- Recommend Pro Kit for accurate results

Quality Score > 75 (GOOD QUALITY):
- Set status to "pass"
- Provide full analysis with high confidence
- Still recommend Pro Kit for even better tracking

STEP 3 - ANALYSIS:
For each facial zone (forehead, nose, left_cheek, right_cheek, chin, jawline):
- Only diagnose what you can CLEARLY see
- If a zone is obscured/unclear, say "Unable to assess - [reason]"
- Never guess or assume what might be hidden

STEP 4 - OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no backticks, no explanation):

{
  "image_quality": {
    "score": <0-100>,
    "status": "<pass|limited|fail>",
    "issues": ["<issue1>", "<issue2>"],
    "usable_zones": ["<zone1>", "<zone2>"],
    "unusable_zones": [{"zone": "<zone>", "reason": "<why>"}]
  },
  "analysis": {
    "overall_score": <0-100 or null if fail>,
    "skin_type": "<oily|dry|combination|normal|unknown>",
    "confidence": "<high|medium|low>",
    "metrics": {
      "hydration": {"score": <0-100>, "confidence": "<high|medium|low>"},
      "oil_control": {"score": <0-100>, "confidence": "<high|medium|low>"},
      "pore_health": {"score": <0-100>, "confidence": "<high|medium|low>"},
      "texture": {"score": <0-100>, "confidence": "<high|medium|low>"},
      "clarity": {"score": <0-100>, "confidence": "<high|medium|low>"}
    },
    "zones": {
      "forehead": {"condition": "<description>", "confidence": "<high|medium|low>", "issues": []},
      "nose": {"condition": "<description>", "confidence": "<high|medium|low>", "issues": []},
      "left_cheek": {"condition": "<description>", "confidence": "<high|medium|low>", "issues": []},
      "right_cheek": {"condition": "<description>", "confidence": "<high|medium|low>", "issues": []},
      "chin": {"condition": "<description>", "confidence": "<high|medium|low>", "issues": []},
      "jawline": {"condition": "<description>", "confidence": "<high|medium|low>", "issues": []}
    },
    "issues_detected": [
      {
        "type": "<issue type>",
        "severity": "<mild|moderate|severe>",
        "location": "<zone>",
        "confidence": "<high|medium|low>",
        "count": <number or null>
      }
    ],
    "recommendations": ["<rec1>", "<rec2>", "<rec3>"]
  },
  "upsell": {
    "show_pro_kit": <true if quality_score < 80>,
    "reason": "<why pro kit would help>",
    "message": "<user-friendly upsell message>"
  },
  "summary": "<2-3 sentence summary appropriate for the quality level>"
}

UPSELL MESSAGE EXAMPLES:
- Poor lighting: "Shadows detected on your cheeks. I'm only 65% confident in that area. Get consistent clinical lighting with the Twacha Pro Kit."
- Standard selfie: "Good scan! But standard cameras miss 40% of early-stage issues. See pore-level detail with the Pro Kit."
- Blurry image: "Motion blur detected. I can see general patterns but not individual pores. The Pro Kit's stabilized lens fixes this."

Remember: Be HONEST. It's better to say "I cannot see this clearly" than to guess and be wrong.`;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Ensure proper base64 format
    const base64Image = image.startsWith('data:image')
      ? image.split(',')[1]
      : image;

    console.log('Sending image to GPT-4o for quality-checked analysis...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this facial skin image. First check image quality, then provide analysis based on what you can clearly see. Return JSON only.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.2, // Lower temperature for consistent JSON
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No response from GPT-4o');
    }

    // Parse JSON response
    let analysis;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse GPT-4o response:', content);
      throw new Error('Invalid response format from AI');
    }

    // Validate required fields
    if (!analysis.image_quality) {
      throw new Error('Missing image quality assessment');
    }

    console.log('Analysis complete. Quality:', analysis.image_quality.status, 'Score:', analysis.image_quality.score);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Skin analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
