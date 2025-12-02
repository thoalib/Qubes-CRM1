-- =============================================
-- QUBES CRM + WORKSHOP INTEGRATION SCHEMA
-- =============================================
-- This extends the base CRM schema with workshop integration
-- Safe to run on existing database with workshop tables

-- =============================================
-- 1. CUSTOMERS TABLE (Master Database)
-- =============================================
-- This is the "All Data Area" - everyone who ever interacted

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  
  -- Source tracking
  first_source TEXT, -- 'workshop', 'quiz', 'website', 'academy_lead', 'agency_lead', 'referral'
  first_interaction_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Engagement metrics
  workshops_attended INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  payments_made INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  
  -- Current status
  is_active_lead BOOLEAN DEFAULT FALSE, -- True if currently in leads pipeline
  is_student BOOLEAN DEFAULT FALSE, -- True if enrolled in course
  current_lead_type TEXT, -- 'academy' or 'agency' if is_active_lead = true
  
  -- Timestamps
  last_activity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active_lead ON customers(is_active_lead);
CREATE INDEX IF NOT EXISTS idx_customers_last_activity ON customers(last_activity_date DESC);

-- =============================================
-- 2. CUSTOMER ACTIVITY LOG (Timeline)
-- =============================================
-- Complete timeline of ALL customer interactions

CREATE TABLE IF NOT EXISTS customer_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL, -- Denormalized for easier queries
  
  -- Activity details
  activity_type TEXT NOT NULL, 
  -- Types: 'workshop_registration', 'payment', 'quiz_completion', 
  --        'lead_created', 'lead_converted', 'course_enrolled', 
  --        'task_assigned', 'stage_changed', 'note_added'
  
  activity_title TEXT, -- Human-readable title
  activity_description TEXT, -- Details
  activity_data JSONB, -- Full data payload
  
  -- Related records
  workshop_id TEXT,
  lead_id UUID REFERENCES leads(id),
  student_id UUID REFERENCES students(id),
  task_id UUID REFERENCES tasks(id),
  payment_id BIGINT,
  registration_id BIGINT,
  
  -- Metadata
  amount NUMERIC, -- For payments
  created_by UUID REFERENCES profiles(id), -- Employee who created (if manual)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_customer ON customer_activity_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_activity_email ON customer_activity_log(customer_email);
CREATE INDEX IF NOT EXISTS idx_activity_type ON customer_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_date ON customer_activity_log(created_at DESC);

-- =============================================
-- 3. UPDATE EXISTING TABLES
-- =============================================

-- Link leads to customers
ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Link students to customers
ALTER TABLE students ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- =============================================
-- 4. TRIGGERS FOR AUTOMATIC CUSTOMER CREATION
-- =============================================

-- Trigger 1: Workshop Registration → Customer
CREATE OR REPLACE FUNCTION sync_registration_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Insert or update customer
  INSERT INTO customers (
    email,
    full_name,
    phone,
    first_source,
    workshops_attended,
    last_activity_date
  ) VALUES (
    NEW.email,
    NEW.full_name,
    NEW.phone_whatsapp,
    'workshop',
    1,
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    workshops_attended = customers.workshops_attended + 1,
    last_activity_date = GREATEST(customers.last_activity_date, NEW.created_at),
    updated_at = NOW()
  RETURNING id INTO v_customer_id;
  
  -- Log activity
  INSERT INTO customer_activity_log (
    customer_id,
    customer_email,
    activity_type,
    activity_title,
    activity_description,
    activity_data,
    workshop_id,
    registration_id,
    created_at
  ) VALUES (
    v_customer_id,
    NEW.email,
    'workshop_registration',
    'Registered for Workshop',
    'Registered for workshop: ' || COALESCE(NEW.workshop_id, 'Unknown'),
    jsonb_build_object(
      'workshop_id', NEW.workshop_id,
      'full_name', NEW.full_name,
      'field', NEW.your_field,
      'heard_from', NEW.heard_from
    ),
    NEW.workshop_id,
    NEW.id,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS registration_to_customer ON registrations;
CREATE TRIGGER registration_to_customer
  AFTER INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION sync_registration_to_customer();

-- Trigger 2: Payment → Customer Activity
CREATE OR REPLACE FUNCTION sync_payment_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Update customer
  UPDATE customers
  SET 
    payments_made = payments_made + 1,
    total_spent = total_spent + COALESCE(NEW.final_amount, 0),
    last_activity_date = NEW.created_at,
    updated_at = NOW()
  WHERE email = NEW.email
  RETURNING id INTO v_customer_id;
  
  -- Log activity
  IF v_customer_id IS NOT NULL THEN
    INSERT INTO customer_activity_log (
      customer_id,
      customer_email,
      activity_type,
      activity_title,
      activity_description,
      activity_data,
      workshop_id,
      payment_id,
      amount,
      created_at
    ) VALUES (
      v_customer_id,
      NEW.email,
      'payment',
      'Payment Completed',
      'Paid ₹' || NEW.final_amount || ' for workshop',
      jsonb_build_object(
        'razorpay_order_id', NEW.razorpay_order_id,
        'razorpay_payment_id', NEW.razorpay_payment_id,
        'status', NEW.status,
        'discount_amount', NEW.discount_amount,
        'final_amount', NEW.final_amount
      ),
      NEW.workshop_id,
      NEW.id,
      NEW.final_amount,
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_to_customer ON payments;
CREATE TRIGGER payment_to_customer
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_payment_to_customer();

-- Trigger 3: Quiz Response → Customer Activity
CREATE OR REPLACE FUNCTION sync_quiz_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Insert or update customer
  INSERT INTO customers (
    email,
    full_name,
    phone,
    first_source,
    quizzes_completed,
    last_activity_date
  ) VALUES (
    NEW.whatsapp || '@placeholder.com', -- Using WhatsApp as identifier
    NEW.name,
    NEW.whatsapp,
    'quiz',
    1,
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    quizzes_completed = customers.quizzes_completed + 1,
    last_activity_date = GREATEST(customers.last_activity_date, NEW.created_at),
    updated_at = NOW()
  RETURNING id INTO v_customer_id;
  
  -- Log activity
  INSERT INTO customer_activity_log (
    customer_id,
    customer_email,
    activity_type,
    activity_title,
    activity_description,
    activity_data,
    created_at
  ) VALUES (
    v_customer_id,
    NEW.whatsapp || '@placeholder.com',
    'quiz_completion',
    'Completed Quiz',
    'Identified as: ' || NEW.persona_name,
    jsonb_build_object(
      'persona_name', NEW.persona_name,
      'field', NEW.field,
      'role', NEW.role,
      'org', NEW.org,
      'notes', NEW.notes
    ),
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quiz_to_customer ON quiz_responses;
CREATE TRIGGER quiz_to_customer
  AFTER INSERT ON quiz_responses
  FOR EACH ROW
  EXECUTE FUNCTION sync_quiz_to_customer();

-- Trigger 4: Lead Creation → Customer Sync
CREATE OR REPLACE FUNCTION sync_lead_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
BEGIN
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

DROP TRIGGER IF EXISTS lead_to_customer ON leads;
CREATE TRIGGER lead_to_customer
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION sync_lead_to_customer();

-- Trigger 5: Student Enrollment → Customer Sync
CREATE OR REPLACE FUNCTION sync_student_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Update customer
  UPDATE customers
  SET 
    is_student = TRUE,
    last_activity_date = NEW.created_at,
    updated_at = NOW()
  WHERE email = NEW.email
  RETURNING id INTO v_customer_id;
  
  -- Update student with customer_id
  UPDATE students SET customer_id = v_customer_id WHERE id = NEW.id;
  
  -- Log activity
  IF v_customer_id IS NOT NULL THEN
    INSERT INTO customer_activity_log (
      customer_id,
      customer_email,
      activity_type,
      activity_title,
      activity_description,
      activity_data,
      student_id,
      created_at
    ) VALUES (
      v_customer_id,
      NEW.email,
      'course_enrolled',
      'Enrolled in Course',
      'Enrolled in: ' || NEW.course,
      jsonb_build_object(
        'course', NEW.course,
        'batch', NEW.batch,
        'status', NEW.status,
        'fee_paid', NEW.fee_paid,
        'fee_total', NEW.fee_total
      ),
      NEW.id,
      NEW.created_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS student_to_customer ON students;
CREATE TRIGGER student_to_customer
  AFTER INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_student_to_customer();

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to convert customer to lead
CREATE OR REPLACE FUNCTION convert_customer_to_lead(
  p_customer_id UUID,
  p_lead_type TEXT, -- 'academy' or 'agency'
  p_assigned_to UUID,
  p_source TEXT DEFAULT 'customer_database'
)
RETURNS UUID AS $$
DECLARE
  v_customer RECORD;
  v_lead_id UUID;
BEGIN
  -- Get customer details
  SELECT * INTO v_customer FROM customers WHERE id = p_customer_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;
  
  -- Create lead
  INSERT INTO leads (
    name,
    email,
    phone,
    type,
    stage,
    source,
    assigned_to,
    customer_id,
    is_active
  ) VALUES (
    v_customer.full_name,
    v_customer.email,
    v_customer.phone,
    p_lead_type,
    'new',
    p_source,
    p_assigned_to,
    p_customer_id,
    TRUE
  ) RETURNING id INTO v_lead_id;
  
  -- Update customer
  UPDATE customers
  SET 
    is_active_lead = TRUE,
    current_lead_type = p_lead_type,
    updated_at = NOW()
  WHERE id = p_customer_id;
  
  RETURN v_lead_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. VIEWS FOR EASY QUERYING
-- =============================================

-- Complete customer view with aggregated data
CREATE OR REPLACE VIEW customer_complete_view AS
SELECT 
  c.*,
  l.id AS active_lead_id,
  l.stage AS lead_stage,
  l.assigned_to AS lead_assigned_to,
  s.id AS student_id,
  s.course AS enrolled_course,
  s.status AS student_status,
  COUNT(DISTINCT cal.id) FILTER (WHERE cal.activity_type = 'workshop_registration') AS total_workshops,
  COUNT(DISTINCT cal.id) FILTER (WHERE cal.activity_type = 'payment') AS total_payments,
  MAX(cal.created_at) AS last_activity
FROM customers c
LEFT JOIN leads l ON c.id = l.customer_id AND l.is_active = TRUE
LEFT JOIN students s ON c.id = s.customer_id
LEFT JOIN customer_activity_log cal ON c.id = cal.customer_id
GROUP BY c.id, l.id, s.id;
