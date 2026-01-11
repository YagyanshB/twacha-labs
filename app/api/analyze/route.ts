import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

// Set max duration to 60 seconds for Vercel
export const maxDuration = 60;

// Safe fallback response structure (new format)
const getSafeFallbackResponse = () => ({
  gags_score: 4,
  lesion_type: "Unknown",
  extraction_eligible: "NO",
  triage_level: "Referral",
  summary: "Unable to complete analysis at this time. Please try again.",
  action_step: "Consult a dermatologist for professional evaluation.",
  scientific_note: "Analysis incomplete. GAGS score unavailable.",
  active_ingredients: [],
  ai_confidence: 0.0
});

// Read knowledge base files
const loadKnowledgeBase = () => {
  try {
    console.log("📚 Loading knowledge base files...");
    const basePath = join(process.cwd(), 'knowledge-base');
    console.log("   Base path:", basePath);
    
    const acneDiagnosticsPath = join(basePath, 'acne_diagnostics.md');
    const extractionSafetyPath = join(basePath, 'extraction_safety_protocol.md');
    const activeIngredientsPath = join(basePath, 'active_ingredients.md');
    
    console.log("   Checking files exist...");
    
    const acneDiagnostics = readFileSync(acneDiagnosticsPath, 'utf-8');
    console.log("   ✅ acne_diagnostics.md loaded (", acneDiagnostics.length, "chars)");
    
    const extractionSafety = readFileSync(extractionSafetyPath, 'utf-8');
    console.log("   ✅ extraction_safety_protocol.md loaded (", extractionSafety.length, "chars)");
    
    const activeIngredients = readFileSync(activeIngredientsPath, 'utf-8');
    console.log("   ✅ active_ingredients.md loaded (", activeIngredients.length, "chars)");
    
    console.log("✅ All knowledge base files loaded successfully");
    
    return {
      acneDiagnostics,
      extractionSafety,
      activeIngredients
    };
  } catch (error: any) {
    console.error("❌ Error loading knowledge base:");
    console.error("   Message:", error.message);
    console.error("   Code:", error.code);
    console.error("   Path:", error.path);
    console.error("   Stack:", error.stack);
    console.warn("⚠️ Continuing without knowledge base - API will still work but with less context");
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
    // EXplicitly check environment variables BEFORE any initialization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Comprehensive environment variable check with detailed logging
    console.log("🔍 Environment Variables Check:");
    console.log("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? `✅ Set (${supabaseUrl.length} chars, starts with: ${supabaseUrl.substring(0, 20)}...)` : "❌ Missing");
    console.log("   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? `✅ Set (${supabaseKey.length} chars)` : "❌ Missing");
    console.log("   OPENAI_API_KEY:", openaiKey ? `✅ Set (${openaiKey.length} chars)` : "❌ Missing");
    
    // Explicit boolean check for clearer error messages
    const envCheck = {
      url: !!supabaseUrl,
      key: !!supabaseKey,
      openai: !!openaiKey
    };
    
    console.error('Environment Variables Status:', envCheck);
    
    // Debug: List all environment variables that contain "SUPABASE" or "SERVICE"
    console.log("🔍 Debugging: All env vars containing 'SUPABASE' or 'SERVICE':");
    const allEnvVars = Object.keys(process.env);
    const supabaseRelated = allEnvVars.filter(key => 
      key.toUpperCase().includes('SUPABASE') || 
      key.toUpperCase().includes('SERVICE')
    );
    supabaseRelated.forEach(key => {
      const value = process.env[key];
      console.log(`   ${key}: ${value ? `Set (${value.length} chars, starts with: ${value.substring(0, 20)}...)` : 'Empty'}`);
    });
    
    // Check for common variations/typos
    const possibleNames = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_SERVICE_ROLE',
      'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_SERVICE_KEY',
      'SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_URL'
    ];
    console.log("🔍 Checking for common variations:");
    possibleNames.forEach(name => {
      const value = process.env[name];
      if (value) {
        console.log(`   ⚠️ Found variation '${name}': Set (${value.length} chars)`);
      }
    });
    
    // CRITICAL: Fail fast if environment variables are missing
    if (!supabaseUrl || !supabaseKey) {
      const missingVars = [];
      if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
      
      console.error("❌ CRITICAL ERROR: Missing Required Environment Variables");
      console.error("   Missing variables:", missingVars);
      console.error("   Environment Variables Status:", {
        url: !!supabaseUrl,
        key: !!supabaseKey
      });
      console.error("   Action Required: Add these variables in Vercel Dashboard → Settings → Environment Variables");
      console.error("   For local development: Add them to .env.local file");
      
      return NextResponse.json({ 
        error: "Server Configuration Error: Missing required environment variables",
        details: {
          missing: missingVars,
          status: {
            NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: !!supabaseKey
          },
          instructions: "Please add the missing variables in Vercel Dashboard → Settings → Environment Variables, then redeploy."
        }
      }, { status: 500 });
    }
    
    // Validate URL format BEFORE initializing client
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
      console.error("❌ Invalid Supabase URL format");
      console.error("   Expected: URL like https://xxxxx.supabase.co");
      console.error("   Received:", supabaseUrl.substring(0, 50) + "...");
      console.error("   Action: Ensure NEXT_PUBLIC_SUPABASE_URL is set to your Supabase project URL (not the API key)");
      
      return NextResponse.json({ 
        error: "Server Configuration Error: Invalid Supabase URL format",
        details: {
          expected: "URL like https://xxxxx.supabase.co",
          received: supabaseUrl.substring(0, 50) + "...",
          instruction: "NEXT_PUBLIC_SUPABASE_URL should be your Supabase project URL, not an API key"
        }
      }, { status: 500 });
    }

    if (!openaiKey) {
      console.error("❌ Missing OpenAI API Key");
      console.error("   Action Required: Add OPENAI_API_KEY in Vercel Dashboard → Settings → Environment Variables");
      
      return NextResponse.json({ 
        error: "Server Configuration Error: Missing OpenAI API key",
        details: {
          instruction: "Please add OPENAI_API_KEY in Vercel Dashboard → Settings → Environment Variables, then redeploy."
        }
      }, { status: 500 });
    }

    // Only initialize clients AFTER all checks pass
    console.log("🔑 All environment variables validated. Initializing clients...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({
      apiKey: openaiKey,
    });
    
    console.log("✅ OpenAI client initialized");

    // Load knowledge base
    const knowledgeBase = loadKnowledgeBase();
    if (!knowledgeBase) {
      console.warn("⚠️ Knowledge base files not found, proceeding without clinical context");
    }

    // --- READ REQUEST ---
    console.log("📥 Reading request body...");
    const body = await req.json();
    const { imageUrl, userId } = body;

    console.log("📊 Request body keys:", Object.keys(body));
    console.log("📊 Request data:", {
      hasImageUrl: !!imageUrl,
      hasUserId: !!userId,
      imageUrl: imageUrl ? imageUrl.substring(0, 100) + "..." : null
    });

    if (!imageUrl) {
      console.error("❌ No imageUrl provided in request");
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    if (!userId) {
      console.error("❌ No userId provided in request");
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Validate that imageUrl is a valid URL
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      console.error("❌ Invalid imageUrl format. Expected HTTP/HTTPS URL");
      return NextResponse.json({ error: "Invalid imageUrl format" }, { status: 400 });
    }

    console.log("📸 Image URL received:", imageUrl);

    // --- A. FETCH IMAGE AND CONVERT TO BASE64 ---
    console.log("📥 Fetching image from Supabase Storage...");
    const fetchStartTime = Date.now();
    const imageBase64 = await fetchImageAsBase64(imageUrl);
    const fetchDuration = Date.now() - fetchStartTime;
    
    console.log("📥 Image fetch completed");
    console.log("   Duration:", fetchDuration, "ms");
    console.log("   Status:", imageBase64 ? "✅ Success" : "❌ Failed");
    
    if (!imageBase64) {
      console.error("❌ Failed to fetch image from URL:", imageUrl);
      return NextResponse.json({ 
        ...getSafeFallbackResponse(),
        error: "Failed to fetch image from URL"
      }, { status: 400 });
    }

    console.log("📥 Image fetched successfully");
    console.log("   Base64 length:", imageBase64.length, "chars");

    // Extract base64 data and MIME type
    const base64Match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!base64Match) {
      console.error("❌ Invalid image format after fetch");
      return NextResponse.json({ 
        ...getSafeFallbackResponse(),
        error: "Invalid image format"
      }, { status: 400 });
    }

    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    console.log("   MIME type:", mimeType);
    console.log("   Base64 data length:", base64Data.length, "chars");

    // --- C. BUILD CLINICAL PROMPT WITH KNOWLEDGE BASE ---
    let systemInstructions = `Act as a Senior Clinical Dermatologist with NHS experience. Analyze this 15x macro skin image.

CRITICAL: You must return ONLY a valid JSON object with these exact keys:
{
  "gags_score": <number 1-4>,
  "lesion_type": <"Comedone" | "Pustule" | "Nodule" | "Cystic" | "Mixed" | "None">,
  "extraction_eligible": <"YES" | "NO">,
  "triage_level": <"Routine" | "Monitor" | "Referral">,
  "summary": <string - ONE simple sentence explaining what you see, using plain language like "spots", "clogged pores", "breakouts" - NO medical jargon>,
  "action_step": <string - ONE clear, actionable instruction like "Apply the patch and wait 6 hours" or "Use a warm compress for 10 minutes">,
  "scientific_note": <string - Technical GAGS data and clinical details for the Technical Details section>,
  "active_ingredients": <array of 2 strings - recommended active ingredients>,
  "ai_confidence": <float 0.0-1.0>
}

COMMUNICATION STYLE:
- Tone: Empathic, professional, and direct. Like an NHS doctor speaking to a patient, not a textbook.
- Language: Use everyday words. Say "spots" not "lesions", "clogged pores" not "comedones", "breakouts" not "pustules".
- Be reassuring and practical. Focus on what the user can do, not medical terminology.

SUMMARY FIELD:
- ONE sentence only
- Plain language explanation of what you see
- Examples: "You have some surface-level spots and clogged pores in the T-zone." or "I can see a few breakouts that are ready for extraction."

ACTION_STEP FIELD:
- ONE clear, actionable instruction
- Be specific: "Apply the patch and wait 6 hours" not "Use a patch"
- Examples: "Apply a warm compress for 10 minutes, then gently cleanse." or "Use the sterile lancet on the whitehead, then cover with a patch."

SCIENTIFIC_NOTE FIELD:
- Technical GAGS scoring details
- Clinical terminology is fine here (this goes in Technical Details)
- Include: GAGS score rationale, lesion type classification, clinical observations

GAGS SCORING (Simplified 1-4 Scale):
- 1: Minimal/Mild - Few clogged pores, no inflammation
- 2: Mild - Some clogged pores and small spots, minimal inflammation
- 3: Moderate - Multiple spots, visible inflammation, some breakouts
- 4: Severe - Extensive breakouts, significant inflammation, deep spots present

LESION TYPES (for scientific_note only):
- Comedone: Non-inflamed, open (blackhead) or closed (whitehead)
- Pustule: Superficial, pus-filled, white/yellow center, red base, 2-5mm
- Nodule: Deep, solid, painful, no visible pus, extends into dermis, 5-10mm+
- Cystic: Deepest form, large, painful, pus-filled, 10mm+, may cause scarring
- Mixed: Combination of multiple lesion types
- None: No visible lesions

EXTRACTION ELIGIBILITY:
- YES: Whiteheads, blackheads, superficial spots ready for extraction (surface level only)
- NO: Deep spots, inflamed breakouts, active infection, unclear areas

TRIAGE LEVELS:
- Routine: GAGS 1-2, surface-level, non-inflamed, clear extraction eligibility
- Monitor: GAGS 2-3, some inflammation, mixed types, requires assessment
- Referral: GAGS 3-4, deep spots, significant inflammation, infection signs

ACTIVE INGREDIENTS:
Provide 2 clinically appropriate active ingredients based on the condition. Common options include: Salicylic Acid, Benzoyl Peroxide, Retinoids, Niacinamide, Azelaic Acid, etc.

Return ONLY valid JSON. No markdown, no explanations, no additional text.`;

    // Inject knowledge base content if available
    if (knowledgeBase) {
      systemInstructions += `\n\nCLINICAL KNOWLEDGE BASE:\n\n=== ACNE DIAGNOSTICS ===\n${knowledgeBase.acneDiagnostics}\n\n=== EXTRACTION SAFETY PROTOCOL ===\n${knowledgeBase.extractionSafety}\n\n=== ACTIVE INGREDIENTS ===\n${knowledgeBase.activeIngredients}`;
    }

    // --- D. ANALYZE WITH OPENAI GPT-4 VISION ---
    console.log("🤖 Calling OpenAI GPT-4 Vision API...");
    console.log("   Model: gpt-4o");
    console.log("   Image URL:", imageUrl);
    console.log("   Prompt length:", systemInstructions.length, "chars");
    
    let aiResult;
    
    try {
      const apiStartTime = Date.now();
      
      console.log("📤 Sending request to OpenAI...");
      const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
            content: systemInstructions
        },
        {
          role: "user",
          content: [
              {
                type: "text",
                text: "Analyze this 15x macro skin image as a Senior Clinical Dermatologist. Return the JSON response with GAGS score (1-4), lesion type, extraction eligibility (YES/NO), triage level, full clinical report, 2 active ingredients, and confidence score."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`
                }
              }
            ]
          }
      ],
      response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000
      });

      const apiDuration = Date.now() - apiStartTime;
      console.log("✅ OpenAI API call completed");
      console.log("   Duration:", apiDuration, "ms");

      const rawContent = completion.choices[0]?.message?.content;

      console.log("📥 Raw response received from OpenAI");
      console.log("   Content length:", rawContent?.length || 0, "chars");
      if (rawContent) {
        console.log("   First 500 chars:", rawContent.substring(0, 500));
        console.log("   Last 200 chars:", rawContent.substring(Math.max(0, rawContent.length - 200)));
      }

      // --- E. SAFE JSON PARSING with repair logic ---
      if (!rawContent || rawContent.trim() === "") {
        console.error("❌ OpenAI returned empty content");
        console.error("   Response object:", JSON.stringify(completion, null, 2));
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
          
          if (typeof aiResult.gags_score !== 'number' || aiResult.gags_score < 1 || aiResult.gags_score > 4) {
            validationErrors.push(`gags_score is ${aiResult.gags_score}, expected number 1-4`);
          }
          if (!aiResult.lesion_type) {
            validationErrors.push("lesion_type is missing");
          }
          if (aiResult.extraction_eligible !== 'YES' && aiResult.extraction_eligible !== 'NO') {
            validationErrors.push(`extraction_eligible is ${aiResult.extraction_eligible}, expected "YES" or "NO"`);
          }
          if (!aiResult.triage_level) {
            validationErrors.push("triage_level is missing");
          }
          if (!aiResult.summary) {
            validationErrors.push("summary is missing");
          }
          if (!aiResult.action_step) {
            validationErrors.push("action_step is missing");
          }
          if (!aiResult.scientific_note) {
            validationErrors.push("scientific_note is missing");
          }
          if (!Array.isArray(aiResult.active_ingredients) || aiResult.active_ingredients.length !== 2) {
            validationErrors.push(`active_ingredients is ${JSON.stringify(aiResult.active_ingredients)}, expected array of 2 strings`);
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
              gags_score: Math.max(1, Math.min(4, Math.round(aiResult.gags_score))),
              lesion_type: String(aiResult.lesion_type),
              extraction_eligible: String(aiResult.extraction_eligible), // Keep as "YES"/"NO"
              triage_level: ['Routine', 'Monitor', 'Referral'].includes(aiResult.triage_level) 
                ? aiResult.triage_level 
                : 'Referral',
              summary: String(aiResult.summary || aiResult.analysis_summary || 'Analysis completed'),
              action_step: String(aiResult.action_step || 'Follow recommended protocol'),
              scientific_note: String(aiResult.scientific_note || aiResult.analysis_summary || 'Technical details unavailable'),
              active_ingredients: Array.isArray(aiResult.active_ingredients) 
                ? aiResult.active_ingredients.map(String).slice(0, 2)
                : [],
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
    } catch (openaiError: any) {
      console.error("🔥 OpenAI API Error:");
      console.error("   Message:", openaiError.message);
      console.error("   Status:", openaiError.status);
      console.error("   Code:", openaiError.code);
      console.error("   Name:", openaiError.name);
      console.error("   Stack:", openaiError.stack);
      console.error("   Full error object:", JSON.stringify(openaiError, Object.getOwnPropertyNames(openaiError), 2));
      
      // Use fallback response
      aiResult = getSafeFallbackResponse();
    }

    // --- F. SAVE TO DB USING SERVICE ROLE KEY ---
    try {
      // Format ai_verdict as "Extraction Eligibility + Triage Level"
      const extractionStatus = aiResult.extraction_eligible === 'YES' ? 'Eligible' : 'Not Eligible';
      const aiVerdict = `${extractionStatus} | ${aiResult.triage_level}`;
      
      const { error: dbError } = await supabase.from('scans').insert({
        image_url: imageUrl,
        user_id: userId,
        ai_diagnosis: aiResult.analysis_summary, // Full clinical report text
        ai_verdict: aiVerdict, // Extraction Eligibility + Triage Level
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

    // Return analysis result
    return NextResponse.json({
      ...aiResult,
      imageUrl: imageUrl
    });

  } catch (error: any) {
    console.error("🔥 SERVER ERROR (Top-level catch):");
    console.error("   Message:", error.message);
    console.error("   Name:", error.name);
    console.error("   Stack:", error.stack);
    
    // Try to stringify error, but handle circular references
    try {
      console.error("   Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (stringifyError) {
      console.error("   Could not stringify error (circular reference)");
      console.error("   Error type:", typeof error);
      console.error("   Error keys:", Object.keys(error || {}));
    }
    
    // Return safe fallback with error details for debugging
    return NextResponse.json({
      ...getSafeFallbackResponse(),
      error: "Analysis service temporarily unavailable",
      errorMessage: error.message || "Unknown error",
      errorName: error.name || "Error"
    }, { status: 500 });
  }
}
