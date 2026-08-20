-- Migration: Add created_by_name to interactions table
-- Date: 2026-08-20
-- Purpose: Store ISR name for activity attribution and audit trail

-- Add created_by_name column if it doesn't exist
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_interactions_created_by_name
ON interactions(created_by_name);

-- Verify column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'interactions'
ORDER BY ordinal_position;
