import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserCheck,
  Eye,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { Student, StudentFilterParams } from '../../types';
import { studentDataService } from '../../services/dataService';
import { RiskBadge } from '../common/Badge';

interface StudentsPageProps {
  onSelectStudent: (student: Student) => void;
  isFacultyMode?: boolean;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  onSelectStudent,
  isFacultyMode = false,
}) => {
  const [params, setParams] = useState<StudentFilterParams>({
    search: '',
    department: 'all',
    riskLevel: 'all',
    segment: 'all',
    mentorStatus: isFacultyMode ? 'Assigned' : 'all',
    codingRange: 'all',
    page: 1,
    pageSize: 25,
    sortBy: 'student_success_score',
    sortOrder: 'asc',
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    const result = await studentDataService.getStudents(params);
    setStudents(result.data);
    setTotalCount(result.total);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
    const unsub = studentDataService.subscribe(fetchStudents);
    return unsub;
  }, [params]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key: keyof StudentFilterParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSort = (field: string) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const resetFilters = () => {
    setParams({
      search: '',
      department: 'all',
      riskLevel: 'all',
      segment: 'all',
      mentorStatus: 'all',
      codingRange: 'all',
      page: 1,
      pageSize: 25,
      sortBy: 'student_success_score',
      sortOrder: 'asc',
    });
  };

  const departments = ['CSE', 'AI & DS', 'BCA', 'ECE', 'Mechanical', 'BBA', 'Civil'];
  const segments = [
    'High Performers',
    'Strong & Engaged',
    'Developing Students',
    'High Risk - Needs Intervention',
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            {isFacultyMode ? 'My Assigned Students & Department Roster' : 'Student Directory & Roster'}
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Searchable student records with success scores, coding mastery, risk stratification and mentorship assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#111827] text-[#8F9BAD] px-3 py-1.5 rounded-xl font-medium border border-white/[0.06]">
            Showing <strong className="text-[#F5F7FA]">{students.length}</strong> of{' '}
            <strong className="text-[#F5F7FA]">{totalCount.toLocaleString()}</strong> Students
          </span>
        </div>
      </div>

      {/* Filter Bar with all 5 required filters + Search */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          {/* Search by Name or Student ID */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or student ID..."
              value={params.search}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={params.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={params.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Segment Filter */}
          <div>
            <select
              value={params.segment}
              onChange={(e) => handleFilterChange('segment', e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">All Segments</option>
              {segments.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Mentor Assigned Filter */}
          <div>
            <select
              value={params.mentorStatus}
              onChange={(e) => handleFilterChange('mentorStatus', e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">Mentor Status (All)</option>
              <option value="Assigned">Mentor Assigned</option>
              <option value="Pending">Pending Assignment</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          {/* Coding Score Filter */}
          <div className="lg:col-span-2">
            <select
              value={params.codingRange}
              onChange={(e) => handleFilterChange('codingRange', e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">Coding Score (All Ranges)</option>
              <option value="below50">Coding Score &lt; 50 (Critical)</option>
              <option value="50to75">Coding Score 50 - 75 (Average)</option>
              <option value="above75">Coding Score &gt; 75 (Strong)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(params.search ||
          params.department !== 'all' ||
          params.riskLevel !== 'all' ||
          params.segment !== 'all' ||
          params.mentorStatus !== 'all' ||
          params.codingRange !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
            <span className="text-[#8F9BAD]">Active filters applied</span>
            <button
              onClick={resetFilters}
              className="text-[#EB5757] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#657083] uppercase font-bold text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#F5F7FA] transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Student
                    <ArrowUpDown className="w-3 h-3 text-[#657083]" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#F5F7FA] transition-colors"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center gap-1">
                    Department
                    <ArrowUpDown className="w-3 h-3 text-[#657083]" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#F5F7FA] transition-colors"
                  onClick={() => handleSort('student_success_score')}
                >
                  <div className="flex items-center gap-1">
                    Success Score
                    <ArrowUpDown className="w-3 h-3 text-[#657083]" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#F5F7FA] transition-colors"
                  onClick={() => handleSort('coding_score')}
                >
                  <div className="flex items-center gap-1">
                    Coding Score
                    <ArrowUpDown className="w-3 h-3 text-[#657083]" />
                  </div>
                </th>
                <th className="py-3 px-4">Academic Risk</th>
                <th className="py-3 px-4">Placement Risk</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Mentor</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {students.length > 0 ? (
                students.map((s) => (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s)}
                    className="hover:bg-[#1B263A]/40 transition-colors cursor-pointer group"
                  >
                    {/* 1. Student */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F5F7FA] group-hover:text-[#6EA8FE] transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-[#657083] font-mono">
                        {s.student_id} • {s.city}
                      </div>
                    </td>

                    {/* 2. Department */}
                    <td className="py-3.5 px-4 font-medium text-[#8F9BAD]">{s.department}</td>

                    {/* 3. Success Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold ${
                            s.student_success_score < 50
                              ? 'text-[#EB5757]'
                              : s.student_success_score < 70
                              ? 'text-[#F2C94C]'
                              : 'text-[#6FCF97]'
                          }`}
                        >
                          {s.student_success_score}
                        </span>
                        <div className="w-10 bg-[#0A0F1A] rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.student_success_score < 50
                                ? 'bg-[#EB5757]'
                                : s.student_success_score < 70
                                ? 'bg-[#F2C94C]'
                                : 'bg-[#6FCF97]'
                            }`}
                            style={{ width: `${s.student_success_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 4. Coding Score */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          s.coding_score < 50 ? 'text-[#EB5757]' : 'text-[#F5F7FA]'
                        }`}
                      >
                        {s.coding_score}/100
                      </span>
                    </td>

                    {/* 5. Academic Risk */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-medium ${
                          s.academic_risk_probability > 40 ? 'text-[#EB5757]' : 'text-[#8F9BAD]'
                        }`}
                      >
                        {s.academic_risk_probability}%
                      </span>
                    </td>

                    {/* 6. Placement Risk */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-medium ${
                          s.placement_risk_probability > 50 ? 'text-[#EB5757]' : 'text-[#F2C94C]'
                        }`}
                      >
                        {s.placement_risk_probability}%
                      </span>
                    </td>

                    {/* 7. Risk Level */}
                    <td className="py-3.5 px-4">
                      <RiskBadge level={s.predicted_risk_level} size="xs" />
                    </td>

                    {/* 8. Mentor */}
                    <td className="py-3.5 px-4">
                      {s.mentor_name &&
                      s.mentor_name !== 'Not Required' &&
                      s.mentor_name !== 'No mentor available' ? (
                        <span className="text-[#F5F7FA] flex items-center gap-1.5 font-medium truncate max-w-[140px]">
                          <UserCheck className="w-3.5 h-3.5 text-[#6FCF97] shrink-0" />
                          {s.mentor_name}
                        </span>
                      ) : s.mentor_name === 'No mentor available' ? (
                        <span className="text-[10px] bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/20 px-2 py-0.5 rounded-full font-medium">
                          Pending Slot
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#657083]">Not Required</span>
                      )}
                    </td>

                    {/* 9. Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium text-xs transition-colors border border-white/[0.08] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8F9BAD]">
                    <div className="w-5 h-5 border-2 border-[#6EA8FE] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Filtering students...
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#657083]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#657083]" />
                    No students match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 bg-[#0A0F1A] border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#8F9BAD]">
          <div className="flex items-center gap-3">
            <span>
              Page <strong className="text-[#F5F7FA]">{params.page}</strong> of{' '}
              <strong className="text-[#F5F7FA]">{totalPages || 1}</strong>
            </span>
            <div className="flex items-center gap-1">
              <span>Show</span>
              <select
                value={params.pageSize}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))
                }
                className="bg-[#111827] border border-white/[0.08] rounded-lg px-2 py-0.5 text-[#F5F7FA] font-medium"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, (params.page || 1) - 1))}
              disabled={params.page === 1}
              className="px-3 py-1 bg-[#111827] border border-white/[0.08] rounded-xl hover:bg-[#1B263A] disabled:opacity-40 text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" /> Previous
            </button>
            <button
              onClick={() =>
                handleFilterChange('page', Math.min(totalPages, (params.page || 1) + 1))
              }
              disabled={params.page === totalPages || totalPages === 0}
              className="px-3 py-1 bg-[#111827] border border-white/[0.08] rounded-xl hover:bg-[#1B263A] disabled:opacity-40 text-xs font-medium cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
