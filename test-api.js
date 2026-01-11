/**
 * Simple API test script for /api/analyze endpoint
 * 
 * Usage:
 * 1. Start your dev server: npm run dev
 * 2. Run this script: node test-api.js
 * 
 * Make sure you have:
 * - GOOGLE_GENERATIVE_AI_API_KEY in your .env.local
 * - NEXT_PUBLIC_SUPABASE_URL in your .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in your .env.local
 */

const fs = require('fs');
const path = require('path');

// Read a sample image and convert to base64
// You can replace this with any image path
const getSampleImage = () => {
  // Try to find a sample image, or create a minimal test image
  const sampleImagePath = path.join(__dirname, 'public', 'next.svg');
  
  if (fs.existsSync(sampleImagePath)) {
    const imageBuffer = fs.readFileSync(sampleImagePath);
    const base64 = imageBuffer.toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
  
  // Create a minimal test image (1x1 pixel PNG)
  // This is a base64 encoded 1x1 transparent PNG
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
};

async function testAPI() {
  const imageData = getSampleImage();
  
  console.log('🧪 Testing /api/analyze endpoint...\n');
  console.log('📸 Using sample image (base64 length:', imageData.length, 'chars)\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [imageData],
        age: '25-29',
        skinType: 'combination',
      }),
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ API Response Success!\n');
      console.log('Response Data:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check for expected fields
      const expectedFields = ['gags_score', 'triage_level', 'extraction_eligible', 'analysis_summary', 'ai_confidence'];
      const missingFields = expectedFields.filter(field => !(field in result));
      
      if (missingFields.length > 0) {
        console.log('\n⚠️  Warning: Missing expected fields:', missingFields);
      } else {
        console.log('\n✅ All expected fields present!');
      }
    } else {
      console.log('\n❌ API Error Response:');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('\n🔥 Error testing API:');
    console.error('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure your dev server is running:');
      console.error('   npm run dev');
    } else if (error.message.includes('fetch')) {
      console.error('\n💡 Tip: Check if the server is running on http://localhost:3000');
    }
    
    process.exit(1);
  }
}

// Run the test
testAPI();
