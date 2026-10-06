# Lumora Backend API (FastAPI + SQLite + ML)

Production-grade Python backend service layer for **Lumora — Student Success Intelligence Platform**.

## Architecture Overview
- **Framework**: FastAPI (asynchronous ASGI backend)
- **Data Engine**: Pandas & NumPy for in-memory analytical transformations across 4,000 verified students & 10 mentors.
- **Machine Learning Integration**:
  - `academic_risk_model.pkl` (Logistic Regression / Classifier)
  - `placement_risk_model.pkl` (Classifier)
  - `student_segmentation_model.pkl` (K-Means Clustering)
  - `segmentation_scaler.pkl` (Feature Scaler)
  - *Strict Zero Leakage*: Feature pipeline never ingests `student_success_score` or `risk_level` as input signals.
- **Persistence Layer**: SQLite (`lumora.db`) for ACID storage of:
  - Mentorship assignments & capacity tracking
  - Mock interview schedules and evaluation notes
  - Faculty feedback entries
  - Technical & Soft skill assessments
  - Campus events & Hackathons
  - Hackathon certificates & Dean verification status
- **Grounded Campus AI**: Deterministic intelligence endpoint (`POST /api/ai/chat`) querying live records with zero hallucination.
- **CORS**: Enabled for Vite development frontend at `http://localhost:5173`.

---

## Quickstart

### 1. Requirements
Ensure Python 3.10+ is installed:
```bash
pip install -r requirements.txt
```

### 2. Launch FastAPI Server
From the root directory or inside `backend/`:
```bash
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```
Or inside `backend/`:
```bash
python main.py
```

### 3. Interactive Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Endpoints

### Health & Analytics
- `GET /api/health` — System status, total students, total mentors
- `GET /api/analytics/overview` — Top institutional KPIs (4,000 students, high risk count, mentor unassigned count)
- `GET /api/analytics/risk-distribution` — Risk donut breakdown (Low, Medium, High)
- `GET /api/analytics/departments` — Departmental success scores & attendance
- `GET /api/analytics/coding` — Coding performance distribution & department breakdowns
- `GET /api/analytics/skills` — Skills averages & campus skill gap matrix
- `GET /api/analytics/segments` — 4 ML-derived behavioral student cohorts
- `GET /api/analytics/high-potential` — Multi-pillar student leadership candidates
- `GET /api/analytics/feedback` — Aggregated mentorship sentiment and category distributions

### Student Directory & Rosters
- `GET /api/students` — Paginated directory with department, risk, mentor, coding, flag, search, and sorting filters
- `GET /api/students/high-risk` — Urgent high-risk cohort requiring intervention
- `GET /api/students/unassigned` — Students lacking active faculty mentorship
- `GET /api/students/search?q={query}` — Instant name/ID/department search
- `GET /api/students/{id}` — Full student 360 profile
- `PUT /api/students/{id}/status` — Update intervention workflow status

### Mentorship Caseloads
- `GET /api/mentors` — Faculty mentor list with active student load, available slots, and utilization %
- `GET /api/mentors/{id}` — Individual mentor profile and specialties
- `GET /api/mentors/{id}/students` — Assigned mentees roster
- `POST /api/mentors/assign` — Assign a student to a faculty mentor (persisted to SQLite)

### Mock Interviews
- `GET /api/interviews` — Filterable scheduled mock interview sessions
- `POST /api/interviews` — Schedule a new technical or HR mock interview
- `PUT /api/interviews/{id}` — Update mock status and evaluation feedback notes

### Feedback & Certificates
- `GET /api/feedback` — Categorized feedback entries
- `POST /api/feedback` — Submit new mentor feedback
- `GET /api/certificates` — Issued hackathon & symposium certificates
- `GET /api/certificates/stats` — Hackathon participation and verification metrics
- `PUT /api/certificates/{id}/verify` — Dean verification toggle

### Campus Activities & Hackathons
- `GET /api/events` — Institutional campus calendar events
- `GET /api/hackathons` — Major university hackathons with teams & finalist rosters

### Campus AI Copilot
- `POST /api/ai/chat` — Deterministic natural language query copilot grounded in actual campus data

---

## Frontend Integration
In `src/services/dataService.ts`:
```typescript
export const CONFIG = {
  USE_BACKEND_API: true,
  API_BASE_URL: 'http://localhost:8000/api',
};
```
All UI views seamlessly consume this backend with automatic local fallback if the service is stopped.
