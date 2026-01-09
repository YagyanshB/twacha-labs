# Vercel Deployment Checklist

## Environment Variables Required

Make sure to set these in your Vercel project settings:

### Required Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o analysis

### Optional (if using client-side Supabase):
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Build Configuration

✅ **Next.js Config**: Optimized for Vercel with:
- TensorFlow.js package optimization
- Image remote patterns configured
- TypeScript build errors ignored (for development)

✅ **Build Command**: `NODE_OPTIONS='--max-old-space-size=4096' next build`
- Already configured in package.json

✅ **Output Directory**: `.next` (default, Vercel handles automatically)

## Deployment Notes

1. **TensorFlow.js**: The face detection libraries are optimized for client-side use. They will be bundled automatically by Vercel.

2. **API Routes**: All API routes are serverless functions that will work automatically on Vercel.

3. **Supabase Storage**: Ensure the `scan-images` bucket exists and has proper permissions.

4. **Database**: Ensure the `scans` table exists in Supabase with the correct schema.

## Post-Deployment

After deploying, verify:
- [ ] Camera permissions work on mobile devices
- [ ] Face detection loads correctly
- [ ] API routes respond correctly
- [ ] Supabase storage uploads work
- [ ] OpenAI API calls succeed

## Language Updates

All medical/clinical language has been updated to cosmetic-focused:
- ✅ API route: Changed from "Dermatological Triage AI" to "Cosmetic Skin Analysis AI"
- ✅ Scanner component: "Diagnosis" → "Cosmetic Assessment"
- ✅ Layout metadata: Removed "Clinical-grade" language
- ✅ Product section: Removed "Clinical-grade hardware" language
