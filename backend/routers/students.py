"""
Student endpoints for Lumora backend:
Roster pagination & filtering, student details, high-risk students, unassigned students, search, status updates.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from data_loader import DataLoader
from schemas import (
    PaginatedStudentsResponse,
    StudentDetail,
    StatusUpdateRequest
)

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("", response_model=PaginatedStudentsResponse)
def get_students(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=500),
    search: Optional[str] = None,
    department: Optional[str] = None,
    risk: Optional[str] = None,
    mentor: Optional[str] = None,
    codingRange: Optional[str] = None,
    segment: Optional[str] = None,
    flagFilter: Optional[str] = None,
    sortBy: Optional[str] = "student_success_score",
    sortOrder: Optional[str] = "asc"
):
    loader = DataLoader.get_instance()
    return loader.get_students(
        page=page,
        limit=limit,
        search=search,
        department=department,
        risk=risk,
        mentor=mentor,
        codingRange=codingRange,
        segment=segment,
        flagFilter=flagFilter,
        sortBy=sortBy,
        sortOrder=sortOrder
    )

@router.get("/high-risk", response_model=List[StudentDetail])
def get_high_risk_students(limit: int = Query(50, ge=1, le=500)):
    loader = DataLoader.get_instance()
    return loader.get_high_risk_students(limit=limit)

@router.get("/unassigned", response_model=List[StudentDetail])
def get_unassigned_students(limit: int = Query(50, ge=1, le=500)):
    loader = DataLoader.get_instance()
    return loader.get_unassigned_students(limit=limit)

@router.get("/search", response_model=List[StudentDetail])
def search_students(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=100)):
    loader = DataLoader.get_instance()
    return loader.search_students(query=q, limit=limit)

@router.get("/{student_id}", response_model=StudentDetail)
def get_student_by_id(student_id: str):
    loader = DataLoader.get_instance()
    student = loader.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")
    return student

@router.put("/{student_id}/status")
def update_student_status(student_id: str, payload: StatusUpdateRequest):
    loader = DataLoader.get_instance()
    success = loader.update_intervention_status(student_id, payload.status)
    if not success:
        raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found")
    return {"status": "ok", "student_id": student_id, "new_status": payload.status}
