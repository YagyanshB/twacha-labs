import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  let uploadedImagePaths: string[] = [];
  
  try {
    // Step A: Setup
    const supabase = createSupabaseServerClient();
    const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'undefined'
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;

    // Step B: Parse Input
    const { images, email } = await req.json();

    if (!images || !Array.isArray(images) || images.length !== 3) {
      return NextResponse.json({ 
        error: "Exactly 3 images are required (Center, Left, Right)" 
      }, { status: 400 });
    }

    // Step C: Upload Images to Supabase Storage
    if (supabase) {
      try {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const timestamp = Date.now();
        
        for (let i = 0; i < images.length; i++) {
          try {
            const image = images[i];
            // Remove data URL prefix if present
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            
            // Convert base64 to buffer
            const buffer = Buffer.from(base64Data, 'base64');
            
            // Generate file path
            const randomStr = Math.random().toString(36).substring(2, 8);
            const filePath = `raw/${dateStr}/scan_${timestamp}_${i}_${randomStr}.jpg`;
            
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('scans')
              .upload(filePath, buffer, {
                contentType: 'image/jpeg',
                upsert: false,
              });

            if (uploadError) {
              console.error(`❌ Failed to upload image ${i}:`, uploadError);
              // Continue even if upload fails
            } else {
              uploadedImagePaths.push(filePath);
              console.log(`✅ Uploaded image ${i} to: ${filePath}`);
            }
          } catch (imageError: any) {
            console.error(`❌ Error processing image ${i}:`, imageError);
            // Continue with next image
          }
        }
      } catch (storageError: any) {
        console.error('❌ Storage upload error (continuing with analysis):', storageError);
        // Don't block the user - continue with AI analysis
      }
    } else {
      console.warn('⚠️ Supabase not configured - skipping image upload');
    }

    // Step D: AI Analysis
    let aiResult: any = null;
    
    if (!openai) {
      console.log('⚠️ OPENAI_API_KEY not found - returning mock response');
      
      // Mock response
      const mockScore = Math.floor(Math.random() * 41) + 40; // 40-80
      let mockVerdict: string;
      let mockAnalysis: string;
      let mockRecommendation: string;
      let mockConfidence: number;

      if (mockScore < 50) {
        mockVerdict = 'STOP';
        mockAnalysis = 'Analysis of all three angles reveals significant skin barrier compromise. Deep inflammation and cystic formations detected across multiple facial zones. Immediate professional consultation recommended.';
        mockRecommendation = 'The Founder\'s Kit - Emergency Protocol';
        mockConfidence = 0.85;
      } else if (mockScore < 80) {
        mockVerdict = 'CAUTION';
        mockAnalysis = 'Moderate skin congestion observed across facial regions. Some areas show active inflammation and pore blockage. Targeted intervention recommended.';
        mockRecommendation = 'The Founder\'s Kit - Standard Protocol';
        mockConfidence = 0.75;
      } else {
        mockVerdict = 'POP';
        mockAnalysis = 'Minor surface-level concerns detected. Skin barrier largely intact with isolated whitehead formations. Preventive maintenance recommended.';
        mockRecommendation = 'The Founder\'s Kit - Maintenance Protocol';
        mockConfidence = 0.90;
      }

      aiResult = {
        score: mockScore,
        verdict: mockVerdict,
        analysis: mockAnalysis,
        recommendation: mockRecommendation,
        confidence: mockConfidence,
      };
    } else {
      // Format all 3 images for OpenAI
      const formattedImages = images.map((img: string) => 
        img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`
      );

      console.log("🚀 Sending 3-angle analysis request to OpenAI...");

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Senior Dermatologist. Analyze these 3 skin images (Center, Left, Right angles of the face). 
            Return strict JSON with fields:
            - "diagnosis" (string: detailed diagnosis)
            - "verdict" (string: "POP" | "STOP" | "CAUTION")
            - "reasoning" (string: clinical reasoning)
            - "confidence" (number: 0.0 to 1.0, your confidence in the diagnosis)
            - "score" (number: 0-100, Skin Integrity Score where 100 = Perfect, 0 = Severe Trauma)`
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: "Analyze these 3 facial angles for skin integrity. Provide diagnosis, verdict, reasoning, confidence, and score." 
              },
              { 
                type: "image_url", 
                image_url: { url: formattedImages[0] },
              },
              { 
                type: "image_url", 
                image_url: { url: formattedImages[1] },
              },
              { 
                type: "image_url", 
                image_url: { url: formattedImages[2] },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      console.log("🔍 Finish Reason:", response.choices[0].finish_reason);
      
      if (response.choices[0].finish_reason === 'content_filter') {
        console.error("❌ BLOCKED BY SAFETY FILTER");
        aiResult = {
          score: 0,
          verdict: "STOP",
          analysis: "Image flagged as sensitive/medical. Please consult a doctor.",
          recommendation: "Consult with a dermatologist for professional assessment.",
          confidence: 0.5,
        };
      } else {
        const content = response.choices[0].message.content;
        console.log("📄 Raw Content:", content);

        if (!content) {
          throw new Error("OpenAI returned empty content.");
        }

        const parsed = JSON.parse(content);
        
        // Map AI response to our format
        aiResult = {
          score: parsed.score || 50,
          verdict: parsed.verdict || 'CAUTION',
          analysis: parsed.diagnosis || parsed.reasoning || 'Analysis complete',
          recommendation: 'The Founder\'s Kit',
          confidence: parsed.confidence || 0.75,
        };
      }
    }

    // Step E: Log Data to Supabase
    if (supabase && uploadedImagePaths.length > 0) {
      try {
        const primaryImagePath = uploadedImagePaths[0]; // Use first image as primary
        
        const { error: dbError } = await supabase
          .from('scan_logs')
          .insert({
            image_path: primaryImagePath,
            ai_verdict: aiResult.verdict,
            ai_diagnosis: aiResult.analysis,
            ai_confidence: aiResult.confidence || 0.75,
            user_email: email || null,
          });

        if (dbError) {
          console.error('❌ Failed to log scan to database:', dbError);
          // Don't block the user - continue to return results
        } else {
          console.log('✅ Scan logged to database');
        }
      } catch (dbError: any) {
        console.error('❌ Database logging error (continuing):', dbError);
        // Don't block the user
      }
    } else {
      console.warn('⚠️ Supabase not configured or no images uploaded - skipping database log');
    }

    // Step F: Return Results
    return NextResponse.json({
      score: aiResult.score,
      verdict: aiResult.verdict,
      analysis: aiResult.analysis,
      recommendation: aiResult.recommendation,
      imagePath: uploadedImagePaths[0] || null, // Return primary image path for email update
    });

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ 
      error: "Scan Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
