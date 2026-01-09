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

    // Upload to Supabase Storage (hardcoded bucket: 'scan-images')
    let imageUrl = "";
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('scan-images')
      .upload(fileName, buffer, { contentType: 'image/jpeg' });

    if (uploadError) {
      // Log detailed error but don't crash - allow AI analysis to proceed
      console.error("❌ Supabase Storage Upload Failed:");
      console.error("   Error Message:", uploadError.message);
      console.error("   Error Details:", JSON.stringify(uploadError, null, 2));
      console.error("   File Name:", fileName);
      // Continue execution - AI analysis will still work
    } else {
      // Successfully uploaded, get public URL
      const { data: publicUrlData } = supabase.storage.from('scan-images').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
      console.log("✅ Image uploaded successfully:", imageUrl);
    }

    // --- B. ANALYZE WITH GPT-4o ---
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Cosmetic Skin Analysis AI. Analyze skin images and provide cosmetic advice only. This is NOT medical diagnosis.

IMPORTANT: Focus on cosmetic appearance and skincare routine recommendations. For any serious medical concerns, always recommend consulting a dermatologist.

VERDICT RULES (STRICT):
- If no distinct blemish is found -> Verdict: "CLEAR"
- If visible whitehead/pustule (surface-level, safe to extract) -> Verdict: "POP"
- If red/inflamed/deep cyst (do not extract) -> Verdict: "STOP"
- If concerning/unknown appearance that may need professional evaluation -> Verdict: "DOCTOR"

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "verdict": "CLEAR" | "POP" | "STOP" | "DOCTOR",
  "diagnosis": "Cosmetic observation and skincare advice (not medical diagnosis)",
  "confidence": 0.0-1.0
}

Return ONLY valid JSON. No markdown, no code blocks, no explanations outside the JSON.`
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

    // --- C. SAFE JSON PARSING (strip markdown if present) ---
    let rawContent = response.choices[0].message.content || "{}";
    
    // Strip markdown code blocks if OpenAI returns them (e.g., ```json ... ```)
    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("   Raw Content:", rawContent);
      // Fallback to safe default
      aiResult = {
        verdict: "DOCTOR",
        diagnosis: "Unable to analyze - please try again",
        confidence: 0.0
      };
    }

    // --- D. SAVE TO DB ---
    // Only save if we have a valid image URL (upload succeeded)
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