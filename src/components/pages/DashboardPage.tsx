import React from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Bot,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type {
  DashboardKPIs,
  RiskDistribution,
  DepartmentScore,
  DepartmentCodingScore,
  SegmentStats,
  Student,
  NavItem,
} from '../../types';

interface DashboardPageProps {
  kpis: DashboardKPIs;
  riskData: RiskDistribution[];
  departmentScores?: DepartmentScore[];
  departmentCodingScores?: DepartmentCodingScore[];
  segmentStats?: SegmentStats[];
  attentionStudents: Student[];
  onSelectStudent: (student: Student) => void;
  onNavigateTab: (tab: NavItem) => void;
  onOpenCampusAI?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis,
  riskData,
  attentionStudents,
  onSelectStudent,
  onNavigateTab,
  onOpenCampusAI,
}) => {
  // Compute risk distributions
  const lowRisk = riskData.find((r) => r.name.toLowerCase().includes('low'))?.count || 1845;
  const medRisk = riskData.find((r) => r.name.toLowerCase().includes('medium'))?.count || 1028;
  const highRisk = riskData.find((r) => r.name.toLowerCase().includes('high'))?.count || kpis.high_risk_students;
  const total = kpis.total_students || 4000;

  const lowPct = ((lowRisk / total) * 100).toFixed(1);
  const medPct = ((medRisk / total) * 100).toFixed(1);
  const highPct = ((highRisk / total) * 100).toFixed(1);

  // Exact 6 Priority Students for minimal scannability
  const priorityStudents = attentionStudents.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* ================= 1. COMPACT HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Welcome back, Dean
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5 font-normal">
            Student success overview and priority insights for your institution.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] bg-[#111827] border border-white/[0.06] px-3 py-1.5 rounded-xl text-[#8F9BAD] flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#6FCF97] animate-pulse" />
            <span>Telemetry Active</span>
          </span>
          <button
            onClick={() => onNavigateTab('risk_intelligence')}
            className="text-xs bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium px-3.5 py-1.5 rounded-xl border border-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Risk Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ================= 2. FOUR KPI CARDS ONLY ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Students (Blue) */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between card-hover-lift shadow-xs">
          <div className="flex items-center justify-between text-[#8F9BAD] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#657083]">Total Students</span>
            <div className="w-7 h-7 rounded-lg bg-[#6EA8FE]/10 border border-[#6EA8FE]/20 flex items-center justify-center text-[#6EA8FE]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] tracking-tight">
            {kpis.total_students.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#8F9BAD] mt-2 pt-2 border-t border-white/[0.04]">
            Enrolled across 7 departments
          </div>
        </div>

        {/* KPI 2: Average Success Score (Green/Cyan) */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between card-hover-lift shadow-xs">
          <div className="flex items-center justify-between text-[#8F9BAD] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#657083]">Avg Success Score</span>
            <div className="w-7 h-7 rounded-lg bg-[#6EE7F9]/10 border border-[#6EE7F9]/20 flex items-center justify-center text-[#6EE7F9]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] tracking-tight flex items-baseline">
            {kpis.avg_success_score}
            <span className="text-xs font-normal text-[#8F9BAD] ml-1">/ 100</span>
          </div>
          <div className="text-[11px] text-[#6FCF97] font-medium mt-2 pt-2 border-t border-white/[0.04]">
            +2.4% vs institutional benchmark
          </div>
        </div>

        {/* KPI 3: High Risk Students (Red) */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between card-hover-lift shadow-xs">
          <div className="flex items-center justify-between text-[#8F9BAD] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EB5757]">High Risk Students</span>
            <div className="w-7 h-7 rounded-lg bg-[#EB5757]/10 border border-[#EB5757]/20 flex items-center justify-center text-[#EB5757]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#EB5757] tracking-tight flex items-baseline">
            {kpis.high_risk_students.toLocaleString()}
            <span className="text-xs font-normal text-[#8F9BAD] ml-1.5">
              ({kpis.high_risk_percentage}%)
            </span>
          </div>
          <div className="text-[11px] text-[#8F9BAD] mt-2 pt-2 border-t border-white/[0.04]">
            Requires remedial intervention
          </div>
        </div>

        {/* KPI 4: Students Requiring Intervention (Yellow) */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between card-hover-lift shadow-xs">
          <div className="flex items-center justify-between text-[#8F9BAD] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C94C]">Intervention Needed</span>
            <div className="w-7 h-7 rounded-lg bg-[#F2C94C]/10 border border-[#F2C94C]/20 flex items-center justify-center text-[#F2C94C]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#F2C94C] tracking-tight">
            47
          </div>
          <div className="text-[11px] text-[#8F9BAD] mt-2 pt-2 border-t border-white/[0.04]">
            Immediate priority interventions
          </div>
        </div>
      </div>

      {/* ================= 3. MAIN ANALYTICS: RISK OVERVIEW (LEFT) & LUMORA INSIGHT (RIGHT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Student Risk Overview (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                Student Risk Overview
              </h3>
              <span className="text-[11px] text-[#657083]">4,000 Enrolled</span>
            </div>
            <p className="text-xs text-[#8F9BAD] mb-4">
              Categorized by attendance, academic trends, coding benchmarks, and placement readiness.
            </p>

            {/* Horizontal Segmented Distribution Chart */}
            <div className="w-full h-4.5 rounded-lg overflow-hidden flex bg-[#0A0F1A] p-0.5 border border-white/[0.06] mb-4">
              <div
                style={{ width: `${lowPct}%` }}
                className="bg-[#6FCF97] h-full rounded-l-md transition-all duration-300"
                title={`Low Risk: ${lowRisk} students (${lowPct}%)`}
              />
              <div
                style={{ width: `${medPct}%` }}
                className="bg-[#F2C94C] h-full transition-all duration-300"
                title={`Medium Risk: ${medRisk} students (${medPct}%)`}
              />
              <div
                style={{ width: `${highPct}%` }}
                className="bg-[#EB5757] h-full rounded-r-md transition-all duration-300"
                title={`High Risk: ${highRisk} students (${highPct}%)`}
              />
            </div>

            {/* 3 Minimal Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Low Risk */}
              <div className="bg-[#151D2D] border border-[#6FCF97]/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#6FCF97] mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#6FCF97]" />
                  Low Risk
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#F5F7FA]">
                  {lowRisk.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">{lowPct}%</div>
              </div>

              {/* Medium Risk */}
              <div className="bg-[#151D2D] border border-[#F2C94C]/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#F2C94C] mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#F2C94C]" />
                  Medium Risk
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#F5F7FA]">
                  {medRisk.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">{medPct}%</div>
              </div>

              {/* High Risk */}
              <div className="bg-[#151D2D] border border-[#EB5757]/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#EB5757] mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#EB5757]" />
                  High Risk
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#EB5757]">
                  {highRisk.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#8F9BAD] mt-0.5">{highPct}%</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-[#8F9BAD]">
            <span>Thresholds: Low (&gt;75 Score), High (&lt;60 Score or 2+ Flags)</span>
            <button
              onClick={() => onNavigateTab('risk_intelligence')}
              className="text-[#6EA8FE] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Explore Risk Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* RIGHT: Lumora Insight Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#151D2D] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6EA8FE] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#6EA8FE]" />
                Lumora Insight
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6FCF97]/10 text-[#6FCF97] border border-[#6FCF97]/20 font-medium">
                Autonomous
              </span>
            </div>

            {/* Concise insight statement */}
            <p className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed font-normal">
              Students with low attendance and weak technical skills represent the largest intervention group.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#8F9BAD]">
                <span>Immediate intervention pool:</span>
                <span className="text-[#F2C94C] font-semibold">47 students</span>
              </div>
              <div className="flex items-center justify-between text-[#8F9BAD]">
                <span>Most affected department:</span>
                <span className="text-[#F5F7FA] font-medium">Civil Engineering (CE)</span>
              </div>
              <div className="flex items-center justify-between text-[#8F9BAD]">
                <span>Placement readiness gap:</span>
                <span className="text-[#EB5757] font-semibold">24.6% below benchmark</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
            <button
              onClick={() => onNavigateTab('skill_gap_intelligence')}
              className="flex-1 py-2 px-3 rounded-xl bg-[#1B263A] hover:bg-[#23314B] text-[#F5F7FA] text-xs font-medium border border-white/[0.06] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Skill Gaps</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8F9BAD]" />
            </button>
            {onOpenCampusAI && (
              <button
                onClick={onOpenCampusAI}
                className="py-2 px-3.5 rounded-xl bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Lumora AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 4. PRIORITY STUDENTS TABLE ================= */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F5F7FA] tracking-tight">
              Priority Students
            </h3>
            <p className="text-xs text-[#8F9BAD] mt-0.5 font-normal">
              Students requiring immediate attention
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('students')}
            className="text-xs text-[#6EA8FE] hover:text-[#8B9CFF] font-medium flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Students</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Risk</th>
                <th className="py-3 px-4 font-semibold">Success Score</th>
                <th className="py-3 px-4 font-semibold">Main Risk Factor</th>
                <th className="py-3 px-4 font-semibold">Mentor</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
              {priorityStudents.map((student) => {
                const mainRisk =
                  student.risk_factors.slice(0, 2).join(', ') ||
                  (student.coding_score < 50
                    ? 'Low Coding Score'
                    : student.attendance_percent < 75
                    ? 'Low Attendance'
                    : 'Academic & Placement');

                return (
                  <tr
                    key={student.student_id}
                    className="hover:bg-[#1B263A]/50 transition-colors group"
                  >
                    {/* Student */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F5F7FA] group-hover:text-[#6EA8FE] transition-colors">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-[#657083] font-mono">
                        {student.student_id}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-[#8F9BAD] font-medium">
                      {student.department}
                    </td>

                    {/* Risk Badge (High: Red, Medium: Yellow, Low: Green) */}
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

                    {/* Success Score */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#F5F7FA]">
                        {student.student_success_score}
                        <span className="text-[10px] text-[#657083] font-normal"> / 100</span>
                      </div>
                    </td>

                    {/* Main Risk Factor */}
                    <td className="py-3 px-4 text-xs text-[#8F9BAD] max-w-xs truncate">
                      {mainRisk}
                    </td>

                    {/* Mentor */}
                    <td className="py-3 px-4 text-xs">
                      {student.mentor_name &&
                      student.mentor_name !== 'Not Required' &&
                      student.mentor_name !== 'No mentor available' ? (
                        <span className="text-[#F5F7FA] font-medium">{student.mentor_name}</span>
                      ) : (
                        <span className="text-[#EB5757] font-medium">Unassigned</span>
                      )}
                    </td>

                    {/* Action */}
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
          <span>Showing priority cohort requiring immediate intervention</span>
          <button
            onClick={() => onNavigateTab('risk_intelligence')}
            className="text-[#6EA8FE] hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Open Risk Intelligence Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
