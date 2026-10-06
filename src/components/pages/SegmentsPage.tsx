import React, { useState, useEffect } from 'react';
import {
  Users,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { SegmentStats, Student } from '../../types';
import { studentDataService } from '../../services/dataService';
import { RiskBadge } from '../common/Badge';

interface SegmentsPageProps {
  onSelectStudent: (student: Student) => void;
}

export const SegmentsPage: React.FC<SegmentsPageProps> = ({ onSelectStudent }) => {
  const [segments, setSegments] = useState<SegmentStats[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('High Performers');
  const [segmentStudents, setSegmentStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const loadSegments = async () => {
      const data = await studentDataService.getSegmentDistribution();
      setSegments(data);
    };
    loadSegments();
  }, []);

  useEffect(() => {
    const loadCohortStudents = async () => {
      setLoadingStudents(true);
      const res = await studentDataService.getStudents({
        segment: selectedSegment,
        pageSize: 15,
        page: 1,
      });
      setSegmentStudents(res.data);
      setLoadingStudents(false);
    };
    if (selectedSegment) {
      loadCohortStudents();
    }
  }, [selectedSegment]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Student Cohort Segmentation Analysis
        </h2>
        <p className="text-xs text-slate-500">
          Clustering based on academic mastery, skill acquisition, placement preparedness, and campus engagement
        </p>
      </div>

      {/* Four Main Segment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {segments.map((seg) => {
          const isSelected = selectedSegment === seg.segment_name;
          return (
            <div
              key={seg.segment_name}
              onClick={() => setSelectedSegment(seg.segment_name)}
              className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all relative overflow-hidden group ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: seg.color }}
              />

              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {seg.segment_name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
              </div>

              {/* Student Count & % */}
              <div className="flex items-baseline gap-2 mb-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {seg.student_count.toLocaleString()}
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  ({seg.percentage}% of campus)
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed mb-4 min-h-[32px]">
                {seg.description}
              </p>

              {/* 4 Required Metric Scores */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Avg Success Score</span>
                  <span className="font-bold text-slate-900">{seg.avg_success_score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Avg Academic Score</span>
                  <span className="font-bold text-blue-700">{seg.avg_academic_score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Avg Placement Score</span>
                  <span className="font-bold text-purple-700">{seg.avg_placement_score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Avg Engagement Score</span>
                  <span className="font-bold text-teal-700">{seg.avg_engagement_score}</span>
                </div>
              </div>

              <div
                className={`mt-4 pt-2 text-[11px] font-bold flex items-center justify-between transition-colors ${
                  isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                <span>{isSelected ? 'Currently Viewing' : 'Select Cohort'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Dimensional Comparison Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cross-Cohort Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Side-by-side performance across Success, Academic, Placement, and Engagement metrics
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={segments} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="segment_name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any, name: any) => [`${val}/100`, name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={8} />
              <Bar dataKey="avg_success_score" name="Success Score" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_academic_score" name="Academic Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_placement_score" name="Placement Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_engagement_score" name="Engagement Score" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Student Sample Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Students in "{selectedSegment}"
            </h3>
            <p className="text-xs text-slate-500">
              Sample cohort members. Click any student to review full diagnostic profile.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Cohort Size: {segments.find((s) => s.segment_name === selectedSegment)?.student_count.toLocaleString() || 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Success Score</th>
                <th className="py-3 px-3">Academic</th>
                <th className="py-3 px-3">Placement</th>
                <th className="py-3 px-3">Engagement</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingStudents ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading cohort members...
                  </td>
                </tr>
              ) : segmentStudents.map((s) => (
                <tr
                  key={s.student_id}
                  onClick={() => onSelectStudent(s)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{s.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono font-normal">
                      {s.student_id}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{s.department}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {s.student_success_score}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{s.academic_score}%</td>
                  <td className="py-3 px-3 text-slate-700">{s.placement_score}%</td>
                  <td className="py-3 px-3 text-slate-700">{s.engagement_score}%</td>
                  <td className="py-3 px-3">
                    <RiskBadge level={s.predicted_risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent(s);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs"
                    >
                      View Profile
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
