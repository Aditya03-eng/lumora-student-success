import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  Filter,
  Search,
  ExternalLink,
  Users,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import type { Student, RiskLevel } from '../../types';
import { studentDataService } from '../../services/dataService';

interface RiskIntelligencePageProps {
  onSelectStudent: (student: Student) => void;
}

export const RiskIntelligencePage: React.FC<RiskIntelligencePageProps> = ({
  onSelectStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedFactor, setSelectedFactor] = useState('all');
  const [selectedMentorFilter, setSelectedMentorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await studentDataService.getAllStudents();
      setStudents(data);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const departments = ['all', 'Computer Science & Engineering (CSE)', 'Information Technology (IT)', 'Electronics & Comm (ECE)', 'Mechanical Engineering (ME)', 'Civil Engineering (CE)', 'Electrical Engineering (EE)'];

  // Counts
  const total = students.length || 4000;
  const highRisk = students.filter((s) => s.predicted_risk_level === 'High').length;
  const medRisk = students.filter((s) => s.predicted_risk_level === 'Medium').length;
  const lowRisk = students.filter((s) => s.predicted_risk_level === 'Low').length;

  // Filter students
  const filteredStudents = students.filter((s) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Risk Intelligence Matrix
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Diagnostic early warning surveillance, multi-factor risk telemetry, and intervention triage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#111827] border border-white/[0.06] px-3 py-1.5 rounded-xl text-[#8F9BAD]">
            4,000 Verified Students Indexed
          </span>
        </div>
      </div>

      {/* Top 3 Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Risk */}
        <div className="bg-[#111827] border border-[#EB5757]/20 rounded-2xl p-4.5 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between text-[#EB5757] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk Tier</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#EB5757] animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#EB5757] tracking-tight">
            {highRisk.toLocaleString()}
          </div>
          <p className="text-xs text-[#8F9BAD] mt-1">
            {((highRisk / total) * 100).toFixed(1)}% of campus • Critical multi-factor early warnings
          </p>
        </div>

        {/* Medium Risk */}
        <div className="bg-[#111827] border border-[#F2C94C]/20 rounded-2xl p-4.5 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between text-[#F2C94C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Medium Risk Tier</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2C94C]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#F2C94C] tracking-tight">
            {medRisk.toLocaleString()}
          </div>
          <p className="text-xs text-[#8F9BAD] mt-1">
            {((medRisk / total) * 100).toFixed(1)}% of campus • Developing risk signals
          </p>
        </div>

        {/* Low Risk */}
        <div className="bg-[#111827] border border-[#6FCF97]/20 rounded-2xl p-4.5 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between text-[#6FCF97] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Risk Tier</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#6FCF97]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#6FCF97] tracking-tight">
            {lowRisk.toLocaleString()}
          </div>
          <p className="text-xs text-[#8F9BAD] mt-1">
            {((lowRisk / total) * 100).toFixed(1)}% of campus • Stable academic and placement trajectory
          </p>
        </div>
      </div>

      {/* Major Risk Factors & Intervention Recommendations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Major Risk Factors */}
        <div className="lg:col-span-6 bg-[#111827] border border-white/[0.06] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
              Major Risk Factors
            </h3>
            <span className="text-[10px] text-[#657083]">Primary Drivers</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#F5F7FA]">Low Class Attendance (&lt;75%)</div>
                <div className="text-[11px] text-[#8F9BAD]">Chronic absenteeism correlates with test failures</div>
              </div>
              <span className="text-sm font-bold text-[#EB5757] font-mono">1,828</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#F5F7FA]">Low Coding Score (&lt;50/100)</div>
                <div className="text-[11px] text-[#8F9BAD]">Algorithmic problem-solving deficiency</div>
              </div>
              <span className="text-sm font-bold text-[#F2C94C] font-mono">840</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#F5F7FA]">Placement Readiness Deficit (&lt;60)</div>
                <div className="text-[11px] text-[#8F9BAD]">Interview communication and technical mock clearance</div>
              </div>
              <span className="text-sm font-bold text-[#6EA8FE] font-mono">712</span>
            </div>
          </div>
        </div>

        {/* Intervention Recommendations */}
        <div className="lg:col-span-6 bg-[#151D2D] border border-white/[0.08] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6EA8FE] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6EA8FE]" />
              Intervention Recommendations
            </h3>
            <span className="text-[10px] text-[#8F9BAD]">Institutional Action Plan</span>
          </div>
          <div className="space-y-2.5 text-xs text-[#F5F7FA]">
            <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04]">
              <div className="font-semibold text-[#6EA8FE] mb-0.5">1. Peer Mentorship Allocation</div>
              <p className="text-[11px] text-[#8F9BAD]">
                Pair 623 dual-deficit students with High-Potential scholars in CSE and IT.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04]">
              <div className="font-semibold text-[#F2C94C] mb-0.5">2. Mandatory Remedial Coding Labs</div>
              <p className="text-[11px] text-[#8F9BAD]">
                Schedule 2-hour guided problem-solving cohorts for students scoring below 50.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04]">
              <div className="font-semibold text-[#6FCF97] mb-0.5">3. Faculty Mentor Check-in Cadence</div>
              <p className="text-[11px] text-[#8F9BAD]">
                Enforce bi-weekly check-ins for the 47 immediate intervention students.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#6EA8FE]" />
            Risk Filters & Search
          </div>
          <span className="text-xs text-[#8F9BAD]">
            Showing <strong className="text-[#F5F7FA]">{filteredStudents.length}</strong> of {total} students
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science & Engineering (CSE)">CSE</option>
            <option value="Information Technology (IT)">IT</option>
            <option value="Electronics & Comm (ECE)">ECE</option>
            <option value="Mechanical Engineering (ME)">ME</option>
            <option value="Civil Engineering (CE)">CE</option>
            <option value="Electrical Engineering (EE)">EE</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>

          {/* Risk Factor Filter */}
          <select
            value={selectedFactor}
            onChange={(e) => setSelectedFactor(e.target.value)}
            className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Risk Factors</option>
            <option value="attendance">Low Attendance (&lt;75%)</option>
            <option value="coding">Low Coding (&lt;50)</option>
            <option value="academic">Low Academic (&lt;60)</option>
            <option value="technical">Low Technical (&lt;60)</option>
            <option value="communication">Low Communication (&lt;60)</option>
            <option value="placement">Low Placement Readiness</option>
          </select>

          {/* Mentor Filter */}
          <select
            value={selectedMentorFilter}
            onChange={(e) => setSelectedMentorFilter(e.target.value)}
            className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Mentor Statuses</option>
            <option value="unassigned">Unassigned Mentors</option>
            <option value="assigned">Assigned Mentors</option>
          </select>
        </div>
      </div>

      {/* Clean Student Table */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Risk Level</th>
                <th className="py-3 px-4 font-semibold">Success Score</th>
                <th className="py-3 px-4 font-semibold">Attendance</th>
                <th className="py-3 px-4 font-semibold">Coding</th>
                <th className="py-3 px-4 font-semibold">Risk Factors</th>
                <th className="py-3 px-4 font-semibold">Assigned Mentor</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
              {filteredStudents.slice(0, 30).map((student) => {
                const factors = student.risk_factors.slice(0, 2).join(', ') || 'General Academic';
                return (
                  <tr
                    key={student.student_id}
                    className="hover:bg-[#1B263A]/50 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F5F7FA] group-hover:text-[#6EA8FE]">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-[#657083] font-mono">
                        {student.student_id}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#8F9BAD]">
                      {student.department}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border inline-flex items-center gap-1 ${
                          student.predicted_risk_level === 'High'
                            ? 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/25'
                            : student.predicted_risk_level === 'Medium'
                            ? 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/25'
                            : 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/25'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.predicted_risk_level === 'High'
                              ? 'bg-[#EB5757]'
                              : student.predicted_risk_level === 'Medium'
                              ? 'bg-[#F2C94C]'
                              : 'bg-[#6FCF97]'
                          }`}
                        />
                        {student.predicted_risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {student.student_success_score}
                      <span className="text-[10px] text-[#657083] font-normal"> / 100</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          student.attendance_percent < 75 ? 'text-[#EB5757]' : 'text-[#8F9BAD]'
                        }`}
                      >
                        {student.attendance_percent}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          student.coding_score < 50 ? 'text-[#EB5757]' : 'text-[#8F9BAD]'
                        }`}
                      >
                        {student.coding_score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8F9BAD] max-w-xs truncate">
                      {factors}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {student.mentor_name &&
                      student.mentor_name !== 'Not Required' &&
                      student.mentor_name !== 'No mentor available' ? (
                        <span className="text-[#F5F7FA]">{student.mentor_name}</span>
                      ) : (
                        <span className="text-[#EB5757] font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#6EA8FE] text-[#6EA8FE] hover:text-[#070B14] font-semibold text-xs border border-white/[0.08] hover:border-[#6EA8FE] transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0A0F1A] border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8F9BAD]">
          <span>Displaying top 30 filtered records</span>
          <span>Refine filters above to drill down into specific cohorts</span>
        </div>
      </div>
    </div>
  );
};
