import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ❌ DO NOT initialize Supabase here. It causes the build error.

export async function POST(req: Request) {
  try {
    // ✅ Initialize INSIDE the function. 
    // This way, it only runs when a user actually requests a scan, not during build.
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Safety check to prevent crashing if keys are missing
    if (!supabaseUrl || !supabaseKey) {
      console.error("Build/Runtime Error: Missing Supabase Keys");
      return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    // --- READ REQUEST ---
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // --- A. UPLOAD TO STORAGE ---
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `scan_${Date.now()}.jpg`;

    // Upload (Ignore error for MVP flow if storage isn't set up perfectly)
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('scan-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg' });

    let imageUrl = "";
    if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('scan-images').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
    }

    // --- B. ANALYZE WITH GPT-4o ---
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Dermatological Triage AI. Analyze the skin. RULES: If whitehead/pustule -> verdict: 'POP'. If cystic/red/deep -> verdict: 'STOP'. Return strict JSON: { diagnosis: string, verdict: string, confidence: number, reasoning: string }."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image." },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(response.choices[0].message.content || "{}");

    // --- C. SAVE TO DB ---
    // Only save if we have a valid image URL
    if (imageUrl) {
        await supabase.from('scans').insert({
        image_url: imageUrl,
        ai_diagnosis: aiResult.diagnosis,
        ai_verdict: aiResult.verdict,
        ai_confidence: aiResult.confidence || 0
        });
    }

    return NextResponse.json(aiResult);

  } catch (error: any) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json({ error: error.message || "Scan Failed" }, { status: 500 });
  }
}