-- Fix the lead_to_customer trigger to use the new name, email, phone columns
-- Run this AFTER running migration-add-lead-columns-simple.sql

CREATE OR REPLACE FUNCTION sync_lead_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Only sync if email is provided
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insert or update customer
  INSERT INTO customers (
    email,
    full_name,
    phone,
    first_source,
    is_active_lead,
    current_lead_type,
    last_activity_date
  ) VALUES (
    NEW.email,
    NEW.name,
    NEW.phone,
    COALESCE(NEW.source, 'direct_lead'),
    TRUE,
    NEW.type,
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    is_active_lead = TRUE,
    current_lead_type = NEW.type,
    last_activity_date = GREATEST(customers.last_activity_date, NEW.created_at),
    updated_at = NOW()
  RETURNING id INTO v_customer_id;
  
  -- Update lead with customer_id
  UPDATE leads SET customer_id = v_customer_id WHERE id = NEW.id;
  
  -- Log activity
  INSERT INTO customer_activity_log (
    customer_id,
    customer_email,
    activity_type,
    activity_title,
    activity_description,
    activity_data,
    lead_id,
    created_at
  ) VALUES (
    v_customer_id,
    NEW.email,
    'lead_created',
    'Added as ' || UPPER(NEW.type) || ' Lead',
    'Lead stage: ' || NEW.stage,
    jsonb_build_object(
      'type', NEW.type,
      'stage', NEW.stage,
      'source', NEW.source,
      'assigned_to', NEW.assigned_to
    ),
    NEW.id,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
