import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Specifically check if OPENAI_API_KEY is undefined or empty
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'undefined') {
      const errorMsg = 'OPENAI_API_KEY environment variable is missing or undefined';
      console.error('API Key Error:', errorMsg);
      console.error('Environment check:', {
        hasKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length || 0,
        keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'N/A',
      });
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }

    // Initialize OpenAI client only when needed (not at module level)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Remove data URL prefix if present (data:image/jpeg;base64,)
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Wrap OpenAI API call in try/catch for specific error handling
    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a Dermatological Triage AI. Analyze the skin close-up. If it is a whitehead/pustule, return verdict: "POP". If it is cystic, red, or deep, return verdict: "STOP". If unclear, return "UNCLEAR". Provide a short 1-sentence reasoning.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this skin image and return only valid JSON with "verdict" and "reason" fields.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 200,
      });
    } catch (openaiError: any) {
      // Log the exact error object for debugging
      console.error('OpenAI API Error:', {
        error: openaiError,
        message: openaiError?.message,
        status: openaiError?.status,
        code: openaiError?.code,
        type: openaiError?.type,
        stack: openaiError?.stack,
      });
      
      // Return specific error message
      const errorMessage = openaiError?.message || 'OpenAI API request failed';
      return NextResponse.json(
        { error: `OpenAI API Error: ${errorMessage}` },
        { status: openaiError?.status || 500 }
      );
    }

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      console.error('OpenAI Response Error:', {
        response: response,
        choices: response.choices,
        firstChoice: response.choices[0],
        message: response.choices[0]?.message,
      });
      return NextResponse.json(
        { error: 'OpenAI returned an empty response. No content in the response choices.' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', {
        error: parseError,
        content: content,
        contentLength: content?.length,
        contentPreview: content?.substring(0, 200),
      });
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysisResult = JSON.parse(jsonMatch[0]);
        } catch (extractError: any) {
          console.error('JSON Extract Error:', extractError);
          return NextResponse.json(
            { error: `Failed to parse JSON response from OpenAI: ${extractError.message}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Invalid JSON response from OpenAI. Received: ${content.substring(0, 200)}` },
          { status: 500 }
        );
      }
    }

    // Validate the response structure
    if (!analysisResult.verdict || !analysisResult.reason) {
      console.error('Invalid Response Structure:', {
        analysisResult: analysisResult,
        hasVerdict: !!analysisResult.verdict,
        hasReason: !!analysisResult.reason,
      });
      return NextResponse.json(
        { error: `Invalid response format from AI. Missing required fields. Received: ${JSON.stringify(analysisResult)}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verdict: analysisResult.verdict,
      reason: analysisResult.reason,
    });
  } catch (error: any) {
    // Log the exact error object for debugging
    console.error('General Analysis Error:', {
      error: error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
