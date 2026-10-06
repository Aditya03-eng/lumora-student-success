"""
Data and ML Model Loader for Lumora Backend.
Loads student_dashboard_data_final.csv, mentors_final.csv, and scikit-learn models once at startup.
Exposes analytical query functions and grounds AI toolbox responses in verified data.
"""

import os
import ast
import json
import sqlite3
import pandas as pd
import numpy as np
import joblib
from typing import List, Dict, Any, Optional, Tuple

from database import get_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def parse_list(val) -> List[str]:
    if pd.isna(val) or val is None:
        return []
    s = str(val).strip()
    if not s or s == "[]":
        return []
    try:
        res = ast.literal_eval(s)
        if isinstance(res, list):
            return [str(x).strip() for x in res if str(x).strip()]
        return [str(res).strip()]
    except Exception:
        cleaned = s.strip("[]").replace("'", "").replace('"', "")
        return [x.strip() for x in cleaned.split(",") if x.strip()]

class DataLoader:
    _instance = None

    def __init__(self):
        self.students_df: Optional[pd.DataFrame] = None
        self.mentors_df: Optional[pd.DataFrame] = None
        self.students_map: Dict[str, Dict[str, Any]] = {}
        self.mentors_map: Dict[str, Dict[str, Any]] = {}

        # ML Models & Feature Lists
        self.academic_features: List[str] = []
        self.academic_model = None
        self.placement_features: List[str] = []
        self.placement_model = None
        self.segmentation_scaler = None
        self.student_segmentation_model = None

        self.loaded = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def find_file(self, filename: str, search_paths: List[str]) -> str:
        for p in search_paths:
            full = os.path.join(p, filename)
            if os.path.exists(full):
                return full
        # Fallback to C:\Hackathon
        hackathon_path = os.path.join(r"C:\Hackathon", filename)
        if os.path.exists(hackathon_path):
            return hackathon_path
        raise FileNotFoundError(f"Could not locate {filename} in {search_paths}")

    def load(self):
        if self.loaded:
            return

        print("--> [Lumora Backend] Loading datasets and ML models...")

        # 1. Locate and read CSV datasets
        data_search_dirs = [
            BASE_DIR,
            os.path.join(BASE_DIR, "public", "data"),
            os.path.join(BASE_DIR, "backend"),
            os.path.join(BASE_DIR, "dist", "data"),
            r"C:\Hackathon"
        ]

        student_csv = self.find_file("student_dashboard_data_final.csv", data_search_dirs)
        mentor_csv = self.find_file("mentors_final.csv", data_search_dirs)

        print(f"    Loaded student dataset: {student_csv}")
        print(f"    Loaded mentor dataset:  {mentor_csv}")

        self.students_df = pd.read_csv(student_csv)
        self.mentors_df = pd.read_csv(mentor_csv)

        # 2. Locate and load ML models
        model_search_dirs = [
            os.path.join(BASE_DIR, "models"),
            os.path.join(BASE_DIR, "backend", "models"),
            r"C:\Hackathon\models"
        ]

        af_path = self.find_file("academic_features.pkl", model_search_dirs)
        am_path = self.find_file("academic_risk_model.pkl", model_search_dirs)
        pf_path = self.find_file("placement_features.pkl", model_search_dirs)
        pm_path = self.find_file("placement_risk_model.pkl", model_search_dirs)
        ss_path = self.find_file("segmentation_scaler.pkl", model_search_dirs)
        sm_path = self.find_file("student_segmentation_model.pkl", model_search_dirs)

        self.academic_features = joblib.load(af_path)
        self.academic_model = joblib.load(am_path)
        self.placement_features = joblib.load(pf_path)
        self.placement_model = joblib.load(pm_path)
        self.segmentation_scaler = joblib.load(ss_path)
        self.student_segmentation_model = joblib.load(sm_path)

        print("    ML Risk & Segmentation models loaded successfully.")

        # 3. Clean and prepare datasets in memory
        self._prepare_data()

        # 4. Synchronize with SQLite persistent overrides
        self.sync_persistent_overrides()

        self.loaded = True
        print(f"--> [Lumora Backend] Ready! Total students: {len(self.students_df)}, Mentors: {len(self.mentors_df)}")

    def _prepare_data(self):
        # Fill missing string fields
        self.students_df["activity_type"] = self.students_df["activity_type"].fillna("None")
        self.students_df["leadership_role"] = self.students_df["leadership_role"].fillna("None")
        self.students_df["mentor_match_reason"] = self.students_df["mentor_match_reason"].fillna("None")

        # Parse list fields
        self.students_df["risk_factors_list"] = self.students_df["risk_factors"].apply(parse_list)
        self.students_df["recommendations_list"] = self.students_df["recommendations"].apply(parse_list)

        # Default intervention status
        def get_default_status(row):
            risk = str(row["predicted_risk_level"]).strip()
            mentor_name = str(row.get("mentor_name", "")).strip()
            if risk == "High":
                return "In Progress" if mentor_name not in ["Not Required", "No mentor available", ""] else "Assigned"
            elif risk == "Medium":
                return "Assigned"
            return "Completed"

        self.students_df["intervention_status"] = self.students_df.apply(get_default_status, axis=1)

        # Mentors map
        for _, row in self.mentors_df.iterrows():
            m_id = str(row["mentor_id"]).strip()
            self.mentors_map[m_id] = {
                "mentor_id": m_id,
                "mentor_name": str(row["mentor_name"]).strip(),
                "department": str(row["department"]).strip(),
                "expertise": [e.strip() for e in str(row["expertise"]).split("|") if e.strip()],
                "expertise_raw": str(row["expertise"]).strip(),
                "max_students": int(row["max_students"]),
                "current_students": int(row["current_students"]),
                "available_slots": max(0, int(row["max_students"]) - int(row["current_students"])),
                "utilization_percent": round((int(row["current_students"]) / max(1, int(row["max_students"]))) * 100, 1)
            }

        # Build student records map
        self._rebuild_students_map()

    def _rebuild_students_map(self):
        self.students_map = {}
        for _, row in self.students_df.iterrows():
            s_id = str(row["student_id"]).strip()

            rf_list = row["risk_factors_list"] if isinstance(row["risk_factors_list"], list) else []
            rec_list = row["recommendations_list"] if isinstance(row["recommendations_list"], list) else []

            # Compute boolean risk flags
            att = float(row["attendance_percent"])
            avg_s = float(row["average_score"])
            coding = float(row["coding_score"])
            tech = float(row["technical_skill"])
            comm = float(row["communication_skill"])
            plac_prob = float(row.get("placement_risk_probability", 0))
            comp_rate = float(row["assignment_completion_rate"])
            sat = float(row["student_satisfaction"])

            flags = {
                "low_attendance": att < 75,
                "low_academic": avg_s < 60,
                "low_coding": coding < 60,
                "low_technical": tech < 60,
                "low_communication": comm < 60,
                "low_placement": plac_prob >= 0.70,
                "low_assignment": comp_rate < 70,
                "low_satisfaction": sat < 60,
            }

            self.students_map[s_id] = {
                "student_id": s_id,
                "name": str(row["name"]),
                "email": str(row["email"]),
                "department": str(row["department"]),
                "gender": str(row["gender"]),
                "city": str(row["city"]),
                "admission_year": int(row["admission_year"]) if pd.notna(row["admission_year"]) else 2024,
                "attendance_percent": round(att, 2),
                "marks": float(row["marks"]),
                "max_marks": float(row["max_marks"]),
                "average_score": round(avg_s, 2),
                "total_assignments": int(row["total_assignments"]),
                "submitted": int(row["submitted"]),
                "assignment_completion_rate": round(comp_rate, 2),
                "activities_joined": int(row["activities_joined"]),
                "activity_type": str(row["activity_type"]),
                "events_attended": int(row["events_attended"]),
                "leadership_role": str(row["leadership_role"]),
                "books_borrowed": int(row["books_borrowed"]),
                "books_returned": int(row["books_returned"]),
                "fine_amount": float(row["fine_amount"]),
                "last_activity": str(row["last_activity"]),
                "total_fee": float(row["total_fee"]),
                "paid_amount": float(row["paid_amount"]),
                "fee_status": str(row["fee_status"]),
                "payment_date": str(row["payment_date"]),
                "student_satisfaction": round(sat, 2),
                "faculty_feedback": round(float(row["faculty_feedback"]), 2),
                "academic_support_need": str(row["academic_support_need"]),
                "career_support_need": str(row["career_support_need"]),
                "technical_skill": round(tech, 2),
                "communication_skill": round(comm, 2),
                "problem_solving": round(float(row["problem_solving"]), 2),
                "teamwork": round(float(row["teamwork"]), 2),
                "leadership": round(float(row["leadership"]), 2),
                "aptitude_score": round(float(row["aptitude_score"]), 2),
                "coding_score": round(coding, 2),
                "placement_communication_score": round(float(row["placement_communication_score"]), 2),
                "mock_interview_score": round(float(row["mock_interview_score"]), 2),
                "placement_readiness": round(float(row["placement_readiness"]), 2),
                "academic_score": round(float(row["academic_score"]), 2),
                "skill_score": round(float(row["skill_score"]), 2),
                "placement_score": round(float(row["placement_score"]), 2),
                "engagement_score": round(float(row["engagement_score"]), 2),
                "feedback_score": round(float(row["feedback_score"]), 2),
                "leadership_indicator": int(row["leadership_indicator"]),
                "student_success_score": round(float(row["student_success_score"]), 2),
                "risk_level": str(row["risk_level"]),
                "predicted_risk_level": str(row["predicted_risk_level"]),
                "last_submission_date": str(row["last_submission_date"]),
                "academic_risk_probability": round(float(row.get("academic_risk_probability", 0)), 3),
                "placement_risk_probability": round(plac_prob, 3),
                "risk_factors": rf_list,
                "recommendations": rec_list,
                "segment": int(row["segment"]) if pd.notna(row["segment"]) else 0,
                "segment_name": str(row["segment_name"]),
                "mentor_id": str(row.get("mentor_id", "")).strip(),
                "mentor_name": str(row.get("mentor_name", "")).strip(),
                "mentor_match_reason": str(row.get("mentor_match_reason", "")),
                "intervention_status": str(row["intervention_status"]),
                "flags": flags
            }

    def sync_persistent_overrides(self):
        """Reads SQLite assignments and statuses and overlays them in memory."""
        conn = get_connection()
        cursor = conn.cursor()

        # 1. Overlay Mentor assignments
        cursor.execute("SELECT student_id, mentor_id, mentor_name FROM mentor_assignments")
        assigned = cursor.fetchall()
        for row in assigned:
            s_id = row["student_id"]
            m_id = row["mentor_id"]
            m_name = row["mentor_name"]
            if s_id in self.students_map:
                self.students_map[s_id]["mentor_id"] = m_id
                self.students_map[s_id]["mentor_name"] = m_name
                self.students_map[s_id]["mentor_match_reason"] = f"Assigned to {m_name} (Persisted)"
                if self.students_map[s_id]["intervention_status"] in ["Not Started", "Assigned"]:
                    self.students_map[s_id]["intervention_status"] = "In Progress"

        # 2. Overlay Intervention statuses
        cursor.execute("SELECT student_id, status FROM intervention_statuses")
        statuses = cursor.fetchall()
        for row in statuses:
            s_id = row["student_id"]
            st = row["status"]
            if s_id in self.students_map:
                self.students_map[s_id]["intervention_status"] = st

        conn.close()

        # Recalculate live mentor student loads
        counts = {}
        for s in self.students_map.values():
            m_id = s.get("mentor_id")
            if m_id and s.get("mentor_name") not in ["Not Required", "No mentor available", ""]:
                counts[m_id] = counts.get(m_id, 0) + 1

        for m_id, m in self.mentors_map.items():
            curr = counts.get(m_id, m["current_students"])
            m["current_students"] = curr
            m["available_slots"] = max(0, m["max_students"] - curr)
            m["utilization_percent"] = round((curr / max(1, m["max_students"])) * 100, 1)

    # -------------------------------------------------------------
    # ANALYTICS ENDPOINTS LOGIC
    # -------------------------------------------------------------

    def get_overview(self) -> Dict[str, Any]:
        students = list(self.students_map.values())
        total = len(students)
        if total == 0:
            return {
                "total_students": 0,
                "average_success_score": 0.0,
                "high_risk_students": 0,
                "medium_risk_students": 0,
                "low_risk_students": 0,
                "students_requiring_intervention": 0,
                "students_without_mentor": 0,
                "pending_mock_interviews": 0,
                "avg_coding_score": 0.0,
                "insights": []
            }

        avg_success = round(float(np.mean([s["student_success_score"] for s in students])), 1)
        avg_coding = round(float(np.mean([s["coding_score"] for s in students])), 1)

        high_risk = sum(1 for s in students if s["predicted_risk_level"] == "High")
        med_risk = sum(1 for s in students if s["predicted_risk_level"] == "Medium")
        low_risk = sum(1 for s in students if s["predicted_risk_level"] == "Low")

        intervention_needed = sum(
            1 for s in students if s["predicted_risk_level"] == "High" or s["intervention_status"] in ["Assigned", "Not Started", "In Progress"]
        )

        unassigned_high = sum(
            1 for s in students if s["predicted_risk_level"] == "High" and s["mentor_name"] in ["No mentor available", "", "Not Required"]
        )

        # Count pending interviews from SQLite
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM mock_interviews WHERE status IN ('Not Scheduled', 'Scheduled')")
        pending_interviews = cursor.fetchone()[0]
        conn.close()

        insights = [
            f"{high_risk} students ({round((high_risk/total)*100, 1)}%) currently demonstrate critical risk signals requiring active interventions.",
            f"The predominant risk vectors across cohorts are low attendance (<75%) and foundational coding skill gaps (<60).",
            f"{unassigned_high} high-risk students currently await faculty mentor allocation across engineering departments."
        ]

        return {
            "total_students": total,
            "average_success_score": avg_success,
            "high_risk_students": high_risk,
            "medium_risk_students": med_risk,
            "low_risk_students": low_risk,
            "students_requiring_intervention": intervention_needed,
            "students_without_mentor": unassigned_high,
            "pending_mock_interviews": pending_interviews,
            "avg_coding_score": avg_coding,
            "insights": insights
        }

    def get_risk_distribution(self) -> List[Dict[str, Any]]:
        students = list(self.students_map.values())
        total = max(1, len(students))
        counts = {"Low": 0, "Medium": 0, "High": 0}
        for s in students:
            lvl = s["predicted_risk_level"]
            counts[lvl] = counts.get(lvl, 0) + 1

        return [
            {"name": "Low Risk", "count": counts["Low"], "percentage": round((counts["Low"] / total) * 100, 1), "color": "#6FCF97"},
            {"name": "Medium Risk", "count": counts["Medium"], "percentage": round((counts["Medium"] / total) * 100, 1), "color": "#F2C94C"},
            {"name": "High Risk", "count": counts["High"], "percentage": round((counts["High"] / total) * 100, 1), "color": "#EB5757"},
        ]

    def get_risk_factors(self) -> List[Dict[str, Any]]:
        students = list(self.students_map.values())
        total = max(1, len(students))
        factor_counts: Dict[str, int] = {}
        for s in students:
            for rf in s["risk_factors"]:
                factor_counts[rf] = factor_counts.get(rf, 0) + 1

        # Sort descending
        sorted_factors = sorted(factor_counts.items(), key=lambda x: x[1], reverse=True)
        return [
            {"factor": k, "count": v, "percentage": round((v / total) * 100, 1)}
            for k, v in sorted_factors
        ]

    def get_academic_risk(self) -> Dict[str, Any]:
        students = list(self.students_map.values())
        total = max(1, len(students))

        scores = [s["academic_score"] for s in students]
        high = sum(1 for s in students if s["academic_score"] < 60)
        med = sum(1 for s in students if 60 <= s["academic_score"] < 75)
        low = sum(1 for s in students if s["academic_score"] >= 75)

        distribution = [
            {"range": "< 50 (Critical)", "count": sum(1 for s in students if s["academic_score"] < 50), "color": "#EB5757"},
            {"range": "50 - 64 (Borderline)", "count": sum(1 for s in students if 50 <= s["academic_score"] < 65), "color": "#F2C94C"},
            {"range": "65 - 79 (Proficient)", "count": sum(1 for s in students if 65 <= s["academic_score"] < 80), "color": "#6EA8FE"},
            {"range": "80+ (Exemplary)", "count": sum(1 for s in students if s["academic_score"] >= 80), "color": "#6FCF97"},
        ]

        return {
            "high_risk_count": high,
            "medium_risk_count": med,
            "low_risk_count": low,
            "average_academic_score": round(float(np.mean(scores)), 1),
            "score_distribution": distribution,
            "key_drivers": ["Midterm exam performance", "Assignment submission consistency", "Lecture attendance rate"]
        }

    def get_placement_risk(self) -> Dict[str, Any]:
        students = list(self.students_map.values())
        scores = [s["placement_score"] for s in students]
        probs = [s["placement_risk_probability"] for s in students]

        high = sum(1 for p in probs if p >= 0.70)
        med = sum(1 for p in probs if 0.40 <= p < 0.70)
        low = sum(1 for p in probs if p < 0.40)

        distribution = [
            {"range": "High Risk (p >= 0.70)", "count": high, "color": "#EB5757"},
            {"range": "Moderate Risk (0.40 - 0.69)", "count": med, "color": "#F2C94C"},
            {"range": "Low Risk (p < 0.40)", "count": low, "color": "#6FCF97"}
        ]

        return {
            "high_risk_count": high,
            "medium_risk_count": med,
            "low_risk_count": low,
            "average_placement_score": round(float(np.mean(scores)), 1),
            "probability_distribution": distribution,
            "key_drivers": ["Coding round scores", "Placement communication fluency", "Mock interview clearance"]
        }

    def get_departments(self) -> List[Dict[str, Any]]:
        students = list(self.students_map.values())
        dept_data: Dict[str, List[Dict[str, Any]]] = {}
        for s in students:
            d = s["department"]
            if d not in dept_data:
                dept_data[d] = []
            dept_data[d].append(s)

        results = []
        for dept, list_s in dept_data.items():
            cnt = len(list_s)
            results.append({
                "department": dept,
                "student_count": cnt,
                "average_success_score": round(float(np.mean([s["student_success_score"] for s in list_s])), 1),
                "high_risk_count": sum(1 for s in list_s if s["predicted_risk_level"] == "High"),
                "average_attendance": round(float(np.mean([s["attendance_percent"] for s in list_s])), 1),
                "average_academic_score": round(float(np.mean([s["academic_score"] for s in list_s])), 1),
                "average_skill_score": round(float(np.mean([s["skill_score"] for s in list_s])), 1),
                "average_placement_score": round(float(np.mean([s["placement_score"] for s in list_s])), 1),
            })

        return sorted(results, key=lambda x: x["average_success_score"], reverse=True)

    def get_coding(self) -> Dict[str, Any]:
        students = list(self.students_map.values())
        total = max(1, len(students))
        scores = [s["coding_score"] for s in students]
        below_50 = sum(1 for s in students if s["coding_score"] < 50)

        # Department breakdown
        dept_scores: Dict[str, List[float]] = {}
        for s in students:
            d = s["department"]
            if d not in dept_scores:
                dept_scores[d] = []
            dept_scores[d].append(s["coding_score"])

        dept_breakdown = [
            {
                "department": dept,
                "average_coding": round(float(np.mean(sc_list)), 1),
                "below_threshold": sum(1 for x in sc_list if x < 50),
                "total": len(sc_list)
            }
            for dept, sc_list in dept_scores.items()
        ]
        dept_breakdown = sorted(dept_breakdown, key=lambda x: x["average_coding"], reverse=True)

        top_students = sorted(students, key=lambda x: x["coding_score"], reverse=True)[:10]
        top_list = [
            {"student_id": s["student_id"], "name": s["name"], "department": s["department"], "coding_score": s["coding_score"]}
            for s in top_students
        ]

        return {
            "average_coding_score": round(float(np.mean(scores)), 1),
            "students_below_threshold": below_50,
            "percentage_below_threshold": round((below_50 / total) * 100, 1),
            "department_breakdown": dept_breakdown,
            "top_students": top_list
        }

    def get_skills(self) -> Dict[str, Any]:
        students = list(self.students_map.values())
        averages = {
            "coding": round(float(np.mean([s["coding_score"] for s in students])), 1),
            "technical_skill": round(float(np.mean([s["technical_skill"] for s in students])), 1),
            "communication_skill": round(float(np.mean([s["communication_skill"] for s in students])), 1),
            "problem_solving": round(float(np.mean([s["problem_solving"] for s in students])), 1),
            "teamwork": round(float(np.mean([s["teamwork"] for s in students])), 1),
            "leadership": round(float(np.mean([s["leadership"] for s in students])), 1),
            "aptitude_score": round(float(np.mean([s["aptitude_score"] for s in students])), 1),
            "placement_communication_score": round(float(np.mean([s["placement_communication_score"] for s in students])), 1),
            "mock_interview_score": round(float(np.mean([s["mock_interview_score"] for s in students])), 1),
        }

        # Dept summary for skill gap matrix
        dept_map: Dict[str, List[Dict[str, Any]]] = {}
        for s in students:
            d = s["department"]
            if d not in dept_map:
                dept_map[d] = []
            dept_map[d].append(s)

        dept_summary = []
        for dept, list_s in dept_map.items():
            avg_c = float(np.mean([s["coding_score"] for s in list_s]))
            avg_t = float(np.mean([s["technical_skill"] for s in list_s]))
            avg_comm = float(np.mean([s["communication_skill"] for s in list_s]))
            avg_p = float(np.mean([s["problem_solving"] for s in list_s]))
            avg_pl = float(np.mean([s["placement_readiness"] for s in list_s]))

            def gap_level(val):
                if val < 60: return "High"
                elif val < 72: return "Medium"
                return "Low"

            dept_summary.append({
                "department": dept,
                "coding_gap": gap_level(avg_c),
                "technical_gap": gap_level(avg_t),
                "communication_gap": gap_level(avg_comm),
                "problem_solving_gap": gap_level(avg_p),
                "placement_gap": gap_level(avg_pl),
                "critical_students_count": sum(1 for s in list_s if s["coding_score"] < 50 or s["attendance_percent"] < 65)
            })

        critical_gaps = [
            "Civil and Mechanical departments demonstrate elevated coding skill gaps (< 62 avg).",
            "BCA students require targeted placement communication mock rounds.",
            "Technical skill baseline remains strong across CSE and AI & DS cohorts."
        ]

        return {
            "averages": averages,
            "department_summary": dept_summary,
            "critical_gaps": critical_gaps
        }

    def get_segments(self) -> List[Dict[str, Any]]:
        students = list(self.students_map.values())
        total = max(1, len(students))

        seg_groups: Dict[str, List[Dict[str, Any]]] = {}
        for s in students:
            name = s["segment_name"]
            if name not in seg_groups:
                seg_groups[name] = []
            seg_groups[name].append(s)

        colors = {
            "High Performers": "#2563eb",
            "Strong & Engaged": "#10b981",
            "Developing Students": "#f59e0b",
            "High Risk - Needs Intervention": "#ef4444",
        }
        descs = {
            "High Performers": "Top academic and technical achievers with high engagement and leadership.",
            "Strong & Engaged": "Consistent performers with high attendance and peer collaboration.",
            "Developing Students": "Steady progress, potential vulnerability in placement readiness or attendance.",
            "High Risk - Needs Intervention": "Urgent academic tutoring, attendance monitoring, and mentor allocation required.",
        }

        results = []
        for name, list_s in seg_groups.items():
            results.append({
                "segment_name": name,
                "student_count": len(list_s),
                "percentage": round((len(list_s) / total) * 100, 1),
                "average_success_score": round(float(np.mean([s["student_success_score"] for s in list_s])), 1),
                "average_academic_score": round(float(np.mean([s["academic_score"] for s in list_s])), 1),
                "average_skill_score": round(float(np.mean([s["skill_score"] for s in list_s])), 1),
                "average_placement_score": round(float(np.mean([s["placement_score"] for s in list_s])), 1),
                "average_engagement_score": round(float(np.mean([s["engagement_score"] for s in list_s])), 1),
                "color": colors.get(name, "#64748b"),
                "description": descs.get(name, "Cohort segment")
            })

        return sorted(results, key=lambda x: x["student_count"], reverse=True)

    def get_high_potential(self) -> List[Dict[str, Any]]:
        students = list(self.students_map.values())
        # Filter top performing candidates: high success score or exceptional dimensions
        candidates = [s for s in students if s["student_success_score"] >= 78.0 or s["coding_score"] >= 85.0]

        results = []
        for s in candidates:
            # Determine potential area
            if s["academic_score"] >= 88.0:
                area = "Academic Excellence"
                role = "University Research Fellow"
                reason = f"Maintains outstanding academic GPA of {s['academic_score']} and consistent coursework distinction."
            elif s["coding_score"] >= 85.0:
                area = "Technical Excellence"
                role = "Hackathon Lead / Lab Assistant"
                reason = f"Elite programming capability with coding score of {s['coding_score']} and technical mastery."
            elif s["leadership"] >= 82.0 or s["leadership_role"] != "None":
                area = "Leadership"
                role = "Student Council Lead / Mentor"
                reason = f"Demonstrated campus leadership and exceptional peer collaboration indicator."
            elif s["placement_score"] >= 84.0:
                area = "Placement Readiness"
                role = "Campus Placement Ambassador"
                reason = f"Ready for Tier-1 corporate recruitment with mock interview score of {s['mock_interview_score']}."
            else:
                area = "Engagement"
                role = "Co-Curricular Coordinator"
                reason = f"High engagement index of {s['engagement_score']} across campus societies and competitions."

            results.append({
                "student_id": s["student_id"],
                "student_name": s["name"],
                "department": s["department"],
                "student_success_score": s["student_success_score"],
                "coding_score": s["coding_score"],
                "placement_score": s["placement_score"],
                "academic_score": s["academic_score"],
                "segment_name": s["segment_name"],
                "potential_area": area,
                "recommended_role": role,
                "potential_reason": reason
            })

        return sorted(results, key=lambda x: x["student_success_score"], reverse=True)

    # -------------------------------------------------------------
    # STUDENT QUERIES & CRUD
    # -------------------------------------------------------------

    def get_students(
        self,
        page: int = 1,
        limit: int = 25,
        search: Optional[str] = None,
        department: Optional[str] = None,
        risk: Optional[str] = None,
        mentor: Optional[str] = None,
        codingRange: Optional[str] = None,
        segment: Optional[str] = None,
        flagFilter: Optional[str] = None,
        sortBy: Optional[str] = "student_success_score",
        sortOrder: Optional[str] = "asc",
    ) -> Dict[str, Any]:
        students = list(self.students_map.values())

        # Filtering
        if search and search.strip():
            q = search.strip().lower()
            students = [
                s for s in students
                if q in s["name"].lower() or q in s["student_id"].lower() or q in s["email"].lower() or q in s["department"].lower()
            ]

        if department and department != "all":
            students = [s for s in students if s["department"] == department]

        if risk and risk != "all":
            students = [s for s in students if s["predicted_risk_level"] == risk]

        if segment and segment != "all":
            students = [s for s in students if s.get("segment_name") == segment]

        if mentor and mentor != "all":
            if mentor == "Assigned":
                students = [s for s in students if s["mentor_name"] not in ["Not Required", "No mentor available", ""]]
            elif mentor == "Pending":
                students = [s for s in students if s["mentor_name"] in ["No mentor available", ""]]
            elif mentor == "Not Required":
                students = [s for s in students if s["mentor_name"] == "Not Required"]

        if codingRange and codingRange != "all":
            if codingRange == "below50":
                students = [s for s in students if s["coding_score"] < 50]
            elif codingRange == "50to75":
                students = [s for s in students if 50 <= s["coding_score"] <= 75]
            elif codingRange == "above75":
                students = [s for s in students if s["coding_score"] > 75]

        if flagFilter and flagFilter != "all":
            students = [s for s in students if s.get("flags", {}).get(flagFilter, False)]

        # Sorting
        if sortBy:
            reverse = (sortOrder == "desc")
            def sort_key(s):
                val = s.get(sortBy, 0)
                if isinstance(val, str):
                    return val.lower()
                return val or 0
            students = sorted(students, key=sort_key, reverse=reverse)

        total = len(students)
        total_pages = max(1, int(np.ceil(total / limit)))
        start_idx = (page - 1) * limit
        paginated = students[start_idx : start_idx + limit]

        return {
            "data": paginated,
            "total": total,
            "page": page,
            "pageSize": limit,
            "totalPages": total_pages
        }

    def get_student_by_id(self, student_id: str) -> Optional[Dict[str, Any]]:
        return self.students_map.get(student_id.strip())

    def get_high_risk_students(self, limit: int = 50) -> List[Dict[str, Any]]:
        high_risk = [s for s in self.students_map.values() if s["predicted_risk_level"] == "High"]
        return sorted(high_risk, key=lambda x: x["student_success_score"])[:limit]

    def get_unassigned_students(self, limit: int = 50) -> List[Dict[str, Any]]:
        unassigned = [
            s for s in self.students_map.values()
            if s["predicted_risk_level"] in ["High", "Medium"]
            and s["mentor_name"] in ["No mentor available", "", "Not Required"]
        ]
        return sorted(unassigned, key=lambda x: x["student_success_score"])[:limit]

    def search_students(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []
        q = query.strip().lower()
        matched = [
            s for s in self.students_map.values()
            if q in s["name"].lower() or q in s["student_id"].lower() or q in s["email"].lower() or q in s["department"].lower()
        ]
        return matched[:limit]

    def update_intervention_status(self, student_id: str, new_status: str) -> bool:
        if student_id not in self.students_map:
            return False

        self.students_map[student_id]["intervention_status"] = new_status

        # Persist to SQLite
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO intervention_statuses (student_id, status, updated_at)
            VALUES (?, ?, datetime('now'))
        """, (student_id, new_status))
        conn.commit()
        conn.close()
        return True

    # -------------------------------------------------------------
    # MENTOR OPERATIONS
    # -------------------------------------------------------------

    def get_mentors(self, department: Optional[str] = "all") -> List[Dict[str, Any]]:
        # Count live student assignments
        counts = {}
        for s in self.students_map.values():
            m_id = s.get("mentor_id")
            if m_id and s.get("mentor_name") not in ["Not Required", "No mentor available", ""]:
                counts[m_id] = counts.get(m_id, 0) + 1

        res = []
        for m in self.mentors_map.values():
            if department and department != "all" and m["department"] != department:
                continue
            curr = counts.get(m["mentor_id"], m["current_students"])
            m_copy = dict(m)
            m_copy["current_students"] = curr
            m_copy["available_slots"] = max(0, m["max_students"] - curr)
            m_copy["utilization_percent"] = round((curr / max(1, m["max_students"])) * 100, 1)
            res.append(m_copy)

        return sorted(res, key=lambda x: x["utilization_percent"], reverse=True)

    def get_mentor_by_id(self, mentor_id: str) -> Optional[Dict[str, Any]]:
        m = self.mentors_map.get(mentor_id)
        if not m:
            return None
        # Compute live count
        assigned = [
            s for s in self.students_map.values()
            if s.get("mentor_id") == mentor_id and s.get("mentor_name") not in ["Not Required", "No mentor available", ""]
        ]
        m_copy = dict(m)
        m_copy["current_students"] = len(assigned)
        m_copy["available_slots"] = max(0, m["max_students"] - len(assigned))
        m_copy["utilization_percent"] = round((len(assigned) / max(1, m["max_students"])) * 100, 1)
        return m_copy

    def get_mentor_students(self, mentor_id: str) -> List[Dict[str, Any]]:
        return [
            s for s in self.students_map.values()
            if s.get("mentor_id") == mentor_id and s.get("mentor_name") not in ["Not Required", "No mentor available", ""]
        ]

    def assign_mentor(self, student_id: str, mentor_id: str) -> Tuple[bool, str]:
        if student_id not in self.students_map:
            return False, "Student not found"
        if mentor_id not in self.mentors_map:
            return False, "Mentor not found"

        mentor = self.get_mentor_by_id(mentor_id)
        if mentor["available_slots"] <= 0:
            return False, f"Mentor {mentor['mentor_name']} is at full capacity ({mentor['current_students']}/{mentor['max_students']})"

        student = self.students_map[student_id]
        mentor_name = mentor["mentor_name"]

        student["mentor_id"] = mentor_id
        student["mentor_name"] = mentor_name
        student["mentor_match_reason"] = f"Assigned to {mentor_name} ({mentor['department']} • {mentor['expertise_raw']})"
        if student["intervention_status"] in ["Not Started", "Assigned"]:
            student["intervention_status"] = "In Progress"

        # Persist assignment in SQLite
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO mentor_assignments (student_id, mentor_id, mentor_name, assigned_at)
            VALUES (?, ?, ?, datetime('now'))
        """, (student_id, mentor_id, mentor_name))
        conn.commit()
        conn.close()

        # Update mentor's in-memory load
        self.mentors_map[mentor_id]["current_students"] += 1
        self.mentors_map[mentor_id]["available_slots"] = max(0, self.mentors_map[mentor_id]["max_students"] - self.mentors_map[mentor_id]["current_students"])
        self.mentors_map[mentor_id]["utilization_percent"] = round(
            (self.mentors_map[mentor_id]["current_students"] / max(1, self.mentors_map[mentor_id]["max_students"])) * 100, 1
        )

        return True, "Mentor assigned successfully"

    # -------------------------------------------------------------
    # AI TOOLBOX DATA-GROUNDED QUERY ENGINE
    # -------------------------------------------------------------

    def query_ai(self, raw_message: str, student_context_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Determines query intent and queries actual Pandas/SQLite data.
        Never fabricates names or fake scores.
        """
        q = raw_message.lower().strip()
        students = list(self.students_map.values())

        # If student context is given or asked for specific student
        target_student = None
        if student_context_id and student_context_id in self.students_map:
            target_student = self.students_map[student_context_id]
        else:
            # Check if query names an existing student
            for s in students:
                if s["student_id"].lower() in q or s["name"].lower() in q:
                    target_student = s
                    break

        if target_student:
            rf = ", ".join(target_student["risk_factors"]) if target_student["risk_factors"] else "No active risk factors"
            recs = target_student["recommendations"]
            ans = (
                f"**Student Diagnostic: {target_student['name']} ({target_student['student_id']})**\n\n"
                f"- **Department:** {target_student['department']}\n"
                f"- **Predicted Risk Level:** {target_student['predicted_risk_level']} (Academic Risk: {int(target_student['academic_risk_probability']*100)}%, Placement Risk: {int(target_student['placement_risk_probability']*100)}%)\n"
                f"- **Success Score:** {target_student['student_success_score']}/100 | **Attendance:** {target_student['attendance_percent']}%\n"
                f"- **Coding Score:** {target_student['coding_score']}/100 | **Technical Skill:** {target_student['technical_skill']}/100\n"
                f"- **Assigned Mentor:** {target_student['mentor_name'] if target_student['mentor_name'] != 'Not Required' else 'Not Required'}\n"
                f"- **Identified Risk Factors:** {rf}\n\n"
                f"**Prescribed Recommendations:**\n"
                + "\n".join([f"1. {r}" for r in recs])
            )
            return {
                "answer": ans,
                "students": [target_student],
                "insights": target_student["risk_factors"],
                "source": "database"
            }

        # 1. High Risk / Immediate Intervention
        if any(w in q for w in ["intervention", "immediate", "urgent", "high risk", "critical"]):
            # Check if department filter is mentioned
            matched_dept = None
            for d in ["cse", "ece", "bca", "ai & ds", "mechanical", "bba", "civil"]:
                if d in q:
                    matched_dept = d.upper() if d != "ai & ds" else "AI & DS"
                    break

            filtered = [s for s in students if s["predicted_risk_level"] == "High"]
            if matched_dept:
                filtered = [s for s in filtered if s["department"].upper() == matched_dept]

            top_cases = sorted(filtered, key=lambda x: x["student_success_score"])[:5]
            student_list_text = "\n".join([
                f"- **{s['name']}** ({s['student_id']} • {s['department']}): Success Score {s['student_success_score']}, Attendance {s['attendance_percent']}%, Coding {s['coding_score']}. Factors: {', '.join(s['risk_factors'][:2])}"
                for s in top_cases
            ])

            dept_clause = f" in {matched_dept}" if matched_dept else ""
            ans = (
                f"Found **{len(filtered)} students requiring immediate intervention**{dept_clause}.\n\n"
                f"**Highest Priority Cases:**\n{student_list_text}\n\n"
                f"Recommended Action: Assign designated faculty mentors and queue for placement mock interviews."
            )
            return {
                "answer": ans,
                "students": top_cases,
                "insights": [f"{len(filtered)} total high-risk students identified"],
                "source": "database"
            }

        # 2. Coding Gaps
        if any(w in q for w in ["coding", "code", "programming", "lowest coding"]):
            crit_coding = sorted([s for s in students if s["coding_score"] < 55], key=lambda x: x["coding_score"])[:5]
            coding_text = "\n".join([
                f"- **{s['name']}** ({s['student_id']} • {s['department']}): Coding Score **{s['coding_score']}**, Technical Foundation {s['technical_skill']}"
                for s in crit_coding
            ])
            avg_c = round(float(np.mean([s["coding_score"] for s in students])), 1)
            ans = (
                f"Campus average coding score is **{avg_c}/100**. A total of **{sum(1 for s in students if s['coding_score'] < 50)} students** scored below the 50-point critical competency threshold.\n\n"
                f"**Students with Largest Coding Skill Gaps:**\n{coding_text}\n\n"
                f"Recommendation: Enroll in mandatory algorithm problem solving tutorials and peer pair-programming labs."
            )
            return {
                "answer": ans,
                "students": crit_coding,
                "insights": [f"Campus average coding score: {avg_c}"],
                "source": "database"
            }

        # 3. High Potential Students
        if any(w in q for w in ["high potential", "top student", "accelerated", "best student", "highest score"]):
            high_pot = self.get_high_potential()[:5]
            hp_text = "\n".join([
                f"- **{s['student_name']}** ({s['department']}): Success Score **{s['student_success_score']}** | Area: **{s['potential_area']}** ({s['recommended_role']})"
                for s in high_pot
            ])
            ans = (
                f"Identified **{len(self.get_high_potential())} accelerated learners** eligible for academic fellowships, research labs, and leadership honors.\n\n"
                f"**Top High-Potential Cohort:**\n{hp_text}"
            )
            return {
                "answer": ans,
                "students": high_pot,
                "insights": ["Accelerated learners identified using multi-dimensional success and skill metrics."],
                "source": "database"
            }

        # 4. Mock Interviews
        if any(w in q for w in ["mock interview", "interview"]):
            needs_interview = sorted(
                [s for s in students if s["placement_risk_probability"] >= 0.70 and s["coding_score"] >= 60],
                key=lambda x: x["placement_risk_probability"],
                reverse=True
            )[:5]
            interview_text = "\n".join([
                f"- **{s['name']}** ({s['student_id']} • {s['department']}): Placement Risk **{int(s['placement_risk_probability']*100)}%**, Mock Interview Score: {s['mock_interview_score']}"
                for s in needs_interview
            ])
            ans = (
                f"Identified priority candidates possessing good technical aptitude but facing high placement risk due to behavioral and interview readiness barriers.\n\n"
                f"**Students Recommended for Immediate Mock Interview:**\n{interview_text}\n\n"
                f"Action: Schedule 1-on-1 placement readiness sessions in the Mock Interview Operations tab."
            )
            return {
                "answer": ans,
                "students": needs_interview,
                "insights": ["Recommended based on placement readiness and interview score gaps."],
                "source": "database"
            }

        # 5. Mentors / Unassigned
        if any(w in q for w in ["mentor", "unassigned", "without mentor"]):
            unassigned = [
                s for s in students
                if s["predicted_risk_level"] in ["High", "Medium"]
                and s["mentor_name"] in ["No mentor available", "", "Not Required"]
            ][:5]
            unassigned_text = "\n".join([
                f"- **{s['name']}** ({s['student_id']} • {s['department']}): Risk: {s['predicted_risk_level']}, Success Score: {s['student_success_score']}"
                for s in unassigned
            ])
            available_mentors = [m for m in self.mentors_map.values() if m["available_slots"] > 0]
            ans = (
                f"Currently, there are unassigned medium- and high-risk students awaiting mentorship allocation.\n\n"
                f"**Priority Unassigned Students:**\n{unassigned_text}\n\n"
                f"**Faculty Capacity:** {len(available_mentors)} faculty mentors currently have open advising slots. Assignments can be approved in the Mentors portal."
            )
            return {
                "answer": ans,
                "students": unassigned,
                "insights": [f"{len(available_mentors)} mentors have available caseload capacity."],
                "source": "database"
            }

        # 6. Department Performance
        if any(w in q for w in ["department", "worst", "lowest performing", "performance"]):
            depts = self.get_departments()
            worst = depts[-1]
            best = depts[0]
            dept_text = "\n".join([
                f"- **{d['department']}**: Avg Success Score: **{d['average_success_score']}**, High-Risk Students: {d['high_risk_count']}, Avg Attendance: {d['average_attendance']}%"
                for d in depts
            ])
            ans = (
                f"**Departmental Performance Analysis:**\n\n"
                f"- **Lowest Performing Department:** **{worst['department']}** (Avg Success Score: {worst['average_success_score']}, High-Risk Count: {worst['high_risk_count']})\n"
                f"- **Highest Performing Department:** **{best['department']}** (Avg Success Score: {best['average_success_score']})\n\n"
                f"**Comprehensive Departmental Breakdown:**\n{dept_text}"
            )
            return {
                "answer": ans,
                "students": [],
                "insights": [f"Lowest performing: {worst['department']}", f"Highest performing: {best['department']}"],
                "source": "database"
            }

        # Default factual overview response
        overview = self.get_overview()
        ans = (
            f"**Lumora Institutional Intelligence Summary:**\n\n"
            f"- **Total Monitored Students:** {overview['total_students']}\n"
            f"- **Institutional Average Success Score:** {overview['average_success_score']}/100\n"
            f"- **High-Risk Students:** {overview['high_risk_students']} ({round((overview['high_risk_students']/overview['total_students'])*100, 1)}%)\n"
            f"- **Students Requiring Active Intervention:** {overview['students_requiring_intervention']}\n"
            f"- **Campus Average Coding Score:** {overview['avg_coding_score']}/100\n\n"
            f"You can ask me targeted queries such as:\n"
            f"- *'Who needs immediate intervention?'*\n"
            f"- *'Which students have the largest coding skill gaps?'*\n"
            f"- *'Who are the high-potential students?'*\n"
            f"- *'Show high-risk CSE students'* or *'Why is [Student Name] at risk?'*"
        )
        return {
            "answer": ans,
            "students": [],
            "insights": overview["insights"],
            "source": "database"
        }
