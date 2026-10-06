import React, { useState, useEffect } from 'react';
import {
  Code2,
  Users,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  CalendarCheck,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import type { Student, StudentSkillAssessment, AssessmentStatus, SoftSkillStatus } from '../../types';
import { studentDataService } from '../../services/dataService';

interface SkillsAssessmentsPageProps {
  onSelectStudent: (student: Student) => void;
  onAssignInterview?: (student: Student) => void;
}

export const SkillsAssessmentsPage: React.FC<SkillsAssessmentsPageProps> = ({
  onSelectStudent,
  onAssignInterview,
}) => {
  const [activeArea, setActiveArea] = useState<'technical' | 'soft'>('technical');
  const [assessments, setAssessments] = useState<StudentSkillAssessment[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Status edit modal state
  const [editingAssessment, setEditingAssessment] = useState<{
    student_id: string;
    student_name: string;
    techStatus: AssessmentStatus;
    softStatus: SoftSkillStatus;
  } | null>(null);

  const loadData = async () => {
    const list = await studentDataService.getSkillAssessments({
      department: selectedDept,
      assessmentStatus: selectedStatus,
      search: searchQuery,
    });
    setAssessments(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedStatus, searchQuery]);

  const handleUpdateStatus = async (
    studentId: string,
    updates: { technical_assessment_status?: AssessmentStatus; soft_skill_status?: SoftSkillStatus }
  ) => {
    await studentDataService.updateSkillAssessment(studentId, updates);
    loadData();
    setEditingAssessment(null);
  };

  const handleOpenStudentProfile = async (studentId: string) => {
    const s = await studentDataService.getStudentById(studentId);
    if (s) {
      onSelectStudent(s);
    }
  };

  // KPI Calculations
  const totalCount = assessments.length || 1;
  const avgCoding = Math.round(
    assessments.reduce((acc, a) => acc + a.coding_score, 0) / totalCount
  );
  const avgTech = Math.round(
    assessments.reduce((acc, a) => acc + a.technical_skill, 0) / totalCount
  );
  const avgComm = Math.round(
    assessments.reduce((acc, a) => acc + a.communication_skill, 0) / totalCount
  );
  const avgTeam = Math.round(
    assessments.reduce((acc, a) => acc + a.teamwork, 0) / totalCount
  );
  const needsImprovementCount = assessments.filter(
    (a) => a.technical_assessment_status === 'Needs Improvement'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Skills & Assessments Management
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Diagnostic tracking of student algorithmic coding capability and interpersonal soft skills
          </p>
        </div>

        {/* Sub-Area Switcher */}
        <div className="flex items-center bg-[#111827] p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveArea('technical')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeArea === 'technical'
                ? 'bg-[#151D2D] text-[#6EA8FE] shadow-xs border border-white/[0.08]'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Technical Skills</span>
          </button>
          <button
            onClick={() => setActiveArea('soft')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeArea === 'soft'
                ? 'bg-[#151D2D] text-[#8B9CFF] shadow-xs border border-white/[0.08]'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Soft Skills</span>
          </button>
        </div>
      </div>

      {/* 4 Compact Skill KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activeArea === 'technical' ? (
          <>
            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#657083] uppercase tracking-wider block mb-1">
                Average Coding Score
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] flex items-baseline gap-1">
                {avgCoding}
                <span className="text-xs text-[#657083] font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Institutional benchmark
              </div>
            </div>

            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#657083] uppercase tracking-wider block mb-1">
                Average Technical Skill
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#6EA8FE] flex items-baseline gap-1">
                {avgTech}
                <span className="text-xs text-[#657083] font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Lab practicals & project scores
              </div>
            </div>

            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#EB5757] uppercase tracking-wider block mb-1">
                Needs Coding Support
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#EB5757]">
                {needsImprovementCount}
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Score &lt; 50 in algorithmic logic
              </div>
            </div>

            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#6FCF97] uppercase tracking-wider block mb-1">
                Completed Assessments
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#6FCF97]">
                {assessments.filter((a) => a.technical_assessment_status === 'Completed').length}
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Verified by academic board
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#657083] uppercase tracking-wider block mb-1">
                Average Communication
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] flex items-baseline gap-1">
                {avgComm}
                <span className="text-xs text-[#657083] font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Verbal presentation & interviews
              </div>
            </div>

            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#657083] uppercase tracking-wider block mb-1">
                Average Teamwork
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#8B9CFF] flex items-baseline gap-1">
                {avgTeam}
                <span className="text-xs text-[#657083] font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Peer review & group project metrics
              </div>
            </div>

            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#6FCF97] uppercase tracking-wider block mb-1">
                Exemplary Soft Skills
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#6FCF97]">
                {assessments.filter((a) => a.soft_skill_status === 'Exemplary').length}
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Leadership & communication &gt; 80
              </div>
            </div>

            <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
              <span className="text-[10px] font-semibold text-[#F2C94C] uppercase tracking-wider block mb-1">
                Developing Soft Skills
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-[#F2C94C]">
                {assessments.filter((a) => a.soft_skill_status === 'Developing' || a.soft_skill_status === 'Needs Support').length}
              </div>
              <div className="text-[11px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
                Recommended for mentor coaching
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Ribbon */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] text-xs focus:outline-none focus:border-[#6EA8FE]/60"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering (CSE)">CSE</option>
            <option value="Information Technology (IT)">IT</option>
            <option value="Electronics & Comm (ECE)">ECE</option>
            <option value="Mechanical Engineering (ME)">ME</option>
            <option value="Civil Engineering (CE)">CE</option>
            <option value="Electrical Engineering (EE)">EE</option>
          </select>

          {activeArea === 'technical' && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">All Assessment Statuses</option>
              <option value="Not Assessed">Not Assessed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Needs Improvement">Needs Improvement</option>
            </select>
          )}
        </div>

        <span className="text-[11px] text-[#8F9BAD]">
          Showing {assessments.slice(0, 50).length} of {assessments.length} assessed students
        </span>
      </div>

      {/* ================= TECHNICAL SKILLS TABLE ================= */}
      {activeArea === 'technical' ? (
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Coding Score</th>
                  <th className="py-3 px-4 font-semibold">Technical Skill</th>
                  <th className="py-3 px-4 font-semibold">Problem Solving</th>
                  <th className="py-3 px-4 font-semibold">Aptitude Score</th>
                  <th className="py-3 px-4 font-semibold">Assessment Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
                {assessments.slice(0, 50).map((item) => (
                  <tr key={item.student_id} className="hover:bg-[#1B263A]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F5F7FA]">{item.student_name}</div>
                      <div className="text-[10px] text-[#657083] font-mono">{item.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#8F9BAD] font-medium">{item.department}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                          item.coding_score < 50
                            ? 'bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20'
                            : item.coding_score < 70
                            ? 'bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/20'
                            : 'bg-[#6FCF97]/10 text-[#6FCF97] border border-[#6FCF97]/20'
                        }`}
                      >
                        {item.coding_score}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#F5F7FA]">{item.technical_skill}</td>
                    <td className="py-3.5 px-4 font-medium text-[#F5F7FA]">{item.problem_solving}</td>
                    <td className="py-3.5 px-4 font-medium text-[#F5F7FA]">{item.aptitude_score}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          setEditingAssessment({
                            student_id: item.student_id,
                            student_name: item.student_name,
                            techStatus: item.technical_assessment_status,
                            softStatus: item.soft_skill_status,
                          })
                        }
                        title="Click to update status"
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                          item.technical_assessment_status === 'Completed'
                            ? 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/20'
                            : item.technical_assessment_status === 'Scheduled'
                            ? 'bg-[#6EA8FE]/10 text-[#6EA8FE] border-[#6EA8FE]/20'
                            : item.technical_assessment_status === 'Needs Improvement'
                            ? 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20'
                            : 'bg-white/[0.04] text-[#8F9BAD] border-white/[0.08]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.technical_assessment_status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenStudentProfile(item.student_id)}
                        className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium border border-white/[0.08] text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= SOFT SKILLS TABLE ================= */
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Communication</th>
                  <th className="py-3 px-4 font-semibold">Teamwork</th>
                  <th className="py-3 px-4 font-semibold">Leadership</th>
                  <th className="py-3 px-4 font-semibold">Placement Communication</th>
                  <th className="py-3 px-4 font-semibold">Soft Skill Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
                {assessments.slice(0, 50).map((item) => (
                  <tr key={item.student_id} className="hover:bg-[#1B263A]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F5F7FA]">{item.student_name}</div>
                      <div className="text-[10px] text-[#657083] font-mono">{item.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#8F9BAD] font-medium">{item.department}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#6EE7F9]">{item.communication_skill}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#8B9CFF]">{item.teamwork}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#F2C94C]">{item.leadership}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#6FCF97]">{item.placement_communication}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          setEditingAssessment({
                            student_id: item.student_id,
                            student_name: item.student_name,
                            techStatus: item.technical_assessment_status,
                            softStatus: item.soft_skill_status,
                          })
                        }
                        title="Click to update status"
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                          item.soft_skill_status === 'Exemplary'
                            ? 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/20'
                            : item.soft_skill_status === 'Proficient'
                            ? 'bg-[#6EA8FE]/10 text-[#6EA8FE] border-[#6EA8FE]/20'
                            : item.soft_skill_status === 'Developing'
                            ? 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/20'
                            : 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.soft_skill_status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenStudentProfile(item.student_id)}
                        className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium border border-white/[0.08] text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inline Status Edit Modal */}
      {editingAssessment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-[#F5F7FA] mb-1">
              Update Assessment Telemetry
            </h3>
            <p className="text-xs text-[#8F9BAD] mb-4">
              Student: <strong className="text-[#6EA8FE]">{editingAssessment.student_name}</strong>
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8F9BAD] font-medium mb-1.5">
                  Technical Assessment Status
                </label>
                <select
                  value={editingAssessment.techStatus}
                  onChange={(e) =>
                    setEditingAssessment({
                      ...editingAssessment,
                      techStatus: e.target.value as AssessmentStatus,
                    })
                  }
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                >
                  <option value="Not Assessed">Not Assessed</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8F9BAD] font-medium mb-1.5">
                  Soft Skill Proficiency Status
                </label>
                <select
                  value={editingAssessment.softStatus}
                  onChange={(e) =>
                    setEditingAssessment({
                      ...editingAssessment,
                      softStatus: e.target.value as SoftSkillStatus,
                    })
                  }
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                >
                  <option value="Exemplary">Exemplary (&gt;80)</option>
                  <option value="Proficient">Proficient (70-79)</option>
                  <option value="Developing">Developing (60-69)</option>
                  <option value="Needs Support">Needs Support (&lt;60)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setEditingAssessment(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#151D2D] hover:bg-[#1B263A] text-[#8F9BAD] hover:text-[#F5F7FA] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(editingAssessment.student_id, {
                    technical_assessment_status: editingAssessment.techStatus,
                    soft_skill_status: editingAssessment.softStatus,
                  })
                }
                className="px-4 py-1.5 rounded-xl bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
