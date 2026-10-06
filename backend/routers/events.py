"""
Campus Events endpoints for Lumora backend:
GET /api/events
POST /api/events
PUT /api/events/{event_id}
DELETE /api/events/{event_id}
"""

import time
from typing import List
from fastapi import APIRouter, HTTPException
from database import get_connection
from schemas import (
    CampusEventItem,
    CampusEventCreateRequest,
    CampusEventUpdateRequest
)

router = APIRouter(prefix="/api/events", tags=["Campus Events"])

@router.get("", response_model=List[CampusEventItem])
def get_events():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY date ASC")
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "title": r["event_name"],
            "date": r["date"],
            "category": r["category"],
            "location": r["location"],
            "participants_count": r["participants"],
            "status": r["status"],
            "description": r["description"] or ""
        }
        for r in rows
    ]

@router.post("", response_model=CampusEventItem)
def create_event(payload: CampusEventCreateRequest):
    event_id = payload.event_id or f"EVT-{int(time.time() * 1000)}"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO events (id, event_name, date, category, location, participants, status, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        payload.event_name,
        payload.date,
        payload.category,
        payload.location,
        payload.participants,
        payload.status,
        payload.description or ""
    ))
    conn.commit()
    conn.close()

    return {
        "id": event_id,
        "title": payload.event_name,
        "date": payload.date,
        "category": payload.category,
        "location": payload.location,
        "participants_count": payload.participants,
        "status": payload.status,
        "description": payload.description or ""
    }

@router.put("/{event_id}", response_model=CampusEventItem)
def update_event(event_id: str, payload: CampusEventUpdateRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")

    new_name = payload.event_name if payload.event_name is not None else existing["event_name"]
    new_date = payload.date if payload.date is not None else existing["date"]
    new_cat = payload.category if payload.category is not None else existing["category"]
    new_loc = payload.location if payload.location is not None else existing["location"]
    new_parts = payload.participants if payload.participants is not None else existing["participants"]
    new_status = payload.status if payload.status is not None else existing["status"]
    new_desc = payload.description if payload.description is not None else existing["description"]

    cursor.execute("""
        UPDATE events
        SET event_name = ?, date = ?, category = ?, location = ?, participants = ?, status = ?, description = ?
        WHERE id = ?
    """, (new_name, new_date, new_cat, new_loc, new_parts, new_status, new_desc, event_id))
    conn.commit()

    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    updated = cursor.fetchone()
    conn.close()

    return {
        "id": updated["id"],
        "title": updated["event_name"],
        "date": updated["date"],
        "category": updated["category"],
        "location": updated["location"],
        "participants_count": updated["participants"],
        "status": updated["status"],
        "description": updated["description"] or ""
    }

@router.delete("/{event_id}")
def delete_event(event_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM events WHERE id = ?", (event_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")

    cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()
    return {"status": "ok", "deleted_id": event_id}
