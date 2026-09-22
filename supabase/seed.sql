-- =============================================================================
-- NAGARSAATHI AI — SUPABASE POSTGRESQL SEED DATA
-- Fictional Nagpur / Ashi Nagar Demonstration Records
-- =============================================================================

-- 1. Seed Departments
INSERT INTO public.departments (name, code, default_sla_hours)
VALUES 
    ('Road Department', 'ROAD', 24),
    ('Water Department', 'WATER', 24),
    ('Garbage Department', 'GARBAGE', 12),
    ('Drainage Department', 'DRAINAGE', 24),
    ('Streetlight Department', 'STREETLIGHT', 24),
    ('Electricity Department', 'ELECTRICITY', 12),
    ('General Public Grievance', 'OTHER', 48)
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Demo Department Works (Demonstrates Conflict Detection within 35m)
INSERT INTO public.department_works (department_id, title, work_type, latitude, longitude, start_date, end_date, status)
VALUES 
    (
        (SELECT id FROM public.departments WHERE code = 'ROAD' LIMIT 1),
        'Asphalt Road Resurfacing & Bitumen Laying',
        'Road Construction',
        21.1735,
        79.1160,
        NOW(),
        NOW() + INTERVAL '7 days',
        'IN_PROGRESS'
    ),
    (
        (SELECT id FROM public.departments WHERE code = 'WATER' LIMIT 1),
        'Main Water Supply Pipeline Trench Excavation',
        'Pipeline Trenching',
        21.1737,
        79.1162,
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '8 days',
        'SCHEDULED'
    ),
    (
        (SELECT id FROM public.departments WHERE code = 'ELECTRICITY' LIMIT 1),
        'Underground Power Cable Duct Laying',
        'Cable Installation',
        21.1205,
        79.0605,
        NOW() + INTERVAL '10 days',
        NOW() + INTERVAL '15 days',
        'SCHEDULED'
    );
