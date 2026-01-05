import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'undefined') {
      console.error('❌ OPENAI_API_KEY is missing or undefined');
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Ensure image has the correct prefix for OpenAI
    // OpenAI expects "data:image/jpeg;base64,..."
    const formattedImage = image.startsWith('data:image') 
      ? image 
      : `data:image/jpeg;base64,${image}`;

    console.log("🚀 Sending request to OpenAI...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          // CRITICAL: You MUST say "JSON" in the prompt for json_object mode to work
          content: "You are a Dermatological Triage AI. Analyze the skin image. Return a valid JSON object with fields: 'verdict' (POP or STOP) and 'reason' (short explanation)."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image for acne/skin issues." },
            { type: "image_url", image_url: { url: formattedImage } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    // --- DEBUGGING LOGS ---
    console.log("🔍 Finish Reason:", response.choices[0].finish_reason);
    
    if (response.choices[0].finish_reason === 'content_filter') {
      console.error("❌ BLOCKED BY SAFETY FILTER");
      return NextResponse.json({ 
        verdict: "STOP", 
        reason: "Image flagged as sensitive/medical. Please consult a doctor." 
      });
    }

    const content = response.choices[0].message.content;
    console.log("📄 Raw Content:", content);

    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ 
      error: "Scan Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
