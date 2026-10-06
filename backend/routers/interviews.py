"""
Mock Interview endpoints for Lumora backend:
GET /api/interviews
GET /api/interviews/{student_id}
POST /api/interviews
PUT /api/interviews/{interview_id}
"""

import time
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from database import get_connection
from data_loader import DataLoader
from schemas import (
    MockInterviewItem,
    MockInterviewCreateRequest,
    MockInterviewUpdateRequest
)

router = APIRouter(prefix="/api/interviews", tags=["Mock Interviews"])

def _format_interview(row: dict, loader: DataLoader) -> dict:
    d = dict(row)
    s_id = d.get("student_id")
    student = loader.get_student_by_id(s_id) if s_id else None

    # Populate aliases
    d["mentor_name"] = d.get("interviewer") or ""
    d["mentor_id"] = d.get("interviewer_id") or ""
    d["interview_type"] = d.get("type") or ""
    d["scheduled_date"] = d.get("date") or ""
    d["scheduled_time"] = d.get("time") or ""
    d["coding_score"] = float(student["coding_score"]) if student else 0.0
    d["placement_risk"] = float(student["placement_risk_probability"]) if student else 0.0
    d["last_mock_interview"] = student.get("last_mock_interview_date") if student else ""
    d["feedback_notes"] = d.get("notes") or ""
    return d

@router.get("", response_model=List[MockInterviewItem])
def get_interviews(
    status: Optional[str] = "all",
    department: Optional[str] = "all",
    search: Optional[str] = None
):
    loader = DataLoader.get_instance()
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM mock_interviews WHERE 1=1"
    params = []

    if status and status != "all":
        query += " AND status = ?"
        params.append(status)

    if department and department != "all":
        query += " AND department = ?"
        params.append(department)

    query += " ORDER BY date ASC, time ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    formatted = [_format_interview(dict(r), loader) for r in rows]

    if search and search.strip():
        q = search.strip().lower()
        formatted = [
            f for f in formatted
            if q in f["student_name"].lower() or q in f["student_id"].lower() or q in f["mentor_name"].lower()
        ]

    return formatted

@router.get("/{student_id}", response_model=List[MockInterviewItem])
def get_interviews_by_student(student_id: str):
    loader = DataLoader.get_instance()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mock_interviews WHERE student_id = ? ORDER BY date DESC", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [_format_interview(dict(r), loader) for r in rows]

@router.post("", response_model=MockInterviewItem)
def create_interview(payload: MockInterviewCreateRequest):
    loader = DataLoader.get_instance()
    student = loader.get_student_by_id(payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{payload.student_id}' not found")

    interview_id = f"MI-{int(time.time() * 1000)}"
    dept = student["department"]
    student_name = payload.student_name or student["name"]
    interviewer = payload.interviewer or payload.mentor_name or "Faculty Mentor"
    interviewer_id = payload.interviewer_id or payload.mentor_id or ""
    itype = payload.type or payload.interview_type or "Technical Coding"
    idate = payload.date or payload.scheduled_date or time.strftime("%Y-%m-%d")
    itime = payload.time or payload.scheduled_time or "10:00"
    created_at = time.strftime("%Y-%m-%d")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO mock_interviews (id, student_id, student_name, department, interviewer, interviewer_id, type, date, time, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        interview_id,
        payload.student_id,
        student_name,
        dept,
        interviewer,
        interviewer_id,
        itype,
        idate,
        itime,
        payload.status or "Scheduled",
        payload.notes or "",
        created_at
    ))
    conn.commit()
    conn.close()

    raw_item = {
        "id": interview_id,
        "student_id": payload.student_id,
        "student_name": student_name,
        "department": dept,
        "interviewer": interviewer,
        "interviewer_id": interviewer_id,
        "type": itype,
        "date": idate,
        "time": itime,
        "status": payload.status or "Scheduled",
        "notes": payload.notes or "",
        "created_at": created_at
    }
    return _format_interview(raw_item, loader)

@router.put("/{interview_id}", response_model=MockInterviewItem)
def update_interview(interview_id: str, payload: MockInterviewUpdateRequest):
    loader = DataLoader.get_instance()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mock_interviews WHERE id = ?", (interview_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Mock interview '{interview_id}' not found")

    new_status = payload.status if payload.status is not None else existing["status"]
    new_notes = payload.feedback_notes or payload.notes or existing["notes"]
    new_date = payload.date if payload.date is not None else existing["date"]
    new_time = payload.time if payload.time is not None else existing["time"]

    cursor.execute("""
        UPDATE mock_interviews
        SET status = ?, notes = ?, date = ?, time = ?
        WHERE id = ?
    """, (new_status, new_notes, new_date, new_time, interview_id))
    conn.commit()

    cursor.execute("SELECT * FROM mock_interviews WHERE id = ?", (interview_id,))
    updated = cursor.fetchone()
    conn.close()

    return _format_interview(dict(updated), loader)
