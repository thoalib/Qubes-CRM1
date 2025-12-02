-- Simplified migration: Just add the columns
-- Run this in Supabase SQL Editor

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);

-- Migrate existing data from contact_details
UPDATE leads 
SET 
  name = contact_details->>'name',
  email = contact_details->>'email',
  phone = contact_details->>'phone'
WHERE contact_details IS NOT NULL 
  AND (name IS NULL OR email IS NULL OR phone IS NULL);
