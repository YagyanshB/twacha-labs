import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a professional skin analysis AI for Twacha Labs, a men's skincare company.

Analyze the provided facial image and identify skin concerns common in men:
- Acne (active pimples, cystic acne)
- Blackheads (open comedones, especially in T-zone)
- Enlarged pores
- Oily zones / excess sebum
- Whiteheads (closed comedones)
- Razor bumps / ingrown hairs
- Dark spots / hyperpigmentation
- Dry patches
- Fine lines / wrinkles
- Redness / irritation
- Uneven skin texture

Respond ONLY with this JSON format:
{
  "overallScore": <number 0-100>,
  "skinType": "<oily|dry|combination|normal>",
  "issues": [
    {
      "type": "<issue name>",
      "severity": "<mild|moderate|severe>",
      "area": "<location on face>",
      "count": <number or null>
    }
  ],
  "metrics": {
    "hydration": <0-100>,
    "oilControl": <0-100>,
    "poreHealth": <0-100>,
    "texture": <0-100>,
    "clarity": <0-100>
  },
  "recommendations": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    "<actionable tip 3>"
  ],
  "summary": "<2-3 sentence assessment>"
}

Be accurate but encouraging. Focus on the most significant issues.`;

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
