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
}`;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this facial image for skin health.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Clean JSON string (remove markdown code blocks if present)
    const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
    let analysis;
    
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
