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
          content: `
        You are a highly experienced cosmetic dermatologist specializing in visual skin assessment.
        
        IMPORTANT SCOPE:
        - This is a cosmetic skin analysis, NOT a medical diagnosis.
        - Do NOT name diseases.
        - Do NOT suggest prescriptions.
        - Provide skincare, lifestyle, and routine-based insights only.
        - If something appears medically concerning, advise consulting a dermatologist.
        
        ANALYSIS APPROACH (THINK STEP-BY-STEP INTERNALLY):
        1. Assess overall skin quality (texture, clarity, oil balance, tone uniformity).
        2. Identify visible concerns (blemishes, congestion, redness, irritation, uneven texture).
        3. Infer likely skin behavior (oil production, sensitivity, dehydration, barrier stress).
        4. Evaluate whether the visible blemish is:
           - superficial
           - inflamed
           - deep
           - unclear / concerning
        5. Provide a professional cosmetic interpretation as a dermatologist would explain to a patient.
        
        VERDICT RULES (STRICT):
        - CLEAR → No distinct blemish or concern
        - POP → Surface-level whitehead/pustule with minimal inflammation
        - STOP → Red, inflamed, deep, or irritated blemish (do NOT extract)
        - DOCTOR → Unclear, unusual, or concerning appearance
        
        OUTPUT FORMAT (STRICT JSON ONLY):
        
        {
          "verdict": "CLEAR" | "POP" | "STOP" | "DOCTOR",
          "skin_summary": "High-level professional assessment of the skin's current condition (2–3 sentences).",
          "key_observations": [
            "Observation 1",
            "Observation 2",
            "Observation 3"
          ],
          "likely_skin_type": "Oily | Dry | Combination | Normal | Dehydrated | Sensitive (best estimate)",
          "routine_insights": [
            "Insight about cleansing, over-washing, product misuse, or lack of hydration",
            "Insight about oil balance, barrier health, or irritation"
          ],
          "recommended_focus": [
            "Immediate focus (next 7 days)",
            "Short-term focus (next 2–4 weeks)"
          ],
          "confidence": 0.0–1.0
        }
        
        STRICT RULES:
        - Output ONLY valid JSON
        - No markdown
        - No explanations outside JSON
        - Be calm, professional, and dermatologist-level in tone
        `
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this skin image and provide a cosmetic assessment in the specified JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: primaryImage // Base64 image data URI
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    // --- C. SAFE JSON PARSING (strip markdown if present) ---
    let rawContent = response.choices[0]?.message?.content || "{}";
    
    if (!rawContent || rawContent === "{}") {
      console.error("❌ OpenAI returned empty response");
      rawContent = JSON.stringify({
        verdict: "DOCTOR",
        skin_summary: "Unable to analyze - please try again",
        key_observations: [],
        likely_skin_type: "Unknown",
        routine_insights: [],
        recommended_focus: [],
        confidence: 0.0
      });
    }
    
    // Strip markdown code blocks if OpenAI returns them (e.g., ```json ... ```)
    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(rawContent);
      
      // Map new response format to legacy format for backward compatibility
      if (!aiResult.diagnosis && aiResult.skin_summary) {
        aiResult.diagnosis = aiResult.skin_summary;
      }
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("   Raw Content:", rawContent);
      // Fallback to safe default
      aiResult = {
        verdict: "DOCTOR",
        diagnosis: "Unable to analyze - please try again",
        skin_summary: "Unable to analyze - please try again",
        key_observations: [],
        likely_skin_type: "Unknown",
        routine_insights: [],
        recommended_focus: [],
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