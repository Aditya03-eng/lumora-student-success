"""
AI Toolbox router for Lumora backend:
POST /api/ai/chat
Queries actual Pandas and SQLite data deterministically.
Never invents student names, scores, or risk levels.
"""

from fastapi import APIRouter
from data_loader import DataLoader
from schemas import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/api/ai", tags=["AI Copilot"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_campus_ai(payload: AIChatRequest):
    loader = DataLoader.get_instance()
    response = loader.query_ai(
        raw_message=payload.message,
        student_context_id=payload.student_context_id
    )
    return response
