"""
Feedback endpoints for Lumora backend:
GET /api/feedback
GET /api/feedback/{student_id}
POST /api/feedback
"""

import time
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from database import get_connection
from data_loader import DataLoader
from schemas import (
    FeedbackItem,
    FeedbackCreateRequest
)

def _format_feedback(row: dict) -> dict:
    d = dict(row)
    d["mentor_name"] = d.get("mentor") or ""
    d["comment"] = d.get("feedback") or ""
    d["created_at"] = d.get("date") or ""
    return d

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.get("", response_model=List[FeedbackItem])
def get_feedbacks(category: Optional[str] = "all", department: Optional[str] = "all"):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM feedbacks WHERE 1=1"
    params = []

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if department and department != "all":
        query += " AND department = ?"
        params.append(department)

    query += " ORDER BY date DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [_format_feedback(dict(r)) for r in rows]

@router.get("/{student_id}", response_model=List[FeedbackItem])
def get_feedbacks_by_student(student_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM feedbacks WHERE student_id = ? ORDER BY date DESC", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [_format_feedback(dict(r)) for r in rows]

@router.post("", response_model=FeedbackItem)
def create_feedback(payload: FeedbackCreateRequest):
    loader = DataLoader.get_instance()
    student = loader.get_student_by_id(payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{payload.student_id}' not found")

    fb_id = f"FB-{int(time.time() * 1000)}"
    dept = student["department"]
    fb_date = payload.date or payload.created_at or time.strftime("%Y-%m-%d")
    mentor_val = payload.mentor or payload.mentor_name or "Faculty Mentor"
    comment_val = payload.feedback or payload.comment or ""

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO feedbacks (id, student_id, student_name, department, mentor, category, rating, feedback, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        fb_id,
        payload.student_id,
        student["name"],
        dept,
        mentor_val,
        payload.category,
        payload.rating,
        comment_val,
        fb_date
    ))
    conn.commit()
    conn.close()

    raw_item = {
        "id": fb_id,
        "student_id": payload.student_id,
        "student_name": student["name"],
        "department": dept,
        "mentor": mentor_val,
        "category": payload.category,
        "rating": payload.rating,
        "feedback": comment_val,
        "date": fb_date
    }
    return _format_feedback(raw_item)
