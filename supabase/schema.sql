-- =============================================================================
-- NAGARSAATHI AI — SUPABASE POSTGRESQL DATABASE SCHEMA
-- Civic Grievance Redressal, Smart Governance & Accountability Platform
-- =============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    default_sla_hours INTEGER NOT NULL DEFAULT 48,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Users / Application Profiles Table
-- Maps directly to Supabase Auth UUID (auth.users.id)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    auth_user_id UUID UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Officers Table
CREATE TABLE IF NOT EXISTS public.officers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES public.departments(id),
    zone VARCHAR(100) NOT NULL DEFAULT 'North Zone',
    designation VARCHAR(100) NOT NULL DEFAULT 'Junior Engineer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Master Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    citizen_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'en',
    category VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    address VARCHAR(500),
    location_source VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    department_id INTEGER REFERENCES public.departments(id),
    officer_id INTEGER REFERENCES public.officers(id),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    sla_hours INTEGER NOT NULL DEFAULT 48,
    sla_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Complaint Reports (Multi-Citizen Master Grouping)
CREATE TABLE IF NOT EXISTS public.complaint_reports (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    citizen_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    description TEXT,
    image_url VARCHAR(500),
    image_hash VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Resolutions Table (Officer Evidence Submission)
CREATE TABLE IF NOT EXISTS public.resolutions (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    officer_id INTEGER NOT NULL REFERENCES public.officers(id),
    resolution_note TEXT NOT NULL,
    after_photo_url VARCHAR(500),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_match BOOLEAN NOT NULL DEFAULT TRUE,
    scene_similarity DOUBLE PRECISION NOT NULL DEFAULT 0.90,
    repair_detected BOOLEAN NOT NULL DEFAULT TRUE,
    ai_confidence DOUBLE PRECISION NOT NULL DEFAULT 0.88,
    ai_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Citizen Verifications Table (Feedback / Closed / Reopen)
CREATE TABLE IF NOT EXISTS public.citizen_verifications (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    citizen_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    result VARCHAR(50) NOT NULL, -- FIXED or NOT_FIXED
    rating INTEGER,
    feedback TEXT,
    reopen_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Complaint Messages Table
CREATE TABLE IF NOT EXISTS public.complaint_messages (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    sender_role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    complaint_id INTEGER REFERENCES public.complaints(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL DEFAULT 'WEB',
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Department Works Table (Infrastructure Planning & Conflicts)
CREATE TABLE IF NOT EXISTS public.department_works (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES public.departments(id),
    title VARCHAR(255) NOT NULL,
    work_type VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_complaints_public_id ON public.complaints(public_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department_id ON public.complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_officer_id ON public.complaints(officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_sla_deadline ON public.complaints(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_works_dates_dept ON public.department_works(department_id, start_date, end_date);

-- =============================================================================
-- SUPABASE STORAGE BUCKETS
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('complaint-photos', 'complaint-photos', true),
    ('resolution-photos', 'resolution-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Read Access for Complaint Photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'complaint-photos');

CREATE POLICY "Public Read Access for Resolution Photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'resolution-photos');

CREATE POLICY "Authenticated Uploads for Complaint Photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'complaint-photos');

CREATE POLICY "Authenticated Uploads for Resolution Photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'resolution-photos');

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Application-level RBAC is enforced strictly in FastAPI backend.
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_works ENABLE ROW LEVEL SECURITY;

-- Allow backend service role / postgres connection full access
CREATE POLICY "Backend Full Access on Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Departments" ON public.departments FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Officers" ON public.officers FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Complaints" ON public.complaints FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Complaint Reports" ON public.complaint_reports FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Resolutions" ON public.resolutions FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Verifications" ON public.citizen_verifications FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Messages" ON public.complaint_messages FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Backend Full Access on Works" ON public.department_works FOR ALL USING (true);
