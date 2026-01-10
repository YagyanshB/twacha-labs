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
      return NextResponse.json({ error: "Server Config Error: Missing Supabase credentials" }, { status: 500 });
    }

    if (!openaiKey) {
      console.error("Build/Runtime Error: Missing OpenAI API Key");
      return NextResponse.json({ error: "Server Config Error: Missing OpenAI API key" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    // --- READ REQUEST ---
    const body = await req.json();
    const { images, image } = body; // Support both 'images' (array) and 'image' (single) for backward compatibility

    // Normalize to array: if 'images' is provided, use it; otherwise use 'image' as single-item array
    const imageArray = images || (image ? [image] : []);
    
    if (!imageArray || imageArray.length === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Use the first image for analysis (typically the center/primary view)
    const primaryImage = imageArray[0];

    // --- A. UPLOAD ALL IMAGES TO STORAGE ---
    const timestamp = Date.now();
    const uploadedImageUrls: string[] = [];

    for (let i = 0; i < imageArray.length; i++) {
      const img = imageArray[i];
      const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `scan_${timestamp}_${i + 1}.jpg`;

      try {
        // Upload to Supabase Storage bucket 'scan-images'
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('scan-images')
          .upload(fileName, buffer, { 
            contentType: 'image/jpeg',
            upsert: false // Don't overwrite existing files
          });

        if (uploadError) {
          console.error(`❌ Supabase Storage Upload Failed for image ${i + 1}:`);
          console.error("   Error Message:", uploadError.message);
          console.error("   Error Details:", JSON.stringify(uploadError, null, 2));
          // Continue with other images
        } else {
          // Successfully uploaded, get public URL
          const { data: publicUrlData } = supabase.storage.from('scan-images').getPublicUrl(fileName);
          uploadedImageUrls.push(publicUrlData.publicUrl);
          console.log(`✅ Image ${i + 1} uploaded successfully:`, publicUrlData.publicUrl);
        }
      } catch (uploadErr) {
        console.error(`❌ Error uploading image ${i + 1}:`, uploadErr);
        // Continue with other images
      }
    }

    // Use the first uploaded URL for database storage, or primary image if upload failed
    const primaryImageUrl = uploadedImageUrls[0] || primaryImage;

    // --- B. ANALYZE WITH GPT-4o (using primary image) ---
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
            { type: "image_url", image_url: { url: primaryImage } },
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
    // Only save if we have at least one uploaded image URL
    if (uploadedImageUrls.length > 0) {
      try {
        const { error: dbError } = await supabase.from('scans').insert({
          image_url: primaryImageUrl, // Store primary image URL
          image_urls: uploadedImageUrls.length > 1 ? uploadedImageUrls : null, // Store all URLs if multiple
          ai_diagnosis: aiResult.diagnosis,
          ai_verdict: aiResult.verdict,
          ai_confidence: aiResult.confidence || 0
        });

        if (dbError) {
          console.error("❌ Database insert error:", dbError);
          // Don't fail the request if DB insert fails
        } else {
          console.log("✅ Scan saved to database");
        }
      } catch (dbErr) {
        console.error("❌ Database error:", dbErr);
        // Continue - return analysis result even if DB save fails
      }
    }

    // Return analysis result with image URLs
    return NextResponse.json({
      ...aiResult,
      imageUrls: uploadedImageUrls, // Include uploaded URLs in response
      imagePath: primaryImageUrl // For backward compatibility
    });

  } catch (error: any) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json({ error: error.message || "Scan Failed" }, { status: 500 });
  }
}