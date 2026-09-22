# NagarSaathi (नगरसाथी)
### AI-Powered Civic Problem Intelligence & Smart Governance Platform

NagarSaathi bridges citizens, civic field officers, and municipal command centers across Nagpur for rapid, automated civic grievance intelligence, duplicate detection, and verified resolutions.

---

## 🏛️ Core Civic Workflow
```text
Report → AI Understands → Responsibility → Duplicate Check → Track → Field Officer → Verify → Citizen Confirms → Hotspots → Department Conflict
```

---

## 🎨 Locked Visual Design System
NagarSaathi enforces a strict, single, accessible civic design system:
- **Primary Brand / Action**: `#4F46E5` (Indigo)
- **Page Canvas / Background**: `#F8FAFC` (Light Gray)
- **Card Surface**: `#FFFFFF` (Pure White)
- **Typography / Text**: `#1E293B` (Dark Slate)
- **Success**: `#16A34A` (Resolved & Verified)
- **Warning**: `#F59E0B` (SLA Approaching / Attention)
- **Error**: `#DC2626` (SLA Breached / High Urgency / Conflict)

---

## 🧭 The 3 Experience Layouts
1. **Citizen Experience**: Mobile-first portal with problem reporting, AI analysis preview, duplicate clustering alert, and citizen resolution confirmation.
2. **Officer Experience**: Desktop console with sidebar navigation, work order queue, SLA countdown timers, and photo resolution upload.
3. **Command Center**: Executive city operations room tracking 10 municipal zones, recurrent problem hotspots, and inter-agency infrastructure conflicts.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Running Locally
```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Launch Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### Production Build
```bash
cd Frontend
npm run build
```
Build verification passes cleanly with TypeScript checks and production asset bundling.

---

## ⚡ Backend Platform (FastAPI + Ollama AI + Supabase)

### Prerequisites
- Python 3.11+
- Ollama with model `qwen3:8b` (optional for local AI categorization)

### Backend Setup & Running
```bash
# 1. Navigate to backend & install dependencies
cd Backend
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env

# 3. Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Health Check:** `http://localhost:8000/health`
- **Interactive Swagger API Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Automated Test Suite
```bash
cd Backend
python -m pytest -v
```
All 21 unit and integration test suites pass 100%.


