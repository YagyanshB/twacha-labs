import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a professional skin analysis AI for Twacha Labs, a men's skincare company.

CRITICAL: Analyze the ACTUAL image provided. Each image is different - give UNIQUE, VARIED scores based on what you ACTUALLY SEE. Do NOT give generic or placeholder scores. Different images should get significantly different results.

Carefully examine the provided facial image and identify specific skin concerns:
- Acne (active pimples, cystic acne) - count visible spots
- Blackheads (open comedones, especially in T-zone) - assess visibility and density
- Enlarged pores - evaluate size and prominence
- Oily zones / excess sebum - look for shine, especially T-zone
- Whiteheads (closed comedones)
- Razor bumps / ingrown hairs
- Dark spots / hyperpigmentation - note specific areas
- Dry patches - look for flakiness, roughness
- Fine lines / wrinkles - check around eyes, forehead
- Redness / irritation - assess severity and location
- Uneven skin texture - evaluate smoothness

SCORING GUIDELINES:
- overallScore: 90-100 = excellent skin, 70-89 = good with minor issues, 50-69 = moderate concerns, below 50 = significant issues
- hydration: Low if you see dryness/flakiness, high if skin looks plump/smooth
- oilControl: Low if you see heavy shine/grease, high if matte/balanced
- poreHealth: Low if pores very visible/enlarged, high if barely visible
- texture: Low if bumpy/rough/uneven, high if smooth
- clarity: Low if dark spots/redness/blemishes, high if even tone

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "overallScore": <number 0-100 based on ACTUAL observation>,
  "skinType": "<oily|dry|combination|normal based on what you SEE>",
  "issues": [
    {
      "type": "<specific issue you observe>",
      "severity": "<mild|moderate|severe>",
      "area": "<specific location: forehead, nose, cheeks, chin, etc>",
      "count": <actual count if countable, null otherwise>
    }
  ],
  "metrics": {
    "hydration": <0-100 based on visible dryness/moisture>,
    "oilControl": <0-100 based on visible shine>,
    "poreHealth": <0-100 based on pore visibility>,
    "texture": <0-100 based on skin smoothness>,
    "clarity": <0-100 based on even tone/blemishes>
  },
  "recommendations": [
    "<specific actionable tip based on what you see>",
    "<another specific recommendation>",
    "<third specific recommendation>"
  ],
  "summary": "<2-3 sentences describing THIS specific person's skin - be specific about what you observe>"
}

Be honest and specific about what you see. Vary your scores - not every image should score 75. Some skin is great (85-95), some has issues (45-65). Use the full range.`;

interface SkinAnalysisResult {
  overallScore: number;
  skinType: string;
  issues: Array<{
    type: string;
    severity: string;
    area: string;
    count: number | null;
  }>;
  metrics: {
    hydration: number;
    oilControl: number;
    poreHealth: number;
    texture: number;
    clarity: number;
  };
  recommendations: string[];
  summary: string;
}

export async function POST(request: Request) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not configured');
      return NextResponse.json({
        error: 'API configuration error',
        details: 'OpenAI API key is missing'
      }, { status: 500 });
    }

    const body = await request.json();
    const { image } = body; // base64 image

    if (!image) {
      return NextResponse.json({
        error: 'Missing image data'
      }, { status: 400 });
    }

    // Ensure image is in correct format (data:image/jpeg;base64,...)
    let imageData = image;
    if (!image.startsWith('data:image/')) {
      // If just base64, add the data URL prefix
      imageData = `data:image/jpeg;base64,${image}`;
    }

    // Call GPT-4o Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this facial image for skin health.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content;

    if (!rawContent) {
      console.error('❌ OpenAI returned empty content');
      return NextResponse.json({
        error: 'Analysis failed',
        details: 'No response from AI'
      }, { status: 500 });
    }

    // Parse the JSON response
    let analysisResult: SkinAnalysisResult;
    try {
      analysisResult = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.error('Raw content:', rawContent);
      return NextResponse.json({
        error: 'Analysis parsing failed',
        details: 'Could not parse AI response'
      }, { status: 500 });
    }

    // Validate the response structure
    if (!analysisResult.overallScore || !analysisResult.skinType || !analysisResult.issues) {
      console.error('❌ Invalid response structure:', analysisResult);
      return NextResponse.json({
        error: 'Invalid analysis result',
        details: 'AI response missing required fields'
      }, { status: 500 });
    }

    // Return the analysis result
    return NextResponse.json(analysisResult, { status: 200 });

  } catch (error: any) {
    console.error('❌ Skin analysis error:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      errorMessage: error.message || 'Unknown error',
      errorName: error.name || 'Error'
    }, { status: 500 });
  }
}
