"""
Skills & Assessments endpoints for Lumora backend:
GET /api/assessments
GET /api/assessments/{student_id}
POST /api/assessments
PUT /api/assessments/{assessment_id}
"""

import time
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from database import get_connection
from data_loader import DataLoader
from schemas import (
    AssessmentItem,
    AssessmentCreateRequest,
    AssessmentUpdateRequest
)

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.get("", response_model=List[AssessmentItem])
def get_assessments():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        # If no assessment records yet, construct sample initial assessments from student dataset
        loader = DataLoader.get_instance()
        sample_students = list(loader.students_map.values())[:20]
        results = []
        for s in sample_students:
            t_status = "Completed" if s["technical_skill"] >= 70 else "Needs Improvement"
            results.append({
                "id": f"ASM-{s['student_id']}",
                "student_id": s["student_id"],
                "student_name": s["name"],
                "department": s["department"],
                "assessment_type": "Technical",
                "category": "Coding & Algorithms",
                "score": s["coding_score"],
                "status": t_status,
                "date": "2026-09-28",
                "notes": f"Baseline assessment evaluation. Technical foundation score: {s['technical_skill']}"
            })
        return results

    return [dict(r) for r in rows]

@router.get("/{student_id}", response_model=List[AssessmentItem])
def get_assessments_by_student(student_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE student_id = ? ORDER BY date DESC", (student_id,))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        # Check student in data loader
        loader = DataLoader.get_instance()
        student = loader.get_student_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")

        # Return default assessment profiles based on actual student data
        return [
            {
                "id": f"ASM-T-{student_id}",
                "student_id": student_id,
                "student_name": student["name"],
                "department": student["department"],
                "assessment_type": "Technical",
                "category": "Algorithmic Coding",
                "score": student["coding_score"],
                "status": "Completed" if student["coding_score"] >= 65 else "Needs Improvement",
                "date": "2026-09-20",
                "notes": f"Technical skill assessment: {student['technical_skill']}/100"
            },
            {
                "id": f"ASM-S-{student_id}",
                "student_id": student_id,
                "student_name": student["name"],
                "department": student["department"],
                "assessment_type": "Soft Skill",
                "category": "Corporate Communication",
                "score": student["communication_skill"],
                "status": "Completed" if student["communication_skill"] >= 65 else "Needs Improvement",
                "date": "2026-09-22",
                "notes": f"Communication readiness: {student['communication_skill']}/100, Teamwork: {student['teamwork']}/100"
            }
        ]

    return [dict(r) for r in rows]

@router.post("", response_model=AssessmentItem)
def create_assessment(payload: AssessmentCreateRequest):
    loader = DataLoader.get_instance()
    student = loader.get_student_by_id(payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{payload.student_id}' not found")

    asm_id = f"ASM-{int(time.time() * 1000)}"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO assessments (id, student_id, student_name, department, assessment_type, category, score, status, date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        asm_id,
        payload.student_id,
        student["name"],
        student["department"],
        payload.assessment_type,
        payload.category,
        payload.score,
        payload.status,
        payload.date,
        payload.notes or ""
    ))
    conn.commit()
    conn.close()

    return {
        "id": asm_id,
        "student_id": payload.student_id,
        "student_name": student["name"],
        "department": student["department"],
        "assessment_type": payload.assessment_type,
        "category": payload.category,
        "score": payload.score,
        "status": payload.status,
        "date": payload.date,
        "notes": payload.notes or ""
    }

@router.put("/{assessment_id}", response_model=AssessmentItem)
def update_assessment(assessment_id: str, payload: AssessmentUpdateRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Assessment '{assessment_id}' not found")

    new_score = payload.score if payload.score is not None else existing["score"]
    new_status = payload.status if payload.status is not None else existing["status"]
    new_notes = payload.notes if payload.notes is not None else existing["notes"]
    new_date = payload.date if payload.date is not None else existing["date"]

    cursor.execute("""
        UPDATE assessments
        SET score = ?, status = ?, notes = ?, date = ?
        WHERE id = ?
    """, (new_score, new_status, new_notes, new_date, assessment_id))
    conn.commit()

    cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
    updated = cursor.fetchone()
    conn.close()

    return dict(updated)
