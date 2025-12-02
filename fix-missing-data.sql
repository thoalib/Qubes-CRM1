-- =============================================
-- DATA BACKFILL SCRIPT (FIXED)
-- =============================================
-- Run this script in your Supabase SQL Editor to sync existing data.

-- 1. Sync existing 'registrations' to 'customers' (Webinar Registrants)
-- We GROUP BY email to ensure each email is processed only once, preventing the "affect row a second time" error.
INSERT INTO customers (
    email, 
    full_name, 
    phone, 
    first_source, 
    workshops_attended, 
    last_activity_date, 
    created_at, 
    updated_at
)
SELECT 
    email, 
    MAX(full_name) as full_name, -- Take the latest name (lexicographically, or could be improved)
    MAX(phone_whatsapp) as phone, 
    'workshop', 
    COUNT(*) as workshops_attended, -- Count how many times they registered
    MAX(created_at) as last_activity_date, 
    MIN(created_at) as created_at, 
    NOW() as updated_at
FROM registrations
GROUP BY email
ON CONFLICT (email) DO UPDATE
SET 
    -- If customer exists, we ensure source is set and update activity
    -- We don't add workshops_attended to avoid potential double counting if run multiple times, 
    -- but we ensure it's at least the count we found.
    first_source = CASE WHEN customers.first_source IS NULL THEN 'workshop' ELSE customers.first_source END,
    workshops_attended = GREATEST(customers.workshops_attended, EXCLUDED.workshops_attended),
    last_activity_date = GREATEST(customers.last_activity_date, EXCLUDED.last_activity_date);

-- 2. Backfill 'customer_activity_log' (Detailed History)
-- This inserts a log entry for EVERY registration, so you can see exactly which webinars they attended.
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
)
SELECT 
    c.id,
    r.email,
    'workshop_registration',
    'Registered for Workshop',
    'Registered for workshop: ' || COALESCE(r.workshop_id, 'Unknown'),
    jsonb_build_object(
        'workshop_id', r.workshop_id,
        'full_name', r.full_name,
        'field', r.your_field,
        'heard_from', r.heard_from
    ),
    r.workshop_id,
    r.id,
    r.created_at
FROM registrations r
JOIN customers c ON r.email = c.email
WHERE NOT EXISTS (
    SELECT 1 FROM customer_activity_log cal 
    WHERE cal.registration_id = r.id
);

-- 3. Sync existing 'auth.users' to 'profiles' (Employees)
INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email), 
    'employee', 
    true, 
    created_at, 
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Verify counts
SELECT 'Customers' as table_name, count(*) FROM customers
UNION ALL
SELECT 'Activity Logs' as table_name, count(*) FROM customer_activity_log
UNION ALL
SELECT 'Profiles' as table_name, count(*) FROM profiles;
