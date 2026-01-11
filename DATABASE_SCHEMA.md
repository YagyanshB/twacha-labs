# Database Schema Requirements for GDPR Compliance

## Right to Erasure (Article 17 GDPR)

To fulfill GDPR "Right to Erasure" requests, the `scans` table must include a `deleted_at` column for soft deletion.

### Required Schema Update

```sql
-- Add deleted_at column to scans table
ALTER TABLE scans 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Create index for efficient queries
CREATE INDEX idx_scans_deleted_at ON scans(deleted_at) 
WHERE deleted_at IS NULL;

-- Optional: Add updated_at for audit trail
ALTER TABLE scans 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### Implementation Notes

1. **Soft Delete Pattern**: Use `deleted_at` instead of hard deletion to:
   - Maintain audit trail
   - Allow data recovery if needed
   - Support compliance reporting

2. **Query Filtering**: Always filter out deleted records:
   ```sql
   SELECT * FROM scans 
   WHERE deleted_at IS NULL 
   AND user_id = $1;
   ```

3. **Admin Deletion Endpoint**: Create an admin API endpoint to set `deleted_at`:
   ```typescript
   // Example: /api/admin/scans/[id]/delete
   await supabase
     .from('scans')
     .update({ deleted_at: new Date().toISOString() })
     .eq('id', scanId)
     .eq('user_id', userId);
   ```

4. **Data Retention Policy**: Consider implementing automatic hard deletion after a retention period:
   ```sql
   -- Example: Hard delete after 7 years (if legally required)
   DELETE FROM scans 
   WHERE deleted_at IS NOT NULL 
   AND deleted_at < NOW() - INTERVAL '7 years';
   ```

### Current Schema (Reference)

The `scans` table should include:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `image_url` (TEXT, Supabase Storage URL)
- `ai_diagnosis` (TEXT, clinical report)
- `ai_verdict` (TEXT, extraction eligibility + triage)
- `ai_confidence` (FLOAT, 0.0-1.0)
- `created_at` (TIMESTAMP, auto-generated)
- `deleted_at` (TIMESTAMP, NULL by default) ← **REQUIRED FOR GDPR**

### Migration Script

Run this migration in your Supabase SQL editor:

```sql
-- Migration: Add GDPR compliance columns
BEGIN;

-- Add deleted_at column
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Add updated_at column for audit trail
ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_scans_deleted_at 
ON scans(deleted_at) 
WHERE deleted_at IS NULL;

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_scans_updated_at ON scans;
CREATE TRIGGER update_scans_updated_at
    BEFORE UPDATE ON scans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### Admin API Endpoint Example

Create `/app/api/admin/scans/[id]/delete/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const scanId = params.id;

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('scans')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', scanId);

    if (error) {
      console.error('Deletion error:', error);
      return NextResponse.json({ error: "Failed to delete scan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Scan marked for deletion" });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Notes

- **Right to Erasure**: Users can request deletion via privacy@twachalabs.com
- **Processing Time**: GDPR requires fulfillment within 30 days
- **Verification**: Always verify user identity before deletion
- **Backup Policy**: Consider backup retention for legal/compliance requirements
