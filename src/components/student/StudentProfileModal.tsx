import React, { useState } from 'react';
import {
  X,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  UserCheck,
  BookOpen,
  Code2,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  Bot,
  Award,
  HeartHandshake,
} from 'lucide-react';
import type { Student, Mentor, InterventionStatus } from '../../types';
import { RiskBadge } from '../common/Badge';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  mentors: Mentor[];
  onAssignMentor: (studentId: string, mentorId: string) => void;
  onUpdateStatus: (studentId: string, status: InterventionStatus) => void;
  onOpenMockAssign?: (student: Student) => void;
  onOpenFeedbackSubmit?: (student: Student) => void;
  onAskAI?: (student: Student, initialQuestion?: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  mentors,
  onAssignMentor,
  onUpdateStatus,
  onOpenMockAssign,
  onOpenFeedbackSubmit,
  onAskAI,
}) => {
  if (!student) return null;

  const [selectedMentorId, setSelectedMentorId] = useState<string>(student.mentor_id || '');
  const [status, setStatus] = useState<InterventionStatus>(student.intervention_status);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleAssignMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorId || selectedMentorId === 'Not Required' || selectedMentorId === 'No mentor available') {
      return;
    }
    onAssignMentor(student.student_id, selectedMentorId);
    setSavedMessage('Mentor assigned successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleStatusChange = (newStatus: InterventionStatus) => {
    setStatus(newStatus);
    onUpdateStatus(student.student_id, newStatus);
    setSavedMessage(`Intervention status updated to ${newStatus}`);
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const assignedMentorDetails = mentors.find(
    (m) => m.mentor_id === student.mentor_id || m.mentor_name === student.mentor_name
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-[#0A0F1A] border border-white/[0.08] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#F5F7FA] animate-in fade-in zoom-in-95 duration-150">
        {/* ================= 1. STUDENT OVERVIEW (HEADER) ================= */}
        <div className="bg-[#090E18] border-b border-white/[0.06] p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-[#111827] hover:bg-[#1B263A] text-[#8F9BAD] hover:text-[#F5F7FA] border border-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#111827] border border-white/[0.08] flex items-center justify-center text-[#6EA8FE] text-lg font-bold shrink-0 shadow-sm">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-[#F5F7FA]">{student.name}</h2>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-[#111827] text-[#6EA8FE] border border-white/[0.08]">
                    {student.student_id}
                  </span>
                  <RiskBadge level={student.predicted_risk_level} size="xs" />
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-xs text-[#8F9BAD] flex-wrap">
                  <span>Department: <strong className="text-[#F5F7FA]">{student.department}</strong></span>
                  <span>•</span>
                  <span>{student.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#657083]" />
                    {student.city}
                  </span>
                  <span>•</span>
                  <span>Cohort: Class of {student.admission_year + 4}</span>
                </div>
              </div>
            </div>

            {/* Success Score Badge */}
            <div className="flex md:flex-col items-center md:items-end justify-between bg-[#111827] px-4 py-2.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-semibold text-[#657083] uppercase tracking-wider">
                Success Score
              </span>
              <div className="text-2xl font-black text-[#F5F7FA]">
                {student.student_success_score}
                <span className="text-xs font-normal text-[#8F9BAD] ml-0.5">/ 100</span>
              </div>
              <span className="text-[10px] text-[#8B9CFF]">
                Cohort: {student.segment_name}
              </span>
            </div>
          </div>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8F9BAD]">Intervention:</span>
              <div className="flex items-center rounded-xl border border-white/[0.06] bg-[#111827] p-0.5 text-[11px]">
                {(['Not Started', 'Assigned', 'In Progress', 'Completed'] as InterventionStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      status === st
                        ? st === 'Completed'
                          ? 'bg-[#6FCF97]/15 text-[#6FCF97] font-bold border border-[#6FCF97]/30'
                          : st === 'In Progress'
                          ? 'bg-[#6EA8FE]/15 text-[#6EA8FE] font-bold border border-[#6EA8FE]/30'
                          : 'bg-[#F2C94C]/15 text-[#F2C94C] font-bold border border-[#F2C94C]/30'
                        : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onAskAI && (
                <button
                  onClick={() => {
                    onClose();
                    onAskAI(student);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#6EA8FE]/15 hover:bg-[#6EA8FE]/25 text-[#6EA8FE] font-medium border border-[#6EA8FE]/30 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-[#6EA8FE]" />
                  Ask Lumora AI
                </button>
              )}
              {onOpenMockAssign && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMockAssign(student);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#1B263A] text-[#6EA8FE] font-medium border border-white/[0.08] text-xs flex items-center gap-1 cursor-pointer"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Assign Mock
                </button>
              )}
              {onOpenFeedbackSubmit && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenFeedbackSubmit(student);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#1B263A] text-[#8B9CFF] font-medium border border-white/[0.08] text-xs flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Log Feedback
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= MODAL BODY: REORGANIZED SECTIONS ================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {savedMessage && (
            <div className="bg-[#6FCF97]/10 border border-[#6FCF97]/25 text-[#6FCF97] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6FCF97]" />
              {savedMessage}
            </div>
          )}

          {/* 2. ACADEMIC SECTION */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6EA8FE]" />
              Academic Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <div className="text-[10px] text-[#657083] uppercase font-semibold">Attendance</div>
                <div className="text-xl font-bold mt-0.5 flex items-center justify-between">
                  <span className={student.attendance_percent < 75 ? 'text-[#EB5757]' : 'text-[#6FCF97]'}>
                    {student.attendance_percent}%
                  </span>
                  <span className="text-[10px] text-[#8F9BAD]">Target: 75%</span>
                </div>
                <div className="w-full bg-[#0A0F1A] rounded-full h-1 mt-2">
                  <div
                    className={`h-1 rounded-full ${student.attendance_percent < 75 ? 'bg-[#EB5757]' : 'bg-[#6FCF97]'}`}
                    style={{ width: `${student.attendance_percent}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <div className="text-[10px] text-[#657083] uppercase font-semibold">Average Score</div>
                <div className="text-xl font-bold text-[#F5F7FA] mt-0.5">
                  {student.average_score} <span className="text-xs text-[#8F9BAD]">/ 100</span>
                </div>
                <div className="w-full bg-[#0A0F1A] rounded-full h-1 mt-2">
                  <div
                    className="bg-[#6EA8FE] h-1 rounded-full"
                    style={{ width: `${student.average_score}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <div className="text-[10px] text-[#657083] uppercase font-semibold">Assignment Completion</div>
                <div className="text-xl font-bold text-[#F5F7FA] mt-0.5">
                  {student.assignment_completion_rate}%
                </div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">
                  {student.submitted} of {student.total_assignments} completed
                </div>
              </div>
            </div>
          </div>

          {/* 3. TECHNICAL SKILLS SECTION */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#8B9CFF]" />
              Technical Skills
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold block">Coding Score</span>
                <span className={`text-xl font-bold ${student.coding_score < 50 ? 'text-[#EB5757]' : 'text-[#6EA8FE]'}`}>
                  {student.coding_score}
                </span>
                <span className="text-[10px] text-[#8F9BAD] block mt-0.5">Algorithmic logic</span>
              </div>

              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold block">Technical Skill</span>
                <span className="text-xl font-bold text-[#F5F7FA]">{student.technical_skill}</span>
                <span className="text-[10px] text-[#8F9BAD] block mt-0.5">Lab proficiency</span>
              </div>

              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold block">Problem Solving</span>
                <span className="text-xl font-bold text-[#F5F7FA]">{student.problem_solving}</span>
                <span className="text-[10px] text-[#8F9BAD] block mt-0.5">Core DSA</span>
              </div>

              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold block">Aptitude Score</span>
                <span className="text-xl font-bold text-[#F5F7FA]">{student.aptitude_score}</span>
                <span className="text-[10px] text-[#8F9BAD] block mt-0.5">Quantitative logic</span>
              </div>
            </div>
          </div>

          {/* 4. SOFT SKILLS SECTION */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#6FCF97]" />
              Soft Skills & Interpersonal Competence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#657083] uppercase font-semibold">Communication</span>
                  <span className="font-bold text-[#F5F7FA]">{student.communication_skill}</span>
                </div>
                <div className="w-full bg-[#0A0F1A] rounded-full h-1 mt-1.5">
                  <div
                    className="bg-[#6EA8FE] h-1 rounded-full"
                    style={{ width: `${student.communication_skill}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#657083] uppercase font-semibold">Teamwork</span>
                  <span className="font-bold text-[#F5F7FA]">{student.teamwork}</span>
                </div>
                <div className="w-full bg-[#0A0F1A] rounded-full h-1 mt-1.5">
                  <div
                    className="bg-[#8B9CFF] h-1 rounded-full"
                    style={{ width: `${student.teamwork}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#657083] uppercase font-semibold">Leadership</span>
                  <span className="font-bold text-[#F5F7FA]">{student.leadership}</span>
                </div>
                <div className="w-full bg-[#0A0F1A] rounded-full h-1 mt-1.5">
                  <div
                    className="bg-[#6FCF97] h-1 rounded-full"
                    style={{ width: `${student.leadership}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. PLACEMENT SECTION */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#F2C94C]" />
              Placement Readiness & Mock Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold block">Placement Readiness</span>
                <span className={`text-xl font-bold mt-0.5 block ${student.placement_readiness < 60 ? 'text-[#EB5757]' : 'text-[#6FCF97]'}`}>
                  {student.placement_readiness}%
                </span>
                <span className="text-[10px] text-[#8F9BAD] block mt-0.5">Corporate clearance target</span>
              </div>

              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold block">Placement Communication</span>
                <span className="text-xl font-bold text-[#F5F7FA] mt-0.5 block">
                  {student.placement_communication_score} / 100
                </span>
                <span className="text-[10px] text-[#8F9BAD] block mt-0.5">HR & panel articulation</span>
              </div>

              <div className="p-3.5 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold block">Mock Interview Score</span>
                <span className="text-xl font-bold text-[#F5F7FA] mt-0.5 block">
                  {student.mock_interview_score} / 100
                </span>
                <span className="text-[10px] text-[#8F9BAD] block mt-0.5">Panel simulation grade</span>
              </div>
            </div>
          </div>

          {/* 6. INTELLIGENCE SECTION: Risk Factors, Skill Gaps, Segment & Recommendations */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6EA8FE] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6EA8FE]" />
                Lumora Intelligence & Prescriptions
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#8F9BAD] border border-white/[0.06]">
                Segment: {student.segment_name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Factors & Skill Gaps */}
              <div className="p-4 bg-[#151D2D] border border-[#EB5757]/20 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#EB5757] flex items-center gap-1.5 mb-2.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Identified Risk Factors & Gaps
                </span>
                {student.risk_factors && student.risk_factors.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-[#F5F7FA]">
                    {student.risk_factors.map((rf, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EB5757] mt-1.5 shrink-0" />
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#8F9BAD] italic">No critical risk flags recorded.</p>
                )}
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-[#151D2D] border border-[#6EA8FE]/20 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6EA8FE] flex items-center gap-1.5 mb-2.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Actionable Recommendations
                </span>
                {student.recommendations && student.recommendations.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-[#F5F7FA]">
                    {student.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#6EA8FE] mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#8F9BAD] italic">Student performing on target.</p>
                )}
              </div>
            </div>

            {/* Interactive Lumora AI Prompt Bar */}
            {onAskAI && (
              <div className="bg-[#0A0F1A] border border-white/[0.06] rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <Bot className="w-4 h-4 text-[#6EA8FE] shrink-0" />
                  <span className="text-xs font-semibold text-[#F5F7FA]">
                    Ask Lumora AI about {student.name.split(' ')[0]}:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    'Why is this student at risk?',
                    'Explain their Success Score',
                    'What intervention do you recommend?',
                    'Should this student receive a mock interview?',
                    'Does this student need a mentor?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onClose();
                        onAskAI(student, q);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#1B263A] text-[#6EA8FE] hover:text-[#F5F7FA] border border-white/[0.06] transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. MENTOR SECTION */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#6EA8FE]" />
              Faculty Mentorship Program
            </h3>

            {assignedMentorDetails ? (
              <div className="bg-[#151D2D] border border-white/[0.06] rounded-xl p-4 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F5F7FA]">
                      {assignedMentorDetails.mentor_name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[#8F9BAD] border border-white/[0.06]">
                      {assignedMentorDetails.department}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {assignedMentorDetails.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#0A0F1A] text-[#8F9BAD] px-2 py-0.5 rounded-lg border border-white/[0.06]"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                  {student.mentor_match_reason && (
                    <p className="text-[11px] text-[#8F9BAD] mt-1.5 italic">
                      Match reason: {student.mentor_match_reason}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs">
                  <div className="text-[#8F9BAD]">Mentor Caseload</div>
                  <div className="font-bold text-[#F5F7FA]">
                    {assignedMentorDetails.current_students} / {assignedMentorDetails.max_students} Students
                  </div>
                  <span className="text-[10px] text-[#6FCF97]">
                    {assignedMentorDetails.available_slots} slots open
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#F2C94C]/10 border border-[#F2C94C]/25 rounded-xl p-3.5 mb-3 text-xs text-[#F2C94C] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#F2C94C]" />
                <span>
                  No mentor currently assigned to this student ({student.mentor_name || 'Unassigned'}).
                </span>
              </div>
            )}

            {/* Mentor Reassignment Selector */}
            <form onSubmit={handleAssignMentor} className="flex items-center gap-2 text-xs">
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60 flex-1"
              >
                <option value="">-- Assign or Change Mentor --</option>
                {mentors.map((m) => (
                  <option key={m.mentor_id} value={m.mentor_id}>
                    {m.mentor_name} ({m.department}) — {m.available_slots} slots available
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                Update Mentor
              </button>
            </form>
          </div>

          {/* 8. ACTIVITIES SECTION: Events, Hackathons & Certificates */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#8B9CFF]" />
              Campus Activities & Co-Curriculars
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold">Societies Joined</span>
                <div className="text-xl font-bold text-[#F5F7FA] mt-0.5">{student.activities_joined}</div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">Type: {student.activity_type || 'General'}</div>
              </div>

              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold">Events Attended</span>
                <div className="text-xl font-bold text-[#F5F7FA] mt-0.5">{student.events_attended}</div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">Role: {student.leadership_role || 'Participant'}</div>
              </div>

              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold">Satisfaction</span>
                <div className="text-xl font-bold text-[#6FCF97] mt-0.5">{student.student_satisfaction} / 5.0</div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">Feedback Score: {student.feedback_score}%</div>
              </div>

              <div className="p-3 bg-[#151D2D] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-[#657083] uppercase font-semibold">Library Books</span>
                <div className="text-xl font-bold text-[#F5F7FA] mt-0.5">{student.books_borrowed}</div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">{student.books_returned} returned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
