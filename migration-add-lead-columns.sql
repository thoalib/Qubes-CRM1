-- Add name, email, phone columns to leads table for easier access
-- These will duplicate data from contact_details JSONB for query performance

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);

-- Optional: Migrate existing data from contact_details to new columns
UPDATE leads 
SET 
  name = contact_details->>'name',
  email = contact_details->>'email',
  phone = contact_details->>'phone'
WHERE contact_details IS NOT NULL;

-- Create a trigger to keep the columns in sync with contact_details
CREATE OR REPLACE FUNCTION sync_lead_contact_details()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract from contact_details if it exists
  IF NEW.contact_details IS NOT NULL THEN
    NEW.name = NEW.contact_details->>'name';
    NEW.email = NEW.contact_details->>'email';
    NEW.phone = NEW.contact_details->>'phone';
  END IF;
  
  -- Also update contact_details if direct columns are set
  IF NEW.name IS NOT NULL OR NEW.email IS NOT NULL OR NEW.phone IS NOT NULL THEN
    NEW.contact_details = jsonb_build_object(
      'name', COALESCE(NEW.name, NEW.contact_details->>'name'),
      'email', COALESCE(NEW.email, NEW.contact_details->>'email'),
      'phone', COALESCE(NEW.phone, NEW.contact_details->>'phone')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_lead_contact_details_trigger ON leads;
CREATE TRIGGER sync_lead_contact_details_trigger
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION sync_lead_contact_details();
