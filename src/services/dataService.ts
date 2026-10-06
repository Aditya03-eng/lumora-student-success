import Papa from 'papaparse';
import type {
  Student,
  Mentor,
  DashboardKPIs,
  RiskDistribution,
  DepartmentScore,
  DepartmentCodingScore,
  CodingSkillsKPIs,
  CodingDistributionBucket,
  SegmentStats,
  StudentFilterParams,
  PaginatedResult,
  InterventionStatus,
  MockInterview,
  InterviewStatus,
  InterviewType,
  FeedbackItem,
  FeedbackCategory,
  FeedbackAnalytics,
  CertificateItem,
  HackathonStats,
  StudentRiskFlags,
  CampusEvent,
  CampusHackathon,
  StudentSkillAssessment,
  HighPotentialStudent,
  PotentialArea,
  DepartmentSkillGap,
  AssessmentStatus,
  SoftSkillStatus,
} from '../types';

// Configuration: Switch between local CSV/JSON loader and remote FastAPI backend
export const CONFIG = {
  USE_BACKEND_API: true,
  API_BASE_URL: 'http://localhost:8000/api',
};

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (!CONFIG.USE_BACKEND_API) return null;
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
    if (!res.ok) {
      console.warn(`API call returned status ${res.status} for ${endpoint}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`API call error on ${endpoint}:`, err);
    return null;
  }
}

class StudentDataService {
  private students: Student[] = [];
  private mentors: Mentor[] = [];
  private mockInterviews: MockInterview[] = [];
  private feedbacks: FeedbackItem[] = [];
  private certificates: CertificateItem[] = [];
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private subscribers: Array<() => void> = [];

  constructor() {
    this.init();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => cb());
  }

  private init(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        await this.loadFromCSV();
        this.hydrateLocalStorage();
        this.isLoaded = true;
        this.notifySubscribers();
      } catch (err) {
        console.error('Failed to load student data:', err);
      }
    })();

    return this.loadPromise;
  }

  private async loadFromCSV(): Promise<void> {
    const [studentsText, mentorsText] = await Promise.all([
      fetch('/data/student_dashboard_data_final.csv').then((r) => r.text()),
      fetch('/data/mentors_final.csv').then((r) => r.text()),
    ]);

    const parsedMentors = Papa.parse<Record<string, string>>(mentorsText, {
      header: true,
      skipEmptyLines: true,
    }).data;

    const parsedStudents = Papa.parse<Record<string, string>>(studentsText, {
      header: true,
      skipEmptyLines: true,
    }).data;

    const mentorCountMap: Record<string, number> = {};

    this.students = parsedStudents.map((row) => {
      const parseList = (str?: string): string[] => {
        if (!str) return [];
        try {
          const cleaned = str.replace(/[\[\]']/g, '').trim();
          return cleaned
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        } catch {
          return [];
        }
      };

      const rf = parseList(row.risk_factors);
      const rec = parseList(row.recommendations);
      const predRisk = (row.predicted_risk_level || 'Low').trim() as Student['predicted_risk_level'];
      const mName = (row.mentor_name || 'Not Required').trim();
      const mId = (row.mentor_id || '').trim();

      if (mId && mName !== 'Not Required' && mName !== 'No mentor available') {
        mentorCountMap[mId] = (mentorCountMap[mId] || 0) + 1;
      }

      let interventionStatus: InterventionStatus = 'Not Started';
      if (predRisk === 'High') {
        interventionStatus =
          mName !== 'Not Required' && mName !== 'No mentor available' ? 'In Progress' : 'Assigned';
      } else if (predRisk === 'Medium') {
        interventionStatus = 'Assigned';
      }

      const attendance = parseFloat(row.attendance_percent || '0');
      const avgScore = parseFloat(row.average_score || '0');
      const coding = parseFloat(row.coding_score || '0');
      const techSkill = parseFloat(row.technical_skill || '0');
      const commSkill = parseFloat(row.communication_skill || '0');
      const placementReadiness = parseFloat(row.placement_readiness || '0');
      const assignmentCompletion = parseFloat(row.assignment_completion_rate || '0');
      const satisfaction = parseFloat(row.student_satisfaction || '0');

      const flags: StudentRiskFlags = {
        low_attendance: attendance < 75,
        low_academic: avgScore < 60,
        low_coding: coding < 50,
        low_technical: techSkill < 60,
        low_communication: commSkill < 60,
        low_placement: placementReadiness < 60,
        low_assignment: assignmentCompletion < 70,
        low_satisfaction: satisfaction < 3.0,
      };

      return {
        student_id: row.student_id,
        name: row.name,
        email: row.email,
        department: row.department,
        gender: row.gender,
        city: row.city,
        admission_year: parseInt(row.admission_year || '2024', 10),
        attendance_percent: attendance,
        marks: parseFloat(row.marks || '0'),
        average_score: avgScore,
        total_assignments: parseInt(row.total_assignments || '0', 10),
        submitted: parseInt(row.submitted || '0', 10),
        assignment_completion_rate: assignmentCompletion,
        activities_joined: parseInt(row.activities_joined || '0', 10),
        activity_type: row.activity_type || 'None',
        events_attended: parseInt(row.events_attended || '0', 10),
        leadership_role: row.leadership_role || 'None',
        books_borrowed: parseInt(row.books_borrowed || '0', 10),
        books_returned: parseInt(row.books_returned || '0', 10),
        student_satisfaction: satisfaction,
        faculty_feedback: parseFloat(row.faculty_feedback || '0'),
        academic_support_need: row.academic_support_need || 'Low',
        career_support_need: row.career_support_need || 'Low',
        technical_skill: techSkill,
        communication_skill: commSkill,
        problem_solving: parseFloat(row.problem_solving || '0'),
        teamwork: parseFloat(row.teamwork || '0'),
        leadership: parseFloat(row.leadership || '0'),
        aptitude_score: parseFloat(row.aptitude_score || '0'),
        coding_score: coding,
        placement_communication_score: parseFloat(row.placement_communication_score || '0'),
        mock_interview_score: parseFloat(row.mock_interview_score || '0'),
        placement_readiness: placementReadiness,
        academic_score: parseFloat(row.academic_score || row.average_score || '0'),
        skill_score: parseFloat(row.skill_score || '0'),
        placement_score: parseFloat(row.placement_score || '0'),
        engagement_score: parseFloat(row.engagement_score || '0'),
        feedback_score: parseFloat(row.feedback_score || '0'),
        student_success_score: parseFloat(row.student_success_score || '0'),
        risk_level: row.risk_level || 'Low Risk',
        predicted_risk_level: predRisk,
        academic_risk_probability: parseFloat(row.academic_risk_probability || '0'),
        placement_risk_probability: parseFloat(row.placement_risk_probability || '0'),
        risk_factors: rf,
        main_risk_factor: rf[0] || (flags.low_attendance ? 'Low attendance' : flags.low_coding ? 'Low coding score' : 'None identified'),
        recommendations: rec,
        segment: parseInt(row.segment || '0', 10),
        segment_name: row.segment_name,
        mentor_id: mId,
        mentor_name: mName,
        mentor_match_reason: row.mentor_match_reason || 'None',
        intervention_status: interventionStatus,
        flags,
        last_mock_interview_date: row.last_activity ? row.last_activity : '2026-02-15',
        mock_interview_status: 'Not Scheduled',
      };
    });

    this.mentors = parsedMentors.map((row) => {
      const mId = (row.mentor_id || '').trim();
      const maxStudents = parseInt(row.max_students || '10', 10);
      const currentStudents = mentorCountMap[mId] || parseInt(row.current_students || '10', 10);
      const available = Math.max(0, maxStudents - currentStudents);
      const util = maxStudents > 0 ? Math.round((currentStudents / maxStudents) * 1000) / 10 : 0;
      const expertiseList = (row.expertise || '').split('|').map((e) => e.trim()).filter(Boolean);

      return {
        mentor_id: mId,
        mentor_name: row.mentor_name,
        department: row.department,
        expertise: expertiseList,
        expertise_raw: row.expertise || '',
        max_students: maxStudents,
        current_students: currentStudents,
        available_slots: available,
        utilization_percent: util,
      };
    });
  }

  private hydrateLocalStorage(): void {
    try {
      // 1. Interventions
      const savedInterventions = localStorage.getItem('sc_interventions');
      if (savedInterventions) {
        const parsedMap: Record<string, InterventionStatus> = JSON.parse(savedInterventions);
        this.students.forEach((s) => {
          if (parsedMap[s.student_id]) {
            s.intervention_status = parsedMap[s.student_id];
          }
        });
      }

      // 2. Mentors
      const savedMentors = localStorage.getItem('sc_assigned_mentors');
      if (savedMentors) {
        const parsedMentors: Record<string, { mentor_id: string; mentor_name: string }> =
          JSON.parse(savedMentors);
        this.students.forEach((s) => {
          if (parsedMentors[s.student_id]) {
            s.mentor_id = parsedMentors[s.student_id].mentor_id;
            s.mentor_name = parsedMentors[s.student_id].mentor_name;
          }
        });
        this.recalculateMentorLoads();
      }

      // 3. Mock Interviews
      const savedMock = localStorage.getItem('sc_mock_interviews_v2');
      if (savedMock) {
        this.mockInterviews = JSON.parse(savedMock);
      } else {
        this.initDefaultMockInterviews();
      }

      // 4. Feedbacks
      const savedFeedbacks = localStorage.getItem('sc_feedbacks_v2');
      if (savedFeedbacks) {
        this.feedbacks = JSON.parse(savedFeedbacks);
      } else {
        this.initDefaultFeedbacks();
      }

      // 5. Certificates
      const savedCertificates = localStorage.getItem('sc_certificates_v2');
      if (savedCertificates) {
        this.certificates = JSON.parse(savedCertificates);
      } else {
        this.initDefaultCertificates();
      }
    } catch (e) {
      console.error('Error hydrating localStorage state', e);
      this.initDefaultMockInterviews();
      this.initDefaultFeedbacks();
      this.initDefaultCertificates();
    }
  }

  private initDefaultMockInterviews(): void {
    const defaultInterviews: MockInterview[] = [
      {
        id: 'MI-101',
        student_id: 'STU10003',
        student_name: 'Sakshi Negi',
        department: 'Mechanical',
        mentor_id: 'M001',
        mentor_name: 'Rahul Sharma',
        interview_type: 'Technical Coding',
        scheduled_date: '2026-10-14',
        scheduled_time: '14:30',
        status: 'Scheduled',
        coding_score: 77.1,
        placement_risk: 63.5,
        last_mock_interview: '2026-03-19',
        notes: 'Focus on Data Structures and Placement Communication.',
        created_at: '2026-10-01',
      },
      {
        id: 'MI-102',
        student_id: 'STU10004',
        student_name: 'Ankit Malhotra',
        department: 'ECE',
        mentor_id: 'M003',
        mentor_name: 'Amit Kumar',
        interview_type: 'System Design',
        scheduled_date: '2026-10-15',
        scheduled_time: '11:00',
        status: 'Not Scheduled',
        coding_score: 69.5,
        placement_risk: 57.2,
        last_mock_interview: '2026-02-20',
        notes: 'Awaiting student confirmation on slot availability.',
        created_at: '2026-10-02',
      },
      {
        id: 'MI-103',
        student_id: 'STU10012',
        student_name: 'Rohan Deshmukh',
        department: 'CSE',
        mentor_id: 'M001',
        mentor_name: 'Rahul Sharma',
        interview_type: 'Technical Coding',
        scheduled_date: '2026-10-08',
        scheduled_time: '16:00',
        status: 'Completed',
        coding_score: 42.0,
        placement_risk: 78.4,
        last_mock_interview: '2026-10-08',
        notes: 'Solid progress in string problems; needs dynamic programming support.',
        feedback_notes: 'Scored 65/100. Recommend weekly LeetCode mentoring.',
        created_at: '2026-09-28',
      },
      {
        id: 'MI-104',
        student_id: 'STU10024',
        student_name: 'Kabir Srivastava',
        department: 'AI & DS',
        mentor_id: 'M002',
        mentor_name: 'Priya Mehta',
        interview_type: 'Behavioral & HR',
        scheduled_date: '2026-10-12',
        scheduled_time: '10:30',
        status: 'Completed',
        coding_score: 84.5,
        placement_risk: 21.0,
        last_mock_interview: '2026-10-12',
        notes: 'Demonstrated high poise and technical leadership.',
        feedback_notes: 'Scored 92/100. Ready for tier-1 campus placements.',
        created_at: '2026-10-04',
      },
      {
        id: 'MI-105',
        student_id: 'STU10035',
        student_name: 'Neha Verma',
        department: 'BCA',
        mentor_id: 'M002',
        mentor_name: 'Priya Mehta',
        interview_type: 'Placement Readiness',
        scheduled_date: '2026-10-18',
        scheduled_time: '15:00',
        status: 'Needs Follow-up',
        coding_score: 38.5,
        placement_risk: 72.0,
        last_mock_interview: '2026-09-15',
        notes: 'Student requested rescheduling due to mid-semester exams.',
        created_at: '2026-09-25',
      },
      {
        id: 'MI-106',
        student_id: 'STU10048',
        student_name: 'Vikas Patel',
        department: 'Civil',
        mentor_id: 'M003',
        mentor_name: 'Amit Kumar',
        interview_type: 'Technical Coding',
        scheduled_date: '2026-10-20',
        scheduled_time: '13:00',
        status: 'Not Scheduled',
        coding_score: 32.0,
        placement_risk: 84.0,
        last_mock_interview: 'None',
        notes: 'Priority intervention for IT placement eligibility.',
        created_at: '2026-10-05',
      },
    ];

    this.mockInterviews = defaultInterviews;
    try {
      localStorage.setItem('sc_mock_interviews_v2', JSON.stringify(defaultInterviews));
    } catch (e) {
      console.error(e);
    }
  }

  private initDefaultFeedbacks(): void {
    const defaultFeedbacks: FeedbackItem[] = [
      {
        id: 'FB-01',
        student_id: 'STU10003',
        student_name: 'Sakshi Negi',
        mentor_id: 'M001',
        mentor_name: 'Rahul Sharma',
        category: 'Coding',
        rating: 4,
        comment:
          'Sakshi shows great dedication in algorithms sessions. Needs structured practice in graph theory.',
        department: 'Mechanical',
        created_at: '2026-10-04',
      },
      {
        id: 'FB-02',
        student_id: 'STU10004',
        student_name: 'Ankit Malhotra',
        mentor_id: 'M003',
        mentor_name: 'Amit Kumar',
        category: 'Attendance',
        rating: 3,
        comment:
          'Attendance improved over last 3 weeks from 58% to 72%. On track to reach clearance threshold.',
        department: 'ECE',
        created_at: '2026-10-03',
      },
      {
        id: 'FB-03',
        student_id: 'STU10012',
        student_name: 'Rohan Deshmukh',
        mentor_id: 'M001',
        mentor_name: 'Rahul Sharma',
        category: 'Placement',
        rating: 2,
        comment:
          'Needs intensive resume review and mock aptitude practice. Technical foundation requires reinforcement.',
        department: 'CSE',
        created_at: '2026-10-01',
      },
      {
        id: 'FB-04',
        student_id: 'STU10024',
        student_name: 'Kabir Srivastava',
        mentor_id: 'M002',
        mentor_name: 'Priya Mehta',
        category: 'Communication',
        rating: 5,
        comment:
          'Exemplary technical articulation and team presentation skills demonstrated during campus hackathon prep.',
        department: 'AI & DS',
        created_at: '2026-09-30',
      },
      {
        id: 'FB-05',
        student_id: 'STU10001',
        student_name: 'Kritika Agarwal',
        mentor_id: 'M004',
        mentor_name: 'Neha Gupta',
        category: 'Overall',
        rating: 5,
        comment:
          'Outstanding academic rigor and classroom contribution. Recommended for university honor society.',
        department: 'BBA',
        created_at: '2026-09-28',
      },
    ];

    this.feedbacks = defaultFeedbacks;
    try {
      localStorage.setItem('sc_feedbacks_v2', JSON.stringify(defaultFeedbacks));
    } catch (e) {
      console.error(e);
    }
  }

  private initDefaultCertificates(): void {
    const defaultCerts: CertificateItem[] = [
      {
        id: 'CERT-001',
        student_id: 'STU10024',
        student_name: 'Kabir Srivastava',
        department: 'AI & DS',
        hackathon_name: 'Smart Campus Hackathon',
        role: 'Team Member',
        achievement: 'Finalist',
        status: 'Verified',
        certificate_date: '2026-03-15',
        credential_id: 'SCH-2026-FN-0412',
        verified_by: 'Dean Academic Affairs Office',
        verified_at: '2026-03-18',
      },
      {
        id: 'CERT-002',
        student_id: 'STU10001',
        student_name: 'Kritika Agarwal',
        department: 'BBA',
        hackathon_name: 'National FinTech Innovation Challenge',
        role: 'Team Lead',
        achievement: 'Winner - 1st Place',
        status: 'Verified',
        certificate_date: '2026-02-28',
        credential_id: 'NFT-2026-WN-109',
        verified_by: 'Dean Academic Affairs Office',
        verified_at: '2026-03-02',
      },
      {
        id: 'CERT-003',
        student_id: 'STU10002',
        student_name: 'Isha Rajput',
        department: 'AI & DS',
        hackathon_name: 'Inter-College AI Sprint',
        role: 'ML Engineer',
        achievement: 'Runner Up - 2nd Place',
        status: 'Verified',
        certificate_date: '2026-04-10',
        credential_id: 'AIS-2026-RU-204',
        verified_by: 'Dept Coordinator',
        verified_at: '2026-04-12',
      },
      {
        id: 'CERT-004',
        student_id: 'STU10005',
        student_name: 'Kabir Jain',
        department: 'CSE',
        hackathon_name: 'Smart Campus Hackathon',
        role: 'Full-Stack Developer',
        achievement: 'Best Technical Solution',
        status: 'Pending Verification',
        certificate_date: '2026-03-15',
        credential_id: 'SCH-2026-BTS-008',
      },
      {
        id: 'CERT-005',
        student_id: 'STU10015',
        student_name: 'Aarav Sharma',
        department: 'ECE',
        hackathon_name: 'IoT Hardware Hackfest',
        role: 'Embedded Dev',
        achievement: 'Special Jury Award',
        status: 'Verified',
        certificate_date: '2026-01-22',
        credential_id: 'IOT-2026-SJA-033',
        verified_by: 'Dean Academic Affairs Office',
        verified_at: '2026-01-25',
      },
      {
        id: 'CERT-006',
        student_id: 'STU10032',
        student_name: 'Ananya Roy',
        department: 'BCA',
        hackathon_name: 'Cloud Native Developer Sprint',
        role: 'Cloud Architect',
        achievement: 'Finalist',
        status: 'Pending Verification',
        certificate_date: '2026-05-04',
        credential_id: 'CNDS-2026-FN-115',
      },
    ];

    this.certificates = defaultCerts;
    try {
      localStorage.setItem('sc_certificates_v2', JSON.stringify(defaultCerts));
    } catch (e) {
      console.error(e);
    }
  }

  private recalculateMentorLoads(): void {
    const counts: Record<string, number> = {};
    this.students.forEach((s) => {
      if (s.mentor_name !== 'Not Required' && s.mentor_name !== 'No mentor available') {
        counts[s.mentor_id] = (counts[s.mentor_id] || 0) + 1;
      }
    });

    this.mentors.forEach((m) => {
      m.current_students = counts[m.mentor_id] || 0;
      m.available_slots = Math.max(0, m.max_students - m.current_students);
      m.utilization_percent = Math.round((m.current_students / m.max_students) * 1000) / 10;
    });
  }

  public async ensureDataLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.init();
    }
  }

  // Dashboard KPIs
  public async getDashboardKPIs(): Promise<DashboardKPIs> {
    const remote = await apiFetch<any>('/analytics/overview');
    if (remote) {
      return {
        total_students: remote.total_students,
        avg_success_score: remote.average_success_score,
        high_risk_students: remote.high_risk_students,
        high_risk_percentage: Math.round((remote.high_risk_students / remote.total_students) * 1000) / 10,
        students_without_mentor: remote.students_without_mentor,
        pending_mock_interviews: remote.pending_mock_interviews,
        avg_coding_score: remote.avg_coding_score,
        assigned_to_mentors: remote.total_students - remote.students_without_mentor,
      };
    }

    await this.ensureDataLoaded();
    const total = this.students.length;
    if (total === 0) {
      return {
        total_students: 0,
        avg_success_score: 0,
        high_risk_students: 0,
        high_risk_percentage: 0,
        students_without_mentor: 0,
        pending_mock_interviews: 0,
        avg_coding_score: 0,
        assigned_to_mentors: 0,
      };
    }

    const totalSuccess = this.students.reduce((acc, s) => acc + s.student_success_score, 0);
    const totalCoding = this.students.reduce((acc, s) => acc + s.coding_score, 0);
    const highRisk = this.students.filter((s) => s.predicted_risk_level === 'High').length;
    const assignedMentors = this.students.filter(
      (s) => s.mentor_name !== 'Not Required' && s.mentor_name !== 'No mentor available'
    ).length;
    const withoutMentor = this.students.filter(
      (s) =>
        s.predicted_risk_level === 'High' &&
        (s.mentor_name === 'No mentor available' || !s.mentor_id || s.mentor_name === 'Not Required')
    ).length;
    const pendingInterviews = this.mockInterviews.filter(
      (i) => i.status === 'Not Scheduled' || i.status === 'Needs Follow-up'
    ).length;

    return {
      total_students: total,
      avg_success_score: Math.round((totalSuccess / total) * 10) / 10,
      high_risk_students: highRisk,
      high_risk_percentage: Math.round((highRisk / total) * 1000) / 10,
      students_without_mentor: withoutMentor,
      pending_mock_interviews: pendingInterviews,
      avg_coding_score: Math.round((totalCoding / total) * 10) / 10,
      assigned_to_mentors: assignedMentors,
    };
  }

  // Risk Distribution Donut Chart
  public async getRiskDistribution(): Promise<RiskDistribution[]> {
    const remote = await apiFetch<RiskDistribution[]>('/analytics/risk-distribution');
    if (remote) return remote;

    await this.ensureDataLoaded();
    const counts = { High: 0, Medium: 0, Low: 0 };
    this.students.forEach((s) => {
      counts[s.predicted_risk_level] = (counts[s.predicted_risk_level] || 0) + 1;
    });

    const total = this.students.length || 1;
    return [
      {
        name: 'Low Risk',
        count: counts.Low,
        percentage: Math.round((counts.Low / total) * 1000) / 10,
        color: '#6FCF97', // Success green
      },
      {
        name: 'Medium Risk',
        count: counts.Medium,
        percentage: Math.round((counts.Medium / total) * 1000) / 10,
        color: '#F2C94C', // Warning yellow
      },
      {
        name: 'High Risk',
        count: counts.High,
        percentage: Math.round((counts.High / total) * 1000) / 10,
        color: '#EB5757', // Danger red
      },
    ];
  }

  // Department-wise average Success Score Bar Chart
  public async getDepartmentScores(): Promise<DepartmentScore[]> {
    const remote = await apiFetch<any[]>('/analytics/departments');
    if (remote) {
      return remote.map((d) => ({
        department: d.department,
        avg_success_score: d.average_success_score,
        student_count: d.student_count,
        high_risk_count: d.high_risk_count,
        avg_attendance: d.average_attendance,
      }));
    }

    await this.ensureDataLoaded();
    const map: Record<
      string,
      { totalScore: number; count: number; highRisk: number; totalAttendance: number }
    > = {};

    this.students.forEach((s) => {
      if (!map[s.department]) {
        map[s.department] = { totalScore: 0, count: 0, highRisk: 0, totalAttendance: 0 };
      }
      map[s.department].totalScore += s.student_success_score;
      map[s.department].totalAttendance += s.attendance_percent;
      map[s.department].count += 1;
      if (s.predicted_risk_level === 'High') {
        map[s.department].highRisk += 1;
      }
    });

    return Object.entries(map)
      .map(([dept, data]) => ({
        department: dept,
        avg_success_score: Math.round((data.totalScore / data.count) * 10) / 10,
        student_count: data.count,
        high_risk_count: data.highRisk,
        avg_attendance: Math.round((data.totalAttendance / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.avg_success_score - a.avg_success_score);
  }

  // Department Coding Performance
  public async getDepartmentCodingScores(): Promise<DepartmentCodingScore[]> {
    const remote = await apiFetch<any>('/analytics/coding');
    if (remote && remote.department_breakdown) {
      return remote.department_breakdown.map((d: any) => ({
        department: d.department,
        avg_coding_score: d.average_coding,
        avg_technical_skill: Math.round((d.average_coding + 2) * 10) / 10,
        student_count: d.total,
        below_50_count: d.below_threshold,
        is_low_performing: d.average_coding < 65,
      }));
    }

    await this.ensureDataLoaded();
    const map: Record<
      string,
      { totalCoding: number; totalTech: number; count: number; below50: number }
    > = {};

    this.students.forEach((s) => {
      if (!map[s.department]) {
        map[s.department] = { totalCoding: 0, totalTech: 0, count: 0, below50: 0 };
      }
      map[s.department].totalCoding += s.coding_score;
      map[s.department].totalTech += s.technical_skill;
      map[s.department].count += 1;
      if (s.coding_score < 50) {
        map[s.department].below50 += 1;
      }
    });

    const results = Object.entries(map).map(([dept, data]) => {
      const avg = Math.round((data.totalCoding / data.count) * 10) / 10;
      return {
        department: dept,
        avg_coding_score: avg,
        avg_technical_skill: Math.round((data.totalTech / data.count) * 10) / 10,
        student_count: data.count,
        below_50_count: data.below50,
        is_low_performing: avg < 65,
      };
    });

    return results.sort((a, b) => b.avg_coding_score - a.avg_coding_score);
  }

  // Coding & Skills KPIs
  public async getCodingSkillsKPIs(): Promise<CodingSkillsKPIs> {
    const [codingRes, skillsRes] = await Promise.all([
      apiFetch<any>('/analytics/coding'),
      apiFetch<any>('/analytics/skills'),
    ]);
    if (codingRes && skillsRes && skillsRes.averages) {
      return {
        avg_coding_score: codingRes.average_coding_score,
        avg_technical_skill: skillsRes.averages.technical_skill,
        avg_problem_solving: skillsRes.averages.problem_solving,
        avg_communication_skill: skillsRes.averages.communication_skill,
        students_below_50: codingRes.students_below_threshold,
        percentage_below_50: codingRes.percentage_below_threshold,
      };
    }

    await this.ensureDataLoaded();
    const total = this.students.length || 1;
    let sumCoding = 0;
    let sumTech = 0;
    let sumProblem = 0;
    let sumComm = 0;
    let countBelow50 = 0;

    this.students.forEach((s) => {
      sumCoding += s.coding_score;
      sumTech += s.technical_skill;
      sumProblem += s.problem_solving;
      sumComm += s.communication_skill;
      if (s.coding_score < 50) countBelow50++;
    });

    return {
      avg_coding_score: Math.round((sumCoding / total) * 10) / 10,
      avg_technical_skill: Math.round((sumTech / total) * 10) / 10,
      avg_problem_solving: Math.round((sumProblem / total) * 10) / 10,
      avg_communication_skill: Math.round((sumComm / total) * 10) / 10,
      students_below_50: countBelow50,
      percentage_below_50: Math.round((countBelow50 / total) * 1000) / 10,
    };
  }

  // Coding Score Distribution
  public async getCodingDistribution(): Promise<CodingDistributionBucket[]> {
    await this.ensureDataLoaded();
    const buckets = [
      { range: '< 40 (Critical)', count: 0, color: '#EB5757' },
      { range: '40 - 59 (Developing)', count: 0, color: '#F2C94C' },
      { range: '60 - 79 (Proficient)', count: 0, color: '#6EA8FE' },
      { range: '80 - 100 (Advanced)', count: 0, color: '#6FCF97' },
    ];

    this.students.forEach((s) => {
      if (s.coding_score < 40) buckets[0].count++;
      else if (s.coding_score < 60) buckets[1].count++;
      else if (s.coding_score < 80) buckets[2].count++;
      else buckets[3].count++;
    });

    const total = this.students.length || 1;
    return buckets.map((b) => ({
      range: b.range,
      count: b.count,
      percentage: Math.round((b.count / total) * 1000) / 10,
      color: b.color,
    }));
  }

  // Students Needing Coding Support
  public async getStudentsNeedingCodingSupport(limit = 50): Promise<Student[]> {
    await this.ensureDataLoaded();
    return [...this.students]
      .filter((s) => s.coding_score < 55)
      .sort((a, b) => a.coding_score - b.coding_score)
      .slice(0, limit);
  }

  // Student Segments distribution
  public async getSegmentDistribution(): Promise<SegmentStats[]> {
    const remote = await apiFetch<any[]>('/analytics/segments');
    if (remote && remote.length > 0) {
      return remote.map((s) => ({
        segment_name: s.segment_name,
        student_count: s.student_count,
        percentage: s.percentage,
        avg_success_score: s.average_success_score ?? s.avg_success_score,
        avg_academic_score: s.average_academic_score ?? s.avg_academic_score,
        avg_placement_score: s.average_placement_score ?? s.avg_placement_score,
        avg_engagement_score: s.average_engagement_score ?? s.avg_engagement_score,
        color: s.color,
        description: s.description,
      }));
    }

    await this.ensureDataLoaded();
    const segmentConfig: Record<string, { color: string; desc: string }> = {
      'High Performers': {
        color: '#6EA8FE',
        desc: 'Top academic and technical achievers with high engagement and leadership.',
      },
      'Strong & Engaged': {
        color: '#6FCF97',
        desc: 'Consistent performers with high attendance and active campus participation.',
      },
      'Developing Students': {
        color: '#F2C94C',
        desc: 'Steady progress, potential vulnerability in placement readiness or coding mastery.',
      },
      'High Risk - Needs Intervention': {
        color: '#EB5757',
        desc: 'Flagged for urgent academic tutoring, attendance monitoring, and mentor assignment.',
      },
    };

    const map: Record<
      string,
      {
        count: number;
        totalSuccess: number;
        totalAcademic: number;
        totalPlacement: number;
        totalEngagement: number;
      }
    > = {
      'High Performers': { count: 0, totalSuccess: 0, totalAcademic: 0, totalPlacement: 0, totalEngagement: 0 },
      'Strong & Engaged': { count: 0, totalSuccess: 0, totalAcademic: 0, totalPlacement: 0, totalEngagement: 0 },
      'Developing Students': { count: 0, totalSuccess: 0, totalAcademic: 0, totalPlacement: 0, totalEngagement: 0 },
      'High Risk - Needs Intervention': { count: 0, totalSuccess: 0, totalAcademic: 0, totalPlacement: 0, totalEngagement: 0 },
    };

    this.students.forEach((s) => {
      const segName = s.segment_name || 'Developing Students';
      if (!map[segName]) {
        map[segName] = { count: 0, totalSuccess: 0, totalAcademic: 0, totalPlacement: 0, totalEngagement: 0 };
      }
      map[segName].count += 1;
      map[segName].totalSuccess += s.student_success_score;
      map[segName].totalAcademic += s.academic_score;
      map[segName].totalPlacement += s.placement_score;
      map[segName].totalEngagement += s.engagement_score;
    });

    const totalStudents = this.students.length || 1;

    return Object.entries(map).map(([name, data]) => {
      const c = data.count || 1;
      const conf = segmentConfig[name] || { color: '#8B9CFF', desc: 'Cohort' };
      return {
        segment_name: name,
        student_count: data.count,
        percentage: Math.round((data.count / totalStudents) * 1000) / 10,
        avg_success_score: Math.round((data.totalSuccess / c) * 10) / 10,
        avg_academic_score: Math.round((data.totalAcademic / c) * 10) / 10,
        avg_placement_score: Math.round((data.totalPlacement / c) * 10) / 10,
        avg_engagement_score: Math.round((data.totalEngagement / c) * 10) / 10,
        color: conf.color,
        description: conf.desc,
      };
    });
  }

  // Risk Flags Summary Across Campus
  public async getRiskFlagsSummary(): Promise<{
    lowAttendance: number;
    lowAcademic: number;
    lowCoding: number;
    lowTechnical: number;
    lowCommunication: number;
    lowPlacement: number;
    lowAssignment: number;
    lowSatisfaction: number;
  }> {
    await this.ensureDataLoaded();
    const summary = {
      lowAttendance: 0,
      lowAcademic: 0,
      lowCoding: 0,
      lowTechnical: 0,
      lowCommunication: 0,
      lowPlacement: 0,
      lowAssignment: 0,
      lowSatisfaction: 0,
    };

    this.students.forEach((s) => {
      if (s.flags.low_attendance) summary.lowAttendance++;
      if (s.flags.low_academic) summary.lowAcademic++;
      if (s.flags.low_coding) summary.lowCoding++;
      if (s.flags.low_technical) summary.lowTechnical++;
      if (s.flags.low_communication) summary.lowCommunication++;
      if (s.flags.low_placement) summary.lowPlacement++;
      if (s.flags.low_assignment) summary.lowAssignment++;
      if (s.flags.low_satisfaction) summary.lowSatisfaction++;
    });

    return summary;
  }

  // Attention students (Dashboard)
  public async getStudentsRequiringAttention(limit = 8): Promise<Student[]> {
    const remote = await apiFetch<Student[]>(`/students/high-risk?limit=${limit}`);
    if (remote && remote.length > 0) return remote;

    await this.ensureDataLoaded();
    return [...this.students]
      .filter((s) => s.predicted_risk_level === 'High')
      .sort((a, b) => a.student_success_score - b.student_success_score)
      .slice(0, limit);
  }

  // Filtered & Paginated Students list
  public async getStudents(params: StudentFilterParams = {}): Promise<PaginatedResult<Student>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.pageSize) queryParams.set('limit', String(params.pageSize));
    if (params.search) queryParams.set('search', params.search);
    if (params.department && params.department !== 'all') queryParams.set('department', params.department);
    if (params.riskLevel && params.riskLevel !== 'all') queryParams.set('risk', params.riskLevel);
    if (params.mentorStatus && params.mentorStatus !== 'all') queryParams.set('mentor', params.mentorStatus);
    if (params.codingRange && params.codingRange !== 'all') queryParams.set('codingRange', params.codingRange);
    if (params.segment && params.segment !== 'all') queryParams.set('segment', params.segment);
    if (params.flagFilter && params.flagFilter !== 'all') queryParams.set('flagFilter', params.flagFilter);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const remote = await apiFetch<PaginatedResult<Student>>(`/students?${queryParams.toString()}`);
    if (remote && remote.data && remote.data.length > 0) {
      return remote;
    }

    await this.ensureDataLoaded();
    const {
      search = '',
      department = 'all',
      riskLevel = 'all',
      segment = 'all',
      mentorStatus = 'all',
      codingRange = 'all',
      flagFilter = 'all',
      page = 1,
      pageSize = 25,
      sortBy = 'student_success_score',
      sortOrder = 'asc',
    } = params;

    let filtered = [...this.students];

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.student_id.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (department !== 'all') {
      filtered = filtered.filter((s) => s.department === department);
    }

    // Risk level filter
    if (riskLevel !== 'all') {
      filtered = filtered.filter((s) => s.predicted_risk_level === riskLevel || s.risk_level === riskLevel);
    }

    // Segment filter
    if (segment !== 'all') {
      filtered = filtered.filter((s) => s.segment_name === segment);
    }

    // Mentor status filter
    if (mentorStatus !== 'all') {
      if (mentorStatus === 'Assigned') {
        filtered = filtered.filter(
          (s) => s.mentor_name !== 'Not Required' && s.mentor_name !== 'No mentor available'
        );
      } else if (mentorStatus === 'Pending') {
        filtered = filtered.filter((s) => s.mentor_name === 'No mentor available');
      } else if (mentorStatus === 'Not Required') {
        filtered = filtered.filter((s) => s.mentor_name === 'Not Required');
      }
    }

    // Coding range filter
    if (codingRange !== 'all') {
      if (codingRange === 'below50') filtered = filtered.filter((s) => s.coding_score < 50);
      else if (codingRange === '50to75') filtered = filtered.filter((s) => s.coding_score >= 50 && s.coding_score <= 75);
      else if (codingRange === 'above75') filtered = filtered.filter((s) => s.coding_score > 75);
    }

    // Flag filter
    if (flagFilter !== 'all') {
      if (flagFilter === 'low_attendance') filtered = filtered.filter((s) => s.flags.low_attendance);
      else if (flagFilter === 'low_academic') filtered = filtered.filter((s) => s.flags.low_academic);
      else if (flagFilter === 'low_coding') filtered = filtered.filter((s) => s.flags.low_coding);
      else if (flagFilter === 'low_technical') filtered = filtered.filter((s) => s.flags.low_technical);
      else if (flagFilter === 'low_communication') filtered = filtered.filter((s) => s.flags.low_communication);
      else if (flagFilter === 'low_placement') filtered = filtered.filter((s) => s.flags.low_placement);
      else if (flagFilter === 'low_assignment') filtered = filtered.filter((s) => s.flags.low_assignment);
      else if (flagFilter === 'low_satisfaction') filtered = filtered.filter((s) => s.flags.low_satisfaction);
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = (a as unknown as Record<string, any>)[sortBy];
      const bVal = (b as unknown as Record<string, any>)[sortBy];

      if (typeof aVal === 'string') {
        const aStr = aVal.toLowerCase();
        const bStr = ((bVal as string) || '').toLowerCase();
        return sortOrder === 'asc' ? (aStr > bStr ? 1 : -1) : (aStr < bStr ? 1 : -1);
      }

      const numA = Number(aVal) || 0;
      const numB = Number(bVal) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  // Risk analysis data for legacy component if needed
  public async getRiskAnalysis(): Promise<{
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    academicRiskDistribution: Array<{ range: string; count: number; percentage: number }>;
    placementRiskDistribution: Array<{ range: string; count: number; percentage: number }>;
    highRiskStudents: Student[];
  }> {
    await this.ensureDataLoaded();
    const high = this.students.filter((s) => s.predicted_risk_level === 'High');
    const medium = this.students.filter((s) => s.predicted_risk_level === 'Medium');
    const low = this.students.filter((s) => s.predicted_risk_level === 'Low');
    const total = this.students.length || 1;

    const acadBuckets = [
      { range: '0 - 20%', count: 0 },
      { range: '21 - 40%', count: 0 },
      { range: '41 - 60%', count: 0 },
      { range: '61 - 80%', count: 0 },
      { range: '81 - 100%', count: 0 },
    ];

    const placeBuckets = [
      { range: '0 - 20%', count: 0 },
      { range: '21 - 40%', count: 0 },
      { range: '41 - 60%', count: 0 },
      { range: '61 - 80%', count: 0 },
      { range: '81 - 100%', count: 0 },
    ];

    this.students.forEach((s) => {
      const a = s.academic_risk_probability;
      if (a <= 20) acadBuckets[0].count++;
      else if (a <= 40) acadBuckets[1].count++;
      else if (a <= 60) acadBuckets[2].count++;
      else if (a <= 80) acadBuckets[3].count++;
      else acadBuckets[4].count++;

      const p = s.placement_risk_probability;
      if (p <= 20) placeBuckets[0].count++;
      else if (p <= 40) placeBuckets[1].count++;
      else if (p <= 60) placeBuckets[2].count++;
      else if (p <= 80) placeBuckets[3].count++;
      else placeBuckets[4].count++;
    });

    return {
      highRiskCount: high.length,
      mediumRiskCount: medium.length,
      lowRiskCount: low.length,
      academicRiskDistribution: acadBuckets.map((b) => ({
        range: b.range,
        count: b.count,
        percentage: Math.round((b.count / total) * 1000) / 10,
      })),
      placementRiskDistribution: placeBuckets.map((b) => ({
        range: b.range,
        count: b.count,
        percentage: Math.round((b.count / total) * 1000) / 10,
      })),
      highRiskStudents: high.slice(0, 50),
    };
  }

  // Get Faculty Member's Mentees
  public async getFacultyStudents(mentorName = 'Rahul Sharma'): Promise<Student[]> {
    await this.ensureDataLoaded();
    const clean = mentorName.toLowerCase();
    const matches = this.students.filter(
      (s) =>
        s.mentor_name.toLowerCase().includes(clean) ||
        (s.department === 'CSE' && s.predicted_risk_level === 'High')
    );
    return matches.slice(0, 30);
  }

  // Get single student by ID
  public async getStudentById(studentId: string): Promise<Student | undefined> {
    const remote = await apiFetch<Student>(`/students/${studentId}`);
    if (remote) return remote;

    await this.ensureDataLoaded();
    return this.students.find((s) => s.student_id === studentId);
  }

  // Mentors list
  public async getMentors(department = 'all'): Promise<Mentor[]> {
    const remote = await apiFetch<Mentor[]>(`/mentors?department=${department}`);
    if (remote && remote.length > 0) return remote;

    await this.ensureDataLoaded();
    if (department === 'all') {
      return [...this.mentors];
    }
    return this.mentors.filter((m) => m.department === department);
  }

  // AI Recommendations page query
  public async getRecommendations(params: {
    status?: string;
    riskLevel?: string;
    department?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    data: Student[];
    total: number;
    stats: { total: number; notStarted: number; assigned: number; inProgress: number; completed: number };
  }> {
    await this.ensureDataLoaded();
    const { status = 'all', riskLevel = 'all', department = 'all', search = '', page = 1, pageSize = 20 } = params;

    let list = this.students.filter((s) => s.recommendations && s.recommendations.length > 0);

    const stats = {
      total: list.length,
      notStarted: list.filter((s) => s.intervention_status === 'Not Started').length,
      assigned: list.filter((s) => s.intervention_status === 'Assigned').length,
      inProgress: list.filter((s) => s.intervention_status === 'In Progress').length,
      completed: list.filter((s) => s.intervention_status === 'Completed').length,
    };

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q));
    }

    if (status !== 'all') {
      list = list.filter((s) => s.intervention_status === status);
    }

    if (riskLevel !== 'all') {
      list = list.filter((s) => s.predicted_risk_level === riskLevel);
    }

    if (department !== 'all') {
      list = list.filter((s) => s.department === department);
    }

    const total = list.length;
    const startIdx = (page - 1) * pageSize;
    const paginated = list.slice(startIdx, startIdx + pageSize);

    return {
      data: paginated,
      total,
      stats,
    };
  }

  // Update Intervention Status
  public async updateInterventionStatus(studentId: string, status: InterventionStatus): Promise<boolean> {
    await apiFetch<any>(`/students/${studentId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    await this.ensureDataLoaded();
    const student = this.students.find((s) => s.student_id === studentId);
    if (!student) return false;

    student.intervention_status = status;

    try {
      const saved = localStorage.getItem('sc_interventions');
      const map = saved ? JSON.parse(saved) : {};
      map[studentId] = status;
      localStorage.setItem('sc_interventions', JSON.stringify(map));
    } catch (e) {
      console.error(e);
    }

    this.notifySubscribers();
    return true;
  }

  // Assign Mentor to Student
  public async assignMentor(studentId: string, mentorId: string): Promise<boolean> {
    await apiFetch<any>('/mentors/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, mentor_id: mentorId }),
    });

    await this.ensureDataLoaded();
    const student = this.students.find((s) => s.student_id === studentId);
    const mentor = this.mentors.find((m) => m.mentor_id === mentorId);
    if (!student || !mentor) return false;

    student.mentor_id = mentor.mentor_id;
    student.mentor_name = mentor.mentor_name;
    student.mentor_match_reason = `Assigned based on faculty expertise in ${mentor.expertise.join(', ')}`;
    if (student.intervention_status === 'Assigned' || student.intervention_status === 'Not Started') {
      student.intervention_status = 'In Progress';
    }

    this.recalculateMentorLoads();

    try {
      const saved = localStorage.getItem('sc_assigned_mentors');
      const map = saved ? JSON.parse(saved) : {};
      map[studentId] = { mentor_id: mentor.mentor_id, mentor_name: mentor.mentor_name };
      localStorage.setItem('sc_assigned_mentors', JSON.stringify(map));
    } catch (e) {
      console.error(e);
    }

    this.notifySubscribers();
    return true;
  }

  // ==================== MOCK INTERVIEWS ====================
  public async getMockInterviews(filters: {
    status?: string;
    department?: string;
    search?: string;
  } = {}): Promise<MockInterview[]> {
    const queryParams = new URLSearchParams();
    if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status);
    if (filters.department && filters.department !== 'all') queryParams.set('department', filters.department);
    if (filters.search) queryParams.set('search', filters.search);

    const remote = await apiFetch<any[]>(`/interviews?${queryParams.toString()}`);
    if (remote && remote.length > 0) {
      return remote.map((r) => ({
        id: r.id,
        student_id: r.student_id,
        student_name: r.student_name,
        department: r.department || '',
        mentor_id: r.mentor_id || r.interviewer_id || '',
        mentor_name: r.mentor_name || r.interviewer || '',
        interview_type: r.interview_type || r.type || 'Technical Coding',
        scheduled_date: r.scheduled_date || r.date || '',
        scheduled_time: r.scheduled_time || r.time || '',
        status: r.status,
        coding_score: r.coding_score || 0,
        placement_risk: r.placement_risk || 0,
        last_mock_interview: r.last_mock_interview || '',
        notes: r.notes || '',
        feedback_notes: r.feedback_notes || '',
        created_at: r.created_at || '',
      }));
    }

    await this.ensureDataLoaded();
    let res = [...this.mockInterviews];

    if (filters.status && filters.status !== 'all') {
      res = res.filter((i) => i.status === filters.status);
    }

    if (filters.department && filters.department !== 'all') {
      res = res.filter((i) => i.department === filters.department);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      res = res.filter(
        (i) =>
          i.student_name.toLowerCase().includes(q) ||
          i.student_id.toLowerCase().includes(q) ||
          i.mentor_name.toLowerCase().includes(q)
      );
    }

    return res;
  }

  public async assignMockInterview(params: {
    student_id: string;
    mentor_id: string;
    interview_type: InterviewType;
    scheduled_date: string;
    scheduled_time: string;
    notes?: string;
  }): Promise<MockInterview | null> {
    await this.ensureDataLoaded();
    const student = this.students.find((s) => s.student_id === params.student_id);
    const mentor = this.mentors.find((m) => m.mentor_id === params.mentor_id);
    if (!student || !mentor) return null;

    // Send to backend API
    await apiFetch<any>('/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: params.student_id,
        student_name: student.name,
        interviewer: mentor.mentor_name,
        interviewer_id: mentor.mentor_id,
        mentor_name: mentor.mentor_name,
        mentor_id: mentor.mentor_id,
        type: params.interview_type,
        interview_type: params.interview_type,
        date: params.scheduled_date,
        scheduled_date: params.scheduled_date,
        time: params.scheduled_time,
        scheduled_time: params.scheduled_time,
        notes: params.notes,
        status: 'Scheduled',
      }),
    });

    const newInterview: MockInterview = {
      id: `MI-${Date.now().toString().slice(-4)}`,
      student_id: student.student_id,
      student_name: student.name,
      department: student.department,
      mentor_id: mentor.mentor_id,
      mentor_name: mentor.mentor_name,
      interview_type: params.interview_type,
      scheduled_date: params.scheduled_date,
      scheduled_time: params.scheduled_time,
      status: 'Scheduled',
      coding_score: student.coding_score,
      placement_risk: student.placement_risk_probability,
      last_mock_interview: student.last_mock_interview_date || '2026-03-01',
      notes: params.notes || 'Institutional placement mock interview session.',
      created_at: new Date().toISOString().split('T')[0],
    };

    this.mockInterviews.unshift(newInterview);
    student.mock_interview_status = 'Scheduled';

    try {
      localStorage.setItem('sc_mock_interviews_v2', JSON.stringify(this.mockInterviews));
    } catch (e) {
      console.error(e);
    }

    this.notifySubscribers();
    return newInterview;
  }

  public async updateMockInterviewStatus(id: string, status: InterviewStatus, feedbackNotes?: string): Promise<boolean> {
    await apiFetch<any>(`/interviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        notes: feedbackNotes,
        feedback_notes: feedbackNotes,
      }),
    });

    await this.ensureDataLoaded();
    const item = this.mockInterviews.find((i) => i.id === id);
    if (!item) return false;

    item.status = status;
    if (feedbackNotes) item.feedback_notes = feedbackNotes;

    const student = this.students.find((s) => s.student_id === item.student_id);
    if (student) {
      student.mock_interview_status = status;
      if (status === 'Completed') {
        student.last_mock_interview_date = new Date().toISOString().split('T')[0];
      }
    }

    try {
      localStorage.setItem('sc_mock_interviews_v2', JSON.stringify(this.mockInterviews));
    } catch (e) {
      console.error(e);
    }

    this.notifySubscribers();
    return true;
  }

  // ==================== FEEDBACK ====================
  public async getFeedbacks(category = 'all', department = 'all'): Promise<FeedbackItem[]> {
    const remote = await apiFetch<any[]>(`/feedback?category=${category}&department=${department}`);
    if (remote && remote.length > 0) {
      return remote.map((r) => ({
        id: r.id,
        student_id: r.student_id,
        student_name: r.student_name,
        mentor_id: r.mentor_id || '',
        mentor_name: r.mentor_name || r.mentor || '',
        category: r.category,
        rating: r.rating,
        comment: r.comment || r.feedback || '',
        department: r.department || '',
        created_at: r.created_at || r.date || '',
      }));
    }

    await this.ensureDataLoaded();
    let res = [...this.feedbacks];
    if (category !== 'all') {
      res = res.filter((f) => f.category === category);
    }
    if (department !== 'all') {
      res = res.filter((f) => f.department === department);
    }
    return res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async submitFeedback(params: {
    student_id: string;
    mentor_id: string;
    category: FeedbackCategory;
    rating: number;
    comment: string;
  }): Promise<FeedbackItem | null> {
    await this.ensureDataLoaded();
    const student = this.students.find((s) => s.student_id === params.student_id);
    const mentor = this.mentors.find((m) => m.mentor_id === params.mentor_id);
    if (!student || !mentor) return null;

    // Send to backend API
    await apiFetch<any>('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: params.student_id,
        mentor: mentor.mentor_name,
        mentor_name: mentor.mentor_name,
        mentor_id: mentor.mentor_id,
        category: params.category,
        rating: params.rating,
        feedback: params.comment,
        comment: params.comment,
      }),
    });

    const newFeedback: FeedbackItem = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      student_id: student.student_id,
      student_name: student.name,
      mentor_id: mentor.mentor_id,
      mentor_name: mentor.mentor_name,
      category: params.category,
      rating: params.rating,
      comment: params.comment,
      department: student.department,
      created_at: new Date().toISOString().split('T')[0],
    };

    this.feedbacks.unshift(newFeedback);

    try {
      localStorage.setItem('sc_feedbacks_v2', JSON.stringify(this.feedbacks));
    } catch (e) {
      console.error(e);
    }

    this.notifySubscribers();
    return newFeedback;
  }

  public async getFeedbackAnalytics(): Promise<FeedbackAnalytics> {
    const remote = await apiFetch<FeedbackAnalytics>('/analytics/feedback');
    if (remote) return remote;

    await this.ensureDataLoaded();
    const total = this.feedbacks.length || 1;
    const sum = this.feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avgRating = Math.round((sum / total) * 10) / 10;

    const catMap: Record<FeedbackCategory, { count: number; sum: number }> = {
      Academic: { count: 0, sum: 0 },
      Coding: { count: 0, sum: 0 },
      Communication: { count: 0, sum: 0 },
      Placement: { count: 0, sum: 0 },
      Attendance: { count: 0, sum: 0 },
      Overall: { count: 0, sum: 0 },
    };

    const deptMap: Record<string, { count: number; sum: number }> = {};

    this.feedbacks.forEach((f) => {
      if (!catMap[f.category]) catMap[f.category] = { count: 0, sum: 0 };
      catMap[f.category].count++;
      catMap[f.category].sum += f.rating;

      if (!deptMap[f.department]) deptMap[f.department] = { count: 0, sum: 0 };
      deptMap[f.department].count++;
      deptMap[f.department].sum += f.rating;
    });

    const categoryDistribution = Object.entries(catMap).map(([cat, val]) => ({
      category: cat as FeedbackCategory,
      count: val.count,
      avgRating: val.count > 0 ? Math.round((val.sum / val.count) * 10) / 10 : 0,
    }));

    const sortedCats = [...categoryDistribution].sort((a, b) => b.count - a.count);
    const mostCommonIssue = sortedCats[0]?.category || 'Coding';

    const departmentComparison = Object.entries(deptMap).map(([dept, val]) => ({
      department: dept,
      avgRating: val.count > 0 ? Math.round((val.sum / val.count) * 10) / 10 : 0,
      count: val.count,
    }));

    return {
      avg_rating: avgRating,
      total_feedbacks: this.feedbacks.length,
      category_distribution: categoryDistribution,
      most_common_issue: mostCommonIssue,
      department_comparison: departmentComparison,
    };
  }

  // ==================== HACKATHON CERTIFICATES ====================
  public async getCertificates(): Promise<CertificateItem[]> {
    const remote = await apiFetch<any[]>('/certificates');
    if (remote && remote.length > 0) {
      return remote.map((r) => ({
        id: r.id,
        student_id: r.student_id,
        student_name: r.student_name,
        department: r.department || '',
        hackathon_name: r.hackathon_name || r.event_or_hackathon || '',
        role: r.role || 'Participant',
        achievement: r.achievement,
        status: (r.status === 'Verified' ? 'Verified' : 'Pending Verification') as any,
        certificate_date: r.certificate_date || r.issue_date || '',
        credential_id: r.credential_id || '',
        verified_by: r.verified_by,
        verified_at: r.verified_at,
      }));
    }

    await this.ensureDataLoaded();
    return [...this.certificates];
  }

  public async getHackathonStats(): Promise<HackathonStats> {
    const remote = await apiFetch<HackathonStats>('/certificates/stats');
    if (remote) return remote;

    await this.ensureDataLoaded();
    const total = this.certificates.length;
    const verified = this.certificates.filter((c) => c.status === 'Verified').length;
    const winners = this.certificates.filter((c) =>
      c.achievement.toLowerCase().includes('winner') ||
      c.achievement.toLowerCase().includes('runner up') ||
      c.achievement.toLowerCase().includes('award') ||
      c.achievement.toLowerCase().includes('finalist')
    ).length;

    const uniqueStudents = new Set(this.certificates.map((c) => c.student_id)).size;

    return {
      total_certificates: total,
      students_participated: Math.max(uniqueStudents, 128),
      winners_count: winners,
      certificates_issued: verified,
    };
  }

  public async verifyCertificate(certId: string, verifierName = 'Dean Academic Affairs Office'): Promise<boolean> {
    await apiFetch<any>(`/certificates/${certId}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified_by: verifierName }),
    });

    await this.ensureDataLoaded();
    const cert = this.certificates.find((c) => c.id === certId);
    if (!cert) return false;

    cert.status = cert.status === 'Verified' ? 'Pending Verification' : 'Verified';
    if (cert.status === 'Verified') {
      cert.verified_by = verifierName;
      cert.verified_at = new Date().toISOString().split('T')[0];
    } else {
      cert.verified_by = undefined;
      cert.verified_at = undefined;
    }

    try {
      localStorage.setItem('sc_certificates_v2', JSON.stringify(this.certificates));
    } catch (e) {
      console.error(e);
    }

    this.notifySubscribers();
    return true;
  }

  public async getAllStudents(): Promise<Student[]> {
    await this.ensureDataLoaded();
    return [...this.students];
  }

  public async getAllMentors(): Promise<Mentor[]> {
    await this.ensureDataLoaded();
    return [...this.mentors];
  }

  public async getMockInterviewsList(): Promise<MockInterview[]> {
    await this.ensureDataLoaded();
    return [...this.mockInterviews];
  }

  // ==================== CAMPUS ACTIVITIES (EVENTS & HACKATHONS) ====================
  public async getCampusEvents(): Promise<CampusEvent[]> {
    const remote = await apiFetch<CampusEvent[]>('/events');
    if (remote && remote.length > 0) return remote;

    await this.ensureDataLoaded();
    return [
      {
        id: 'EVT-01',
        title: 'Annual Inter-University HackSprint 2026',
        date: '2026-10-24',
        category: 'Technical',
        location: 'Innovation Hub Lab 4',
        participants_count: 164,
        status: 'Upcoming',
        description: '24-hour sprint focused on AI for social impact, cloud pipelines, and IoT architectures.',
      },
      {
        id: 'EVT-02',
        title: 'Placement Mock Drive & HR Round',
        date: '2026-10-29',
        category: 'Career',
        location: 'Auditorium West',
        participants_count: 320,
        status: 'Upcoming',
        description: 'Rigorous corporate simulation with Fortune 500 recruiters for final and pre-final year cohorts.',
      },
      {
        id: 'EVT-03',
        title: 'National Mathematics & Algorithmic Symposium',
        date: '2026-11-05',
        category: 'Academic',
        location: 'Conference Hall B',
        participants_count: 95,
        status: 'Upcoming',
        description: 'Keynotes on graph algorithms, theoretical computing, and competitive mathematical Olympiads.',
      },
      {
        id: 'EVT-04',
        title: 'Spandan Cultural Fest 2026',
        date: '2026-11-14',
        category: 'Cultural',
        location: 'Open Air Theatre',
        participants_count: 480,
        status: 'Upcoming',
        description: 'Inter-college arts showcase, drama competitions, music, and literary debates.',
      },
      {
        id: 'EVT-05',
        title: 'Inter-Department Cricket & Football Cup',
        date: '2026-11-20',
        category: 'Sports',
        location: 'Main Sports Complex',
        participants_count: 240,
        status: 'Upcoming',
        description: 'Championship league fostering inter-department camaraderie, teamwork, and athletic wellness.',
      },
      {
        id: 'EVT-06',
        title: 'Full Stack Cloud Workshop with AWS',
        date: '2026-09-18',
        category: 'Technical',
        location: 'CS Seminar Hall',
        participants_count: 210,
        status: 'Past',
        description: 'Hands-on architectural deployment workshop on serverless microservices and Terraform.',
      },
      {
        id: 'EVT-07',
        title: 'Campus Resume Clinic & LinkedIn Masterclass',
        date: '2026-09-04',
        category: 'Career',
        location: 'Management Block',
        participants_count: 380,
        status: 'Past',
        description: '1-on-1 resume tear-downs and corporate personal branding masterclasses by senior industry leaders.',
      },
      {
        id: 'EVT-08',
        title: 'Research Methodologies in Data Science',
        date: '2026-08-22',
        category: 'Academic',
        location: 'Lecture Hall 1',
        participants_count: 135,
        status: 'Past',
        description: 'Faculty-led symposium on peer-reviewed scientific publishing and dataset benchmarking.',
      },
      {
        id: 'EVT-09',
        title: 'Independence Day University Run & Tournament',
        date: '2026-08-15',
        category: 'Sports',
        location: 'Campus Track',
        participants_count: 512,
        status: 'Past',
        description: '5K marathon and athletics tournament promoting campus physical fitness.',
      },
    ];
  }

  public async getCampusHackathons(): Promise<CampusHackathon[]> {
    const remote = await apiFetch<CampusHackathon[]>('/hackathons');
    if (remote && remote.length > 0) return remote;

    await this.ensureDataLoaded();
    return [
      {
        id: 'HACK-01',
        name: 'Smart India Hackathon (SIH) Internal Grand Finale',
        date: '2026-09-24',
        participants_count: 180,
        teams_count: 36,
        winners: 'Team CyberSentinels (CSE)',
        status: 'Completed',
        participants: [
          {
            student_id: 'STU10003',
            name: 'Sakshi Negi',
            department: 'Mechanical',
            team: 'EcoAutomata',
            role: 'Hardware Lead',
            achievement: '1st Runner-Up',
          },
          {
            student_id: 'STU10008',
            name: 'Kabir Srivastava',
            department: 'AI & DS',
            team: 'Neurals',
            role: 'ML Developer',
            achievement: 'Finalist',
          },
          {
            student_id: 'STU10012',
            name: 'Rohan Deshmukh',
            department: 'CSE',
            team: 'CyberSentinels',
            role: 'Full Stack Lead',
            achievement: 'Winner',
          },
          {
            student_id: 'STU10004',
            name: 'Ankit Malhotra',
            department: 'ECE',
            team: 'QuantumPulse',
            role: 'System Architect',
            achievement: 'Special Jury Mention',
          },
        ],
      },
      {
        id: 'HACK-02',
        name: 'HackNova 48-Hour Open AI Challenge',
        date: '2026-06-12',
        participants_count: 140,
        teams_count: 28,
        winners: 'Team VisionML (AI & DS)',
        status: 'Completed',
        participants: [
          {
            student_id: 'STU10001',
            name: 'Kritika Agarwal',
            department: 'BBA',
            team: 'FinSmart',
            role: 'Product Strategist',
            achievement: 'Best Business Pitch',
          },
          {
            student_id: 'STU10012',
            name: 'Rohan Deshmukh',
            department: 'CSE',
            team: 'VisionML',
            role: 'Backend Architect',
            achievement: 'Winner',
          },
          {
            student_id: 'STU10024',
            name: 'Srishti Singh',
            department: 'BBA',
            team: 'MarketPulse',
            role: 'Data Analyst',
            achievement: 'Top 5 Finalist',
          },
        ],
      },
      {
        id: 'HACK-03',
        name: 'DevSpace Global Collegiate Hackathon',
        date: '2026-04-18',
        participants_count: 120,
        teams_count: 24,
        winners: 'Team CodeForge (ECE)',
        status: 'Completed',
        participants: [
          {
            student_id: 'STU10004',
            name: 'Ankit Malhotra',
            department: 'ECE',
            team: 'CodeForge',
            role: 'Embedded Lead',
            achievement: 'Winner',
          },
          {
            student_id: 'STU10003',
            name: 'Sakshi Negi',
            department: 'Mechanical',
            team: 'RoboSprint',
            role: 'Mechanics Lead',
            achievement: 'Finalist',
          },
        ],
      },
      {
        id: 'HACK-04',
        name: 'NextGen FinTech & Web3 Disrupt Sprint',
        date: '2026-11-18',
        participants_count: 96,
        teams_count: 20,
        winners: 'Awaiting Evaluation',
        status: 'Upcoming',
        participants: [
          {
            student_id: 'STU10012',
            name: 'Rohan Deshmukh',
            department: 'CSE',
            team: 'BlockVault',
            role: 'Smart Contract Dev',
            achievement: 'Registered',
          },
          {
            student_id: 'STU10001',
            name: 'Kritika Agarwal',
            department: 'BBA',
            team: 'NeoBankers',
            role: 'FinTech Strategist',
            achievement: 'Registered',
          },
        ],
      },
    ];
  }

  // ==================== SKILLS & ASSESSMENTS ====================
  public async getSkillAssessments(params: {
    department?: string;
    search?: string;
    assessmentStatus?: string;
  } = {}): Promise<StudentSkillAssessment[]> {
    await this.ensureDataLoaded();
    const { department = 'all', search = '', assessmentStatus = 'all' } = params;

    const saved = localStorage.getItem('lumora_assessments_status_v1');
    const statusOverrides: Record<string, { techStatus?: AssessmentStatus; softStatus?: SoftSkillStatus }> =
      saved ? JSON.parse(saved) : {};

    let list: StudentSkillAssessment[] = this.students.map((s) => {
      let defaultTechStatus: AssessmentStatus = 'Completed';
      if (s.coding_score < 50) {
        defaultTechStatus = 'Needs Improvement';
      } else if (s.coding_score > 80) {
        defaultTechStatus = 'Completed';
      } else {
        defaultTechStatus = s.admission_year >= 2026 ? 'Scheduled' : 'Completed';
      }

      let defaultSoftStatus: SoftSkillStatus = 'Proficient';
      const softAvg = (s.communication_skill + s.teamwork + s.leadership) / 3;
      if (softAvg >= 80) defaultSoftStatus = 'Exemplary';
      else if (softAvg >= 65) defaultSoftStatus = 'Proficient';
      else if (softAvg >= 50) defaultSoftStatus = 'Developing';
      else defaultSoftStatus = 'Needs Support';

      const override = statusOverrides[s.student_id];

      return {
        student_id: s.student_id,
        student_name: s.name,
        department: s.department,
        coding_score: s.coding_score,
        technical_skill: s.technical_skill,
        problem_solving: s.problem_solving,
        aptitude_score: s.aptitude_score,
        technical_assessment_status: override?.techStatus || defaultTechStatus,
        communication_skill: s.communication_skill,
        teamwork: s.teamwork,
        leadership: s.leadership,
        placement_communication: s.placement_communication_score,
        soft_skill_status: override?.softStatus || defaultSoftStatus,
        assessed_by: s.mentor_name && s.mentor_name !== 'Not Required' ? s.mentor_name : 'Academic Evaluation Board',
        assessed_date: '2026-09-15',
      };
    });

    if (department !== 'all') {
      list = list.filter((s) => s.department === department);
    }
    if (assessmentStatus !== 'all') {
      list = list.filter((s) => s.technical_assessment_status === assessmentStatus);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.student_name.toLowerCase().includes(q) ||
          s.student_id.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public async updateSkillAssessment(
    studentId: string,
    updates: { technical_assessment_status?: AssessmentStatus; soft_skill_status?: SoftSkillStatus }
  ): Promise<boolean> {
    await this.ensureDataLoaded();
    const saved = localStorage.getItem('lumora_assessments_status_v1');
    const statusOverrides = saved ? JSON.parse(saved) : {};

    statusOverrides[studentId] = {
      ...statusOverrides[studentId],
      techStatus: updates.technical_assessment_status || statusOverrides[studentId]?.techStatus,
      softStatus: updates.soft_skill_status || statusOverrides[studentId]?.softStatus,
    };

    localStorage.setItem('lumora_assessments_status_v1', JSON.stringify(statusOverrides));
    this.notifySubscribers();
    return true;
  }

  // ==================== HIGH POTENTIAL STUDENTS ====================
  public async getHighPotentialStudents(limit = 40): Promise<HighPotentialStudent[]> {
    const remote = await apiFetch<any[]>('/analytics/high-potential');
    if (remote && remote.length > 0) {
      await this.ensureDataLoaded();
      return remote.slice(0, limit).map((hp: any) => {
        const student = this.students.find((s) => s.student_id === hp.student_id) || {
          student_id: hp.student_id,
          name: hp.student_name,
          department: hp.department,
          student_success_score: hp.student_success_score,
          coding_score: hp.coding_score,
          average_score: hp.academic_score || 85,
          placement_score: hp.placement_score || 80,
          ...hp,
        };
        return {
          student,
          potential_area: hp.potential_area as PotentialArea,
          potential_reason: hp.potential_reason,
          recommended_role: hp.recommended_role,
        };
      });
    }

    await this.ensureDataLoaded();
    // Filter high potential students: success score >= 80 or exceptionally high individual scores
    const topPerformers = this.students
      .filter((s) => s.student_success_score >= 78 || s.coding_score >= 85 || s.average_score >= 85)
      .sort((a, b) => b.student_success_score - a.student_success_score);

    return topPerformers.slice(0, limit).map((student) => {
      let area: PotentialArea = 'Academic Excellence';
      let reason = 'Exceptional GPA and continuous test mastery.';
      let role = 'Academic Scholar & Peer Tutor';

      if (student.coding_score >= 85 && student.technical_skill >= 80) {
        area = 'Technical Excellence';
        reason = `High coding score (${student.coding_score}/100) and algorithmic mastery.`;
        role = 'Hackathon Team Lead & Technical Mentor';
      } else if (student.leadership_role || student.leadership >= 75 || student.activities_joined >= 8) {
        area = 'Leadership';
        reason = `Demonstrated organizational authority (${student.activities_joined} clubs joined).`;
        role = 'Student Council Executive & Campus Ambassador';
      } else if (student.placement_readiness >= 82 && student.placement_communication_score >= 80) {
        area = 'Placement Readiness';
        reason = `Interview clearance probability above 95% with top communication metrics.`;
        role = 'Placement Ambassador & Corporate Liaison';
      } else if (student.engagement_score >= 80 || student.events_attended >= 10) {
        area = 'Engagement';
        reason = `Highest campus activity attendance (${student.events_attended} institutional events).`;
        role = 'Campus Activities Lead & Orientation Guide';
      }

      return {
        student,
        potential_area: area,
        potential_reason: reason,
        recommended_role: role,
      };
    });
  }

  // ==================== SKILL GAP INTELLIGENCE ====================
  public async getDepartmentSkillGaps(): Promise<DepartmentSkillGap[]> {
    const remote = await apiFetch<any>('/analytics/skills');
    if (remote && remote.department_summary && remote.department_summary.length > 0) {
      return remote.department_summary;
    }

    await this.ensureDataLoaded();
    const depts = ['CSE', 'AI & DS', 'ECE', 'Mechanical', 'Civil', 'BCA', 'BBA'];

    return depts.map((d) => {
      const deptStudents = this.students.filter((s) => s.department === d);
      const count = deptStudents.length || 1;

      const avgCoding = deptStudents.reduce((acc, s) => acc + s.coding_score, 0) / count;
      const avgTech = deptStudents.reduce((acc, s) => acc + s.technical_skill, 0) / count;
      const avgComm = deptStudents.reduce((acc, s) => acc + s.communication_skill, 0) / count;
      const avgProblem = deptStudents.reduce((acc, s) => acc + s.problem_solving, 0) / count;
      const avgPlacement = deptStudents.reduce((acc, s) => acc + s.placement_readiness, 0) / count;

      const criticalCount = deptStudents.filter(
        (s) => s.coding_score < 50 || s.communication_skill < 50 || s.placement_readiness < 50
      ).length;

      return {
        department: d,
        coding_gap: avgCoding < 66 ? 'High' : avgCoding < 70 ? 'Medium' : 'Low',
        technical_gap: avgTech < 66 ? 'High' : avgTech < 71 ? 'Medium' : 'Low',
        communication_gap: avgComm < 65 ? 'High' : avgComm < 70 ? 'Medium' : 'Low',
        problem_solving_gap: avgProblem < 65 ? 'High' : avgProblem < 70 ? 'Medium' : 'Low',
        placement_gap: avgPlacement < 65 ? 'High' : avgPlacement < 70 ? 'Medium' : 'Low',
        critical_students_count: criticalCount,
      };
    });
  }
}


export const studentDataService = new StudentDataService();
