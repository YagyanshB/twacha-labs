import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length !== 3) {
      return NextResponse.json({ 
        error: "Exactly 3 images are required (Center, Left, Right)" 
      }, { status: 400 });
    }

    // Check if API key is configured - if not, return mock response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'undefined') {
      console.log('⚠️ OPENAI_API_KEY not found - returning mock response');
      
      // Mock response with random score between 40-80
      const mockScore = Math.floor(Math.random() * 41) + 40; // 40-80
      let mockVerdict: string;
      let mockAnalysis: string;
      let mockRecommendation: string;

      if (mockScore < 50) {
        mockVerdict = 'STOP';
        mockAnalysis = 'Analysis of all three angles reveals significant skin barrier compromise. Deep inflammation and cystic formations detected across multiple facial zones. Immediate professional consultation recommended.';
        mockRecommendation = 'The Founder\'s Kit - Emergency Protocol';
      } else if (mockScore < 80) {
        mockVerdict = 'CAUTION';
        mockAnalysis = 'Moderate skin congestion observed across facial regions. Some areas show active inflammation and pore blockage. Targeted intervention recommended.';
        mockRecommendation = 'The Founder\'s Kit - Standard Protocol';
      } else {
        mockVerdict = 'POP';
        mockAnalysis = 'Minor surface-level concerns detected. Skin barrier largely intact with isolated whitehead formations. Preventive maintenance recommended.';
        mockRecommendation = 'The Founder\'s Kit - Maintenance Protocol';
      }

      return NextResponse.json({
        score: mockScore,
        verdict: mockVerdict,
        analysis: mockAnalysis,
        recommendation: mockRecommendation,
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Format all 3 images
    const formattedImages = images.map((img: string) => 
      img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`
    );

    console.log("🚀 Sending 3-angle analysis request to OpenAI...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Dermatological Triage AI. Analyze these 3 angles of the user's face (Center, Left, Right). 
          Calculate a Skin Integrity Score from 0 to 100 (100 = Perfect, 0 = Severe Trauma).
          
          Scoring Guidelines:
          - Score < 50: Action STOP (Cystic/Severe) - Deep inflammation, cystic acne, severe trauma
          - Score 50-80: Action CAUTION (Congested) - Moderate congestion, blackheads, mild inflammation
          - Score > 80: Action POP (Minor Whiteheads only) - Minor whiteheads, surface-level issues
          
          Return a valid JSON object with fields: 
          - 'score' (number 0-100)
          - 'verdict' (string: 'STOP', 'CAUTION', or 'POP')
          - 'analysis' (string: detailed analysis of all 3 angles)
          - 'recommendation' (string: specific protocol recommendation)`
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze these 3 facial angles for skin integrity. Provide score, verdict, analysis, and recommendation." 
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

    // --- DEBUGGING LOGS ---
    console.log("🔍 Finish Reason:", response.choices[0].finish_reason);
    
    if (response.choices[0].finish_reason === 'content_filter') {
      console.error("❌ BLOCKED BY SAFETY FILTER");
      return NextResponse.json({ 
        score: 0,
        verdict: "STOP", 
        analysis: "Image flagged as sensitive/medical. Please consult a doctor.",
        recommendation: "Consult with a dermatologist for professional assessment."
      });
    }

    const content = response.choices[0].message.content;
    console.log("📄 Raw Content:", content);

    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }

    const result = JSON.parse(content);
    
    // Validate response structure
    if (typeof result.score !== 'number' || !result.verdict || !result.analysis || !result.recommendation) {
      throw new Error("Invalid response format from AI");
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ 
      error: "Scan Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
