import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { StudentsPage } from './components/pages/StudentsPage';
import { IntelligencePage } from './components/pages/IntelligencePage';
import { SkillsAssessmentsPage } from './components/pages/SkillsAssessmentsPage';
import { CampusActivitiesPage } from './components/pages/CampusActivitiesPage';
import { MockInterviewsPage } from './components/pages/MockInterviewsPage';
import { MentorsPage } from './components/pages/MentorsPage';
import { FeedbackPage } from './components/pages/FeedbackPage';
import { AIRecommendationsPage } from './components/pages/AIRecommendationsPage';
import { RiskIntelligencePage } from './components/pages/RiskIntelligencePage';
import { SkillGapIntelligencePage } from './components/pages/SkillGapIntelligencePage';
import { HighPotentialPage } from './components/pages/HighPotentialPage';
import { HelpSupportModal } from './components/pages/HelpSupportModal';
import { SettingsModal } from './components/pages/SettingsModal';
import { StudentProfileModal } from './components/student/StudentProfileModal';
import { CampusAIChat } from './components/ai/CampusAIChat';
import { Bot } from 'lucide-react';
import { studentDataService } from './services/dataService';
import type {
  Student,
  Mentor,
  DashboardKPIs,
  RiskDistribution,
  DepartmentScore,
  DepartmentCodingScore,
  SegmentStats,
  InterventionStatus,
  User,
  UserRole,
  NavItem,
} from './types';

export const App: React.FC = () => {
  // Current Authenticated User (mocked locally)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('sc_logged_in_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Dean for immediate smooth evaluation if desired, or null for login page
    return null;
  });

  const [activeTab, setActiveTab] = useState<NavItem>('overview');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [preSelectedStudentForMock, setPreSelectedStudentForMock] = useState<Student | null>(null);
  const [preSelectedStudentForFeedback, setPreSelectedStudentForFeedback] = useState<Student | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [campusSubTab, setCampusSubTab] = useState<'events' | 'hackathons' | 'certificates'>('events');

  const handleSelectTab = (tab: NavItem, subTab?: string) => {
    if (tab === 'help_support') {
      setIsHelpOpen(true);
      return;
    }
    if (tab === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    if (subTab && (subTab === 'events' || subTab === 'hackathons' || subTab === 'certificates')) {
      setCampusSubTab(subTab);
    }
    setActiveTab(tab);
  };

  // Campus AI State
  const [isFloatingAIOpen, setIsFloatingAIOpen] = useState(false);
  const [aiStudentContext, setAiStudentContext] = useState<Student | null>(null);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>(undefined);

  const handleOpenCampusAI = (student?: Student | null, initialQuestion?: string) => {
    setAiStudentContext(student || null);
    setAiInitialQuery(initialQuestion);
    setIsFloatingAIOpen(true);
  };

  // Core Data State
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs>({
    total_students: 4000,
    avg_success_score: 68.6,
    high_risk_students: 1127,
    high_risk_percentage: 28.2,
    students_without_mentor: 1065,
    pending_mock_interviews: 3,
    avg_coding_score: 66.8,
    assigned_to_mentors: 62,
  });
  const [riskData, setRiskData] = useState<RiskDistribution[]>([]);
  const [departmentScores, setDepartmentScores] = useState<DepartmentScore[]>([]);
  const [departmentCodingScores, setDepartmentCodingScores] = useState<DepartmentCodingScore[]>([]);
  const [segmentStats, setSegmentStats] = useState<SegmentStats[]>([]);
  const [attentionStudents, setAttentionStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [allStudentsSample, setAllStudentsSample] = useState<Student[]>([]);

  const refreshAllData = async () => {
    try {
      await studentDataService.ensureDataLoaded();

      const [k, r, d, dCoding, s, att, m, sample] = await Promise.all([
        studentDataService.getDashboardKPIs(),
        studentDataService.getRiskDistribution(),
        studentDataService.getDepartmentScores(),
        studentDataService.getDepartmentCodingScores(),
        studentDataService.getSegmentDistribution(),
        studentDataService.getStudentsRequiringAttention(8),
        studentDataService.getMentors('all'),
        studentDataService.getStudents({ pageSize: 500 }),
      ]);

      setKpis(k);
      setRiskData(r);
      setDepartmentScores(d);
      setDepartmentCodingScores(dCoding);
      setSegmentStats(s);
      setAttentionStudents(att);
      setMentors(m);
      setAllStudentsSample(sample.data);
      setLoading(false);

      if (selectedStudent) {
        const fresh = await studentDataService.getStudentById(selectedStudent.student_id);
        if (fresh) setSelectedStudent(fresh);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const unsub = studentDataService.subscribe(refreshAllData);
    return unsub;
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('sc_logged_in_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setActiveTab(user.role === 'dean' ? 'overview' : 'students');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('sc_logged_in_user');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'dean') {
      const deanUser: User = {
        id: 'USR-DEAN-01',
        name: 'Dr. A. K. Banerjee',
        email: 'dean@smartcampus.edu',
        role: 'dean',
        title: 'Dean of Academic Affairs',
        department: 'University Administration',
        avatarInitials: 'AB',
      };
      handleLogin(deanUser);
    } else {
      const facultyUser: User = {
        id: 'USR-FAC-01',
        name: 'Dr. Rahul Sharma',
        email: 'rahul.sharma@smartcampus.edu',
        role: 'faculty',
        title: 'Associate Professor & Mentor Coordinator',
        department: 'Computer Science & Engineering (CSE)',
        avatarInitials: 'RS',
      };
      handleLogin(facultyUser);
    }
  };

  const handleAssignMentor = async (studentId: string, mentorId: string) => {
    await studentDataService.assignMentor(studentId, mentorId);
  };

  const handleUpdateStatus = async (studentId: string, status: InterventionStatus) => {
    await studentDataService.updateInterventionStatus(studentId, status);
  };

  const pageHeaders: Record<NavItem, { title: string; subtitle: string }> = {
    overview: {
      title: 'Executive Success Intelligence',
      subtitle: 'Real-time overview of student achievement, risk distribution, and intervention priorities',
    },
    students: {
      title: currentUser?.role === 'faculty' ? 'My Assigned Students & Department Roster' : 'Student Directory & Roster',
      subtitle: 'Comprehensive student roster with multi-parameter filtering and risk diagnostics',
    },
    risk_intelligence: {
      title: 'Risk Intelligence Hub',
      subtitle: 'Institutional risk diagnostics, multi-factor signals, and priority student roster',
    },
    skill_gap_intelligence: {
      title: 'Competency & Skill Gap Intelligence',
      subtitle: 'Departmental competency gaps, industry readiness benchmarks, and curricular priorities',
    },
    high_potential: {
      title: 'High Potential Student Cohorts',
      subtitle: 'Accelerated learners identified for fellowships, honors tracks, and research opportunities',
    },
    intelligence: {
      title: 'Institutional Intelligence Hub',
      subtitle: 'Risk intelligence, departmental skill gap matrices, and high-potential student cohorts',
    },
    skills_assessments: {
      title: 'Skills & Assessments',
      subtitle: 'Technical aptitude and soft-skill readiness evaluation with status tracking',
    },
    mock_interviews: {
      title: 'Mock Interview Operations',
      subtitle: 'Schedule and track pending, scheduled, and completed placement interviews',
    },
    mentors: {
      title: 'Faculty Mentorship Operations',
      subtitle: 'Advisory caseload tracking, capacity thresholds, and departmental allocation',
    },
    campus_activities: {
      title: 'Campus Activities Hub',
      subtitle: 'Co-curricular events, hackathons, and verifiable institutional credentials',
    },
    feedback: {
      title: 'Faculty & Mentor Feedback Management',
      subtitle: 'Log student observations, track recurrent issues, and monitor feedback analytics',
    },
    recommendations: {
      title: 'AI Prescriptive Interventions',
      subtitle: 'Automated ML recommendations with progress lifecycle tracking',
    },
    settings: {
      title: 'Institutional Settings',
      subtitle: 'System configuration, benchmarks, and data management',
    },
    help_support: {
      title: 'Help & Institutional Support',
      subtitle: 'Documentation, risk scoring index guidelines, and support contacts',
    },
  };

  // If unauthenticated, show the professional Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 text-[#F5F7FA]">
        <div className="w-10 h-10 rounded-xl bg-[#6EA8FE] flex items-center justify-center text-[#070B14] mb-3 animate-spin">
          <div className="w-5 h-5 border-2 border-[#070B14] border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-sm font-bold text-[#F5F7FA]">Loading Lumora — Student Success Intelligence...</h2>
        <p className="text-xs text-[#8F9BAD] mt-1">
          Parsing verified dataset of 4,000 students and faculty mentors
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F5F7FA] flex selection:bg-[#6EA8FE]/30">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        highRiskCount={kpis.high_risk_students}
        totalStudents={kpis.total_students}
        pendingInterviewsCount={kpis.pending_mock_interviews}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={pageHeaders[activeTab]?.title || 'Campus Analytics'}
          subtitle={pageHeaders[activeTab]?.subtitle}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
          onSearchSelect={(student) => setSelectedStudent(student)}
          allStudents={allStudentsSample}
        />

        <main className="flex-1 p-5 sm:p-7 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardPage
              kpis={kpis}
              riskData={riskData}
              departmentScores={departmentScores}
              departmentCodingScores={departmentCodingScores}
              segmentStats={segmentStats}
              attentionStudents={attentionStudents}
              onSelectStudent={setSelectedStudent}
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onOpenCampusAI={() => handleOpenCampusAI()}
            />
          )}

          {activeTab === 'students' && (
            <StudentsPage
              onSelectStudent={setSelectedStudent}
              isFacultyMode={currentUser.role === 'faculty'}
            />
          )}

          {(activeTab === 'risk_intelligence' || activeTab === 'intelligence') && (
            <RiskIntelligencePage onSelectStudent={setSelectedStudent} />
          )}

          {activeTab === 'skill_gap_intelligence' && (
            <SkillGapIntelligencePage />
          )}

          {activeTab === 'high_potential' && (
            <HighPotentialPage onSelectStudent={setSelectedStudent} />
          )}

          {activeTab === 'skills_assessments' && (
            <SkillsAssessmentsPage
              onSelectStudent={setSelectedStudent}
              onAssignInterview={(student) => {
                setPreSelectedStudentForMock(student);
                setActiveTab('mock_interviews');
              }}
            />
          )}

          {activeTab === 'mock_interviews' && (
            <MockInterviewsPage
              onSelectStudent={setSelectedStudent}
              preSelectedStudent={preSelectedStudentForMock}
            />
          )}

          {activeTab === 'mentors' && (
            <MentorsPage onSelectStudent={setSelectedStudent} />
          )}

          {activeTab === 'campus_activities' && (
            <CampusActivitiesPage initialSubTab={campusSubTab} />
          )}

          {activeTab === 'feedback' && (
            <FeedbackPage
              currentUser={currentUser}
              onSelectStudent={setSelectedStudent}
              preSelectedStudent={preSelectedStudentForFeedback}
            />
          )}

          {activeTab === 'recommendations' && (
            <AIRecommendationsPage onSelectStudent={setSelectedStudent} />
          )}

          {activeTab === 'settings' && (
            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6 text-center max-w-lg mx-auto mt-10 shadow-xs">
              <h3 className="text-base font-bold text-[#F5F7FA] mb-2">Institutional Configuration</h3>
              <p className="text-xs text-[#8F9BAD] mb-4">
                Access system thresholds, dataset sync parameters, and demo presets.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Open Settings Dialog
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        mentors={mentors}
        onAssignMentor={handleAssignMentor}
        onUpdateStatus={handleUpdateStatus}
        onOpenMockAssign={(s) => {
          setPreSelectedStudentForMock(s);
          setActiveTab('mock_interviews');
        }}
        onOpenFeedbackSubmit={(s) => {
          setPreSelectedStudentForFeedback(s);
          setActiveTab('feedback');
        }}
        onAskAI={(student, initialQuestion) => handleOpenCampusAI(student, initialQuestion)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetData={refreshAllData}
      />

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Floating Lumora AI Action Button in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsFloatingAIOpen((prev) => !prev)}
          title="Open Lumora AI (Student Success Copilot)"
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#6EA8FE] to-[#8B9CFF] text-[#070B14] flex items-center justify-center shadow-2xl hover:shadow-[#6EA8FE]/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20 relative group"
        >
          <Bot className="w-6 h-6 text-[#070B14]" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6FCF97] border-2 border-[#070B14] animate-pulse" />
        </button>
      </div>

      {/* Floating Assistant Drawer / Modal */}
      {isFloatingAIOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-7rem)] shadow-2xl rounded-2xl animate-in slide-in-from-bottom-5 duration-200">
          <CampusAIChat
            initialStudentContext={aiStudentContext}
            onClearContext={() => setAiStudentContext(null)}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsFloatingAIOpen(false);
            }}
            onScheduleMock={(s) => {
              setPreSelectedStudentForMock(s);
              setActiveTab('mock_interviews');
              setIsFloatingAIOpen(false);
            }}
            onAssignMentor={(s) => {
              setSelectedStudent(s);
              setIsFloatingAIOpen(false);
            }}
            isFloatingMode={true}
            onCloseFloating={() => setIsFloatingAIOpen(false)}
            initialQuery={aiInitialQuery}
          />
        </div>
      )}
    </div>
  );
};

export default App;
