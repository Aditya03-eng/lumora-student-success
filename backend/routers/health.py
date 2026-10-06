"""
Health check endpoints for Lumora backend.
"""

from fastapi import APIRouter
from data_loader import DataLoader
from schemas import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    loader = DataLoader.get_instance()
    return {
        "status": "ok",
        "total_students": len(loader.students_map) if loader.loaded else None,
        "total_mentors": len(loader.mentors_map) if loader.loaded else None
    }

@router.get("/api/health", response_model=HealthResponse)
def get_api_health():
    return get_health()
