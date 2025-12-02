-- =============================================
-- ENHANCED LEADS TABLE WITH CUSTOM FIELDS
-- =============================================

-- Update existing leads table with additional fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS place TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS current_education TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interest_level TEXT CHECK (interest_level IN ('hot', 'warm', 'cold', 'not_interested'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS decision_timeline TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS best_time_to_call TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS language_preference TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS total_calls_made INTEGER DEFAULT 0;

-- =============================================
-- LEAD NOTES TABLE (For detailed tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Note details
  note_type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'general'
  note_title TEXT,
  note_content TEXT NOT NULL,
  
  -- Call-specific fields
  call_duration INTEGER, -- in minutes
  call_outcome TEXT, -- 'answered', 'no_answer', 'voicemail', 'busy'
  interest_level TEXT, -- 'hot', 'warm', 'cold', 'not_interested'
  objections TEXT[], -- Array of objections raised
  
  -- Follow-up
  requires_follow_up BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_reason TEXT,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_date ON lead_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_notes_follow_up ON lead_notes(follow_up_date) WHERE requires_follow_up = TRUE;

-- =============================================
-- CALL LOG TABLE (Detailed call tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id),
  
  -- Call details
  call_date TIMESTAMPTZ DEFAULT NOW(),
  call_duration INTEGER, -- in minutes
  call_outcome TEXT NOT NULL, -- 'answered', 'no_answer', 'voicemail', 'busy', 'wrong_number'
  
  -- Assessment during call
  interest_level TEXT, -- 'hot', 'warm', 'cold', 'not_interested'
  current_education TEXT,
  place TEXT,
  budget_discussed BOOLEAN DEFAULT FALSE,
  budget_range TEXT,
  
  -- Conversation notes
  summary TEXT,
  objections TEXT[],
  questions_asked TEXT[],
  
  -- Next steps
  next_action TEXT, -- 'follow_up', 'send_info', 'schedule_demo', 'close', 'disqualify'
  next_follow_up_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_lead ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_employee ON call_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_date ON call_logs(call_date DESC);

-- =============================================
-- TRIGGER: Update lead after call
-- =============================================

CREATE OR REPLACE FUNCTION update_lead_after_call()
RETURNS TRIGGER AS $$
BEGIN
  -- Update lead with latest call information
  UPDATE leads
  SET 
    last_contacted_at = NEW.call_date,
    total_calls_made = total_calls_made + 1,
    interest_level = COALESCE(NEW.interest_level, interest_level),
    place = COALESCE(NEW.place, place),
    current_education = COALESCE(NEW.current_education, current_education),
    budget_range = COALESCE(NEW.budget_range, budget_range),
    next_follow_up_date = COALESCE(NEW.next_follow_up_date, next_follow_up_date),
    updated_at = NOW()
  WHERE id = NEW.lead_id;
  
  -- Log activity
  INSERT INTO customer_activity_log (
    customer_id,
    customer_email,
    activity_type,
    activity_title,
    activity_description,
    activity_data,
    lead_id,
    created_by,
    created_at
  )
  SELECT 
    l.customer_id,
    l.email,
    'call_made',
    'Call: ' || NEW.call_outcome,
    NEW.summary,
    jsonb_build_object(
      'call_outcome', NEW.call_outcome,
      'duration', NEW.call_duration,
      'interest_level', NEW.interest_level,
      'next_action', NEW.next_action
    ),
    NEW.lead_id,
    NEW.employee_id,
    NEW.call_date
  FROM leads l
  WHERE l.id = NEW.lead_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS call_log_update_lead ON call_logs;
CREATE TRIGGER call_log_update_lead
  AFTER INSERT ON call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_after_call();

-- =============================================
-- VIEWS FOR EMPLOYEE DASHBOARD
-- =============================================

-- My Leads View (for employees)
CREATE OR REPLACE VIEW my_leads_view AS
SELECT 
  l.*,
  c.full_name AS customer_full_name,
  c.workshops_attended,
  c.total_spent,
  p.full_name AS assigned_employee_name,
  COUNT(DISTINCT cl.id) AS total_calls,
  MAX(cl.call_date) AS last_call_date,
  CASE 
    WHEN l.next_follow_up_date < CURRENT_DATE THEN 'overdue'
    WHEN l.next_follow_up_date = CURRENT_DATE THEN 'today'
    WHEN l.next_follow_up_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'upcoming'
    ELSE 'scheduled'
  END AS follow_up_status
FROM leads l
LEFT JOIN customers c ON l.customer_id = c.id
LEFT JOIN profiles p ON l.assigned_to = p.id
LEFT JOIN call_logs cl ON l.id = cl.lead_id
GROUP BY l.id, c.id, p.id;

-- Hot Leads View
CREATE OR REPLACE VIEW hot_leads_view AS
SELECT * FROM my_leads_view
WHERE interest_level = 'hot'
  AND stage NOT IN ('enrolled', 'not_pursuing')
ORDER BY next_follow_up_date ASC NULLS LAST;

-- Follow-up Due View
CREATE OR REPLACE VIEW follow_up_due_view AS
SELECT * FROM my_leads_view
WHERE next_follow_up_date <= CURRENT_DATE
  AND stage NOT IN ('enrolled', 'not_pursuing')
ORDER BY next_follow_up_date ASC;
