import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
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

// Repair malformed JSON responses with comprehensive cleaning
const repairJSON = (rawContent: string): string => {
  console.log("🔧 Starting JSON repair...");
  console.log("📝 Raw content (first 200 chars):", rawContent.substring(0, 200));
  
  if (!rawContent || rawContent.trim() === '') {
    console.log("⚠️ Empty content, returning fallback");
    return JSON.stringify(getSafeFallbackResponse());
  }
  
  // Step 1: Remove markdown code blocks (various formats)
  let cleaned = rawContent
    .replace(/^```json\s*/gi, '')  // ```json at start
    .replace(/^```\s*/g, '')        // ``` at start
    .replace(/\s*```$/g, '')       // ``` at end
    .replace(/^`/g, '')             // Single backtick at start
    .replace(/`$/g, '')             // Single backtick at end
    .trim();
  
  console.log("📝 After markdown removal (first 200 chars):", cleaned.substring(0, 200));
  
  // Step 2: Try to extract JSON object if wrapped in text
  // Look for the first { and last } to extract the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    console.log("📝 Extracted JSON object (first 200 chars):", cleaned.substring(0, 200));
  } else {
    // Try regex as fallback
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
      console.log("📝 Regex extracted JSON (first 200 chars):", cleaned.substring(0, 200));
    }
  }
  
  // Step 3: Fix common JSON issues
  cleaned = cleaned
    .replace(/,\s*}/g, '}')           // Remove trailing commas before }
    .replace(/,\s*]/g, ']')           // Remove trailing commas before ]
    .replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3')  // Replace single quotes in keys
    .replace(/:\s*'([^']+)'(\s*[,}])/g, ': "$1"$2')   // Replace single quotes in string values
    .replace(/'/g, '"');               // Replace any remaining single quotes (basic fix)
  
  console.log("📝 After JSON fixes (first 200 chars):", cleaned.substring(0, 200));
  
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

    console.log("🔑 Initializing Supabase and Gemini clients...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(geminiKey);
    
    // Configure safety settings for clinical dermatology analysis
    // BLOCK_NONE allows all content - necessary for analyzing skin conditions
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      }
    ];
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: safetySettings
    });
    
    console.log("✅ Gemini model initialized with safety settings:", safetySettings);

    // Load knowledge base
    const knowledgeBase = loadKnowledgeBase();
    if (!knowledgeBase) {
      console.warn("⚠️ Knowledge base files not found, proceeding without clinical context");
    }

    // --- READ REQUEST ---
    console.log("📥 Reading request body...");
    const body = await req.json();
    const { images, image, image_url } = body; // Support multiple input formats

    console.log("📊 Request body keys:", Object.keys(body));
    console.log("📊 Image sources found:", {
      hasImageUrl: !!image_url,
      hasImages: !!images,
      hasImage: !!image,
      imagesLength: images?.length || 0
    });

    // Determine primary image source
    let primaryImageInput: string | null = null;
    
    if (image_url) {
      // New format: image_url (Supabase Storage URL)
      primaryImageInput = image_url;
      console.log("📸 Using image_url from request");
    } else if (images && images.length > 0) {
      // Array format
      primaryImageInput = images[0];
      console.log("📸 Using images array, first image");
    } else if (image) {
      // Single image format
      primaryImageInput = image;
      console.log("📸 Using single image from request");
    }
    
    if (!primaryImageInput) {
      console.error("❌ No image provided in request");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const imageType = primaryImageInput.startsWith('data:') ? 'base64' : 'url';
    console.log("📸 Image input received");
    console.log("   Type:", imageType);
    console.log("   Length:", primaryImageInput.length, "chars");
    if (imageType === 'url') {
      console.log("   URL:", primaryImageInput.substring(0, 100) + "...");
    } else {
      console.log("   Base64 preview:", primaryImageInput.substring(0, 50) + "...");
    }

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
      console.log("   Image URL:", primaryImageUrl);
      
      const fetchStartTime = Date.now();
      imageBase64 = await fetchImageAsBase64(primaryImageUrl);
      const fetchDuration = Date.now() - fetchStartTime;
      
      console.log("📥 Image fetch completed");
      console.log("   Duration:", fetchDuration, "ms");
      console.log("   Status:", imageBase64 ? "✅ Success" : "❌ Failed");
      
      if (!imageBase64) {
        console.error("❌ Failed to fetch image from URL:", primaryImageUrl);
        return NextResponse.json({ 
          ...getSafeFallbackResponse(),
          error: "Failed to fetch image from URL"
        }, { status: 400 });
      }

      console.log("📥 Image fetched successfully");
      console.log("   Base64 length:", imageBase64.length, "chars");
      console.log("   Preview:", imageBase64.substring(0, 50) + "...");

      // Extract base64 data and MIME type for Gemini
      const base64Match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!base64Match) {
        console.error("❌ Invalid image format after fetch");
        return NextResponse.json({ 
          ...getSafeFallbackResponse(),
          error: "Invalid image format"
        }, { status: 400 });
      }

      mimeType = base64Match[1];
      base64Data = base64Match[2];
      console.log("   MIME type:", mimeType);
      console.log("   Base64 data length:", base64Data.length, "chars");
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
    console.log("   Model: gemini-1.5-flash");
    console.log("   MIME type:", mimeType);
    console.log("   Base64 data length:", base64Data.length, "chars");
    console.log("   Prompt length:", systemInstructions.length, "chars");
    
    let aiResult;
    
    try {
      const prompt = systemInstructions;
      const apiStartTime = Date.now();
      
      console.log("📤 Sending request to Gemini...");
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const apiDuration = Date.now() - apiStartTime;
      console.log("✅ Gemini API call completed");
      console.log("   Duration:", apiDuration, "ms");

      const response = await result.response;
      const rawContent = response.text();

      console.log("📥 Raw response received from Gemini");
      console.log("   Content length:", rawContent.length, "chars");
      console.log("   First 500 chars:", rawContent.substring(0, 500));
      console.log("   Last 200 chars:", rawContent.substring(Math.max(0, rawContent.length - 200)));

      // --- E. SAFE JSON PARSING with repair logic ---
      if (!rawContent || rawContent.trim() === "") {
        console.error("❌ Gemini returned empty content");
        console.error("   Response object:", JSON.stringify(response, null, 2));
        aiResult = getSafeFallbackResponse();
      } else {
        console.log("🔧 Starting JSON parsing and repair...");
        const repairedJSON = repairJSON(rawContent);
        
        console.log("📝 Repaired JSON (first 500 chars):", repairedJSON.substring(0, 500));
        console.log("📝 Repaired JSON (last 200 chars):", repairedJSON.substring(Math.max(0, repairedJSON.length - 200)));
        
        try {
          console.log("🔍 Attempting JSON.parse...");
          aiResult = JSON.parse(repairedJSON);
          console.log("✅ JSON.parse successful!");
          console.log("📊 Parsed result:", JSON.stringify(aiResult, null, 2));
          
          // Validate required fields exist
          console.log("🔍 Validating required fields...");
          const validationErrors: string[] = [];
          
          if (typeof aiResult.gags_score !== 'number') {
            validationErrors.push(`gags_score is ${typeof aiResult.gags_score}, expected number`);
          }
          if (!aiResult.triage_level) {
            validationErrors.push("triage_level is missing");
          }
          if (typeof aiResult.extraction_eligible !== 'boolean') {
            validationErrors.push(`extraction_eligible is ${typeof aiResult.extraction_eligible}, expected boolean`);
          }
          if (!aiResult.analysis_summary) {
            validationErrors.push("analysis_summary is missing");
          }
          if (typeof aiResult.ai_confidence !== 'number') {
            validationErrors.push(`ai_confidence is ${typeof aiResult.ai_confidence}, expected number`);
          }
          
          if (validationErrors.length > 0) {
            console.warn("⚠️ Response missing required fields:");
            validationErrors.forEach(err => console.warn("   -", err));
            console.warn("   Using fallback response");
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
            console.log("📊 Final result:", JSON.stringify(aiResult, null, 2));
          }
        } catch (parseError: any) {
          console.error("❌ JSON Parse Error after repair");
          console.error("   Error message:", parseError.message);
          console.error("   Error stack:", parseError.stack);
          console.error("   Raw content (full):", rawContent);
          console.error("   Repaired JSON (full):", repairedJSON);
          console.error("   Repaired JSON length:", repairedJSON.length, "chars");
          console.error("   First 1000 chars of repaired JSON:", repairedJSON.substring(0, 1000));
          console.error("   Last 500 chars of repaired JSON:", repairedJSON.substring(Math.max(0, repairedJSON.length - 500)));
          aiResult = getSafeFallbackResponse();
        }
      }
    } catch (geminiError: any) {
      console.error("🔥 Gemini API Error:");
      console.error("   Message:", geminiError.message);
      console.error("   Status:", geminiError.status);
      console.error("   Code:", geminiError.code);
      console.error("   Name:", geminiError.name);
      console.error("   Stack:", geminiError.stack);
      console.error("   Full error object:", JSON.stringify(geminiError, Object.getOwnPropertyNames(geminiError), 2));
      
      // Check for safety-related blocks
      if (geminiError.message?.includes('safety') || geminiError.message?.includes('blocked')) {
        console.error("⚠️ This might be a safety filter issue. Check safety settings.");
      }
      
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
    console.error("🔥 SERVER ERROR (Top-level catch):");
    console.error("   Message:", error.message);
    console.error("   Name:", error.name);
    console.error("   Stack:", error.stack);
    console.error("   Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Return safe fallback instead of error
    return NextResponse.json({
      ...getSafeFallbackResponse(),
      error: "Analysis service temporarily unavailable"
    }, { status: 500 });
  }
}
