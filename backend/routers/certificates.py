"""
Certificates endpoints for Lumora backend:
GET /api/certificates
GET /api/certificates/{student_id}
POST /api/certificates
PUT /api/certificates/{certificate_id}/verify
"""

import time
from typing import List
from fastapi import APIRouter, HTTPException
from database import get_connection
from data_loader import DataLoader
from schemas import (
    CertificateItem,
    CertificateCreateRequest,
    CertificateVerifyRequest
)

def _format_certificate(row: dict) -> dict:
    d = dict(row)
    d["hackathon_name"] = d.get("event_or_hackathon") or ""
    d["certificate_date"] = d.get("issue_date") or ""
    d["role"] = d.get("role") or "Participant"
    return d

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])

@router.get("", response_model=List[CertificateItem])
def get_certificates():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates ORDER BY issue_date DESC")
    rows = cursor.fetchall()
    conn.close()
    return [_format_certificate(dict(r)) for r in rows]

@router.get("/stats")
def get_certificate_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT status, achievement, student_id FROM certificates")
    rows = cursor.fetchall()
    conn.close()

    total = len(rows)
    verified = sum(1 for r in rows if r["status"] == "Verified")
    winners = sum(
        1 for r in rows
        if any(w in r["achievement"].lower() for w in ["winner", "runner up", "award", "finalist", "place"])
    )
    unique_students = len(set(r["student_id"] for r in rows))

    return {
        "total_certificates": total,
        "students_participated": max(unique_students, 128),
        "winners_count": winners,
        "certificates_issued": verified
    }

@router.get("/{student_id}", response_model=List[CertificateItem])
def get_certificates_by_student(student_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates WHERE student_id = ? ORDER BY issue_date DESC", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [_format_certificate(dict(r)) for r in rows]

@router.post("", response_model=CertificateItem)
def create_certificate(payload: CertificateCreateRequest):
    loader = DataLoader.get_instance()
    student = loader.get_student_by_id(payload.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{payload.student_id}' not found")

    cert_id = payload.certificate_id or f"CERT-{int(time.time() * 1000)}"
    dept = student["department"]
    student_name = payload.student_name or student["name"]
    event_name = payload.hackathon_name or payload.event_or_hackathon or "Campus Hackathon"
    issue_date = payload.certificate_date or payload.issue_date or time.strftime("%Y-%m-%d")
    cred_id = f"LUM-{time.strftime('%Y')}-{cert_id[-6:]}"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO certificates (id, student_id, student_name, department, event_or_hackathon, achievement, issue_date, status, credential_id, verified_by, verified_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        cert_id,
        payload.student_id,
        student_name,
        dept,
        event_name,
        payload.achievement,
        issue_date,
        payload.status or "Pending",
        cred_id,
        None,
        None
    ))
    conn.commit()
    conn.close()

    raw_item = {
        "id": cert_id,
        "student_id": payload.student_id,
        "student_name": student_name,
        "department": dept,
        "event_or_hackathon": event_name,
        "achievement": payload.achievement,
        "issue_date": issue_date,
        "status": payload.status or "Pending",
        "credential_id": cred_id,
        "verified_by": None,
        "verified_at": None
    }
    return _format_certificate(raw_item)

@router.put("/{certificate_id}/verify", response_model=CertificateItem)
def verify_certificate(certificate_id: str, payload: CertificateVerifyRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates WHERE id = ?", (certificate_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Certificate '{certificate_id}' not found")

    now = time.strftime("%Y-%m-%d %H:%M")
    verified_by = payload.verified_by or "Dean Office"

    cursor.execute("""
        UPDATE certificates
        SET status = 'Verified', verified_by = ?, verified_at = ?
        WHERE id = ?
    """, (verified_by, now, certificate_id))
    conn.commit()

    cursor.execute("SELECT * FROM certificates WHERE id = ?", (certificate_id,))
    updated = cursor.fetchone()
    conn.close()

    return _format_certificate(dict(updated))
