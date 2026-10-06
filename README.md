# Smart Campus — Student Success Analytics Platform

A modern university analytics dashboard built with React, Tailwind CSS, Recharts, and Lucide React. Designed for academic administrators, department chairs, and faculty mentors to identify students at risk, understand vulnerability factors, coordinate interventions, and manage faculty caseloads.

---

## Key Features

### 1. Executive Analytics Dashboard
- **Top KPIs**: Total Students (4,000), Average Success Score (68.6/100), High Risk Students (1,127), Active Mentored Students (62).
- **Interactive Charts**:
  - Risk Distribution Donut Chart (High, Medium, Low).
  - Department-wise Average Success Score Bar Chart (Civil, Mechanical, CSE, ECE, AI & DS, BBA, BCA) with benchmark reference line.
  - Student Cohort Segments Distribution.
  - Academic vs. Placement Risk Comparison.
- **Students Requiring Immediate Attention Table**: Quick overview of students with high risk and lowest success scores, with one-click profile inspection and mentor assignment.

### 2. Searchable Student Directory
- Multi-parameter filtering:
  - Department (CSE, AI & DS, BCA, ECE, Mechanical, BBA, Civil)
  - Risk Level (High, Medium, Low)
  - Cohort Segment (High Performers, Strong & Engaged, Developing Students, High Risk - Needs Intervention)
  - Mentor Status (Assigned, Pending Slot, Not Required)
- Multi-column sorting (Success Score, Attendance, Department, Student Name).
- Full pagination (15, 25, 50, 100 students per page).

### 3. Diagnostic Student Profile Modal
- Comprehensive demographics: Name, ID, Email, City, Department, Admission Year, Cohort.
- Success Score and AI Predicted Risk Level with Academic Risk % and Placement Risk % meters.
- **6 Performance Pillars**:
  1. Attendance (Attendance % with defaulter threshold alerts)
  2. Academic (Marks, average score, assignment completion rate)
  3. Technical Skills (Coding score, problem solving, technical skill rating)
  4. Communication Skills (Teamwork, leadership, placement communication)
  5. Placement Readiness (Mock interview score, aptitude score)
  6. Campus Engagement (Activities joined, events attended, leadership role, satisfaction)
- **Identified Risk Factors**: Visual alert badges for each diagnosed risk trigger.
- **Prescribed Interventions**: Actionable AI recommendations.
- **Faculty Mentor Coordination**: Real-time mentor assignment dropdown with live capacity tracking.

### 4. Predictive Risk Analysis Page
- Risk cohort counts and percentages.
- Academic Risk probability distribution curve (histogram brackets).
- Placement Risk probability distribution curve.
- High-risk priority table with department filtering.

### 5. Student Cohort Segmentation Page
- 4 Analytical Segments:
  - **High Performers** (808 students)
  - **Strong & Engaged** (1,263 students)
  - **Developing Students** (1,237 students)
  - **High Risk - Needs Intervention** (692 students)
- Four-pillar averages for each segment: Success Score, Academic Score, Placement Score, and Engagement Score.
- Multi-dimensional comparative bar chart.
- Cohort drill-down member table.

### 6. Faculty Mentorship Management
- Sourced from `mentors_final.csv`.
- Displays mentor department, expertise tags, current students, max quota (10), available slots, and utilization percentage.
- Department filter.
- Drill-down to inspect all active mentees assigned to any mentor.

### 7. AI Prescriptive Recommendations Page
- Displays student-specific recommendations and risk factors.
- **Interactive Intervention Status Toggle**: `Assigned` | `In Progress` | `Completed` with optimistic live state and localStorage persistence.
- Status filters and progress summary KPIs.

---

## Tech Stack & Data Architecture
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React, PapaParse.
- **Data Service Layer (`src/services/dataService.ts`)**:
  - Direct local parsing of `student_dashboard_data_final.csv` and `mentors_final.csv`.
  - In-memory caching for zero-latency filtering and sorting across 4,000 records.
  - Pluggable switch to route to FastAPI backend without modifying any UI components (`CONFIG.USE_BACKEND_API = true`).
- **Backend API (`backend/main.py`)**: Optional FastAPI REST service reading the CSV datasets.

---

## Quick Start

### 1. Run Frontend
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Optional: Run FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
API docs available at `http://localhost:8000/docs`.
