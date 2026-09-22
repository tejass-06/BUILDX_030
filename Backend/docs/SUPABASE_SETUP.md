# NagarSaathi AI — Supabase Integration & Setup Guide

This guide walks you through connecting your **NagarSaathi AI** backend to **Supabase** (PostgreSQL Database, Supabase Auth, and Supabase Storage).

---

## 1. Create a Supabase Project

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **"New Project"** and choose your organization.
3. Name your project: `NagarSaathi-AI`.
4. Enter a strong database password (store this securely).
5. Choose your preferred region (e.g. `ap-south-1` Mumbai).
6. Click **"Create new project"**.

---

## 2. Obtain Supabase Keys & Database URL

In your Supabase Project Dashboard:

### A. API Keys (Project Settings ➔ API)
- **Project URL:** Copy the URL (e.g. `https://xyzprojectid.supabase.co`).
- **Project API Keys:**
  - `anon` `public` key: Copy this for `SUPABASE_ANON_KEY`.
  - `service_role` `secret` key: Copy this for `SUPABASE_SERVICE_ROLE_KEY` (Keep secret on backend only!).

### B. Database Connection String (Project Settings ➔ Database)
- Scroll to **Connection string** ➔ select **URI** or **Transaction Pooler** (Port `6543` / `5432`).
- Replace `[YOUR-PASSWORD]` with your database password.
- Format for SQLAlchemy (with `psycopg` driver):
  ```
  postgresql+psycopg://postgres.xyzprojectid:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
  ```

---

## 3. Configure Environment Variables (`.env`)

In the project root `p:\NagarSaathi-AI\.env`:

```env
PROJECT_NAME="NagarSaathi AI"
SECRET_KEY="nagar_saathi_super_secret_jwt_key_hackathon_2026_dev_only_change_in_prod"

# Supabase PostgreSQL Connection
DATABASE_URL="postgresql+psycopg://postgres.xyzprojectid:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# Supabase Auth & Storage API Keys
SUPABASE_URL="https://xyzprojectid.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Storage Buckets
SUPABASE_STORAGE_BUCKET_COMPLAINTS="complaint-photos"
SUPABASE_STORAGE_BUCKET_RESOLUTIONS="resolution-photos"

# Ollama AI Configuration (Optional Local LLM)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2:1b"
```

---

## 4. Run SQL Schema in Supabase SQL Editor

1. Open your Supabase Dashboard ➔ **SQL Editor**.
2. Click **"New query"**.
3. Open [`supabase/schema.sql`](../supabase/schema.sql) in this repository and copy its entire contents into the SQL Editor.
4. Click **"Run"**.

This will automatically create:
- Tables: `departments`, `users` (profiles), `officers`, `complaints`, `complaint_reports`, `resolutions`, `citizen_verifications`, `complaint_messages`, `notifications`, `department_works`.
- Indexes for query performance.
- Storage buckets: `complaint-photos` and `resolution-photos`.
- Storage policies allowing public read and authenticated uploads.
- Row Level Security (RLS) policies.

---

## 5. Seed Demonstration Data (Optional)

1. In Supabase Dashboard ➔ **SQL Editor**.
2. Open [`supabase/seed.sql`](../supabase/seed.sql) and copy into the query editor.
3. Click **"Run"**.

Or simply run the Python seed command:
```bash
python -m app.db.seed
```

---

## 6. Supabase Storage Verification

In Supabase Dashboard ➔ **Storage**:
- Confirm that two buckets exist:
  - `complaint-photos` (Public)
  - `resolution-photos` (Public)
- When citizens submit photos, EXIF GPS coordinates are extracted on the backend, the photo is uploaded to `complaint-photos`, and the public CDN URL is saved in PostgreSQL.

---

## 7. Supabase Auth Workflow & Architecture

```
Frontend (React/Vite)
       │
       ├─► Supabase Auth (Sign In / Sign Up)
       │         │
       │         ▼ Returns access_token (JWT)
       │
       └─► FastAPI Backend with Header: "Authorization: Bearer <access_token>"
                 │
                 ├─► 1. Verifies token against Supabase Auth
                 ├─► 2. Loads / auto-syncs User Profile from PostgreSQL
                 ├─► 3. Enforces Role-Based Access Control (CITIZEN / OFFICER / ADMIN)
                 └─► 4. Executes Civic Business Logic
```

---

## 8. Run & Test Backend

```bash
# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run automated tests
python -m pytest -v
```
