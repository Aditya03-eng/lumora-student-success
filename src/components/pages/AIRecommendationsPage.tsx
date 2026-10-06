import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
} from 'lucide-react';
import type { Student, InterventionStatus } from '../../types';
import { studentDataService } from '../../services/dataService';
import { RiskBadge } from '../common/Badge';

interface AIRecommendationsPageProps {
  onSelectStudent: (student: Student) => void;
}

export const AIRecommendationsPage: React.FC<AIRecommendationsPageProps> = ({
  onSelectStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadData = async () => {
    const res = await studentDataService.getRecommendations({
      status: statusFilter,
      riskLevel: riskFilter,
      department: deptFilter,
      search,
      page,
      pageSize,
    });
    setStudents(res.data);
    setTotalCount(res.total);
    setStats(res.stats);
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, [statusFilter, riskFilter, deptFilter, search, page]);

  const handleStatusChange = async (studentId: string, newStatus: InterventionStatus) => {
    await studentDataService.updateInterventionStatus(studentId, newStatus);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const statuses: InterventionStatus[] = ['Not Started', 'Assigned', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#6EA8FE]" />
            AI Prescriptive Recommendations & Interventions
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Machine-learning generated pedagogical and career interventions with live status lifecycle tracking
          </p>
        </div>
      </div>

      {/* 4 Status KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setStatusFilter('Not Started');
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Not Started'
              ? 'bg-[#151D2D] border-[#6EA8FE]'
              : 'bg-[#111827] border-white/[0.06] hover:bg-[#1B263A]'
          }`}
        >
          <span className="text-[10px] font-semibold text-[#8F9BAD] uppercase tracking-wider block mb-1">
            Not Started
          </span>
          <div className="text-xl font-bold text-[#F5F7FA]">{stats.notStarted}</div>
          <span className="text-[10px] text-[#657083] mt-1 block">Awaiting advisor review</span>
        </button>

        <button
          onClick={() => {
            setStatusFilter('Assigned');
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Assigned'
              ? 'bg-[#151D2D] border-[#F2C94C]'
              : 'bg-[#111827] border-white/[0.06] hover:bg-[#1B263A]'
          }`}
        >
          <span className="text-[10px] font-semibold text-[#F2C94C] uppercase tracking-wider block mb-1">
            Assigned
          </span>
          <div className="text-xl font-bold text-[#F2C94C]">{stats.assigned}</div>
          <span className="text-[10px] text-[#657083] mt-1 block">Task queued for student</span>
        </button>

        <button
          onClick={() => {
            setStatusFilter('In Progress');
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'In Progress'
              ? 'bg-[#151D2D] border-[#6EA8FE]'
              : 'bg-[#111827] border-white/[0.06] hover:bg-[#1B263A]'
          }`}
        >
          <span className="text-[10px] font-semibold text-[#6EA8FE] uppercase tracking-wider block mb-1">
            In Progress
          </span>
          <div className="text-xl font-bold text-[#6EA8FE]">{stats.inProgress}</div>
          <span className="text-[10px] text-[#657083] mt-1 block">Active mentoring underway</span>
        </button>

        <button
          onClick={() => {
            setStatusFilter('Completed');
            setPage(1);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'Completed'
              ? 'bg-[#151D2D] border-[#6FCF97]'
              : 'bg-[#111827] border-white/[0.06] hover:bg-[#1B263A]'
          }`}
        >
          <span className="text-[10px] font-semibold text-[#6FCF97] uppercase tracking-wider block mb-1">
            Completed
          </span>
          <div className="text-xl font-bold text-[#6FCF97]">{stats.completed}</div>
          <span className="text-[10px] text-[#657083] mt-1 block">Successfully resolved</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#657083] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Intervention Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="py-1.5 px-2.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Departments</option>
            {['CSE', 'AI & DS', 'BCA', 'ECE', 'Mechanical', 'BBA', 'Civil'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[11px] text-[#8F9BAD] self-start sm:self-auto font-medium">
          Showing {students.length} of {totalCount} records
        </span>
      </div>

      {/* AI Recommendations Table:
          Student, Risk, Risk Factors, AI Recommendation, Mentor, Intervention Status */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#8F9BAD] uppercase font-bold text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-4">Risk Factors</th>
                <th className="py-2.5 px-4">AI Recommendation</th>
                <th className="py-2.5 px-3">Mentor</th>
                <th className="py-2.5 px-3">Intervention Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {students.length > 0 ? (
                students.map((s) => (
                  <tr
                    key={s.student_id}
                    onClick={() => onSelectStudent(s)}
                    className="hover:bg-[#1B263A] transition-colors cursor-pointer group"
                  >
                    {/* Student */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#F5F7FA] group-hover:text-[#6EA8FE] transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-[#657083] font-mono">
                        {s.student_id} • {s.department}
                      </div>
                    </td>

                    {/* Risk */}
                    <td className="py-2.5 px-3">
                      <RiskBadge level={s.predicted_risk_level} size="xs" />
                    </td>

                    {/* Risk Factors */}
                    <td className="py-2.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {s.risk_factors.map((rf, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20 px-1.5 py-0.5 rounded font-medium"
                          >
                            {rf}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* AI Recommendation */}
                    <td className="py-2.5 px-4 max-w-sm">
                      <div className="space-y-1">
                        {s.recommendations.map((rec, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] text-[#F5F7FA] flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6EA8FE] shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Mentor */}
                    <td className="py-2.5 px-3">
                      {s.mentor_name &&
                      s.mentor_name !== 'Not Required' &&
                      s.mentor_name !== 'No mentor available' ? (
                        <span className="text-[#F5F7FA] flex items-center gap-1 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#6FCF97] shrink-0" />
                          {s.mentor_name}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/20 px-1.5 py-0.5 rounded font-medium">
                          Pending Slot
                        </span>
                      )}
                    </td>

                    {/* Intervention Status (Interactive inline selector) */}
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={s.intervention_status}
                        onChange={(e) =>
                          handleStatusChange(s.student_id, e.target.value as InterventionStatus)
                        }
                        className={`text-[11px] py-1 px-2 rounded-lg font-semibold border focus:outline-none ${
                          s.intervention_status === 'Completed'
                            ? 'bg-[#6FCF97]/15 text-[#6FCF97] border-[#6FCF97]/30'
                            : s.intervention_status === 'In Progress'
                            ? 'bg-[#6EA8FE]/15 text-[#6EA8FE] border-[#6EA8FE]/30'
                            : s.intervention_status === 'Assigned'
                            ? 'bg-[#F2C94C]/15 text-[#F2C94C] border-[#F2C94C]/30'
                            : 'bg-[#151D2D] text-[#8F9BAD] border-white/[0.08]'
                        }`}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st} className="bg-[#111827] text-[#F5F7FA]">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium text-xs border border-white/[0.08] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#657083]">
                    No AI recommendations match current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-[#0A0F1A] border-t border-white/[0.06] flex items-center justify-between text-xs text-[#8F9BAD]">
          <div>
            Page <strong className="text-[#F5F7FA]">{page}</strong> of{' '}
            <strong className="text-[#F5F7FA]">{totalPages || 1}</strong>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 bg-[#111827] border border-white/[0.06] rounded-lg hover:bg-[#151D2D] disabled:opacity-40 text-xs font-medium cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-2.5 py-1 bg-[#111827] border border-white/[0.06] rounded-lg hover:bg-[#151D2D] disabled:opacity-40 text-xs font-medium cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
