# Database Schema Update Summary

All database queries have been updated to match your actual Supabase schema.

---

## ✅ Changes Made

### 1. **app/analysis/page.tsx** - Scan Saving

**Before:**
```typescript
.insert({
  user_id: user.id,
  image_url: data.imageUrl,
  status: 'completed',
  overall_score: result.overallScore,
  // ... other scores
  skin_type: result.skinType,
  summary: result.summary,
  analyzed_at: new Date().toISOString(),
})
```

**After:**
```typescript
.insert({
  user_id: user.id,
  image_url: data.imageUrl,
  status: 'completed',
  overall_score: result.overallScore,
  // ... other scores
  skin_type: result.skinType,
  summary: result.summary,
  analysis: result, // ✅ NEW: Store full GPT-4o response as jsonb
  analyzed_at: new Date().toISOString(),
})
```

**Changes:**
- ✅ Added `analysis` field (jsonb) to store full GPT-4o response
- ✅ Added `extractIngredient()` helper to extract active ingredients from recommendations
- ✅ Added `ingredient` field when saving recommendations
- ✅ Removed manual `increment_scan_count` RPC call (handled by DB trigger)

---

### 2. **app/api/analyze/route.ts** - Legacy Acne Analysis

**Before:**
```typescript
.insert({
  image_url: imageUrl,
  user_id: userId,
  ai_diagnosis: fullDiagnosis,  // ❌ Old field
  ai_verdict: aiVerdict,        // ❌ Old field
  ai_confidence: aiResult.ai_confidence
})
```

**After:**
```typescript
.insert({
  image_url: imageUrl,
  user_id: userId,
  status: 'completed',
  summary: aiResult.summary,           // ✅ Correct field
  verdict: verdict,                    // ✅ Correct field
  confidence: aiResult.ai_confidence,  // ✅ Correct field
  analysis: aiResult,                  // ✅ NEW: Store full AI response
  analyzed_at: new Date().toISOString(),
})
```

**Changes:**
- ✅ Changed `ai_diagnosis` → `summary`
- ✅ Changed `ai_verdict` → `verdict`
- ✅ Changed `ai_confidence` → `confidence`
- ✅ Added `analysis` jsonb field
- ✅ Added `status` and `analyzed_at` fields
- ✅ Removed manual `increment_scan_count` call

---

### 3. **hooks/useRealtimeScores.ts** - Dashboard Data

**Before:**
```typescript
const { data: scans } = await supabase
  .from('scans')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'completed')
  .order('created_at', { ascending: false })
  .limit(2);
```

**After:**
```typescript
const { data: scans } = await supabase
  .from('scans')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'completed')
  .is('deleted_at', null)  // ✅ NEW: Exclude soft-deleted scans
  .order('created_at', { ascending: false })
  .limit(2);
```

**Changes:**
- ✅ Added `.is('deleted_at', null)` to filter out soft-deleted scans
- ✅ All column names already matched schema (no changes needed)

---

### 4. **hooks/useScanAllowance.ts** - Scan Limits

**Before:**
```typescript
const { data } = await supabase
  .rpc('check_scan_allowance', { p_user_id: user.id })  // ❌ Wrong parameter
```

**After:**
```typescript
const { data } = await supabase
  .rpc('check_scan_allowance', { user_id: user.id })  // ✅ Correct parameter
```

**Changes:**
- ✅ Fixed RPC function parameter: `p_user_id` → `user_id`

---

## 📊 Schema Alignment Summary

### Scans Table
| Field | Status | Usage |
|-------|--------|-------|
| `id` | ✅ Used | Primary key |
| `user_id` | ✅ Used | Foreign key to auth.users |
| `image_url` | ✅ Used | Supabase storage URL |
| `status` | ✅ Used | 'pending', 'processing', 'completed', 'failed' |
| `overall_score` | ✅ Used | 0-100 |
| `hydration_score` | ✅ Used | 0-100 |
| `oil_control_score` | ✅ Used | 0-100 |
| `pore_health_score` | ✅ Used | 0-100 |
| `texture_score` | ✅ Used | 0-100 |
| `clarity_score` | ✅ Used | 0-100 |
| `skin_type` | ✅ Used | 'oily', 'dry', 'combination', 'normal' |
| `summary` | ✅ Used | User-friendly text summary |
| `verdict` | ✅ Used | Analysis verdict (legacy API) |
| `confidence` | ✅ Used | AI confidence level (legacy API) |
| `analysis` | ✅ Used | Full GPT-4o response (jsonb) |
| `analyzed_at` | ✅ Used | Timestamp of analysis |
| `created_at` | ✅ Used | Auto-set on insert |
| `updated_at` | ✅ Used | Auto-updated by trigger |
| `deleted_at` | ✅ Used | Soft delete (filtered in queries) |
| `data_consent` | ⚠️ Not Used | Available for future use |

### Scan Issues Table
| Field | Status | Usage |
|-------|--------|-------|
| `id` | ✅ Used | Primary key |
| `scan_id` | ✅ Used | Foreign key to scans |
| `issue_type` | ✅ Used | 'blackheads', 'acne', 'enlarged_pores', etc. |
| `severity` | ✅ Used | 'mild', 'moderate', 'severe' |
| `location` | ✅ Used | 'T-zone', 'cheeks', 'forehead', etc. |
| `count` | ✅ Used | For countable issues |
| `affected_area_percent` | ⚠️ Not Used | Available for future use |
| `created_at` | ✅ Used | Auto-set on insert |

### Recommendations Table
| Field | Status | Usage |
|-------|--------|-------|
| `id` | ✅ Used | Primary key |
| `scan_id` | ✅ Used | Foreign key to scans |
| `priority` | ✅ Used | 'high', 'medium', 'low' |
| `title` | ✅ Used | Recommendation title |
| `description` | ✅ Used | Recommendation details |
| `ingredient` | ✅ Used | Extracted active ingredient |
| `created_at` | ✅ Used | Auto-set on insert |

### Profiles Table
| Field | Status | Usage |
|-------|--------|-------|
| `id` | ✅ Used | Primary key (auth.users.id) |
| `email` | ✅ Used | From auth |
| `total_scans` | ✅ Used | Auto-updated by trigger |
| `current_streak` | ✅ Used | Auto-updated by trigger |
| `monthly_scans_used` | ✅ Used | Used by check_scan_allowance |
| `scans_reset_date` | ✅ Used | Used by check_scan_allowance |
| `is_premium` | ✅ Used | Used by check_scan_allowance |
| `onboarding_completed` | ✅ Used | Checked in auth callback |
| `created_at` | ✅ Used | Member since date |
| `full_name` | ⚠️ Not Used | Available for future use |
| `skin_goals` | ⚠️ Not Used | Available for future use |
| `primary_goal` | ⚠️ Not Used | Available for future use |
| `longest_streak` | ⚠️ Not Used | Available for future use |
| `last_scan_date` | ⚠️ Not Used | Available for future use |
| `avatar_url` | ⚠️ Not Used | Available for future use |
| `updated_at` | ✅ Used | Auto-updated by trigger |

---

## 🎯 Database Functions Used

### `check_scan_allowance(user_id)`
- ✅ Called in `hooks/useScanAllowance.ts`
- ✅ Parameter name fixed: `user_id` (not `p_user_id`)
- Returns: `{ scans_used, scans_remaining, is_premium, can_scan, limit }`

### Auto-Triggers (No Manual Calls Needed)
- ✅ **New user signup** → Auto-creates profile
- ✅ **Scan completed** → Auto-updates `total_scans`, `current_streak`, `monthly_scans_used`

### Not Yet Used (Available for Future)
- `check_ai_chat_allowance(user_id)` - For AI chat feature
- `get_dashboard_stats(user_id)` - Single query for all dashboard data

---

## 🔍 What to Verify

1. **Run the app and complete a scan:**
   - ✅ Scan should save with all fields
   - ✅ Issues should save correctly
   - ✅ Recommendations should save with ingredients
   - ✅ Dashboard should show real data

2. **Check database after scan:**
   ```sql
   -- Should see scan with analysis jsonb
   SELECT id, user_id, overall_score, analysis
   FROM scans
   WHERE status = 'completed'
   ORDER BY created_at DESC
   LIMIT 1;

   -- Should see issues
   SELECT * FROM scan_issues
   WHERE scan_id = '<your_scan_id>';

   -- Should see recommendations with ingredients
   SELECT * FROM recommendations
   WHERE scan_id = '<your_scan_id>';

   -- Profile should auto-update
   SELECT total_scans, current_streak, monthly_scans_used
   FROM profiles
   WHERE id = '<your_user_id>';
   ```

3. **Test soft delete:**
   - Soft delete a scan: `UPDATE scans SET deleted_at = NOW() WHERE id = 'xxx'`
   - ✅ Dashboard should not show deleted scan
   - ✅ Latest scan should skip deleted ones

---

## ✨ Next Steps

All database queries are now aligned with your schema! The codebase is ready to use all the features you've set up:

- ✅ Scan saving with full GPT-4o analysis
- ✅ Issue detection and tracking
- ✅ Personalized recommendations with ingredients
- ✅ Profile stats auto-update
- ✅ Soft delete support
- ✅ Real-time dashboard updates

**Available for future implementation:**
- AI chat (use `ai_chat_messages` table + `check_ai_chat_allowance`)
- Advanced onboarding (use `skin_goals`, `primary_goal` fields)
- User profiles (use `full_name`, `avatar_url` fields)
- Progress tracking (use `longest_streak`, `last_scan_date`)
- Affected area percentage for issues

---

**All schema updates committed and pushed!** 🚀
