# NagarSaathi AI — Primary Production Frontend

A high-performance, zero-build, production frontend for **NagarSaathi AI** built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript**, connected directly to FastAPI, Supabase PostgreSQL, Supabase Auth, and Ollama AI.

---

## 🌟 Key Features

1. **Production Authentication & Role-Based Access Control (RBAC)**:
   - **Citizen Signup & Login** with Supabase Auth + JWT session persistence.
   - **Secure Officer Registration Requests** with `OFFICER_PENDING` quarantine until Administrator approval.
   - **Command Center Officer Approval Queue** for real-time review, authorization, rejection, and deactivation.
2. **Natural Voice Input & Multilingual Recognition**:
   - Web Speech API integration supporting **Marathi (`mr-IN`)**, **Hindi (`hi-IN`)**, and **English (`en-IN`)**.
   - Continuous speech recognition with real-time audio soundwave animation and live transcription.
3. **AI Structured Civic Intent Flow**:
   - Calls backend Ollama AI (`POST /api/v1/ai/analyze`) to extract civic category, severity, priority, responsible department, and SLA duration.
4. **Duplicate Detection & Community Clustering**:
   - Calls backend duplicate detection (`POST /api/v1/ai/duplicate-check`) to discover nearby issues within a 300m radius with similarity matching.
5. **End-to-End Real-Time Grievance Lifecycle Tracking**:
   - Real-time WebSocket connectivity (`/ws/complaints/{id}`) with fallback to auto-refresh.
   - 7-step civic progress timeline with SLA countdown badges.
   - Free prefilled WhatsApp sharing deep-links (`https://wa.me/...`).
6. **NMC Officer Resolution Workspace**:
   - Department workload filters (status, priority, zone).
   - "Start Work" state transitions.
   - After-repair photo upload proof and AI verification.
7. **Citizen Before vs After Verification**:
   - Side-by-side comparison of reported issue vs officer's repair proof.
   - 1–5 star rating and citizen sign-off or grievance reopening.
8. **Municipal Command & Control Center**:
   - Leaflet + OpenStreetMap interactive GIS hotspot density maps.
   - Cross-department infrastructure work conflict detection (Road vs Water vs Electricity).
   - Chronic 30-day failure pattern detection and zone SLA compliance breakdown.

---

## 🚀 Quickstart (Zero Build Step Required)

### 1. Start NagarSaathi Backend
```bash
cd Backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start Frontend-Vanilla
```bash
cd Frontend-Vanilla
python -m http.server 5500
```

### 3. Open in Browser
Open: [http://127.0.0.1:5500](http://127.0.0.1:5500)

---

## 📁 Directory Structure

```
Frontend-Vanilla/
├── index.html               # Main landing portal with role selectors & telemetry
├── login.html               # Multi-role authentication portal (Citizen / Officer / Admin)
├── signup.html              # Citizen signup & Secure Officer registration request
├── citizen.html             # Citizen home dashboard with recent complaints
├── report.html              # Multimodal problem reporting (Voice, text, photo, GPS)
├── ai-analysis.html         # AI understanding & structured civic intent confirmation
├── duplicate.html           # Duplicate check & community issue joining
├── tracking.html            # Live grievance lifecycle tracking & SLA countdown
├── officer.html             # NMC Field Officer task queue & filters
├── officer-complaint.html   # Officer grievance details & work execution
├── resolution.html          # After-photo upload proof & Citizen sign-off verification
├── command-center.html      # Citywide GIS telemetry, hotspot map, conflicts & officer approval queue
├── css/
│   └── style.css            # Civic blue design system, animations & responsive grid
├── js/
│   ├── config.js            # API base URL & runtime configuration
│   ├── auth.js              # Centralized Supabase Auth, JWT session manager & RBAC guards
│   ├── api.js               # Centralized fetch wrapper for all backend routes
│   ├── app.js               # Global header/footer, language switcher, user widget & health monitor
│   ├── citizen.js           # Citizen home telemetry & complaint list
│   ├── voice.js             # Web Speech API engine (mr-IN, hi-IN, en-IN)
│   ├── report.js            # Multimodal form controller with GPS & EXIF priority
│   ├── ai-analysis.js       # AI intent confirmation controller
│   ├── duplicate.js         # Duplicate detection & upvote coordinator
│   ├── tracking.js          # Real-time WebSocket tracking controller
│   ├── officer.js           # Officer grievance queue controller
│   ├── resolution.js        # Resolution proof & Citizen verification logic
│   ├── command-center.js    # GIS hotspot, conflict monitoring & officer approval engine
│   ├── map.js               # Leaflet map engine with Nominatim reverse geocoding
│   ├── websocket.js         # Auto-reconnecting WebSocket client
│   └── utils.js             # Toasts, i18n, SLA formatters, badges & auth storage
└── README.md
```

---

## 🔒 Production Zero Fake Data Guarantee
All data displayed across cards, charts, maps, and lists originates directly from the NagarSaathi FastAPI backend and Supabase PostgreSQL. When empty, explicit and clean empty states are rendered.
