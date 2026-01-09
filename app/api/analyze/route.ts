import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Build/Runtime Error: Missing Supabase Keys");
      return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const openai = new OpenAI({ apiKey: openaiKey });

    const body = await req.json();
    const { image, imageUrl, images, imageUrls, lensType, skinTone, previousScanId, userEmail } = body;

    // Support both single image (legacy) and multiple images (5-angle scan)
    let imageUrlsForAnalysis: string[] = [];
    
    if (images && Array.isArray(images) && images.length > 0) {
      imageUrlsForAnalysis = images.filter((img: string) => img && (img.startsWith('http://') || img.startsWith('https://')));
    } else if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      imageUrlsForAnalysis = imageUrls;
    } else if (imageUrl) {
      imageUrlsForAnalysis = [imageUrl];
    } else if (image) {
      imageUrlsForAnalysis = [image];
    }

    if (imageUrlsForAnalysis.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const primaryImage = imageUrlsForAnalysis[0];
    const isMultiAngleScan = imageUrlsForAnalysis.length >= 3;
    const finalImageUrl = primaryImage.startsWith('http://') || primaryImage.startsWith('https://') ? primaryImage : null;

    let previousScanData = null;
    if (previousScanId && userEmail) {
      const { data: prevScan } = await supabase
        .from('scans')
        .select('ai_diagnosis, inflammation_index, pore_congestion_score, created_at')
        .eq('id', previousScanId)
        .single();
      
      if (prevScan) {
        previousScanData = prevScan;
      }
    }

    // Read knowledge base files
    let knowledgeBase = '';
    try {
      const knowledgeBasePath = join(process.cwd(), 'knowledge-base');
      const acneDiagnostics = readFileSync(join(knowledgeBasePath, 'acne_diagnostics.md'), 'utf-8');
      const extractionSafety = readFileSync(join(knowledgeBasePath, 'extraction_safety_protocol.md'), 'utf-8');
      const activeIngredients = readFileSync(join(knowledgeBasePath, 'active_ingredients.md'), 'utf-8');
      knowledgeBase = `\nKNOWLEDGE BASE:\n${acneDiagnostics}\n\n${extractionSafety}\n\n${activeIngredients}\n`;
    } catch (error) {
      console.warn('Knowledge base files not found, using defaults');
      knowledgeBase = '\nNOTE: Knowledge base files not found. Use standard dermatological guidelines.\n';
    }

    const systemPrompt = `You are a Senior Clinical Dermatologist specializing in Computer Vision analysis.

${knowledgeBase}

═══════════════════════════════════════════════════════════════════════════════
CRITICAL ENFORCEMENT - READ THIS FIRST:
═══════════════════════════════════════════════════════════════════════════════
1. The "diagnosis" field MUST include quantitative metrics (inflammation_index X/10, pore_congestion_score Y%, Cook's Grade)
2. Generic phrases like "moderate congestion" or "some inflammation" are FORBIDDEN
3. Every diagnosis MUST reference specific numbers from your analysis
4. If you provide generic advice, you are FAILING the task
5. The treatment_protocol MUST include specific ingredient, concentration, mechanism, and frequency

FRAMEWORK:
- Use the Global Acne Grading System (GAGS) to evaluate lesion severity
- Apply Cook's Acne Grade for comprehensive assessment
- Analyze RGB color channels for quantitative inflammation measurement
- Reference the knowledge base above for all ingredient recommendations and safety protocols

ANALYSIS REQUIREMENTS:

1. STRUCTURED DATA OUTPUT (JSON ONLY):
{
  "inflammation_index": <number 1-10>,
  "pore_congestion_score": <number 0-100>,
  "lesion_type": "<Papule | Pustule | Comedone | Cystic | None>",
  "lesion_count": <number>,
  "confidence_score": <number 0.0-1.0>,
  "gags_score": <number 0-39>,
  "cooks_grade": "<Grade 0 | Grade 1 | Grade 2 | Grade 3 | Grade 4>",
  "fitzpatrick_scale": "<I | II | III | IV | V | VI>",
  "pih_risk": <boolean>,
  "overall_score": <number 40-95>,
  "skin_metrics": {
    "texture_score": <number 0-100>,
    "oiliness_tzone": <number 0-100>,
    "oiliness_cheeks": <number 0-100>,
    "wrinkle_severity": <number 0-100>,
    "dark_spots_count": <number>,
    "redness_level": <number 0-100>,
    "evenness_score": <number 0-100>
  },
  "treatment_protocol": {
    "primary_ingredient": "<ingredient name>",
    "concentration": "<percentage>",
    "mechanism": "<scientific mechanism>",
    "application_frequency": "<frequency>"
  },
  "follicular_analysis": <string | null>,
  "comparison_data": {
    "inflammation_change": <number | null>,
    "pore_congestion_change": <number | null>,
    "redness_surface_area_change": <number | null>
  },
  "diagnosis": "<MUST include quantitative metrics: inflammation_index X/10, pore_congestion_score Y%, lesion_type Z, Cook's Grade W. FORBIDDEN: generic phrases>",
  "verdict": "<CLEAR | POP | STOP | DOCTOR>",
  "top_concerns": [<string>, <string>, <string>]
}

CRITICAL: Calculate a DYNAMIC overall_score (40-95) based on actual skin metrics:
- Base score: 100
- Subtract points for each concern:
  * inflammation_index: -5 points per point
  * pore_congestion_score: -0.5 points per percentage
  * Active lesions: -10 points per papule, -15 per pustule, -20 per cyst
  * Wrinkles: -2 points per detected wrinkle area
  * Dark spots: -3 points per significant hyperpigmentation area
  * Uneven texture: -5 points for rough texture
- DO NOT return a fixed score like 65 - it must vary based on the analysis

Return ONLY valid JSON. No markdown, no code blocks, no explanations outside the JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `${isMultiAngleScan ? `Analyze these ${imageUrlsForAnalysis.length} dermatological images captured from multiple angles. ` : 'Analyze this dermatological image. '}${lensType === '15x' ? 'This image was captured with a 15x macro lens.' : ''} ${previousScanData ? 'Compare with previous scan data.' : ''}` 
            },
            ...imageUrlsForAnalysis.map((imgUrl: string) => ({
              type: "image_url" as const,
              image_url: { url: imgUrl }
            })),
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    let rawContent = response.choices[0].message.content || "{}";
    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(rawContent);
      
      // Calculate dynamic score if not provided
      if (!aiResult.overall_score && aiResult.inflammation_index !== undefined) {
        let calculatedScore = 100;
        calculatedScore -= (aiResult.inflammation_index || 0) * 5;
        calculatedScore -= (aiResult.pore_congestion_score || 0) * 0.5;
        const lesionCount = aiResult.lesion_count || 0;
        if (aiResult.lesion_type === 'Papule') calculatedScore -= lesionCount * 10;
        else if (aiResult.lesion_type === 'Pustule') calculatedScore -= lesionCount * 15;
        else if (aiResult.lesion_type === 'Cystic') calculatedScore -= lesionCount * 20;
        if (aiResult.skin_metrics?.wrinkle_severity) calculatedScore -= (aiResult.skin_metrics.wrinkle_severity / 10) * 2;
        if (aiResult.skin_metrics?.dark_spots_count) calculatedScore -= aiResult.skin_metrics.dark_spots_count * 3;
        if (aiResult.skin_metrics?.texture_score && aiResult.skin_metrics.texture_score < 50) calculatedScore -= 5;
        aiResult.overall_score = Math.max(40, Math.min(95, Math.round(calculatedScore)));
      }
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      aiResult = {
        inflammation_index: 0,
        pore_congestion_score: 0,
        lesion_type: "None",
        confidence_score: 0.0,
        overall_score: 75,
        diagnosis: "Analysis error - please retry scan.",
        verdict: "DOCTOR",
      };
    }

    const extractionEligible = aiResult.verdict === 'POP' ? 'Yes' : (aiResult.verdict === 'STOP' || aiResult.verdict === 'DOCTOR' ? 'No' : 'N/A');
    const triageLevel = aiResult.verdict === 'CLEAR' ? 'Routine' : 
                        aiResult.verdict === 'POP' ? 'Routine' :
                        aiResult.verdict === 'STOP' ? 'Urgent' : 'Critical';

    if (finalImageUrl) {
      const { error: dbError } = await supabase.from('scans').insert({
        image_url: finalImageUrl,
        user_email: userEmail || null,
        ai_diagnosis: aiResult.diagnosis || 'Analysis complete',
        ai_verdict: `${extractionEligible} - ${triageLevel} Triage`,
        ai_confidence: aiResult.confidence_score || 0,
        inflammation_index: aiResult.inflammation_index,
        pore_congestion_score: aiResult.pore_congestion_score,
        lesion_type: aiResult.lesion_type,
        gags_score: aiResult.gags_score,
        cooks_grade: aiResult.cooks_grade,
        fitzpatrick_scale: aiResult.fitzpatrick_scale,
        pih_risk: aiResult.pih_risk,
        treatment_protocol: aiResult.treatment_protocol,
        follicular_analysis: aiResult.follicular_analysis,
        comparison_data: aiResult.comparison_data,
        lens_type: lensType || null,
        skin_tone: skinTone || null,
      });

      if (dbError) {
        console.error("❌ Database Insert Error:", dbError);
      }
    }

    return NextResponse.json({
      diagnosis: aiResult.diagnosis || 'Analysis complete',
      verdict: `${extractionEligible} - ${triageLevel} Triage`,
      confidence: aiResult.confidence_score || 0,
      confidence_score: aiResult.confidence_score || 0,
      overall_score: aiResult.overall_score || 75,
      score: aiResult.overall_score || 75,
      ...aiResult,
    });

  } catch (error: any) {
    console.error("🔥 SERVER ERROR:", error);
    return NextResponse.json({ error: error.message || "Scan Failed" }, { status: 500 });
  }
}
