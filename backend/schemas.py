"""
Pydantic schemas for request and response validation in Lumora Backend.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- HEALTH -----------------
class HealthResponse(BaseModel):
    status: str
    total_students: Optional[int] = None
    total_mentors: Optional[int] = None

# ----------------- OVERVIEW -----------------
class OverviewResponse(BaseModel):
    total_students: int
    average_success_score: float
    high_risk_students: int
    medium_risk_students: int
    low_risk_students: int
    students_requiring_intervention: int
    students_without_mentor: int
    pending_mock_interviews: int
    avg_coding_score: float
    insights: List[str] = []

# ----------------- RISK ANALYTICS -----------------
class RiskDistributionItem(BaseModel):
    name: str
    count: int
    percentage: float
    color: str

class RiskFactorItem(BaseModel):
    factor: str
    count: int
    percentage: float

class AcademicRiskResponse(BaseModel):
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_academic_score: float
    score_distribution: List[Dict[str, Any]]
    key_drivers: List[str]

class PlacementRiskResponse(BaseModel):
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_placement_score: float
    probability_distribution: List[Dict[str, Any]]
    key_drivers: List[str]

# ----------------- DEPARTMENT & CODING -----------------
class DepartmentScoreItem(BaseModel):
    department: str
    student_count: int
    average_success_score: float
    high_risk_count: int
    average_attendance: float
    average_academic_score: float
    average_skill_score: float
    average_placement_score: float

class CodingAnalyticsResponse(BaseModel):
    average_coding_score: float
    students_below_threshold: int
    percentage_below_threshold: float
    department_breakdown: List[Dict[str, Any]]
    top_students: List[Dict[str, Any]]

class SkillsAnalyticsResponse(BaseModel):
    averages: Dict[str, float]
    department_summary: List[Dict[str, Any]]
    critical_gaps: List[str]

# ----------------- SEGMENTS -----------------
class SegmentItem(BaseModel):
    segment_name: str
    student_count: int
    percentage: float
    average_success_score: float
    average_academic_score: float
    average_skill_score: float
    average_placement_score: float
    average_engagement_score: float
    color: str
    description: str

# ----------------- HIGH POTENTIAL -----------------
class HighPotentialItem(BaseModel):
    student_id: str
    student_name: str
    department: str
    student_success_score: float
    coding_score: float
    placement_score: float
    academic_score: float
    segment_name: str
    potential_area: str
    recommended_role: str
    potential_reason: str

# ----------------- STUDENTS -----------------
class StudentSummary(BaseModel):
    student_id: str
    name: str
    email: str
    department: str
    gender: str
    attendance_percent: float
    average_score: float
    coding_score: float
    student_success_score: float
    predicted_risk_level: str
    academic_risk_probability: float
    placement_risk_probability: float
    risk_factors: List[str]
    recommendations: List[str]
    mentor_id: Optional[str] = None
    mentor_name: Optional[str] = None
    intervention_status: str
    segment_name: str

class StudentDetail(BaseModel):
    student_id: str
    name: str
    email: str
    department: str
    gender: str
    city: str
    admission_year: int
    attendance_percent: float
    marks: float
    max_marks: float
    average_score: float
    total_assignments: int
    submitted: int
    assignment_completion_rate: float
    activities_joined: int
    activity_type: str
    events_attended: int
    leadership_role: str
    books_borrowed: int
    books_returned: int
    fine_amount: float
    last_activity: str
    total_fee: float
    paid_amount: float
    fee_status: str
    payment_date: str
    student_satisfaction: float
    faculty_feedback: float
    academic_support_need: str
    career_support_need: str
    technical_skill: float
    communication_skill: float
    problem_solving: float
    teamwork: float
    leadership: float
    aptitude_score: float
    coding_score: float
    placement_communication_score: float
    mock_interview_score: float
    placement_readiness: float
    academic_score: float
    skill_score: float
    placement_score: float
    engagement_score: float
    feedback_score: float
    leadership_indicator: int
    student_success_score: float
    risk_level: str
    predicted_risk_level: str
    last_submission_date: str
    academic_risk_probability: float
    placement_risk_probability: float
    risk_factors: List[str]
    recommendations: List[str]
    segment: int
    segment_name: str
    mentor_id: str
    mentor_name: str
    mentor_match_reason: str
    intervention_status: str
    flags: Dict[str, bool] = {}

class PaginatedStudentsResponse(BaseModel):
    data: List[StudentDetail]
    total: int
    page: int
    pageSize: int
    totalPages: int

class StatusUpdateRequest(BaseModel):
    status: str

# ----------------- MENTORS -----------------
class MentorItem(BaseModel):
    mentor_id: str
    mentor_name: str
    department: str
    expertise: List[str]
    expertise_raw: str
    max_students: int
    current_students: int
    available_slots: int
    utilization_percent: float

class MentorAssignRequest(BaseModel):
    student_id: str
    mentor_id: str

# ----------------- ASSESSMENTS -----------------
class AssessmentCreateRequest(BaseModel):
    student_id: str
    assessment_type: str
    category: str
    score: float
    status: str
    date: str
    notes: Optional[str] = ""

class AssessmentUpdateRequest(BaseModel):
    score: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None

class AssessmentItem(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = ""
    department: Optional[str] = ""
    assessment_type: str
    category: str
    score: float
    status: str
    date: str
    notes: Optional[str] = ""

# ----------------- MOCK INTERVIEWS -----------------
class MockInterviewCreateRequest(BaseModel):
    student_id: str
    student_name: Optional[str] = None
    interviewer: Optional[str] = None
    interviewer_id: Optional[str] = None
    mentor_id: Optional[str] = None
    mentor_name: Optional[str] = None
    type: Optional[str] = None
    interview_type: Optional[str] = None
    date: Optional[str] = None
    scheduled_date: Optional[str] = None
    time: Optional[str] = None
    scheduled_time: Optional[str] = None
    notes: Optional[str] = ""
    status: Optional[str] = "Scheduled"

class MockInterviewUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    feedback_notes: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None

class MockInterviewItem(BaseModel):
    id: str
    student_id: str
    student_name: str
    department: Optional[str] = ""
    interviewer: Optional[str] = ""
    interviewer_id: Optional[str] = None
    mentor_name: Optional[str] = ""
    mentor_id: Optional[str] = None
    type: Optional[str] = ""
    interview_type: Optional[str] = ""
    date: Optional[str] = ""
    scheduled_date: Optional[str] = ""
    time: Optional[str] = ""
    scheduled_time: Optional[str] = ""
    status: str
    coding_score: Optional[float] = 0.0
    placement_risk: Optional[float] = 0.0
    last_mock_interview: Optional[str] = ""
    notes: Optional[str] = ""
    feedback_notes: Optional[str] = ""
    created_at: str

# ----------------- FEEDBACK -----------------
class FeedbackCreateRequest(BaseModel):
    student_id: str
    mentor: Optional[str] = None
    mentor_name: Optional[str] = None
    mentor_id: Optional[str] = None
    category: str
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None
    comment: Optional[str] = None
    date: Optional[str] = None
    created_at: Optional[str] = None

class FeedbackItem(BaseModel):
    id: str
    student_id: str
    student_name: str
    department: Optional[str] = ""
    mentor: Optional[str] = ""
    mentor_name: Optional[str] = ""
    mentor_id: Optional[str] = None
    category: str
    rating: int
    feedback: Optional[str] = ""
    comment: Optional[str] = ""
    date: Optional[str] = ""
    created_at: Optional[str] = ""

class FeedbackAnalyticsResponse(BaseModel):
    avg_rating: float
    total_feedbacks: int
    category_distribution: List[Dict[str, Any]]
    most_common_issue: str
    department_comparison: List[Dict[str, Any]]

# ----------------- EVENTS -----------------
class CampusEventCreateRequest(BaseModel):
    event_id: Optional[str] = None
    event_name: str
    date: str
    category: str
    location: str
    participants: int
    status: str
    description: Optional[str] = ""

class CampusEventUpdateRequest(BaseModel):
    event_name: Optional[str] = None
    date: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    participants: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None

class CampusEventItem(BaseModel):
    id: str
    title: str
    date: str
    category: str
    location: str
    participants_count: int
    status: str
    description: str

# ----------------- HACKATHONS -----------------
class CampusHackathonCreateRequest(BaseModel):
    hackathon_id: Optional[str] = None
    hackathon_name: str
    date: str
    participants: int
    teams: int
    winners: str
    status: str
    details: Optional[str] = None

class CampusHackathonUpdateRequest(BaseModel):
    hackathon_name: Optional[str] = None
    date: Optional[str] = None
    participants: Optional[int] = None
    teams: Optional[int] = None
    winners: Optional[str] = None
    status: Optional[str] = None

class CampusHackathonItem(BaseModel):
    id: str
    name: str
    date: str
    participants_count: int
    teams_count: int
    winners: str
    status: str
    participants: List[Dict[str, Any]] = []

# ----------------- CERTIFICATES -----------------
class CertificateCreateRequest(BaseModel):
    certificate_id: Optional[str] = None
    student_id: str
    student_name: Optional[str] = None
    event_or_hackathon: Optional[str] = None
    hackathon_name: Optional[str] = None
    role: Optional[str] = None
    achievement: str
    issue_date: Optional[str] = None
    certificate_date: Optional[str] = None
    status: Optional[str] = "Pending"

class CertificateVerifyRequest(BaseModel):
    verified_by: Optional[str] = "Dean Office"

class CertificateItem(BaseModel):
    id: str
    student_id: str
    student_name: str
    department: Optional[str] = ""
    event_or_hackathon: Optional[str] = ""
    hackathon_name: Optional[str] = ""
    role: Optional[str] = ""
    achievement: str
    issue_date: Optional[str] = ""
    certificate_date: Optional[str] = ""
    status: str
    credential_id: str
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None

# ----------------- AI CHAT -----------------
class AIChatRequest(BaseModel):
    message: str
    student_context_id: Optional[str] = None

class AIChatResponse(BaseModel):
    answer: str
    students: List[Dict[str, Any]] = []
    insights: List[str] = []
    source: str = "database"
