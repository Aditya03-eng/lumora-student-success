"""
Student endpoints for Lumora backend:
Roster pagination & filtering, student details, high-risk students, unassigned students, search, status updates.
"""

import io
import json
from datetime import datetime
from typing import List, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException, Query, UploadFile, File

from database import get_connection
from data_loader import DataLoader
from schemas import (
    PaginatedStudentsResponse,
    StudentDetail,
    StatusUpdateRequest
)

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.post("/import")
async def import_students(file: UploadFile = File(...)):
    """Import university student records from CSV and run Lumora ML enrichment."""

    # ---------------------------------------------------------
    # 1. Validate uploaded file
    # ---------------------------------------------------------

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV file is empty."
        )

    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV: {str(e)}"
        )

    # ---------------------------------------------------------
    # 2. Required university input columns
    # ---------------------------------------------------------

    required_columns = [
        "student_id",
        "name",
        "email",
        "department",
        "gender",
        "city",
        "admission_year",
        "attendance_percent",
        "marks",
        "max_marks",
        "total_assignments",
        "submitted",
        "activities_joined",
        "events_attended",
        "technical_skill",
        "communication_skill",
        "problem_solving",
        "teamwork",
        "leadership",
        "aptitude_score",
        "coding_score",
        "placement_communication_score",
        "mock_interview_score",
        "student_satisfaction",
        "faculty_feedback"
    ]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Required columns are missing.",
                "missing_columns": missing_columns
            }
        )

    # ---------------------------------------------------------
    # 3. Remove empty rows
    # ---------------------------------------------------------

    df = df.dropna(how="all").copy()

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="The CSV contains no student records."
        )

    # ---------------------------------------------------------
    # 4. Clean student IDs
    # ---------------------------------------------------------

    df["student_id"] = (
        df["student_id"]
        .astype(str)
        .str.strip()
    )

    invalid_ids = df[
        (df["student_id"] == "") |
        (df["student_id"].str.lower() == "nan")
    ]

    if not invalid_ids.empty:
        raise HTTPException(
            status_code=400,
            detail="One or more rows have an invalid student_id."
        )

    # ---------------------------------------------------------
    # 5. Check duplicate IDs inside CSV
    # ---------------------------------------------------------

    duplicate_ids = (
        df[df["student_id"].duplicated(keep=False)]["student_id"]
        .unique()
        .tolist()
    )

    if duplicate_ids:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Duplicate student IDs found in the uploaded CSV.",
                "duplicate_ids": duplicate_ids[:20],
                "duplicate_count": len(duplicate_ids)
            }
        )

    # ---------------------------------------------------------
    # 6. Check existing SQLite students
    # ---------------------------------------------------------

    conn = get_connection()

    try:
        cursor = conn.cursor()

        existing_ids = []

        for student_id in df["student_id"]:
            cursor.execute(
                "SELECT student_id FROM students WHERE student_id = ?",
                (student_id,)
            )

            if cursor.fetchone():
                existing_ids.append(student_id)

    finally:
        conn.close()

    if existing_ids:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Some student IDs already exist.",
                "existing_student_ids": existing_ids[:20],
                "existing_count": len(existing_ids)
            }
        )

    # ---------------------------------------------------------
    # 7. Clean numeric columns
    # ---------------------------------------------------------

    numeric_columns = [
        "admission_year",
        "attendance_percent",
        "marks",
        "max_marks",
        "total_assignments",
        "submitted",
        "activities_joined",
        "events_attended",
        "technical_skill",
        "communication_skill",
        "problem_solving",
        "teamwork",
        "leadership",
        "aptitude_score",
        "coding_score",
        "placement_communication_score",
        "mock_interview_score",
        "student_satisfaction",
        "faculty_feedback"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # ---------------------------------------------------------
    # 8. Validate numeric data
    # ---------------------------------------------------------

    invalid_numeric_rows = df[
        df[numeric_columns].isna().any(axis=1)
    ]

    if not invalid_numeric_rows.empty:
        invalid_row_numbers = (
            invalid_numeric_rows.index + 2
        ).tolist()

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Some rows contain missing or invalid numeric values.",
                "csv_rows": invalid_row_numbers[:20],
                "invalid_row_count": len(invalid_numeric_rows)
            }
        )

    # ---------------------------------------------------------
    # 9. Get Lumora DataLoader / ML models
    # ---------------------------------------------------------

    loader = DataLoader.get_instance()

    try:
        enriched_df = loader.enrich_imported_students(df)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ML enrichment failed: {str(e)}"
        )

    # ---------------------------------------------------------
    # 10. Convert DataFrame to JSON-safe records
    # ---------------------------------------------------------

    imported_records = []

    for _, row in enriched_df.iterrows():

        record = row.to_dict()

        cleaned_record = {}

        for key, value in record.items():

            if pd.isna(value):
                cleaned_record[key] = None

            elif hasattr(value, "item"):
                cleaned_record[key] = value.item()

            else:
                cleaned_record[key] = value

        imported_records.append(cleaned_record)

    # ---------------------------------------------------------
    # 11. Save enriched students to SQLite
    # ---------------------------------------------------------

    imported_at = datetime.utcnow().isoformat()

    conn = get_connection()

    try:
        cursor = conn.cursor()

        for record in imported_records:

            cursor.execute(
                """
                INSERT INTO students
                (student_id, student_data, imported_at)
                VALUES (?, ?, ?)
                """,
                (
                    str(record["student_id"]),
                    json.dumps(record),
                    imported_at
                )
            )

        conn.commit()

    except Exception as e:

        conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save imported students: {str(e)}"
        )

    finally:
        conn.close()

    # ---------------------------------------------------------
    # 12. Refresh DataLoader
    # ---------------------------------------------------------

    try:
        loader.loaded = False
        loader.load()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Students imported but dashboard refresh failed: {str(e)}"
        )

    # ---------------------------------------------------------
    # 13. Return import summary
    # ---------------------------------------------------------

    high_risk_count = int(
        (enriched_df["predicted_risk_level"] == "High").sum()
    )

    medium_risk_count = int(
        (enriched_df["predicted_risk_level"] == "Medium").sum()
    )

    low_risk_count = int(
        (enriched_df["predicted_risk_level"] == "Low").sum()
    )

    return {
        "status": "success",
        "filename": file.filename,
        "records_found": len(df),
        "records_imported": len(imported_records),
        "risk_summary": {
            "high": high_risk_count,
            "medium": medium_risk_count,
            "low": low_risk_count
        },
        "message": (
            f"{len(imported_records)} students imported successfully "
            "with ML predictions."
        )
    }

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
