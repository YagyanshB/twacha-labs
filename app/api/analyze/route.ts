import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { join } from 'path';

// Safe fallback response structure (new format)
const getSafeFallbackResponse = () => ({
  gags_score: 0,
  triage_level: "Referral",
  extraction_eligible: false,
  analysis_summary: "Unable to complete analysis at this time. Please try again or consult a dermatologist for professional evaluation.",
  ai_confidence: 0.0
});

// Read knowledge base files
const loadKnowledgeBase = () => {
  try {
    const basePath = join(process.cwd(), 'knowledge-base');
    const acneDiagnostics = readFileSync(join(basePath, 'acne_diagnostics.md'), 'utf-8');
    const extractionSafety = readFileSync(join(basePath, 'extraction_safety_protocol.md'), 'utf-8');
    const activeIngredients = readFileSync(join(basePath, 'active_ingredients.md'), 'utf-8');
    
    return {
      acneDiagnostics,
      extractionSafety,
      activeIngredients
    };
  } catch (error) {
    console.error("❌ Error loading knowledge base:", error);
    return null;
  }
};

// Convert image URL to base64 (for Supabase Storage URLs)
const fetchImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
  try {
    // If it's already a data URI, return as-is
    if (imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }
    
    // Fetch from URL (Supabase Storage or other)
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Determine MIME type from response or default to jpeg
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("❌ Error fetching image:", error);
    return null;
  }
};

// Validate and normalize image data
const validateImageData = (imageData: string): string | null => {
  if (!imageData || typeof imageData !== 'string') {
    return null;
  }
  
  // Check if it's a valid data URI
  if (imageData.startsWith('data:image/')) {
    const base64Match = imageData.match(/^data:image\/\w+;base64,(.+)$/);
    if (base64Match && base64Match[1]) {
      // Validate base64 length (20MB limit)
      if (base64Match[1].length > 20 * 1024 * 1024) {
        console.error("❌ Image too large (>20MB)");
        return null;
      }
      return imageData;
    }
  }
  
  // If it's a URL, it will be fetched later
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
    // Initialize Supabase and Gemini
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Safety check to prevent crashing if keys are missing
    if (!supabaseUrl || !supabaseKey) {
      console.error("Build/Runtime Error: Missing Supabase Keys");
      return NextResponse.json({ error: "Server Config Error: Missing Supabase credentials" }, { status: 500 });
    }

    if (!geminiKey) {
      console.error("Build/Runtime Error: Missing Google Gemini API Key");
      return NextResponse.json({ error: "Server Config Error: Missing Google Gemini API key" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Load knowledge base
    const knowledgeBase = loadKnowledgeBase();
    if (!knowledgeBase) {
      console.warn("⚠️ Knowledge base files not found, proceeding without clinical context");
    }

    // --- READ REQUEST ---
    const body = await req.json();
    const { images, image, image_url } = body; // Support multiple input formats

    // Determine primary image source
    let primaryImageInput: string | null = null;
    
    if (image_url) {
      // New format: image_url (Supabase Storage URL)
      primaryImageInput = image_url;
    } else if (images && images.length > 0) {
      // Array format
      primaryImageInput = images[0];
    } else if (image) {
      // Single image format
      primaryImageInput = image;
    }
    
    if (!primaryImageInput) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("📸 Image input received, type:", primaryImageInput.startsWith('data:') ? 'base64' : 'url');

    // --- A. UPLOAD IMAGE TO STORAGE AND PREPARE FOR GEMINI ---
    const timestamp = Date.now();
    let primaryImageUrl: string = primaryImageInput;
    let uploadedImageUrls: string[] = [];
    let imageBase64: string | null = null;
    let mimeType: string = 'image/jpeg';
    let base64Data: string = '';

    // If image is base64, validate and prepare for both storage and Gemini
    if (primaryImageInput.startsWith('data:image/')) {
      const validatedImg = validateImageData(primaryImageInput);
      if (!validatedImg) {
        return NextResponse.json({ 
          ...getSafeFallbackResponse(),
          error: "Invalid image format"
        }, { status: 400 });
      }
      
      // Use base64 directly for Gemini (no need to fetch)
      imageBase64 = validatedImg;
      const base64Match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!base64Match) {
        return NextResponse.json({ 
          ...getSafeFallbackResponse(),
          error: "Invalid base64 format"
        }, { status: 400 });
      }
      
      mimeType = base64Match[1];
      base64Data = base64Match[2];
      
      // Upload to Supabase Storage for persistence
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `scan_${timestamp}.jpg`;

      try {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('scan-images')
          .upload(fileName, buffer, { 
            contentType: mimeType,
            upsert: false
          });

        if (uploadError) {
          console.error("❌ Supabase Storage Upload Failed:", uploadError.message);
          // Continue with analysis using base64
        } else {
          const { data: publicUrlData } = supabase.storage.from('scan-images').getPublicUrl(fileName);
          primaryImageUrl = publicUrlData.publicUrl;
          uploadedImageUrls.push(primaryImageUrl);
          console.log("✅ Image uploaded successfully to Supabase Storage");
        }
      } catch (uploadErr) {
        console.error("❌ Error uploading image:", uploadErr);
        // Continue - storage is optional
      }
    } else {
      // Already a URL, fetch and convert to base64 for Gemini
      primaryImageUrl = primaryImageInput;
      uploadedImageUrls.push(primaryImageUrl);
      
      console.log("📥 Fetching image from URL for Gemini analysis...");
      imageBase64 = await fetchImageAsBase64(primaryImageUrl);
      
      if (!imageBase64) {
        return NextResponse.json({ 
          ...getSafeFallbackResponse(),
          error: "Failed to fetch image from URL"
        }, { status: 400 });
      }

      // Extract base64 data and MIME type for Gemini
      const base64Match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!base64Match) {
        return NextResponse.json({ 
          ...getSafeFallbackResponse(),
          error: "Invalid image format"
        }, { status: 400 });
      }

      mimeType = base64Match[1];
      base64Data = base64Match[2];
    }

    // --- C. BUILD SYSTEM INSTRUCTIONS WITH KNOWLEDGE BASE ---
    let systemInstructions = `You are a clinical dermatology AI assistant analyzing 15x macro skin images for acne assessment.

TASK: Using the provided GAGS (Global Acne Grading System) and extraction safety protocols, analyze this 15x macro skin image. Differentiate between pustules, nodules, and cystic acne.

CRITICAL: You must return ONLY a valid JSON object with these exact keys:
{
  "gags_score": <number 0-44>,
  "triage_level": <"Routine" | "Monitor" | "Referral">,
  "extraction_eligible": <boolean>,
  "analysis_summary": <string>,
  "ai_confidence": <float 0.0-1.0>
}

GAGS SCORING:
- Score range: 0-44 points
- Assess 6 face regions: forehead, right cheek, left cheek, nose, chin, chest/back
- Lesion types: Comedones (0-2), Papules (0-3), Pustules (0-3), Nodules (0-4) per region
- Severity: 0-18 (Mild), 19-30 (Moderate), 31-38 (Severe), 39-44 (Very Severe)

LESION DIFFERENTIATION:
- Pustules: Superficial, pus-filled, white/yellow center, red base, 2-5mm, surface-level
- Nodules: Deep, solid, painful, no visible pus, extends into dermis, 5-10mm+, hard to touch
- Cystic Acne: Deepest form, large, painful, pus-filled, 10mm+, may cause scarring

TRIAGE LEVELS:
- Routine: Mild acne (GAGS 0-18), surface-level, non-inflamed, clear extraction eligibility
- Monitor: Moderate acne (GAGS 19-30), some inflammation, mixed lesion types, requires assessment
- Referral: Severe/Very Severe (GAGS 31-44), deep nodules/cysts, significant inflammation, infection signs

EXTRACTION ELIGIBILITY:
- Eligible: Whiteheads, blackheads, superficial pustules, milia (surface level only)
- NOT Eligible: Deep nodules, cystic acne, inflamed lesions, active infection, unclear lesions

Return ONLY valid JSON. No markdown, no explanations, no additional text.`;

    // Inject knowledge base content if available
    if (knowledgeBase) {
      systemInstructions += `\n\nCLINICAL KNOWLEDGE BASE:\n\n=== ACNE DIAGNOSTICS ===\n${knowledgeBase.acneDiagnostics}\n\n=== EXTRACTION SAFETY PROTOCOL ===\n${knowledgeBase.extractionSafety}\n\n=== ACTIVE INGREDIENTS ===\n${knowledgeBase.activeIngredients}`;
    }

    // --- D. ANALYZE WITH GEMINI 1.5 FLASH ---
    console.log("🤖 Calling Google Gemini 1.5 Flash API...");
    
    let aiResult;
    
    try {
      const prompt = systemInstructions;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      const rawContent = response.text();

      console.log("✅ Gemini API call successful");
      console.log("📝 Raw content length:", rawContent.length, "chars");

      // --- E. SAFE JSON PARSING with repair logic ---
      if (!rawContent || rawContent.trim() === "") {
        console.error("❌ Gemini returned empty content");
        aiResult = getSafeFallbackResponse();
      } else {
        const repairedJSON = repairJSON(rawContent);
        
        try {
          aiResult = JSON.parse(repairedJSON);
          
          // Validate required fields exist
          if (
            typeof aiResult.gags_score !== 'number' ||
            !aiResult.triage_level ||
            typeof aiResult.extraction_eligible !== 'boolean' ||
            !aiResult.analysis_summary ||
            typeof aiResult.ai_confidence !== 'number'
          ) {
            console.warn("⚠️ Response missing required fields, using fallback");
            aiResult = getSafeFallbackResponse();
          } else {
            // Ensure values are within valid ranges
            aiResult = {
              gags_score: Math.max(0, Math.min(44, Math.round(aiResult.gags_score))),
              triage_level: ['Routine', 'Monitor', 'Referral'].includes(aiResult.triage_level) 
                ? aiResult.triage_level 
                : 'Referral',
              extraction_eligible: Boolean(aiResult.extraction_eligible),
              analysis_summary: String(aiResult.analysis_summary),
              ai_confidence: Math.max(0, Math.min(1, parseFloat(aiResult.ai_confidence.toFixed(2))))
            };
            
            console.log("✅ Successfully parsed and validated AI response");
          }
        } catch (parseError: any) {
          console.error("❌ JSON Parse Error after repair:", parseError.message);
          console.error("   Repaired JSON (first 500 chars):", repairedJSON.substring(0, 500));
          aiResult = getSafeFallbackResponse();
        }
      }
    } catch (geminiError: any) {
      console.error("🔥 Gemini API Error:", {
        message: geminiError.message,
        status: geminiError.status,
        code: geminiError.code
      });
      
      // Use fallback response
      aiResult = getSafeFallbackResponse();
    }

    // --- F. SAVE TO DB USING SERVICE ROLE KEY ---
    if (uploadedImageUrls.length > 0) {
      try {
        const { error: dbError } = await supabase.from('scans').insert({
          image_url: primaryImageUrl,
          image_urls: uploadedImageUrls.length > 1 ? uploadedImageUrls : null,
          ai_diagnosis: aiResult.analysis_summary,
          ai_verdict: aiResult.triage_level,
          ai_confidence: aiResult.ai_confidence
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

    // Return analysis result
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
