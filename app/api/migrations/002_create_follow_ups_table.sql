-- Migration: Create Follow-ups management table
-- Date: 2026-08-20
-- Purpose: Enable scheduling and tracking of follow-up calls/activities

CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES interactions(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  assigned_to_user_id UUID,
  activity_type VARCHAR(50) DEFAULT 'call', -- call, email, meeting, etc.
  description TEXT,
  priority VARCHAR(20) DEFAULT 'normal', -- high, normal, low
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled, rescheduled
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_follow_ups_scheduled_date
ON follow_ups(scheduled_date DESC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_contact_id
ON follow_ups(contact_id);

CREATE INDEX IF NOT EXISTS idx_follow_ups_status
ON follow_ups(status);

CREATE INDEX IF NOT EXISTS idx_follow_ups_assigned_user
ON follow_ups(assigned_to_user_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_follow_ups_date_status
ON follow_ups(scheduled_date, status);

-- Verify table creation
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'follow_ups'
ORDER BY ordinal_position;
