# NagarSaathi AI — Fallback Vanilla Frontend

A high-performance, zero-build, fallback frontend for **NagarSaathi AI** built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 🌟 Key Features

1. **Natural Voice Input & Multilingual Recognition**:
   - Web Speech API integration supporting **Marathi (`mr-IN`)**, **Hindi (`hi-IN`)**, and **English (`en-IN`)**.
   - Continuous speech recognition with real-time audio soundwave animation and live transcription.
2. **AI Structured Civic Intent Flow**:
   - Calls backend Ollama AI (`POST /api/v1/ai/analyze`) to extract civic category, severity, priority, responsible department, and SLA duration.
3. **Duplicate Detection & Community Clustering**:
   - Calls backend duplicate detection (`POST /api/v1/ai/duplicate-check`) to discover nearby issues within a 300m radius with similarity matching.
4. **End-to-End Real-Time Grievance Lifecycle Tracking**:
   - Real-time WebSocket connectivity (`/ws/complaints/{id}`) with fallback to auto-refresh.
   - 7-step civic progress timeline with SLA countdown badges.
   - Free prefilled WhatsApp sharing deep-links (`https://wa.me/...`).
5. **NMC Officer Resolution Workspace**:
   - Department workload filters (status, priority, zone).
   - "Start Work" state transitions.
   - After-repair photo upload proof and AI verification.
6. **Citizen Before vs After Verification**:
   - Side-by-side comparison of reported issue vs officer's repair proof.
   - 1–5 star rating and citizen sign-off or grievance reopening.
7. **Municipal Command & Control Center**:
   - Leaflet + OpenStreetMap interactive GIS hotspot density maps.
   - Cross-department infrastructure work conflict detection (Road vs Water vs Electricity).
   - Chronic 30-day failure pattern detection and zone SLA compliance breakdown.

---

## 🚀 Quickstart (No npm required)

### 1. Start NagarSaathi Backend
```bash
cd Backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start Vanilla Frontend
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
├── citizen.html             # Citizen home dashboard with recent complaints
├── report.html              # Multimodal problem reporting (Voice, text, photo, GPS)
├── ai-analysis.html         # AI understanding & structured civic intent confirmation
├── duplicate.html           # Duplicate check & community issue joining
├── tracking.html            # Live grievance lifecycle tracking & SLA countdown
├── officer.html             # NMC Field Officer task queue & filters
├── officer-complaint.html   # Officer grievance details & work execution
├── resolution.html          # After-photo upload proof & Citizen sign-off verification
├── command-center.html      # Citywide GIS telemetry, hotspot map & work conflicts
├── css/
│   └── style.css            # Civic blue design system, animations & responsive grid
├── js/
│   ├── config.js            # API base URL & runtime configuration
│   ├── api.js               # Centralized fetch wrapper for all backend routes
│   ├── app.js               # Global header/footer, language switcher, health check
│   ├── citizen.js           # Citizen home telemetry & complaint list
│   ├── voice.js             # Web Speech API engine (mr-IN, hi-IN, en-IN)
│   ├── report.js            # Multimodal form controller with GPS & EXIF priority
│   ├── ai-analysis.js       # AI intent confirmation controller
│   ├── duplicate.js         # Duplicate detection & upvote coordinator
│   ├── tracking.js          # Real-time WebSocket tracking controller
│   ├── officer.js           # Officer grievance queue controller
│   ├── resolution.js        # Resolution proof & Citizen verification logic
│   ├── command-center.js    # GIS hotspot & conflict monitoring engine
│   ├── map.js               # Leaflet map engine with Nominatim reverse geocoding
│   ├── websocket.js         # Auto-reconnecting WebSocket client
│   └── utils.js             # Toasts, i18n, SLA formatters, badges & auth storage
└── README.md
```

---

## 🔒 Zero Fake Data Guarantee
All components fetch live data directly from the NagarSaathi FastAPI backend. If data is unavailable, clean empty and loading states are rendered without fabricating values.
