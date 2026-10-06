"""
Analytics endpoints for Lumora backend:
Overview, Risk distribution, Risk factors, Academic risk, Placement risk,
Departments, Coding, Skills, Segments, High-potential, Feedback analytics.
"""

from typing import List, Dict, Any
from fastapi import APIRouter
from data_loader import DataLoader
from database import get_connection
from schemas import (
    OverviewResponse,
    RiskDistributionItem,
    RiskFactorItem,
    AcademicRiskResponse,
    PlacementRiskResponse,
    DepartmentScoreItem,
    CodingAnalyticsResponse,
    SkillsAnalyticsResponse,
    SegmentItem,
    HighPotentialItem,
    FeedbackAnalyticsResponse
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=OverviewResponse)
def get_overview():
    loader = DataLoader.get_instance()
    return loader.get_overview()

@router.get("/risk-distribution", response_model=List[RiskDistributionItem])
def get_risk_distribution():
    loader = DataLoader.get_instance()
    return loader.get_risk_distribution()

@router.get("/risk-factors", response_model=List[RiskFactorItem])
def get_risk_factors():
    loader = DataLoader.get_instance()
    return loader.get_risk_factors()

@router.get("/academic-risk", response_model=AcademicRiskResponse)
def get_academic_risk():
    loader = DataLoader.get_instance()
    return loader.get_academic_risk()

@router.get("/placement-risk", response_model=PlacementRiskResponse)
def get_placement_risk():
    loader = DataLoader.get_instance()
    return loader.get_placement_risk()

@router.get("/departments", response_model=List[DepartmentScoreItem])
def get_departments():
    loader = DataLoader.get_instance()
    return loader.get_departments()

@router.get("/coding", response_model=CodingAnalyticsResponse)
def get_coding_analytics():
    loader = DataLoader.get_instance()
    return loader.get_coding()

@router.get("/skills", response_model=SkillsAnalyticsResponse)
def get_skills_analytics():
    loader = DataLoader.get_instance()
    return loader.get_skills()

@router.get("/segments", response_model=List[SegmentItem])
def get_segments():
    loader = DataLoader.get_instance()
    return loader.get_segments()

@router.get("/high-potential", response_model=List[HighPotentialItem])
def get_high_potential():
    loader = DataLoader.get_instance()
    return loader.get_high_potential()

@router.get("/feedback", response_model=FeedbackAnalyticsResponse)
def get_feedback_analytics():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT category, rating, department FROM feedbacks")
    rows = cursor.fetchall()
    conn.close()

    total = len(rows)
    if total == 0:
        return {
            "avg_rating": 0.0,
            "total_feedbacks": 0,
            "category_distribution": [],
            "most_common_issue": "None",
            "department_comparison": []
        }

    ratings = [r["rating"] for r in rows]
    avg_rating = round(sum(ratings) / total, 1)

    cat_map: Dict[str, Dict[str, Any]] = {}
    dept_map: Dict[str, Dict[str, Any]] = {}

    for r in rows:
        c = r["category"]
        if c not in cat_map:
            cat_map[c] = {"count": 0, "sum": 0}
        cat_map[c]["count"] += 1
        cat_map[c]["sum"] += r["rating"]

        d = r["department"] or "General"
        if d not in dept_map:
            dept_map[d] = {"count": 0, "sum": 0}
        dept_map[d]["count"] += 1
        dept_map[d]["sum"] += r["rating"]

    cat_dist = [
        {
            "category": k,
            "count": v["count"],
            "avgRating": round(v["sum"] / max(1, v["count"]), 1)
        }
        for k, v in cat_map.items()
    ]
    sorted_cats = sorted(cat_dist, key=lambda x: x["count"], reverse=True)
    most_common = sorted_cats[0]["category"] if sorted_cats else "Coding"

    dept_comp = [
        {
            "department": k,
            "avgRating": round(v["sum"] / max(1, v["count"]), 1),
            "count": v["count"]
        }
        for k, v in dept_map.items()
    ]

    return {
        "avg_rating": avg_rating,
        "total_feedbacks": total,
        "category_distribution": sorted_cats,
        "most_common_issue": most_common,
        "department_comparison": dept_comp
    }
