"""
Mentor endpoints for Lumora backend:
List mentors, mentor details, mentor students, assign mentor.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from data_loader import DataLoader
from schemas import (
    MentorItem,
    MentorAssignRequest,
    StudentDetail
)

router = APIRouter(prefix="/api/mentors", tags=["Mentors"])

@router.get("", response_model=List[MentorItem])
def get_mentors(department: Optional[str] = "all"):
    loader = DataLoader.get_instance()
    return loader.get_mentors(department=department)

@router.get("/{mentor_id}", response_model=MentorItem)
def get_mentor_by_id(mentor_id: str):
    loader = DataLoader.get_instance()
    mentor = loader.get_mentor_by_id(mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail=f"Mentor '{mentor_id}' not found")
    return mentor

@router.get("/{mentor_id}/students", response_model=List[StudentDetail])
def get_mentor_students(mentor_id: str):
    loader = DataLoader.get_instance()
    mentor = loader.get_mentor_by_id(mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail=f"Mentor '{mentor_id}' not found")
    return loader.get_mentor_students(mentor_id)

@router.post("/assign")
def assign_mentor(payload: MentorAssignRequest):
    loader = DataLoader.get_instance()
    success, message = loader.assign_mentor(payload.student_id, payload.mentor_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {
        "status": "ok",
        "message": message,
        "student_id": payload.student_id,
        "mentor_id": payload.mentor_id
    }
