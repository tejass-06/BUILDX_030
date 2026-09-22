# NagarSaathi AI — Frontend Integration API Contract

> **Backend Version:** 1.0.0 (Production-Ready)  
> **Base URL:** `http://127.0.0.1:8000/api/v1`  
> **WebSocket URL:** `ws://127.0.0.1:8000/ws`  
> **Interactive Docs (Swagger):** `http://127.0.0.1:8000/docs`  
> **OpenAPI JSON:** `http://127.0.0.1:8000/openapi.json`  
> **Target Frontend Origin:** `http://localhost:5173` / `http://127.0.0.1:5173`

---

## 1. Authentication & Security (RBAC)

NagarSaathi AI supports dual auth modes: **Supabase Auth** (JWT) and local high-performance JWT tokens.

### Roles & Access Matrix
| Role | Description | Accessible Endpoints |
|---|---|---|
| `CITIZEN` | Resident reporting grievances | Submit complaint, view own complaints, join issues, verify/reopen, messaging |
| `OFFICER` | Municipal field engineer / inspector | View department complaints, assign/dispatch, update status to `IN_PROGRESS`, submit before/after resolution |
| `ADMIN` | Municipal Commissioner / Command Center | View all complaints, global analytics, zone breakdown, department conflict management, audit logs |

### Headers Format
All authenticated requests must include the Bearer token:
```http
Authorization: Bearer <access_token>
```

---

## 2. Authentication Endpoints

### 2.1 Register User
- **POST** `/auth/register`
- **Auth:** Public
- **Request Body (`application/json`):**
```json
{
  "name": "Ananya Sen",
  "email": "ananya.sen@example.com",
  "phone": "+919811223344",
  "password": "Password@123",
  "role": "CITIZEN",
  "department_code": null,
  "zone": null,
  "designation": null
}
```
- **Response (`201 Created`):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Ananya Sen",
    "email": "ananya.sen@example.com",
    "phone": "+919811223344",
    "role": "CITIZEN",
    "created_at": "2026-09-22T14:30:00Z",
    "department_code": null,
    "officer_id": null
  }
}
```

### 2.2 Login User
- **POST** `/auth/login`
- **Auth:** Public
- **Request Body (`application/json`):**
```json
{
  "email": "ananya.sen@example.com",
  "password": "Password@123"
}
```
- **Response (`200 OK`):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Ananya Sen",
    "email": "ananya.sen@example.com",
    "phone": "+919811223344",
    "role": "CITIZEN",
    "created_at": "2026-09-22T14:30:00Z",
    "department_code": null,
    "officer_id": null
  }
}
```

### 2.3 Get Current Profile
- **GET** `/auth/me`
- **Auth:** Bearer Token (Any Role)
- **Response (`200 OK`):**
```json
{
  "id": 1,
  "name": "Ananya Sen",
  "email": "ananya.sen@example.com",
  "phone": "+919811223344",
  "role": "CITIZEN",
  "created_at": "2026-09-22T14:30:00Z",
  "department_code": null,
  "officer_id": null
}
```

---

## 3. Citizen Grievance Lifecycle Endpoints

### 3.1 Submit Complaint (Multipart Form with Evidence)
- **POST** `/complaints`
- **Auth:** Optional Bearer Token (auto-associated if logged in, anonymous supported)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `title` (string, required): e.g. "Severe pothole near Dharampeth square"
  - `description` (string, required): e.g. "Deep dangerous crater causing traffic hazards"
  - `latitude` (float, optional): Device GPS latitude
  - `longitude` (float, optional): Device GPS longitude
  - `address` (string, optional): Landmark or text address
  - `photo` (file, optional): JPEG/PNG evidence photo
- **Behavior:**
  1. Priority location resolution: `PHOTO_EXIF` > `DEVICE_GPS` > `MANUAL`.
  2. Runs AI understanding (Ollama `qwen3:8b` / deterministic fallback) for language, category, severity, priority.
  3. Deterministic backend department routing (e.g. `ROAD`, `WATER`, `GARBAGE`, `DRAINAGE`, `STREETLIGHT`, `ELECTRICITY`).
  4. Auto-calculates SLA deadline.
  5. Auto-assigns nearest least-loaded active officer.
  6. Creates immutable `COMPLAINT_CREATED` audit log.
  7. Broadcasts WebSocket event.
- **Response (`201 Created`):**
```json
{
  "id": 12,
  "public_id": "NS-1006",
  "citizen_id": 1,
  "title": "Severe pothole near Dharampeth square",
  "description": "Deep dangerous crater causing traffic hazards",
  "language": "English",
  "category": "ROAD_POTHOLE",
  "severity": "HIGH",
  "priority": "HIGH",
  "latitude": 21.1458,
  "longitude": 79.0882,
  "address": "Dharampeth Square, Nagpur",
  "location_source": "DEVICE_GPS",
  "department_id": 1,
  "department_code": "ROAD",
  "department_name": "Road Department",
  "officer_id": 1,
  "officer_name": "Rajesh Patil",
  "officer_phone": "+919876543211",
  "officer_zone": "Dharampeth Zone",
  "officer_designation": "Senior Road Infrastructure Engineer",
  "status": "ASSIGNED",
  "sla_hours": 24,
  "sla_deadline": "2026-09-23T14:30:00Z",
  "sla_status": "ON_TRACK",
  "created_at": "2026-09-22T14:30:00Z",
  "updated_at": "2026-09-22T14:30:00Z",
  "image_url": "https://...supabase.co/.../sample.jpg",
  "reports_count": 1
}
```

### 3.2 List Complaints
- **GET** `/complaints`
- **Query Params:**
  - `status_filter` (optional): `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CITIZEN_VERIFICATION`, `CLOSED`, `REOPENED`
  - `category` (optional): `ROAD_POTHOLE`, `WATER_LEAKAGE`, `GARBAGE`, `DRAINAGE`, `STREETLIGHT`, `ELECTRICITY`, `OTHER`
  - `department_code` (optional): `ROAD`, `WATER`, etc.
  - `limit` (default: 50)
  - `offset` (default: 0)
- **Response (`200 OK`):** `List[ComplaintResponse]`

### 3.3 Get My Complaints
- **GET** `/complaints/my`
- **Auth:** Bearer Token
- **Response (`200 OK`):** `List[ComplaintResponse]`

### 3.4 Get Detailed Complaint (Public or Private)
- **GET** `/complaints/{complaint_id}`
- **Auth:** Optional
- **Response (`200 OK`):**
```json
{
  "id": 12,
  "public_id": "NS-1006",
  "citizen_id": 1,
  "title": "Severe pothole near Dharampeth square",
  "description": "Deep dangerous crater causing traffic hazards",
  "language": "English",
  "category": "ROAD_POTHOLE",
  "severity": "HIGH",
  "priority": "HIGH",
  "latitude": 21.1458,
  "longitude": 79.0882,
  "address": "Dharampeth Square, Nagpur",
  "location_source": "DEVICE_GPS",
  "department_id": 1,
  "department_code": "ROAD",
  "department_name": "Road Department",
  "officer_id": 1,
  "officer_name": "Rajesh Patil",
  "officer_phone": "+919876543211",
  "officer_zone": "Dharampeth Zone",
  "officer_designation": "Senior Road Infrastructure Engineer",
  "status": "CITIZEN_VERIFICATION",
  "sla_hours": 24,
  "sla_deadline": "2026-09-23T14:30:00Z",
  "sla_status": "ON_TRACK",
  "created_at": "2026-09-22T14:30:00Z",
  "updated_at": "2026-09-22T16:00:00Z",
  "image_url": "https://...",
  "reports_count": 2,
  "reports": [
    {
      "id": 1,
      "complaint_id": 12,
      "citizen_id": 1,
      "description": "Deep dangerous crater",
      "image_url": "https://...",
      "latitude": 21.1458,
      "longitude": 79.0882,
      "created_at": "2026-09-22T14:30:00Z",
      "citizen_name": "Ananya Sen"
    }
  ],
  "resolutions": [
    {
      "id": 1,
      "complaint_id": 12,
      "officer_id": 1,
      "resolution_note": "Pothole filled with cold mix asphalt and leveled.",
      "after_photo_url": "https://...",
      "latitude": 21.14581,
      "longitude": 79.08821,
      "location_match": true,
      "scene_similarity": 0.92,
      "repair_detected": true,
      "ai_confidence": 0.94,
      "ai_verified": true,
      "created_at": "2026-09-22T16:00:00Z",
      "officer_name": "Rajesh Patil"
    }
  ],
  "verifications": [],
  "audit_logs": [
    {
      "id": 1,
      "action": "COMPLAINT_CREATED",
      "user_name": "Ananya Sen",
      "role": "CITIZEN",
      "new_state": "ASSIGNED",
      "details": "Complaint registered",
      "created_at": "2026-09-22T14:30:00Z"
    },
    {
      "id": 2,
      "action": "WORK_STARTED",
      "user_name": "Rajesh Patil",
      "role": "OFFICER",
      "new_state": "IN_PROGRESS",
      "details": "Dispatched crew",
      "created_at": "2026-09-22T15:00:00Z"
    },
    {
      "id": 3,
      "action": "RESOLVED",
      "user_name": "Rajesh Patil",
      "role": "OFFICER",
      "new_state": "CITIZEN_VERIFICATION",
      "details": "Pothole repaired",
      "created_at": "2026-09-22T16:00:00Z"
    }
  ],
  "citizen": {
    "id": 1,
    "name": "Ananya Sen",
    "email": "ananya.sen@example.com",
    "role": "CITIZEN"
  }
}
```

### 3.5 Join Existing Complaint Cluster
- **POST** `/complaints/{complaint_id}/join`
- **Auth:** Bearer Token
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `description` (optional), `latitude` (optional), `longitude` (optional), `photo` (file, optional)
- **Response (`200 OK`):** `ComplaintDetailResponse`

### 3.6 Citizen Verify Resolution (FIXED -> CLOSED or NOT_FIXED -> REOPENED)
- **POST** `/complaints/{complaint_id}/verify`
- **Auth:** Bearer Token
- **Request Body (`application/json`):**
```json
{
  "result": "FIXED",
  "rating": 5,
  "feedback": "Work completed cleanly, road is smooth.",
  "reopen_reason": null
}
```
*(If `result: "NOT_FIXED"`, supply `"reopen_reason": "Pothole still open on left side"` and status automatically becomes `REOPENED`)*
- **Response (`200 OK`):** `ComplaintDetailResponse`

### 3.7 Citizen Reopen Shortcut
- **POST** `/complaints/{complaint_id}/reopen`
- **Auth:** Bearer Token
- **Request Body (`application/json`):**
```json
{
  "reason": "Water pipeline is leaking again after initial patch.",
  "feedback": "Needs replacement not temporary patch."
}
```
- **Response (`200 OK`):** `ComplaintDetailResponse`

### 3.8 Audit Trail History
- **GET** `/complaints/{complaint_id}/audit-logs`
- **Auth:** Public / Authenticated
- **Response (`200 OK`):** `List[AuditLogResponse]`

### 3.9 Free WhatsApp Deep-Link ("WhatsApp Ready")
- **GET** `/complaints/{complaint_id}/whatsapp-link?phone=919876543210&note=Dispatching+team`
- **Auth:** Public / Authenticated
- **Response (`200 OK`):**
```json
{
  "status": "WhatsApp Ready",
  "label": "Open WhatsApp",
  "recipient_phone": "919876543210",
  "complaint_public_id": "NS-1006",
  "deeplink": "https://wa.me/919876543210?text=%F0%9F%8F%9B%EF%B8%8F%20*NagarSaathi%20AI%20%E2%80%94%20Civic%20Grievance%20Update*...",
  "message": "🏛️ *NagarSaathi AI — Civic Grievance Update*\n\n📋 *Complaint ID:* NS-1006\n🔄 *Status:* IN_PROGRESS\n..."
}
```

---

## 4. Officer Endpoints

### 4.1 Get Officer Assigned Complaints
- **GET** `/officer/complaints`
- **Auth:** Bearer Token (Officer / Admin)
- **Query Params:** `status_filter` (optional)
- **Response (`200 OK`):** `List[ComplaintResponse]` (filtered automatically to officer's department and jurisdiction)

### 4.2 Update Complaint Status
- **PATCH** `/officer/complaints/{complaint_id}/status`
- **Auth:** Bearer Token (Officer / Admin)
- **Request Body (`application/json`):**
```json
{
  "status": "IN_PROGRESS",
  "note": "Field excavation crew mobilized on site with asphalt roller."
}
```
- **Response (`200 OK`):** `ComplaintResponse`

### 4.3 Submit Resolution with Evidence
- **POST** `/officer/complaints/{complaint_id}/resolve`
- **Auth:** Bearer Token (Officer / Admin)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `resolution_note` (string, required): Description of repair work
  - `latitude` (float, optional): Geotag of after photo
  - `longitude` (float, optional): Geotag of after photo
  - `after_photo` (file, optional): After-resolution photo
- **Behavior:**
  - Evaluates location match with complaint coordinates (< 250m geofence).
  - Computes AI repair verification & confidence.
  - Transitions complaint status to `CITIZEN_VERIFICATION`.
  - Creates immutable `RESOLVED` audit log.
  - Broadcasts WebSocket event.
- **Response (`200 OK`):** `ComplaintDetailResponse`

---

## 5. AI Engine Endpoints

### 5.1 AI Analyze Complaint Text
- **POST** `/ai/analyze`
- **Auth:** Public
- **Request Body (`application/json`):**
```json
{
  "title": "Water leakage in Dharampeth",
  "description": "Pipeline broken near water tank, clean drinking water flowing on road"
}
```
- **Response (`200 OK`):**
```json
{
  "language": "English",
  "category": "WATER_LEAKAGE",
  "summary": "Water leakage in Dharampeth",
  "severity": "HIGH",
  "priority": "HIGH",
  "responsible_department": "WATER",
  "suggested_sla_hours": 24,
  "reason": "Drinking water pipeline leak causing resource loss and road flooding.",
  "keywords": ["water", "leak", "pipeline"],
  "ai_provider": "OLLAMA",
  "model_used": "qwen3:8b"
}
```

### 5.2 Real Database Duplicate Check
- **POST** `/ai/duplicate-check`
- **Auth:** Public
- **Request Body (`application/json`):**
```json
{
  "title": "Severe pothole near Ashi Nagar Square",
  "description": "Deep dangerous pothole on main road",
  "latitude": 21.1738,
  "longitude": 79.1165,
  "image_hash": null,
  "category": "ROAD_POTHOLE"
}
```
- **Response (`200 OK`):**
```json
{
  "is_duplicate": true,
  "duplicate_score": 0.88,
  "matched_complaint_id": "NS-1001",
  "signals": {
    "photo": 0.0,
    "location": 1.0,
    "text": 0.72,
    "time": 0.95
  },
  "similar_complaints": [
    {
      "public_id": "NS-1001",
      "title": "Massive pothole near Ashi Nagar Square",
      "category": "ROAD_POTHOLE",
      "status": "IN_PROGRESS",
      "similarity_score": 0.88,
      "distance_meters": 12.4,
      "reports_count": 3,
      "created_at": "2026-09-22T10:00:00Z"
    }
  ],
  "is_community_issue": true,
  "community_reports_count": 3
}
```

---

## 6. Analytics & Governance Endpoints

### 6.1 Overview KPIs
- **GET** `/analytics/overview`
- **Response (`200 OK`):**
```json
{
  "total_complaints": 6,
  "active_complaints": 4,
  "resolved_complaints": 1,
  "closed_complaints": 1,
  "reopened_complaints": 0,
  "sla_breached": 1,
  "avg_resolution_hours": 3.5,
  "sla_compliance_rate": 83.3
}
```

### 6.2 Administrative Zone Statistics
- **GET** `/analytics/zones`
- **Response (`200 OK`):**
```json
[
  {
    "zone": "Dharampeth Zone",
    "zone_no": 2,
    "total_complaints": 2,
    "active_complaints": 1,
    "resolved_complaints": 1,
    "sla_breached": 0
  },
  {
    "zone": "Ashi Nagar Zone",
    "zone_no": 9,
    "total_complaints": 2,
    "active_complaints": 2,
    "resolved_complaints": 0,
    "sla_breached": 0
  }
]
```

### 6.3 Geographic Hotspots
- **GET** `/analytics/hotspots`
- **Response (`200 OK`):**
```json
[
  {
    "area": "Ashi Nagar Square, North Nagpur",
    "category": "ROAD_POTHOLE",
    "complaint_count": 3,
    "latitude": 21.1738,
    "longitude": 79.1165,
    "severity_breakdown": {
      "CRITICAL": 1,
      "HIGH": 2,
      "MEDIUM": 0,
      "LOW": 0
    }
  }
]
```

### 6.4 Department Performance
- **GET** `/analytics/departments`
- **Response (`200 OK`):**
```json
[
  {
    "department": "Road Department",
    "department_code": "ROAD",
    "total": 3,
    "resolved": 1,
    "active": 2,
    "sla_breached": 0,
    "avg_resolution_hours": 2.5
  }
]
```

### 6.5 Department Works & Infrastructure Conflicts
- **GET** `/works/conflicts`
- **Query Params:** `max_distance_meters` (default: 200.0)
- **Response (`200 OK`):**
```json
{
  "conflict_count": 1,
  "conflicts": [
    {
      "work_1": {
        "id": 1,
        "department_id": 1,
        "department_name": "Road Department",
        "department_code": "ROAD",
        "title": "Asphalt Road Resurfacing & Bitumen Laying",
        "work_type": "Road Construction",
        "latitude": 21.1735,
        "longitude": 79.1160,
        "start_date": "2026-09-22T10:00:00Z",
        "end_date": "2026-09-29T10:00:00Z",
        "status": "IN_PROGRESS"
      },
      "work_2": {
        "id": 2,
        "department_id": 2,
        "department_name": "Water Department",
        "department_code": "WATER",
        "title": "Main Water Supply Pipeline Trench Excavation",
        "work_type": "Pipeline Trenching",
        "latitude": 21.1737,
        "longitude": 79.1162,
        "start_date": "2026-09-23T10:00:00Z",
        "end_date": "2026-09-30T10:00:00Z",
        "status": "SCHEDULED"
      },
      "distance_meters": 30.5,
      "conflict_reason": "Spatial-temporal overlap between Road Department (Road Construction) and Water Department (Pipeline Trenching) within 30.5m"
    }
  ]
}
```

---

## 7. Real-Time WebSockets

### 7.1 Global Channel (Command Center / Dashboard)
- **WebSocket URL:** `ws://127.0.0.1:8000/ws/global`
- **Events Received:**
  - `complaint_created`
  - `complaint_assigned`
  - `status_changed`
  - `resolution_submitted`
  - `complaint_closed`
  - `complaint_reopened`

### 7.2 Complaint-Specific Channel
- **WebSocket URL:** `ws://127.0.0.1:8000/ws/complaints/{public_id}` (e.g. `/ws/complaints/NS-1006`)
- **Events Received:**
```json
{
  "event": "status_changed",
  "complaint_id": "NS-1006",
  "data": {
    "public_id": "NS-1006",
    "status": "IN_PROGRESS",
    "note": "Field repair team dispatched"
  }
}
```

---

## 8. Health Check

- **GET** `/health`
- **Response (`200 OK`):**
```json
{
  "status": "ok",
  "service": "nagar-saathi-backend",
  "database": "connected",
  "ollama": {
    "status": "available",
    "model": "qwen3:8b"
  },
  "storage": {
    "provider": "supabase",
    "complaints_bucket": "complaint-photos"
  }
}
```

---

## 9. Standard Error Format

All error responses strictly adhere to standard HTTP status codes with structured JSON error details:
```json
{
  "detail": "Descriptive error message"
}
```
- `400 Bad Request` — Validation error, duplicate email, invalid parameters.
- `401 Unauthorized` — Missing or expired JWT token.
- `403 Forbidden` — Role not permitted or account inactive.
- `404 Not Found` — Resource or complaint ID not found.
- `422 Unprocessable Entity` — Request schema mismatch.
- `500 Internal Server Error` — Server exception (stack trace concealed in production).
