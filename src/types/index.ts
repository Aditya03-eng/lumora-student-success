export type RiskLevel = 'High' | 'Medium' | 'Low';
export type InterventionStatus = 'Not Started' | 'Assigned' | 'In Progress' | 'Completed';
export type UserRole = 'dean' | 'faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department?: string;
  avatarInitials: string;
}

export interface StudentRiskFlags {
  low_attendance: boolean;
  low_academic: boolean;
  low_coding: boolean;
  low_technical: boolean;
  low_communication: boolean;
  low_placement: boolean;
  low_assignment: boolean;
  low_satisfaction: boolean;
}

export interface Student {
  student_id: string;
  name: string;
  email: string;
  department: string;
  gender: string;
  city: string;
  admission_year: number;
  attendance_percent: number;
  marks: number;
  average_score: number;
  total_assignments: number;
  submitted: number;
  assignment_completion_rate: number;
  activities_joined: number;
  activity_type: string;
  events_attended: number;
  leadership_role: string;
  books_borrowed: number;
  books_returned: number;
  student_satisfaction: number;
  faculty_feedback: number;
  academic_support_need: string;
  career_support_need: string;
  technical_skill: number;
  communication_skill: number;
  problem_solving: number;
  teamwork: number;
  leadership: number;
  aptitude_score: number;
  coding_score: number;
  placement_communication_score: number;
  mock_interview_score: number;
  placement_readiness: number;
  academic_score: number;
  skill_score: number;
  placement_score: number;
  engagement_score: number;
  feedback_score: number;
  student_success_score: number;
  risk_level: string;
  predicted_risk_level: RiskLevel;
  academic_risk_probability: number;
  placement_risk_probability: number;
  risk_factors: string[];
  main_risk_factor: string;
  recommendations: string[];
  segment: number;
  segment_name: string;
  mentor_id: string;
  mentor_name: string;
  mentor_match_reason: string;
  intervention_status: InterventionStatus;
  flags: StudentRiskFlags;
  last_mock_interview_date?: string;
  mock_interview_status?: InterviewStatus;
}

export interface Mentor {
  mentor_id: string;
  mentor_name: string;
  department: string;
  expertise: string[];
  expertise_raw: string;
  max_students: number;
  current_students: number;
  available_slots: number;
  utilization_percent: number;
}

export type InterviewStatus = 'Not Scheduled' | 'Scheduled' | 'Completed' | 'Needs Follow-up';
export type InterviewType =
  | 'Technical Coding'
  | 'System Design'
  | 'Behavioral & HR'
  | 'Placement Readiness';

export interface MockInterview {
  id: string;
  student_id: string;
  student_name: string;
  department: string;
  mentor_id: string;
  mentor_name: string;
  interview_type: InterviewType;
  scheduled_date: string;
  scheduled_time: string;
  status: InterviewStatus;
  coding_score: number;
  placement_risk: number;
  last_mock_interview?: string;
  notes?: string;
  feedback_notes?: string;
  created_at: string;
}

export type FeedbackCategory =
  | 'Academic'
  | 'Coding'
  | 'Communication'
  | 'Placement'
  | 'Attendance'
  | 'Overall';

export interface FeedbackItem {
  id: string;
  student_id: string;
  student_name: string;
  mentor_id: string;
  mentor_name: string;
  category: FeedbackCategory;
  rating: number; // 1 to 5
  comment: string;
  department: string;
  created_at: string;
}

export interface FeedbackAnalytics {
  avg_rating: number;
  total_feedbacks: number;
  category_distribution: Array<{ category: FeedbackCategory; count: number; avgRating: number }>;
  most_common_issue: string;
  department_comparison: Array<{ department: string; avgRating: number; count: number }>;
}

export type CertificateStatus = 'Verified' | 'Pending Verification';

export interface CertificateItem {
  id: string;
  student_id: string;
  student_name: string;
  department: string;
  hackathon_name: string;
  role: string;
  achievement: string;
  status: CertificateStatus;
  certificate_date: string;
  credential_id: string;
  verified_by?: string;
  verified_at?: string;
}

export interface HackathonStats {
  total_certificates: number;
  students_participated: number;
  winners_count: number;
  certificates_issued: number;
}

export interface SegmentStats {
  segment_name: string;
  student_count: number;
  percentage: number;
  avg_success_score: number;
  avg_academic_score: number;
  avg_placement_score: number;
  avg_engagement_score: number;
  color: string;
  description: string;
}

export interface RiskDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DepartmentScore {
  department: string;
  avg_success_score: number;
  student_count: number;
  high_risk_count: number;
  avg_attendance: number;
}

export interface DepartmentCodingScore {
  department: string;
  avg_coding_score: number;
  avg_technical_skill: number;
  student_count: number;
  below_50_count: number;
  is_low_performing: boolean;
}

export interface CodingSkillsKPIs {
  avg_coding_score: number;
  avg_technical_skill: number;
  avg_problem_solving: number;
  avg_communication_skill: number;
  students_below_50: number;
  percentage_below_50: number;
}

export interface CodingDistributionBucket {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardKPIs {
  total_students: number;
  avg_success_score: number;
  high_risk_students: number;
  high_risk_percentage: number;
  students_without_mentor: number;
  pending_mock_interviews: number;
  avg_coding_score: number;
  assigned_to_mentors: number;
}

export interface StudentFilterParams {
  search?: string;
  department?: string;
  riskLevel?: string;
  segment?: string;
  mentorStatus?: string;
  codingRange?: 'all' | 'below50' | '50to75' | 'above75';
  flagFilter?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type NavItem =
  | 'overview'
  | 'students'
  | 'intelligence'
  | 'risk_intelligence'
  | 'skill_gap_intelligence'
  | 'high_potential'
  | 'skills_assessments'
  | 'mock_interviews'
  | 'mentors'
  | 'campus_activities'
  | 'feedback'
  | 'recommendations'
  | 'settings'
  | 'help_support';

export type EventCategory = 'Academic' | 'Technical' | 'Cultural' | 'Sports' | 'Career';
export type EventStatus = 'Upcoming' | 'Past' | 'Ongoing';

export interface CampusEvent {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
  location: string;
  participants_count: number;
  status: EventStatus;
  description: string;
  participating_students?: Array<{ student_id: string; name: string; department: string; role: string }>;
}

export interface CampusHackathon {
  id: string;
  name: string;
  date: string;
  participants_count: number;
  teams_count: number;
  winners: string;
  status: 'Upcoming' | 'Completed';
  participants: Array<{
    student_id: string;
    name: string;
    department: string;
    team: string;
    role: string;
    achievement: string;
  }>;
}

export type AssessmentStatus = 'Not Assessed' | 'Scheduled' | 'Completed' | 'Needs Improvement';
export type SoftSkillStatus = 'Exemplary' | 'Proficient' | 'Developing' | 'Needs Support';

export interface StudentSkillAssessment {
  student_id: string;
  student_name: string;
  department: string;
  coding_score: number;
  technical_skill: number;
  problem_solving: number;
  aptitude_score: number;
  technical_assessment_status: AssessmentStatus;
  communication_skill: number;
  teamwork: number;
  leadership: number;
  placement_communication: number;
  soft_skill_status: SoftSkillStatus;
  assessed_by?: string;
  assessed_date?: string;
}

export type PotentialArea =
  | 'Academic Excellence'
  | 'Technical Excellence'
  | 'Leadership'
  | 'Placement Readiness'
  | 'Engagement';

export interface HighPotentialStudent {
  student: Student;
  potential_area: PotentialArea;
  potential_reason: string;
  recommended_role: string;
}

export interface DepartmentSkillGap {
  department: string;
  coding_gap: 'Low' | 'Medium' | 'High';
  technical_gap: 'Low' | 'Medium' | 'High';
  communication_gap: 'Low' | 'Medium' | 'High';
  problem_solving_gap: 'Low' | 'Medium' | 'High';
  placement_gap: 'Low' | 'Medium' | 'High';
  critical_students_count: number;
}


export interface ChatAction {
  id: string;
  label: string;
  icon?: string;
  type: 'view_student' | 'navigate_tab' | 'schedule_mock' | 'assign_mentor' | 'view_recommendations' | 'query';
  payload?: any;
  primary?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: ChatAction[];
  tableData?: {
    headers: string[];
    rows: Array<Array<string | number>>;
  };
  relatedStudents?: Student[];
  isContextQuery?: boolean;
}

