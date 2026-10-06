import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { Student } from '../../types';
import { studentDataService } from '../../services/dataService';

interface RiskAnalysisPageProps {
  onSelectStudent: (student: Student) => void;
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({ onSelectStudent }) => {
  const [data, setData] = useState<{
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    academicRiskDistribution: Array<{ range: string; count: number; percentage: number }>;
    placementRiskDistribution: Array<{ range: string; count: number; percentage: number }>;
    highRiskStudents: Student[];
  } | null>(null);

  const [selectedDept, setSelectedDept] = useState('all');

  const loadData = async () => {
    const res = await studentDataService.getRiskAnalysis();
    setData(res);
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, []);

  if (!data) return null;

  const total = data.highRiskCount + data.mediumRiskCount + data.lowRiskCount;

  const filteredHighRiskStudents =
    selectedDept === 'all'
      ? data.highRiskStudents
      : data.highRiskStudents.filter((s) => s.department === selectedDept);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Campus Risk Diagnostics & Early Warning
        </h2>
        <p className="text-xs text-slate-500">
          Machine-learning predictive risk analysis modeling academic vulnerability and placement disqualification probability
        </p>
      </div>

      {/* Top 3 Risk KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5">
        {/* High Risk Card */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              High Risk Students
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-700 tracking-tight">
            {data.highRiskCount.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs text-rose-600 mt-2 pt-2 border-t border-rose-200/60 font-medium">
            <span>{((data.highRiskCount / total) * 100).toFixed(1)}% of total cohort</span>
            <span>Immediate Action Required</span>
          </div>
        </div>

        {/* Medium Risk Card */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Medium Risk Students
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 tracking-tight">
            {data.mediumRiskCount.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs text-amber-600 mt-2 pt-2 border-t border-amber-200/60 font-medium">
            <span>{((data.mediumRiskCount / total) * 100).toFixed(1)}% of total cohort</span>
            <span>Monitoring Recommended</span>
          </div>
        </div>

        {/* Low Risk Card */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Low Risk Students
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 tracking-tight">
            {data.lowRiskCount.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-600 mt-2 pt-2 border-t border-emerald-200/60 font-medium">
            <span>{((data.lowRiskCount / total) * 100).toFixed(1)}% of total cohort</span>
            <span>Stable Academic Standing</span>
          </div>
        </div>
      </div>

      {/* Two Risk Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Risk Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Risk Probability Curve</h3>
              <p className="text-xs text-slate-500">Distribution across 5 probability brackets</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
              Academic Model
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.academicRiskDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} students`, 'Student Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Students" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-5 gap-1 text-center text-xs">
            {data.academicRiskDistribution.map((b) => (
              <div key={b.range}>
                <span className="text-[10px] text-slate-400 block">{b.range}</span>
                <span className="font-bold text-slate-800">{b.count}</span>
                <span className="text-[10px] text-slate-500 block">({b.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placement Risk Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Placement Risk Probability Curve</h3>
              <p className="text-xs text-slate-500">Distribution across 5 probability brackets</p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
              Placement Model
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.placementRiskDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} students`, 'Student Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Students" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-5 gap-1 text-center text-xs">
            {data.placementRiskDistribution.map((b) => (
              <div key={b.range}>
                <span className="text-[10px] text-slate-400 block">{b.range}</span>
                <span className="font-bold text-slate-800">{b.count}</span>
                <span className="text-[10px] text-slate-500 block">({b.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-Risk Students Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              High-Risk Student Priority Registry
            </h3>
            <p className="text-xs text-slate-500">
              Students classified with High Predicted Risk needing immediate academic advising
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Departments ({data.highRiskStudents.length})</option>
              {['CSE', 'AI & DS', 'BCA', 'ECE', 'Mechanical', 'BBA', 'Civil'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Success Score</th>
                <th className="py-3 px-3">Academic Risk %</th>
                <th className="py-3 px-3">Placement Risk %</th>
                <th className="py-3 px-4">Main Risk Factor</th>
                <th className="py-3 px-4">Assigned Mentor</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHighRiskStudents.slice(0, 25).map((s) => (
                <tr
                  key={s.student_id}
                  onClick={() => onSelectStudent(s)}
                  className="hover:bg-rose-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-rose-700">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {s.student_id} • {s.city}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {s.department}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {s.student_success_score}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">
                        {s.academic_risk_probability}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-rose-700">
                        {s.placement_risk_probability}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded block truncate">
                      {s.main_risk_factor}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {s.mentor_name &&
                    s.mentor_name !== 'Not Required' &&
                    s.mentor_name !== 'No mentor available' ? (
                      <span className="text-slate-800 font-medium flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {s.mentor_name}
                      </span>
                    ) : (
                      <span className="text-rose-700 bg-rose-50 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        Action Required
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent(s);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                    >
                      Intervene
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
