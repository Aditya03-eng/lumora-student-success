import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ChevronRight,
  Search,
  Eye,
  AlertTriangle,
  GraduationCap,
  Users,
} from 'lucide-react';
import type { Mentor, Student } from '../../types';
import { studentDataService } from '../../services/dataService';
import { RiskBadge } from '../common/Badge';

interface MentorsPageProps {
  onSelectStudent: (student: Student) => void;
}

export const MentorsPage: React.FC<MentorsPageProps> = ({ onSelectStudent }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);

  const loadMentors = async () => {
    const list = await studentDataService.getMentors(departmentFilter);
    setMentors(list);
    if (list.length > 0 && !selectedMentor) {
      setSelectedMentor(list[0]);
    }
  };

  useEffect(() => {
    loadMentors();
    const unsub = studentDataService.subscribe(loadMentors);
    return unsub;
  }, [departmentFilter]);

  // Load students for selected mentor
  useEffect(() => {
    const loadAssigned = async () => {
      if (!selectedMentor) {
        setAssignedStudents([]);
        return;
      }
      setLoadingAssigned(true);
      const res = await studentDataService.getStudents({
        mentorStatus: 'Assigned',
        pageSize: 50,
      });
      const forThisMentor = res.data.filter(
        (s) =>
          s.mentor_id === selectedMentor.mentor_id ||
          s.mentor_name.toLowerCase() === selectedMentor.mentor_name.toLowerCase()
      );
      setAssignedStudents(forThisMentor);
      setLoadingAssigned(false);
    };
    loadAssigned();
  }, [selectedMentor]);

  const departments = ['CSE', 'AI & DS', 'ECE', 'BBA', 'Mechanical'];

  const totalCapacity = mentors.reduce((acc, m) => acc + m.max_students, 0);
  const totalAssigned = mentors.reduce((acc, m) => acc + m.current_students, 0);
  const avgUtilization =
    totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#6EA8FE]" />
            Faculty Mentorship Operations
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Advisory caseload limits, department allocations, and student assignment tracking from mentors_final.csv
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8F9BAD]">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Departments ({mentors.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Capacity Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5 flex flex-col justify-between card-hover-lift shadow-xs">
          <span className="text-[11px] font-semibold text-[#657083] uppercase tracking-wider block mb-1">
            Faculty Mentors
          </span>
          <div className="text-2xl font-bold text-[#F5F7FA]">{mentors.length} Active Advisors</div>
          <span className="text-[10px] text-[#8F9BAD] mt-1 pt-1.5 border-t border-white/[0.04]">
            Official institutional faculty
          </span>
        </div>

        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5 flex flex-col justify-between card-hover-lift shadow-xs">
          <span className="text-[11px] font-semibold text-[#657083] uppercase tracking-wider block mb-1">
            Total Mentee Caseload
          </span>
          <div className="text-2xl font-bold text-[#6EA8FE]">
            {totalAssigned} / {totalCapacity} Students
          </div>
          <span className="text-[10px] text-[#6FCF97] mt-1 pt-1.5 border-t border-white/[0.04]">
            {totalCapacity - totalAssigned} open advising slots campus-wide
          </span>
        </div>

        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5 flex flex-col justify-between card-hover-lift shadow-xs">
          <span className="text-[11px] font-semibold text-[#657083] uppercase tracking-wider block mb-1">
            Campus-Wide Utilization
          </span>
          <div className="text-2xl font-bold text-[#F5F7FA]">{avgUtilization}%</div>
          <div className="w-full bg-[#0A0F1A] rounded-full h-1.5 mt-2 overflow-hidden border border-white/[0.04]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                avgUtilization >= 90
                  ? 'bg-[#EB5757]'
                  : avgUtilization >= 70
                  ? 'bg-[#F2C94C]'
                  : 'bg-[#6FCF97]'
              }`}
              style={{ width: `${avgUtilization}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mentors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors.map((m) => {
          const isSelected = selectedMentor?.mentor_id === m.mentor_id;
          const isFull = m.available_slots <= 0;

          return (
            <div
              key={m.mentor_id}
              onClick={() => setSelectedMentor(m)}
              className={`bg-[#111827] border rounded-2xl p-4.5 cursor-pointer transition-all relative ${
                isSelected
                  ? 'border-[#6EA8FE] ring-1 ring-[#6EA8FE]/30 shadow-md bg-[#151D2D]'
                  : 'border-white/[0.06] hover:bg-[#1B263A]'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A0F1A] text-[#6EA8FE] font-bold flex items-center justify-center text-sm border border-white/[0.08]">
                    {m.mentor_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F5F7FA] text-sm leading-tight">
                      {m.mentor_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#8F9BAD] mt-0.5">
                      <span>{m.department}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-[#657083]">{m.mentor_id}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    isFull
                      ? 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20'
                      : 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/20'
                  }`}
                >
                  {isFull ? 'Capacity Full' : `${m.available_slots} Slots Left`}
                </span>
              </div>

              {/* Expertise Badges */}
              <div className="mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#657083] block mb-1">
                  Expertise
                </span>
                <div className="flex flex-wrap gap-1">
                  {m.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-[#0A0F1A] text-[#F5F7FA] px-2 py-0.5 rounded-lg border border-white/[0.06]"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Bar for Mentor Capacity */}
              <div className="pt-2.5 border-t border-white/[0.04] space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[#8F9BAD]">
                  <span>Caseload:</span>
                  <span className="font-bold text-[#F5F7FA]">
                    {m.current_students} / {m.max_students} Students
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#8F9BAD]">
                  <span>Utilization:</span>
                  <span className="font-bold text-[#6EA8FE]">{m.utilization_percent}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#0A0F1A] rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      m.utilization_percent >= 90
                        ? 'bg-[#EB5757]'
                        : m.utilization_percent >= 60
                        ? 'bg-[#6EA8FE]'
                        : 'bg-[#6FCF97]'
                    }`}
                    style={{ width: `${Math.min(100, m.utilization_percent)}%` }}
                  />
                </div>
              </div>

              <div
                className={`mt-3 pt-2 text-[11px] font-semibold flex items-center justify-between transition-colors ${
                  isSelected ? 'text-[#6EA8FE]' : 'text-[#657083]'
                }`}
              >
                <span>{isSelected ? 'Viewing Assigned Students' : 'Click to View Mentees'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Mentor's Assigned Students Table */}
      {selectedMentor && (
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#6EA8FE]" />
                Assigned Students for {selectedMentor.mentor_name} ({selectedMentor.department})
              </h3>
              <p className="text-[11px] text-[#8F9BAD] mt-0.5">
                Active caseload: {selectedMentor.current_students} of {selectedMentor.max_students} maximum slots
              </p>
            </div>
            <span className="text-xs font-medium text-[#8B9CFF] bg-[#8B9CFF]/10 border border-[#8B9CFF]/20 px-2.5 py-1 rounded-xl self-start sm:self-auto">
              Focus: {selectedMentor.expertise.join(' • ')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F1A] text-[#657083] uppercase font-bold text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Success Score</th>
                  <th className="py-3 px-4 font-semibold">Coding Score</th>
                  <th className="py-3 px-4 font-semibold">Risk Level</th>
                  <th className="py-3 px-4 font-semibold">Match Reason</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {assignedStudents.length > 0 ? (
                  assignedStudents.map((s) => (
                    <tr
                      key={s.student_id}
                      onClick={() => onSelectStudent(s)}
                      className="hover:bg-[#1B263A]/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#F5F7FA] group-hover:text-[#6EA8FE] transition-colors">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-[#657083] font-mono">
                          {s.student_id} • {s.city}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#8F9BAD] font-medium">{s.department}</td>
                      <td className="py-3.5 px-4 font-bold text-[#F5F7FA]">
                        {s.student_success_score}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#F5F7FA]">
                        {s.coding_score}/100
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={s.predicted_risk_level} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-[#8F9BAD] max-w-sm truncate">
                        {s.mentor_match_reason}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(s);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium text-xs transition-colors border border-white/[0.08] cursor-pointer"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  ))
                ) : loadingAssigned ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#8F9BAD]">
                      <div className="w-5 h-5 border-2 border-[#6EA8FE] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading assigned mentees...
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#657083]">
                      No students currently assigned to this mentor in current dataset sample.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
