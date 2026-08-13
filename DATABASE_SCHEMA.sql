-- Airanix CRM: Database Schema Migrations
-- Phase 1: Companies Table & Enhanced Contacts

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  industry TEXT,
  location TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Index on company name for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- 3. Add new columns to contacts table (if they don't exist)
-- Run these ALTER TABLE commands to add missing columns:

-- Add company_id as foreign key
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Add new contact fields
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);

-- 5. Migration helper: Populate company_id from existing company text field
-- This maintains backward compatibility with existing data
-- Uncomment and run ONCE to migrate existing data:
/*
INSERT INTO companies (name)
SELECT DISTINCT company FROM contacts
WHERE company IS NOT NULL AND company != ''
ON CONFLICT (name) DO NOTHING;

UPDATE contacts
SET company_id = companies.id
FROM companies
WHERE contacts.company = companies.name
AND contacts.company_id IS NULL;
*/

-- Note: After migration, you can optionally drop the old 'company' column:
-- ALTER TABLE contacts DROP COLUMN company;
-- For now, keeping it for backward compatibility
