# Testing the API Locally

There are two ways to test the `/api/analyze` endpoint locally:

## Method 1: HTML Test Interface (Recommended)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open the test HTML file in your browser:**
   - Navigate to: `http://localhost:3000/test-api.html`

3. **Test the API:**
   - Click "Choose an image file" and select a skin photo
   - Select age range and skin type
   - Click "Test API"
   - View the response in the result panel

## Method 2: Command Line Script

1. **Start your dev server in one terminal:**
   ```bash
   npm run dev
   ```

2. **Run the test script in another terminal:**
   ```bash
   npm run test:api
   ```
   
   Or directly:
   ```bash
   node test-api.js
   ```

## Environment Variables Required

Make sure you have these in your `.env.local` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Expected Response Format

The API should return a JSON object with these fields:

```json
{
  "gags_score": 0-44,
  "triage_level": "Routine" | "Monitor" | "Referral",
  "extraction_eligible": true | false,
  "analysis_summary": "string",
  "ai_confidence": 0.0-1.0,
  "imageUrls": ["url1", "url2"],
  "imagePath": "url"
}
```

## Troubleshooting

- **Connection Refused**: Make sure `npm run dev` is running
- **401/403 Errors**: Check your API keys in `.env.local`
- **500 Errors**: Check server logs for detailed error messages
- **Empty Response**: Verify the image format is valid (JPG, PNG, WebP)
