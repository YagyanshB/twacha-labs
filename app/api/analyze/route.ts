import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 1. Init Clients
// We use the SERVICE_ROLE key here because we are on the server (Secure)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // --- A. UPLOAD TO SUPABASE STORAGE (The Data Moat) ---
    // 1. Clean the base64 string
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    // 2. Turn it into a buffer
    const buffer = Buffer.from(base64Data, 'base64');
    // 3. Generate a unique filename
    const fileName = `scan_${Date.now()}.jpg`;

    // 4. Upload
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('scan-images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      // We continue even if upload fails, to not block the user
    }

    // 5. Get the public link (to save in DB)
    const { data: publicUrlData } = supabase
      .storage
      .from('scan-images')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;


    // --- B. ANALYZE WITH GPT-4o (The Brain) ---
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


    // --- C. SAVE DATA TO DATABASE (The Asset) ---
    const { error: dbError } = await supabase
      .from('scans')
      .insert({
        image_url: imageUrl,
        ai_diagnosis: aiResult.diagnosis,
        ai_verdict: aiResult.verdict,
        ai_confidence: aiResult.confidence || 0
      });

    if (dbError) console.error("DB Error:", dbError);

    // --- D. RETURN RESULT TO APP ---
    return NextResponse.json(aiResult);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Scan Failed" }, { status: 500 });
  }
}