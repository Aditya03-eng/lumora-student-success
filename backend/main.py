"""
Lumora Student Success Intelligence - FastAPI Backend Application
Exposes REST APIs and ML intelligence to the Lumora React frontend.
Runs at http://localhost:8000
Swagger Docs at http://localhost:8000/docs
"""

import sys
import os

# Ensure backend directory is in python sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from data_loader import DataLoader
from routers import (
    health,
    analytics,
    students,
    mentors,
    assessments,
    interviews,
    feedback,
    events,
    hackathons,
    certificates,
    ai,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite and load CSVs + ML models once
    print("--> [Lumora Backend] Initializing database and data services...")
    init_db()
    DataLoader.get_instance().load()
    print("--> [Lumora Backend] Application ready to receive requests.")
    yield
    # Shutdown
    print("--> [Lumora Backend] Shutting down.")

app = FastAPI(
    title="Lumora — Student Success Intelligence API",
    description="Institutional Student Success Analytics, Early Warning Predictive Risk Models & AI Copilot",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration allowing existing frontend at http://localhost:5173
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[Backend Error] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred while processing student analytics."}
    )

# Include all route modules
app.include_router(health.router)
app.include_router(analytics.router)
app.include_router(students.router)
app.include_router(mentors.router)
app.include_router(assessments.router)
app.include_router(interviews.router)
app.include_router(feedback.router)
app.include_router(events.router)
app.include_router(hackathons.router)
app.include_router(certificates.router)
app.include_router(ai.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
