import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  Filter,
  CheckCircle,
} from 'lucide-react';
import type { Student, StudentFilterParams } from '../../types';
import { studentDataService } from '../../services/dataService';
import { RiskBadge } from '../common/Badge';

interface RiskFlagsPageProps {
  onSelectStudent: (student: Student) => void;
}

export const RiskFlagsPage: React.FC<RiskFlagsPageProps> = ({ onSelectStudent }) => {
  const [params, setParams] = useState<StudentFilterParams>({
    search: '',
    department: 'all',
    riskLevel: 'all',
    flagFilter: 'all',
    page: 1,
    pageSize: 20,
    sortBy: 'student_success_score',
    sortOrder: 'asc',
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [flagSummary, setFlagSummary] = useState({
    lowAttendance: 0,
    lowAcademic: 0,
    lowCoding: 0,
    lowTechnical: 0,
    lowCommunication: 0,
    lowPlacement: 0,
    lowAssignment: 0,
    lowSatisfaction: 0,
  });

  const loadData = async () => {
    setLoading(true);
    const [result, summary] = await Promise.all([
      studentDataService.getStudents(params),
      studentDataService.getRiskFlagsSummary(),
    ]);
    setStudents(result.data);
    setTotalCount(result.total);
    setTotalPages(result.totalPages);
    setFlagSummary(summary);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, [params]);

  const handleFilterChange = (key: keyof StudentFilterParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const departments = ['CSE', 'AI & DS', 'BCA', 'ECE', 'Mechanical', 'BBA', 'Civil'];

  const flagOptions = [
    { id: 'all', label: 'All Flag Types' },
    { id: 'low_attendance', label: 'Low Attendance (<75%)' },
    { id: 'low_academic', label: 'Low Academic Performance (<60)' },
    { id: 'low_coding', label: 'Low Coding Score (<50)' },
    { id: 'low_technical', label: 'Low Technical Skills (<60)' },
    { id: 'low_communication', label: 'Low Communication Skills (<60)' },
    { id: 'low_placement', label: 'Low Placement Readiness (<60)' },
    { id: 'low_assignment', label: 'Low Assignment Completion (<70%)' },
    { id: 'low_satisfaction', label: 'Low Student Satisfaction (<3.0)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#262E3D]">
        <div>
          <h2 className="text-lg font-bold text-[#F1F3F5] tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F2C94C]" />
            Student Risk Flag System
          </h2>
          <p className="text-xs text-[#AAB2C0] mt-0.5">
            Granular risk diagnostic indicators flagging academic vulnerability, attendance drops, and placement readiness
          </p>
        </div>

        {/* Quick high-risk switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              handleFilterChange('riskLevel', params.riskLevel === 'High' ? 'all' : 'High')
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              params.riskLevel === 'High'
                ? 'bg-[#2E1A1D] text-[#EB5757] border-[#5A242B]'
                : 'bg-[#1B202B] text-[#AAB2C0] border-[#262E3D] hover:text-[#F1F3F5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#EB5757]" />
            {params.riskLevel === 'High' ? 'Showing High-Risk Only' : 'Filter High-Risk Only'}
          </button>
        </div>
      </div>

      {/* 8 Campus-Wide Flag Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <button
          onClick={() => handleFilterChange('flagFilter', 'low_attendance')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_attendance'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Low Attendance</span>
          <span className="text-base font-bold text-[#EB5757]">
            {flagSummary.lowAttendance.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 75% class</span>
        </button>

        <button
          onClick={() => handleFilterChange('flagFilter', 'low_academic')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_academic'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Low Academics</span>
          <span className="text-base font-bold text-[#EB5757]">
            {flagSummary.lowAcademic.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 60 avg marks</span>
        </button>

        <button
          onClick={() => handleFilterChange('flagFilter', 'low_coding')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_coding'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Low Coding</span>
          <span className="text-base font-bold text-[#EB5757]">
            {flagSummary.lowCoding.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 50 score</span>
        </button>

        <button
          onClick={() => handleFilterChange('flagFilter', 'low_technical')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_technical'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Low Technical</span>
          <span className="text-base font-bold text-[#F2C94C]">
            {flagSummary.lowTechnical.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 60 skills</span>
        </button>

        <button
          onClick={() => handleFilterChange('flagFilter', 'low_communication')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_communication'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Low Comm</span>
          <span className="text-base font-bold text-[#F2C94C]">
            {flagSummary.lowCommunication.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 60 score</span>
        </button>

        <button
          onClick={() => handleFilterChange('flagFilter', 'low_placement')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_placement'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Placement Risk</span>
          <span className="text-base font-bold text-[#EB5757]">
            {flagSummary.lowPlacement.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 60 readiness</span>
        </button>

        <button
          onClick={() => handleFilterChange('flagFilter', 'low_assignment')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_assignment'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Assignment Gap</span>
          <span className="text-base font-bold text-[#F2C94C]">
            {flagSummary.lowAssignment.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 70% rate</span>
        </button>

        <button
          onClick={() => handleFilterChange('flagFilter', 'low_satisfaction')}
          className={`p-2.5 rounded-lg border text-left transition-colors ${
            params.flagFilter === 'low_satisfaction'
              ? 'bg-[#222936] border-[#6EA8FE]'
              : 'bg-[#1B202B] border-[#262E3D] hover:border-[#7A8499]'
          }`}
        >
          <span className="text-[10px] text-[#AAB2C0] block truncate">Satisfaction</span>
          <span className="text-base font-bold text-[#AAB2C0]">
            {flagSummary.lowSatisfaction.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#7A8499] block">&lt; 3.0 rating</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#7A8499] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={params.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] placeholder-[#7A8499] focus:outline-none focus:border-[#6EA8FE]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={params.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] focus:outline-none focus:border-[#6EA8FE]"
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
              className="w-full py-1.5 px-3 text-xs bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] focus:outline-none focus:border-[#6EA8FE]"
            >
              <option value="all">All Risk Levels (Low, Medium, High)</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>
          </div>

          {/* Specific Flag Filter */}
          <div>
            <select
              value={params.flagFilter}
              onChange={(e) => handleFilterChange('flagFilter', e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] focus:outline-none focus:border-[#6EA8FE]"
            >
              {flagOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter reset if active */}
        {(params.search ||
          params.department !== 'all' ||
          params.riskLevel !== 'all' ||
          params.flagFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-[#AAB2C0] pt-1">
            <span>
              Showing {students.length} of {totalCount.toLocaleString()} flagged students
            </span>
            <button
              onClick={() =>
                setParams({
                  search: '',
                  department: 'all',
                  riskLevel: 'all',
                  flagFilter: 'all',
                  page: 1,
                  pageSize: 20,
                  sortBy: 'student_success_score',
                  sortOrder: 'asc',
                })
              }
              className="text-[#EB5757] hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Flagged Students Table */}
      <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151923] text-[#AAB2C0] uppercase font-bold text-[10px] tracking-wider border-b border-[#262E3D]">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-4">Active Risk Flags</th>
                <th className="py-2.5 px-3">Success Score</th>
                <th className="py-2.5 px-3">Assigned Mentor</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262E3D]">
              {students.length > 0 ? (
                students.map((s) => (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s)}
                    className="hover:bg-[#222936] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#F1F3F5] group-hover:text-[#6EA8FE] transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-[#7A8499] font-mono">
                        {s.student_id} • {s.city}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#AAB2C0] font-medium">{s.department}</td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={s.predicted_risk_level} size="xs" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.flags.low_attendance && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2E1A1D] text-[#EB5757] border border-[#5A242B] font-medium">
                            Attendance ({s.attendance_percent}%)
                          </span>
                        )}
                        {s.flags.low_academic && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2E1A1D] text-[#EB5757] border border-[#5A242B] font-medium">
                            Academic ({s.average_score})
                          </span>
                        )}
                        {s.flags.low_coding && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2E1A1D] text-[#EB5757] border border-[#5A242B] font-medium">
                            Coding ({s.coding_score})
                          </span>
                        )}
                        {s.flags.low_placement && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B2616] text-[#F2C94C] border border-[#4E3F1F] font-medium">
                            Placement Readiness
                          </span>
                        )}
                        {s.flags.low_technical && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B2616] text-[#F2C94C] border border-[#4E3F1F] font-medium">
                            Technical Skills
                          </span>
                        )}
                        {s.flags.low_communication && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222936] text-[#AAB2C0] border border-[#2E3747] font-medium">
                            Communication
                          </span>
                        )}
                        {s.flags.low_assignment && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222936] text-[#AAB2C0] border border-[#2E3747] font-medium">
                            Assignments ({s.assignment_completion_rate}%)
                          </span>
                        )}
                        {!s.flags.low_attendance &&
                          !s.flags.low_academic &&
                          !s.flags.low_coding &&
                          !s.flags.low_placement &&
                          !s.flags.low_technical && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#162722] text-[#6FCF97] border border-[#224738] font-medium">
                              In Good Standing
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#F1F3F5]">{s.student_success_score}</span>
                      <span className="text-[10px] text-[#7A8499]">/100</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {s.mentor_name &&
                      s.mentor_name !== 'Not Required' &&
                      s.mentor_name !== 'No mentor available' ? (
                        <span className="text-[#F1F3F5] flex items-center gap-1 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#6FCF97] shrink-0" />
                          {s.mentor_name}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#2B2616] text-[#F2C94C] border border-[#4E3F1F] px-1.5 py-0.5 rounded font-medium">
                          Pending Mentor
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s);
                        }}
                        className="px-2.5 py-1 rounded bg-[#222936] hover:bg-[#2B3344] text-[#6EA8FE] font-medium text-xs transition-colors border border-[#262E3D] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#AAB2C0]">
                    <div className="w-5 h-5 border-2 border-[#6EA8FE] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying risk flags dataset...
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7A8499]">
                    No students match the selected risk flag filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 bg-[#151923] border-t border-[#262E3D] flex items-center justify-between text-xs text-[#AAB2C0]">
          <div>
            Page <strong className="text-[#F1F3F5]">{params.page}</strong> of{' '}
            <strong className="text-[#F1F3F5]">{totalPages || 1}</strong> (
            {totalCount.toLocaleString()} total students)
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, (params.page || 1) - 1))}
              disabled={params.page === 1}
              className="px-2.5 py-1 bg-[#1B202B] border border-[#262E3D] rounded hover:bg-[#222936] disabled:opacity-40 text-xs font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" /> Prev
            </button>
            <button
              onClick={() =>
                handleFilterChange('page', Math.min(totalPages, (params.page || 1) + 1))
              }
              disabled={params.page === totalPages || totalPages === 0}
              className="px-2.5 py-1 bg-[#1B202B] border border-[#262E3D] rounded hover:bg-[#222936] disabled:opacity-40 text-xs font-medium"
            >
              Next <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
