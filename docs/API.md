# NagarSaathi AI — Frontend API Contract Documentation

**API Base URL:** `http://localhost:8000/api/v1`  
**Swagger Interactive Docs:** `http://localhost:8000/docs`  
**ReDoc Reference:** `http://localhost:8000/redoc`  
**WebSocket URL:** `ws://localhost:8000/ws/complaints/{complaint_id}`  

---

## 🔑 Demo Authentication Credentials

All demo accounts share the password: `Password@123`

| Role | Email | Password | Department / Description |
|---|---|---|---|
| **Citizen** | `citizen@nagar.local` | `Password@123` | Resident user (Aarav Sharma) |
| **Officer** | `officer@nagar.local` | `Password@123` | Senior Civic Engineer (Road Dept, Ashi Nagar Zone) |
| **Admin** | `admin@nagar.local` | `Password@123` | Municipal Commissioner Verma |

---

## 1. System Health

### `GET /health`
- **Auth:** None
- **Response `200 OK`:**
```json
{
  "status": "ok",
  "service": "nagar-saathi-backend"
}
```

---

## 2. Authentication

### `POST /api/v1/auth/register`
Registers a new citizen or officer.
- **Auth:** None
- **Body (`application/json`):**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+919876543210",
  "password": "Password@123",
  "role": "CITIZEN"
}
```
- **Response `201 Created`:**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 4,
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "+919876543210",
    "role": "CITIZEN",
    "created_at": "2026-09-22T06:00:00Z",
    "department_code": null,
    "officer_id": null
  }
}
```

### `POST /api/v1/auth/login`
- **Auth:** None
- **Body (`application/json`):**
```json
{
  "email": "citizen@nagar.local",
  "password": "Password@123"
}
```
- **Response `200 OK`:** Same structure as register response.
- **Errors:** `401 Unauthorized` for invalid email/password.

### `GET /api/v1/auth/me`
- **Auth:** `Bearer <token>`
- **Response `200 OK`:** Returns current `UserResponse`.

---

## 3. Civic Complaints

### `POST /api/v1/complaints`
Submits a complaint with automated photo EXIF geolocation extraction, AI categorization, priority scoring, duplicate detection, and SLA assignment.
- **Auth:** Optional (`Bearer <token>` attaches citizen identity)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `title` *(string, required)*: Complaint headline
  - `description` *(string, required)*: Full description (supports English, Hindi, Marathi, mixed)
  - `photo` *(file, optional)*: Image upload (.jpg, .jpeg, .png)
  - `latitude` *(float, optional)*: Device GPS latitude fallback
  - `longitude` *(float, optional)*: Device GPS longitude fallback
  - `address` *(string, optional)*: Landmark / street address
- **Location Hierarchy:**
  1. `PHOTO_EXIF` (extracted automatically from photo metadata)
  2. `DEVICE_GPS` (fallback coordinates from mobile browser)
  3. `MANUAL`
- **Response `201 Created`:**
```json
{
  "id": 1,
  "public_id": "NS-1001",
  "citizen_id": 1,
  "title": "Massive pothole near Ashi Nagar Square",
  "description": "Deep dangerous pothole on the main road...",
  "language": "english",
  "category": "ROAD_POTHOLE",
  "severity": "HIGH",
  "priority": "HIGH",
  "latitude": 21.1738,
  "longitude": 79.1165,
  "address": "Ashi Nagar Square, North Nagpur",
  "location_source": "PHOTO_EXIF",
  "department_id": 1,
  "department_code": "ROAD",
  "officer_id": 1,
  "officer_name": "Rajesh Patil",
  "status": "ASSIGNED",
  "sla_hours": 24,
  "sla_deadline": "2026-09-23T06:00:00Z",
  "sla_status": "ON_TRACK",
  "created_at": "2026-09-22T06:00:00Z",
  "updated_at": "2026-09-22T06:00:00Z",
  "image_url": "/uploads/a3f2...jpg",
  "reports_count": 1
}
```

### `GET /api/v1/complaints`
Lists all public complaints with optional filters.
- **Query Params:** `status_filter`, `category`, `department_code`, `limit` (default 50), `offset` (default 0)
- **Response `200 OK`:** Array of `ComplaintResponse`.

### `GET /api/v1/complaints/my`
Lists complaints submitted by logged-in citizen.
- **Auth:** `Bearer <token>`

### `GET /api/v1/complaints/{complaint_id}`
Retrieves full complaint dossier with timeline reports, resolution photos, and verification audit trail.
- **Path Param:** `complaint_id` (either database ID `1` or public ID `NS-1001`)
- **Response `200 OK`:** `ComplaintDetailResponse`.

### `POST /api/v1/complaints/{complaint_id}/join`
Allows another citizen to upvote/join an existing master issue with supplementary description or photo.
- **Auth:** `Bearer <token>`
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `description`, `photo`, `latitude`, `longitude`

### `POST /api/v1/complaints/{complaint_id}/verify`
Citizen verifies resolved work.
- **Auth:** `Bearer <token>`
- **Body (`application/json`):**
```json
{
  "result": "FIXED", // or "NOT_FIXED"
  "rating": 5,
  "feedback": "Pothole filled cleanly and leveled.",
  "reopen_reason": null
}
```
- **Lifecycle Transition:**
  - `FIXED` ➔ Status becomes `CLOSED`
  - `NOT_FIXED` ➔ Status becomes `REOPENED`

### `POST /api/v1/complaints/{complaint_id}/reopen`
Citizen reopens an issue.
- **Auth:** `Bearer <token>`
- **Body (`application/json`):**
```json
{
  "reason": "Pipeline is still leaking water under the asphalt.",
  "feedback": "Need supervisor re-inspection"
}
```

---

## 4. Officer Operations

### `GET /api/v1/officer/complaints`
Returns complaints assigned to the officer's department.
- **Auth:** `Bearer <token>` (Requires `OFFICER` or `ADMIN` role)
- **Query Params:** `status_filter` (e.g. `ASSIGNED`, `IN_PROGRESS`)

### `PATCH /api/v1/officer/complaints/{complaint_id}/assign`
Assigns complaint to specific officer or self.
- **Auth:** `Bearer <token>` (Officer/Admin)
- **Body (`application/json`):**
```json
{
  "officer_id": 1
}
```

### `PATCH /api/v1/officer/complaints/{complaint_id}/status`
Updates lifecycle status.
- **Auth:** `Bearer <token>` (Officer/Admin)
- **Body (`application/json`):**
```json
{
  "status": "IN_PROGRESS",
  "note": "Field machinery dispatched to site"
}
```

### `POST /api/v1/officer/complaints/{complaint_id}/resolve`
Submits resolution evidence with after-repair photo. Triggers automated verification check and prompts citizen.
- **Auth:** `Bearer <token>` (Officer/Admin)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `resolution_note` *(string, required)*: Work completed summary
  - `after_photo` *(file, optional)*: Photo of completed repair
  - `latitude` *(float, optional)*: Geotag of repair site
  - `longitude` *(float, optional)*: Geotag of repair site

---

## 5. AI Services

### `POST /api/v1/ai/analyze`
Direct complaint text intelligence engine.
- **Body (`application/json`):**
```json
{
  "title": "Broken transformer wire sparking",
  "description": "High voltage wire broken near hospital gate"
}
```
- **Response `200 OK`:**
```json
{
  "language": "english",
  "category": "ELECTRICITY",
  "summary": "Broken transformer wire sparking",
  "severity": "CRITICAL",
  "priority": "CRITICAL",
  "responsible_department": "ELECTRICITY",
  "suggested_sla_hours": 12,
  "reason": "Identified as Electricity with CRITICAL severity based on civic context analysis. Located near critical public utility (school/hospital)."
}
```

### `POST /api/v1/ai/duplicate-check`
Multi-signal duplicate detection.
- **Body (`application/json`):**
```json
{
  "title": "Khadda on road",
  "description": "Large pothole near Ashi Nagar Square",
  "latitude": 21.1738,
  "longitude": 79.1165,
  "image_hash": "a1b2c3d4e5f60718",
  "category": "ROAD_POTHOLE"
}
```
- **Response `200 OK`:**
```json
{
  "is_duplicate": true,
  "duplicate_score": 0.91,
  "matched_complaint_id": "NS-1001",
  "signals": {
    "photo": 0.94,
    "location": 0.98,
    "text": 0.85,
    "time": 0.90
  }
}
```

### `POST /api/v1/ai/verify-resolution`
Verifies before and after repair evidence.
- **Body (`application/json`):**
```json
{
  "before_photo_url": "/uploads/before.jpg",
  "after_photo_url": "/uploads/after.jpg",
  "complaint_latitude": 21.1738,
  "complaint_longitude": 79.1165,
  "resolution_latitude": 21.1739,
  "resolution_longitude": 79.1166
}
```
- **Response `200 OK`:**
```json
{
  "location_match": true,
  "scene_similarity": 0.92,
  "repair_detected": true,
  "confidence": 0.94
}
```

---

## 6. Complaint Messaging

### `GET /api/v1/complaints/{complaint_id}/messages`
Retrieves chat messages for this complaint.

### `POST /api/v1/complaints/{complaint_id}/messages`
Posts a message. Triggers instant WebSocket broadcast.
- **Auth:** `Bearer <token>`
- **Body (`application/json`):**
```json
{
  "message": "When will the asphalt roller arrive?",
  "attachment_url": null
}
```

---

## 7. Notifications

### `GET /api/v1/notifications`
Lists in-app notifications for authenticated user.
- **Auth:** `Bearer <token>`

### `PATCH /api/v1/notifications/{notification_id}/read`
Marks single notification as read.
- **Auth:** `Bearer <token>`

### `POST /api/v1/notifications/read-all`
Marks all notifications as read.
- **Auth:** `Bearer <token>`

---

## 8. Analytics & Smart Governance

### `GET /api/v1/analytics/overview`
- **Response `200 OK`:**
```json
{
  "total_complaints": 6,
  "active_complaints": 5,
  "resolved_complaints": 0,
  "closed_complaints": 1,
  "reopened_complaints": 0,
  "sla_breached": 0
}
```

### `GET /api/v1/analytics/hotspots`
Returns geo-clustered civic complaint hotspots.
- **Response `200 OK`:**
```json
[
  {
    "area": "Ashi Nagar Square, North Nagpur",
    "category": "ROAD_POTHOLE",
    "complaint_count": 2,
    "latitude": 21.1738,
    "longitude": 79.1165
  }
]
```

### `GET /api/v1/analytics/departments`
Returns department-wise performance and SLA compliance breakdown.

---

## 9. Department Works & Conflict Detection

### `GET /api/v1/works`
Lists ongoing and scheduled civic infrastructure works.

### `POST /api/v1/works`
Creates scheduled department work.
- **Body (`application/json`):**
```json
{
  "department_id": 1,
  "title": "Road Resurfacing",
  "work_type": "Road Construction",
  "latitude": 21.1735,
  "longitude": 79.1160,
  "start_date": "2026-09-22T06:00:00Z",
  "end_date": "2026-09-29T06:00:00Z",
  "status": "IN_PROGRESS"
}
```

### `GET /api/v1/works/conflicts`
Detects spatial-temporal clash between works from different departments within 200 meters.
- **Response `200 OK`:**
```json
{
  "conflict_count": 1,
  "conflicts": [
    {
      "work_1": { "title": "Asphalt Road Resurfacing", "department_name": "Road Department" },
      "work_2": { "title": "Main Water Supply Pipeline Trench Excavation", "department_name": "Water Department" },
      "distance_meters": 30.5,
      "conflict_reason": "Spatial-temporal overlap between Road Department and Water Department within 30.5m"
    }
  ]
}
```

---

## 10. WebSocket Real-Time Events

Connect to: `ws://localhost:8000/ws/complaints/{complaint_id}` or `ws://localhost:8000/ws/complaints/global`

### Emitted Events:
- `complaint_created`
- `complaint_assigned`
- `status_changed`
- `message_created`
- `sla_warning`
- `sla_breached`
- `resolution_submitted`
- `verification_required`
- `complaint_reopened`
- `complaint_closed`
- `citizen_joined`

Payload Format:
```json
{
  "event": "status_changed",
  "complaint_id": "NS-1001",
  "data": {
    "public_id": "NS-1001",
    "status": "IN_PROGRESS",
    "note": "Road repair crew dispatched"
  }
}
```
