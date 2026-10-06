import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  Sparkles,
  Search,
  Filter,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Code2,
  Briefcase,
  Compass,
} from 'lucide-react';
import type {
  Student,
  HighPotentialStudent,
  DepartmentSkillGap,
  RiskLevel,
  PotentialArea,
} from '../../types';
import { studentDataService } from '../../services/dataService';
import { RiskBadge } from '../common/Badge';

interface IntelligencePageProps {
  onSelectStudent: (student: Student) => void;
  initialTab?: 'risk' | 'skill_gaps' | 'high_potential';
}

export const IntelligencePage: React.FC<IntelligencePageProps> = ({
  onSelectStudent,
  initialTab = 'risk',
}) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'skill_gaps' | 'high_potential'>(initialTab);

  // Risk Intelligence state
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('High');
  const [selectedFactor, setSelectedFactor] = useState('all');
  const [selectedMentorFilter, setSelectedMentorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Skill Gap state
  const [skillGaps, setSkillGaps] = useState<DepartmentSkillGap[]>([]);

  // High Potential state
  const [highPotential, setHighPotential] = useState<HighPotentialStudent[]>([]);
  const [selectedPotentialArea, setSelectedPotentialArea] = useState<string>('all');

  const loadData = async () => {
    const [allStudents, gaps, potential] = await Promise.all([
      studentDataService.getAllStudents(),
      studentDataService.getDepartmentSkillGaps(),
      studentDataService.getHighPotentialStudents(60),
    ]);
    setStudents(allStudents);
    setSkillGaps(gaps);
    setHighPotential(potential);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Risk Students
  const filteredRiskStudents = students.filter((s) => {
    if (selectedDept !== 'all' && s.department !== selectedDept) return false;
    if (selectedRisk !== 'all' && s.predicted_risk_level !== selectedRisk) return false;

    if (selectedMentorFilter === 'unassigned') {
      if (s.mentor_name && s.mentor_name !== 'Not Required' && s.mentor_name !== 'No mentor available') {
        return false;
      }
    } else if (selectedMentorFilter === 'assigned') {
      if (!s.mentor_name || s.mentor_name === 'Not Required' || s.mentor_name === 'No mentor available') {
        return false;
      }
    }

    if (selectedFactor !== 'all') {
      if (selectedFactor === 'attendance' && s.attendance_percent >= 75) return false;
      if (selectedFactor === 'coding' && s.coding_score >= 50) return false;
      if (selectedFactor === 'academic' && s.average_score >= 60) return false;
      if (selectedFactor === 'technical' && s.technical_skill >= 60) return false;
      if (selectedFactor === 'communication' && s.communication_skill >= 60) return false;
      if (selectedFactor === 'placement' && s.placement_readiness >= 60) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.student_id.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Filter High Potential Students
  const filteredHighPotential = highPotential.filter((hp) => {
    if (selectedPotentialArea !== 'all' && hp.potential_area !== selectedPotentialArea) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        hp.student.name.toLowerCase().includes(q) ||
        hp.student.student_id.toLowerCase().includes(q) ||
        hp.student.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#262E3D]">
        <div>
          <h2 className="text-lg font-bold text-[#F1F3F5] tracking-tight">
            Institutional Intelligence Hub
          </h2>
          <p className="text-xs text-[#AAB2C0] mt-0.5">
            Deep multi-dimensional telemetry: predictive early warning risk, departmental skill deficits, and high-potential talent
          </p>
        </div>

        {/* 3 Intelligence Sub-Navigation Tabs */}
        <div className="flex items-center bg-[#151923] p-1 rounded-xl border border-[#262E3D] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'risk'
                ? 'bg-[#222936] text-[#EB5757] shadow-sm border border-[#262E3D]'
                : 'text-[#AAB2C0] hover:text-[#F1F3F5]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('skill_gaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'skill_gaps'
                ? 'bg-[#222936] text-[#F2C94C] shadow-sm border border-[#262E3D]'
                : 'text-[#AAB2C0] hover:text-[#F1F3F5]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Skill Gap Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('high_potential')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'high_potential'
                ? 'bg-[#222936] text-[#6EA8FE] shadow-sm border border-[#262E3D]'
                : 'text-[#AAB2C0] hover:text-[#F1F3F5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Potential ({highPotential.length})</span>
          </button>
        </div>
      </div>

      {/* ================= 1. RISK INTELLIGENCE ================= */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#1B202B] border border-[#5A242B] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold text-[#EB5757] uppercase tracking-wider block mb-1">
                High Risk Students
              </span>
              <div className="text-2xl font-bold text-[#EB5757]">
                {students.filter((s) => s.predicted_risk_level === 'High').length.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
                28.2% of total campus roster
              </div>
            </div>

            <div className="bg-[#1B202B] border border-[#4E3F1F] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold text-[#F2C94C] uppercase tracking-wider block mb-1">
                Medium Risk Students
              </span>
              <div className="text-2xl font-bold text-[#F2C94C]">
                {students.filter((s) => s.predicted_risk_level === 'Medium').length.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
                Monitor for potential downgrade
              </div>
            </div>

            <div className="bg-[#1B202B] border border-[#224738] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold text-[#6FCF97] uppercase tracking-wider block mb-1">
                Low Risk Students
              </span>
              <div className="text-2xl font-bold text-[#6FCF97]">
                {students.filter((s) => s.predicted_risk_level === 'Low').length.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
                Good standing (&gt;75 Score)
              </div>
            </div>

            <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold text-[#AAB2C0] uppercase tracking-wider block mb-1">
                Awaiting Mentors
              </span>
              <div className="text-2xl font-bold text-[#F1F3F5]">
                {
                  students.filter(
                    (s) =>
                      s.predicted_risk_level === 'High' &&
                      (!s.mentor_id || s.mentor_name === 'No mentor available')
                  ).length
                }
              </div>
              <div className="text-[11px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
                High-risk unassigned caseload
              </div>
            </div>
          </div>

          {/* Filtering Ribbon */}
          <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-[#7A8499] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] text-xs focus:outline-none focus:border-[#6EA8FE]"
                />
              </div>

              {/* Department */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#151923] border border-[#262E3D] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F5] focus:outline-none"
              >
                <option value="all">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AI & DS">AI & DS</option>
                <option value="ECE">ECE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
              </select>

              {/* Risk Level */}
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="bg-[#151923] border border-[#262E3D] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F5] focus:outline-none"
              >
                <option value="all">All Risk Levels</option>
                <option value="High">High Risk Only</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>

              {/* Risk Factor */}
              <select
                value={selectedFactor}
                onChange={(e) => setSelectedFactor(e.target.value)}
                className="bg-[#151923] border border-[#262E3D] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F5] focus:outline-none"
              >
                <option value="all">All Risk Factors</option>
                <option value="attendance">Low Attendance (&lt;75%)</option>
                <option value="coding">Low Coding Score (&lt;50)</option>
                <option value="academic">Low Academic Score (&lt;60)</option>
                <option value="technical">Low Technical Skill (&lt;60)</option>
                <option value="communication">Low Communication (&lt;60)</option>
                <option value="placement">Low Placement Readiness (&lt;60)</option>
              </select>

              {/* Mentor Status */}
              <select
                value={selectedMentorFilter}
                onChange={(e) => setSelectedMentorFilter(e.target.value)}
                className="bg-[#151923] border border-[#262E3D] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F5] focus:outline-none"
              >
                <option value="all">All Mentorship Status</option>
                <option value="unassigned">Unassigned Only</option>
                <option value="assigned">Assigned Only</option>
              </select>
            </div>

            <span className="text-[11px] text-[#AAB2C0]">
              Showing {filteredRiskStudents.slice(0, 50).length} of {filteredRiskStudents.length} matches
            </span>
          </div>

          {/* Risk Intelligence Table */}
          <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151923] text-[#AAB2C0] uppercase text-[10px] tracking-wider border-b border-[#262E3D]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Risk Level</th>
                    <th className="py-3 px-4 font-semibold">Success Score</th>
                    <th className="py-3 px-4 font-semibold">Academic Risk</th>
                    <th className="py-3 px-4 font-semibold">Placement Risk</th>
                    <th className="py-3 px-4 font-semibold">Main Risk Factors</th>
                    <th className="py-3 px-4 font-semibold">Mentor</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262E3D] text-[#F1F3F5]">
                  {filteredRiskStudents.slice(0, 50).map((s) => (
                    <tr key={s.student_id} className="hover:bg-[#222936]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-[10px] text-[#7A8499]">
                          {s.student_id} • {s.department}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={s.predicted_risk_level} size="xs" />
                      </td>
                      <td className="py-3 px-4 font-bold text-[#F1F3F5]">
                        {s.student_success_score}
                        <span className="text-[10px] text-[#AAB2C0] font-normal"> / 100</span>
                      </td>
                      <td className="py-3 px-4 text-[#EB5757] font-medium">
                        {s.academic_risk_probability}%
                      </td>
                      <td className="py-3 px-4 text-[#EB5757] font-medium">
                        {s.placement_risk_probability}%
                      </td>
                      <td className="py-3 px-4 text-xs text-[#AAB2C0] max-w-xs">
                        <div className="truncate">
                          {s.risk_factors.slice(0, 2).join(', ') || 'Attendance & Coding'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {s.mentor_name &&
                        s.mentor_name !== 'Not Required' &&
                        s.mentor_name !== 'No mentor available' ? (
                          <span className="text-[#F1F3F5] font-medium">{s.mentor_name}</span>
                        ) : (
                          <span className="text-[#EB5757] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectStudent(s)}
                          className="px-2.5 py-1 rounded bg-[#222936] hover:bg-[#2B3344] text-[#6EA8FE] font-medium border border-[#262E3D] text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. SKILL GAP INTELLIGENCE ================= */}
      {activeTab === 'skill_gaps' && (
        <div className="space-y-4">
          {/* Institutional Skill Deficit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#F1F3F5] flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-[#6EA8FE]" />
                  Coding & Logic Gaps
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#2E1A1D] text-[#EB5757] border border-[#5A242B] font-semibold">
                  Critical
                </span>
              </div>
              <p className="text-xs text-[#AAB2C0] leading-relaxed">
                <strong className="text-[#EB5757]">840 students</strong> campus-wide score below 50. Primary deficits exist in data structures and algorithmic complexity.
              </p>
            </div>

            <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#F1F3F5] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#8B9CFF]" />
                  Communication Skill Gaps
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#2B2616] text-[#F2C94C] border border-[#4E3F1F] font-semibold">
                  Moderate
                </span>
              </div>
              <p className="text-xs text-[#AAB2C0] leading-relaxed">
                Identified in <strong className="text-[#F2C94C]">520 students</strong>. Deficits center on technical pitch articulation and placement interview reasoning.
              </p>
            </div>

            <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#F1F3F5] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#6FCF97]" />
                  Placement Readiness Gaps
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#2E1A1D] text-[#EB5757] border border-[#5A242B] font-semibold">
                  Elevated
                </span>
              </div>
              <p className="text-xs text-[#AAB2C0] leading-relaxed">
                <strong className="text-[#EB5757]">784 students</strong> lack mock interview qualification. Requires remedial mock sessions before campus drives.
              </p>
            </div>
          </div>

          {/* Department-level Summary Table */}
          <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#262E3D]">
              <h3 className="text-sm font-bold text-[#F1F3F5]">
                Departmental Skill Gap Matrix
              </h3>
              <p className="text-xs text-[#AAB2C0] mt-0.5">
                Benchmark evaluation across academic faculties identifying targeted remediation needs
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151923] text-[#AAB2C0] uppercase text-[10px] tracking-wider border-b border-[#262E3D]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Coding Gap</th>
                    <th className="py-3 px-4 font-semibold">Technical Skill Gap</th>
                    <th className="py-3 px-4 font-semibold">Communication Gap</th>
                    <th className="py-3 px-4 font-semibold">Problem Solving Gap</th>
                    <th className="py-3 px-4 font-semibold">Placement Gap</th>
                    <th className="py-3 px-4 font-semibold text-right">Critical Deficit Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262E3D] text-[#F1F3F5]">
                  {skillGaps.map((gap) => {
                    const badge = (val: 'Low' | 'Medium' | 'High') => (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          val === 'High'
                            ? 'bg-[#2E1A1D] text-[#EB5757] border-[#5A242B]'
                            : val === 'Medium'
                            ? 'bg-[#2B2616] text-[#F2C94C] border-[#4E3F1F]'
                            : 'bg-[#162722] text-[#6FCF97] border-[#224738]'
                        }`}
                      >
                        {val}
                      </span>
                    );

                    return (
                      <tr key={gap.department} className="hover:bg-[#222936]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#F1F3F5]">{gap.department}</td>
                        <td className="py-3 px-4">{badge(gap.coding_gap)}</td>
                        <td className="py-3 px-4">{badge(gap.technical_gap)}</td>
                        <td className="py-3 px-4">{badge(gap.communication_gap)}</td>
                        <td className="py-3 px-4">{badge(gap.problem_solving_gap)}</td>
                        <td className="py-3 px-4">{badge(gap.placement_gap)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#EB5757]">
                          {gap.critical_students_count}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. HIGH POTENTIAL STUDENTS ================= */}
      {activeTab === 'high_potential' && (
        <div className="space-y-4">
          {/* Filter Ribbon */}
          <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-[#7A8499] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search top talent by name, ID, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] text-xs focus:outline-none focus:border-[#6EA8FE]"
                />
              </div>

              <select
                value={selectedPotentialArea}
                onChange={(e) => setSelectedPotentialArea(e.target.value)}
                className="bg-[#151923] border border-[#262E3D] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F5] focus:outline-none"
              >
                <option value="all">All Potential Areas</option>
                <option value="Academic Excellence">Academic Excellence</option>
                <option value="Technical Excellence">Technical Excellence</option>
                <option value="Leadership">Leadership</option>
                <option value="Placement Readiness">Placement Readiness</option>
                <option value="Engagement">Campus Engagement</option>
              </select>
            </div>

            <span className="text-[11px] text-[#AAB2C0]">
              Showing {filteredHighPotential.length} high potential candidates
            </span>
          </div>

          {/* High Potential Table */}
          <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151923] text-[#AAB2C0] uppercase text-[10px] tracking-wider border-b border-[#262E3D]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Success Score</th>
                    <th className="py-3 px-4 font-semibold">Coding Score</th>
                    <th className="py-3 px-4 font-semibold">Placement Score</th>
                    <th className="py-3 px-4 font-semibold">Segment</th>
                    <th className="py-3 px-4 font-semibold">Potential Area</th>
                    <th className="py-3 px-4 font-semibold">Recommended Role</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262E3D] text-[#F1F3F5]">
                  {filteredHighPotential.map((hp) => {
                    const areaColor =
                      hp.potential_area === 'Technical Excellence'
                        ? 'bg-[#182338] text-[#6EA8FE] border-[#253A5E]'
                        : hp.potential_area === 'Leadership'
                        ? 'bg-[#2B2616] text-[#F2C94C] border-[#4E3F1F]'
                        : hp.potential_area === 'Academic Excellence'
                        ? 'bg-[#201F3B] text-[#8B9CFF] border-[#363468]'
                        : hp.potential_area === 'Placement Readiness'
                        ? 'bg-[#162722] text-[#6FCF97] border-[#224738]'
                        : 'bg-[#222936] text-[#AAB2C0] border-[#262E3D]';

                    return (
                      <tr key={hp.student.student_id} className="hover:bg-[#222936]/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#F1F3F5]">{hp.student.name}</div>
                          <div className="text-[10px] text-[#7A8499] font-mono">{hp.student.student_id}</div>
                        </td>
                        <td className="py-3 px-4 text-[#AAB2C0] font-medium">{hp.student.department}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#6FCF97]">{hp.student.student_success_score}</span>
                          <span className="text-[10px] text-[#AAB2C0]"> / 100</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#F1F3F5]">{hp.student.coding_score}</td>
                        <td className="py-3 px-4 font-medium text-[#F1F3F5]">{hp.student.placement_score}</td>
                        <td className="py-3 px-4 text-[11px] text-[#AAB2C0]">{hp.student.segment_name}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${areaColor}`}>
                            {hp.potential_area}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#F1F3F5] font-medium">
                          {hp.recommended_role}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onSelectStudent(hp.student)}
                            className="px-2.5 py-1 rounded bg-[#222936] hover:bg-[#2B3344] text-[#6EA8FE] font-medium border border-[#262E3D] text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
