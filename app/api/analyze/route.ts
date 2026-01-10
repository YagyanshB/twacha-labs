import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ❌ DO NOT initialize Supabase here. It causes the build error.

// Safe fallback response structure
const getSafeFallbackResponse = () => ({
  verdict: "DOCTOR",
  skin_summary: "Unable to complete analysis at this time. Please try again or consult a dermatologist for professional evaluation.",
  diagnosis: "Unable to complete analysis at this time. Please try again or consult a dermatologist for professional evaluation.",
  key_observations: [
    "Analysis temporarily unavailable"
  ],
  likely_skin_type: "Unknown",
  routine_insights: [
    "Unable to provide insights at this time"
  ],
  recommended_focus: [
    "Please retry the analysis",
    "Consider consulting a dermatologist if concerns persist"
  ],
  confidence: 0.0
});

// Validate and normalize image data
const validateImageData = (imageData: string): string | null => {
  if (!imageData || typeof imageData !== 'string') {
    return null;
  }
  
  // Check if it's a valid data URI
  if (imageData.startsWith('data:image/')) {
    // Extract base64 part
    const base64Match = imageData.match(/^data:image\/\w+;base64,(.+)$/);
    if (base64Match && base64Match[1]) {
      // Validate base64 length (reasonable size check)
      if (base64Match[1].length > 20 * 1024 * 1024) { // 20MB limit
        console.error("❌ Image too large (>20MB)");
        return null;
      }
      return imageData; // Return as-is for GPT-4o Vision
    }
  }
  
  // If it's already a URL, return as-is
  if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
    return imageData;
  }
  
  return null;
};

// Repair malformed JSON responses
const repairJSON = (rawContent: string): string => {
  if (!rawContent || rawContent.trim() === '') {
    return JSON.stringify(getSafeFallbackResponse());
  }
  
  // Remove markdown code blocks
  let cleaned = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  
  // Try to extract JSON if wrapped in text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  // Try to fix common JSON issues
  cleaned = cleaned
    .replace(/,\s*}/g, '}') // Remove trailing commas
    .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
    .replace(/'/g, '"'); // Replace single quotes with double quotes (basic fix)
  
  return cleaned;
};

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
    const openai = new OpenAI({ 
      apiKey: openaiKey,
      timeout: 60000, // 60 second timeout
      maxRetries: 2
    });

    // --- READ REQUEST ---
    const body = await req.json();
    const { images, image } = body; // Support both 'images' (array) and 'image' (single) for backward compatibility

    // Normalize to array: if 'images' is provided, use it; otherwise use 'image' as single-item array
    const imageArray = images || (image ? [image] : []);
    
    if (!imageArray || imageArray.length === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Use the first image for analysis (typically the center/primary view)
    const primaryImageRaw = imageArray[0];
    
    // Validate image format
    const primaryImage = validateImageData(primaryImageRaw);
    if (!primaryImage) {
      console.error("❌ Invalid image format provided");
      return NextResponse.json({ 
        ...getSafeFallbackResponse(),
        error: "Invalid image format"
      }, { status: 400 });
    }

    console.log("📸 Image validated, size:", primaryImage.length, "chars");

    // --- A. UPLOAD ALL IMAGES TO STORAGE (non-blocking) ---
    const timestamp = Date.now();
    const uploadedImageUrls: string[] = [];

    for (let i = 0; i < imageArray.length; i++) {
      const img = imageArray[i];
      const validatedImg = validateImageData(img);
      if (!validatedImg) continue;
      
      const base64Data = validatedImg.replace(/^data:image\/\w+;base64,/, "");
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
          console.error(`❌ Supabase Storage Upload Failed for image ${i + 1}:`, uploadError.message);
          // Continue with other images - storage failure shouldn't block analysis
        } else {
          // Successfully uploaded, get public URL
          const { data: publicUrlData } = supabase.storage.from('scan-images').getPublicUrl(fileName);
          uploadedImageUrls.push(publicUrlData.publicUrl);
          console.log(`✅ Image ${i + 1} uploaded successfully`);
        }
      } catch (uploadErr) {
        console.error(`❌ Error uploading image ${i + 1}:`, uploadErr);
        // Continue - storage is optional
      }
    }

    // Use the first uploaded URL for database storage, or primary image if upload failed
    const primaryImageUrl = uploadedImageUrls[0] || primaryImage;

    // --- B. ANALYZE WITH GPT-4o (using primary image) ---
    console.log("🤖 Calling GPT-4o Vision API...");
    
    let response;
    let aiResult;
    
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a cosmetic dermatologist providing visual skin assessment. This is cosmetic analysis only, not medical diagnosis.

Analyze the skin image and provide a JSON response with this structure:
{
  "verdict": "CLEAR" | "POP" | "STOP" | "DOCTOR",
  "skin_summary": "2-3 sentence professional assessment",
  "key_observations": ["observation 1", "observation 2", "observation 3"],
  "likely_skin_type": "Oily | Dry | Combination | Normal | Dehydrated | Sensitive",
  "routine_insights": ["insight 1", "insight 2"],
  "recommended_focus": ["immediate focus", "short-term focus"],
  "confidence": 0.0-1.0
}

Verdict rules:
- CLEAR: No distinct blemish or concern
- POP: Surface-level whitehead/pustule, minimal inflammation
- STOP: Red, inflamed, deep, or irritated blemish
- DOCTOR: Unclear, unusual, or concerning appearance

Return ONLY valid JSON. No markdown, no explanations.`
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
                  url: primaryImage
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }, // Force JSON output
        max_tokens: 1500, // Increased for comprehensive responses
        temperature: 0.3 // Lower temperature for more consistent JSON
      });

      console.log("✅ OpenAI API call successful");
      console.log("📊 Response structure:", {
        hasChoices: !!response.choices,
        choicesLength: response.choices?.length || 0,
        hasContent: !!response.choices?.[0]?.message?.content,
        contentLength: response.choices?.[0]?.message?.content?.length || 0,
        finishReason: response.choices?.[0]?.finish_reason
      });

      // --- C. SAFE JSON PARSING with repair logic ---
      let rawContent = response.choices[0]?.message?.content || "";
      
      // Log the raw response for debugging
      if (!rawContent || rawContent.trim() === "") {
        console.error("❌ OpenAI returned empty content");
        console.error("   Finish reason:", response.choices[0]?.finish_reason);
        console.error("   Full response:", JSON.stringify(response, null, 2));
        aiResult = getSafeFallbackResponse();
      } else {
        console.log("📝 Raw content length:", rawContent.length, "chars");
        
        // Repair and parse JSON
        const repairedJSON = repairJSON(rawContent);
        
        try {
          aiResult = JSON.parse(repairedJSON);
          
          // Validate required fields exist
          if (!aiResult.verdict || !aiResult.skin_summary) {
            console.warn("⚠️ Response missing required fields, using fallback");
            aiResult = getSafeFallbackResponse();
          } else {
            // Map new response format to legacy format for backward compatibility
            if (!aiResult.diagnosis && aiResult.skin_summary) {
              aiResult.diagnosis = aiResult.skin_summary;
            }
            
            // Ensure all required fields exist with defaults
            aiResult = {
              verdict: aiResult.verdict || "DOCTOR",
              skin_summary: aiResult.skin_summary || "Analysis completed",
              diagnosis: aiResult.diagnosis || aiResult.skin_summary || "Analysis completed",
              key_observations: aiResult.key_observations || [],
              likely_skin_type: aiResult.likely_skin_type || "Unknown",
              routine_insights: aiResult.routine_insights || [],
              recommended_focus: aiResult.recommended_focus || [],
              confidence: typeof aiResult.confidence === 'number' ? aiResult.confidence : 0.7
            };
            
            console.log("✅ Successfully parsed and validated AI response");
          }
        } catch (parseError: any) {
          console.error("❌ JSON Parse Error after repair:", parseError.message);
          console.error("   Repaired JSON (first 500 chars):", repairedJSON.substring(0, 500));
          aiResult = getSafeFallbackResponse();
        }
      }
    } catch (openaiError: any) {
      console.error("🔥 OpenAI API Error:", {
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type
      });
      
      // Use fallback response
      aiResult = getSafeFallbackResponse();
    }

    // --- D. SAVE TO DB (non-blocking) ---
    // Only save if we have at least one uploaded image URL
    if (uploadedImageUrls.length > 0) {
      try {
        const { error: dbError } = await supabase.from('scans').insert({
          image_url: primaryImageUrl,
          image_urls: uploadedImageUrls.length > 1 ? uploadedImageUrls : null,
          ai_diagnosis: aiResult.diagnosis || aiResult.skin_summary,
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
    // ALWAYS return a valid response, even if analysis failed
    return NextResponse.json({
      ...aiResult,
      imageUrls: uploadedImageUrls,
      imagePath: primaryImageUrl
    });

  } catch (error: any) {
    console.error("🔥 SERVER ERROR:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return safe fallback instead of error
    return NextResponse.json({
      ...getSafeFallbackResponse(),
      error: "Analysis service temporarily unavailable"
    }, { status: 500 });
  }
}
