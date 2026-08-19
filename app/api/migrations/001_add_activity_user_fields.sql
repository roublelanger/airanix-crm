-- Migration: Add user attribution and improved activity tracking
-- Date: 2026-08-19
-- Purpose: Enable ISR name display, exact timestamps, and better activity organization

-- Step 1: Add missing columns to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS (
  user_id UUID,                           -- WHO made this activity
  activity_type VARCHAR(50),              -- 'call', 'email', 'note', 'meeting'
  title VARCHAR(255),                     -- activity title
  tags TEXT[] DEFAULT '{}',               -- tags for organization
  metadata JSONB DEFAULT '{}',            -- flexible data per activity type
  is_deleted BOOLEAN DEFAULT false        -- soft delete support
);

-- Step 2: Add indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activities_user_id
ON activities(user_id);

CREATE INDEX IF NOT EXISTS idx_activities_contact_user_created
ON activities(contact_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_type
ON activities(activity_type);

-- Step 3: Improve contacts table with verification and engagement fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS (
  email_verified BOOLEAN DEFAULT false,           -- email verification status
  email_verified_at TIMESTAMP,                    -- when email was verified
  phone_verified BOOLEAN DEFAULT false,           -- phone verification status
  phone_verified_at TIMESTAMP,                    -- when phone was verified
  preferred_contact_method VARCHAR(50),           -- 'email', 'phone', 'sms'
  tags TEXT[] DEFAULT '{}',                       -- custom tags
  internal_notes TEXT,                            -- internal notes (not shared)
  last_activity_date TIMESTAMP,                   -- last contact/activity
  next_followup_date TIMESTAMP,                   -- scheduled followup
  engagement_score INT DEFAULT 0,                 -- 0-100 engagement rating
  contact_frequency VARCHAR(50)                   -- 'daily', 'weekly', 'monthly'
);

-- Step 4: Add index for contact lookups
CREATE INDEX IF NOT EXISTS idx_contacts_engagement
ON contacts(engagement_score DESC, last_activity_date DESC);

-- Step 5: Create activity_users junction table for better tracking
CREATE TABLE IF NOT EXISTS activity_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,  -- ISR who added activity
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by_user UUID,   -- which user created this record
  UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_users_activity
ON activity_users(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_users_user
ON activity_users(user_id);

-- Step 6: Add comments table for detailed activity notes
CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,  -- who wrote this comment
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_activity_comments_activity
ON activity_comments(activity_id, created_at DESC);

-- Step 7: Data migration - populate activity_type from existing data
UPDATE activities
SET activity_type = 'note'
WHERE activity_type IS NULL;

-- Step 8: Grant proper permissions
-- (Adjust these based on your user roles)
-- GRANT SELECT, INSERT, UPDATE ON activities TO authenticated;
-- GRANT SELECT ON activity_users TO authenticated;
-- GRANT SELECT ON activity_comments TO authenticated;

-- Verify migrations
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
ORDER BY ordinal_position;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'contacts'
ORDER BY ordinal_position;
