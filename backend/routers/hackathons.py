"""
Hackathons endpoints for Lumora backend:
GET /api/hackathons
POST /api/hackathons
PUT /api/hackathons/{hackathon_id}
"""

import time
import json
from typing import List
from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import (
    CampusHackathonItem,
    CampusHackathonCreateRequest,
    CampusHackathonUpdateRequest
)

router = APIRouter(prefix="/api/hackathons", tags=["Hackathons"])

@router.get("", response_model=List[CampusHackathonItem])
def get_hackathons():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hackathons ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        participants = []
        if r["details"]:
            try:
                parsed = json.loads(r["details"])
                participants = parsed.get("participants", [])
            except Exception:
                participants = []

        results.append({
            "id": r["id"],
            "name": r["hackathon_name"],
            "date": r["date"],
            "participants_count": r["participants"],
            "teams_count": r["teams"],
            "winners": r["winners"],
            "status": r["status"],
            "participants": participants
        })
    return results

@router.post("", response_model=CampusHackathonItem)
def create_hackathon(payload: CampusHackathonCreateRequest):
    hackathon_id = payload.hackathon_id or f"HACK-{int(time.time() * 1000)}"
    details_str = payload.details or json.dumps({"participants": []})

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO hackathons (id, hackathon_name, date, participants, teams, winners, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        hackathon_id,
        payload.hackathon_name,
        payload.date,
        payload.participants,
        payload.teams,
        payload.winners,
        payload.status,
        details_str
    ))
    conn.commit()
    conn.close()

    return {
        "id": hackathon_id,
        "name": payload.hackathon_name,
        "date": payload.date,
        "participants_count": payload.participants,
        "teams_count": payload.teams,
        "winners": payload.winners,
        "status": payload.status,
        "participants": []
    }

@router.put("/{hackathon_id}", response_model=CampusHackathonItem)
def update_hackathon(hackathon_id: str, payload: CampusHackathonUpdateRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hackathons WHERE id = ?", (hackathon_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Hackathon '{hackathon_id}' not found")

    new_name = payload.hackathon_name if payload.hackathon_name is not None else existing["hackathon_name"]
    new_date = payload.date if payload.date is not None else existing["date"]
    new_parts = payload.participants if payload.participants is not None else existing["participants"]
    new_teams = payload.teams if payload.teams is not None else existing["teams"]
    new_win = payload.winners if payload.winners is not None else existing["winners"]
    new_status = payload.status if payload.status is not None else existing["status"]

    cursor.execute("""
        UPDATE hackathons
        SET hackathon_name = ?, date = ?, participants = ?, teams = ?, winners = ?, status = ?
        WHERE id = ?
    """, (new_name, new_date, new_parts, new_teams, new_win, new_status, hackathon_id))
    conn.commit()

    cursor.execute("SELECT * FROM hackathons WHERE id = ?", (hackathon_id,))
    updated = cursor.fetchone()
    conn.close()

    parts = []
    if updated["details"]:
        try:
            parts = json.loads(updated["details"]).get("participants", [])
        except Exception:
            parts = []

    return {
        "id": updated["id"],
        "name": updated["hackathon_name"],
        "date": updated["date"],
        "participants_count": updated["participants"],
        "teams_count": updated["teams"],
        "winners": updated["winners"],
        "status": updated["status"],
        "participants": parts
    }
