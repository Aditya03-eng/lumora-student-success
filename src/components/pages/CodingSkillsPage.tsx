import React, { useState, useEffect } from 'react';
import {
  Code,
  Cpu,
  Brain,
  MessageSquare,
  AlertTriangle,
  ArrowUpDown,
  Search,
  Eye,
  UserCheck,
  CalendarCheck,
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
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import type {
  CodingSkillsKPIs,
  DepartmentCodingScore,
  CodingDistributionBucket,
  Student,
} from '../../types';
import { studentDataService } from '../../services/dataService';
import { RiskBadge } from '../common/Badge';

interface CodingSkillsPageProps {
  onSelectStudent: (student: Student) => void;
  onAssignInterview?: (student: Student) => void;
}

export const CodingSkillsPage: React.FC<CodingSkillsPageProps> = ({
  onSelectStudent,
  onAssignInterview,
}) => {
  const [kpis, setKpis] = useState<CodingSkillsKPIs>({
    avg_coding_score: 66.8,
    avg_technical_skill: 72.8,
    avg_problem_solving: 71.2,
    avg_communication_skill: 68.4,
    students_below_50: 840,
    percentage_below_50: 21.0,
  });

  const [deptScores, setDeptScores] = useState<DepartmentCodingScore[]>([]);
  const [distribution, setDistribution] = useState<CodingDistributionBucket[]>([]);
  const [supportStudents, setSupportStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [k, d, dist, support] = await Promise.all([
      studentDataService.getCodingSkillsKPIs(),
      studentDataService.getDepartmentCodingScores(),
      studentDataService.getCodingDistribution(),
      studentDataService.getStudentsNeedingCodingSupport(100),
    ]);
    setKpis(k);
    setDeptScores(d);
    setDistribution(dist);
    setSupportStudents(support);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, []);

  const filteredStudents = supportStudents.filter((s) => {
    const matchSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === 'all' || s.department === selectedDept;
    return matchSearch && matchDept;
  });

  const departments = ['CSE', 'AI & DS', 'BCA', 'ECE', 'Mechanical', 'BBA', 'Civil'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#262E3D]">
        <div>
          <h2 className="text-lg font-bold text-[#F1F3F5] tracking-tight flex items-center gap-2">
            <Code className="w-5 h-5 text-[#6EA8FE]" />
            Coding & Technical Skills Analytics
          </h2>
          <p className="text-xs text-[#AAB2C0] mt-0.5">
            Institutional coding proficiency benchmarks, departmental skill distributions, and targeted remedial tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#2E1A1D] text-[#EB5757] border border-[#5A242B] px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {kpis.students_below_50.toLocaleString()} Students Below 50.0 ({kpis.percentage_below_50}%)
          </span>
        </div>
      </div>

      {/* Top 4 KPI Metrics + Critical Alert */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* KPI 1: Average Coding Score */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Coding Score</span>
            <Code className="w-4 h-4 text-[#6EA8FE]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] tracking-tight flex items-baseline gap-1">
            {kpis.avg_coding_score}
            <span className="text-xs font-normal text-[#AAB2C0]">/100</span>
          </div>
          <div className="text-[10px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
            Target threshold: 65.0
          </div>
        </div>

        {/* KPI 2: Average Technical Skill */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Technical Skill</span>
            <Cpu className="w-4 h-4 text-[#8B9CFF]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] tracking-tight flex items-baseline gap-1">
            {kpis.avg_technical_skill}
            <span className="text-xs font-normal text-[#AAB2C0]">/100</span>
          </div>
          <div className="text-[10px] text-[#6FCF97] mt-1 pt-1.5 border-t border-[#262E3D] font-medium">
            Solid lab foundation
          </div>
        </div>

        {/* KPI 3: Average Problem Solving */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Problem Solving</span>
            <Brain className="w-4 h-4 text-[#F2C94C]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] tracking-tight flex items-baseline gap-1">
            {kpis.avg_problem_solving}
            <span className="text-xs font-normal text-[#AAB2C0]">/100</span>
          </div>
          <div className="text-[10px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
            Algorithmic reasoning
          </div>
        </div>

        {/* KPI 4: Average Communication Skill */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Communication Skill</span>
            <MessageSquare className="w-4 h-4 text-[#6FCF97]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] tracking-tight flex items-baseline gap-1">
            {kpis.avg_communication_skill}
            <span className="text-xs font-normal text-[#AAB2C0]">/100</span>
          </div>
          <div className="text-[10px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
            Technical articulation
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Coding Score by Department */}
        <div className="lg:col-span-7 bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-[#F1F3F5] uppercase tracking-wider">
                Coding Score by Department
              </h3>
              <p className="text-[11px] text-[#AAB2C0]">
                Identifying departments requiring remedial coding intervention
              </p>
            </div>
            <span className="text-[10px] bg-[#182338] text-[#6EA8FE] px-2 py-0.5 rounded border border-[#253A5E]">
              Benchmark: 65.0
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptScores}
                margin={{ top: 15, right: 15, left: -20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#222936" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10, fill: '#AAB2C0' }}
                  axisLine={{ stroke: '#262E3D' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 80]}
                  tick={{ fontSize: 10, fill: '#AAB2C0' }}
                  axisLine={{ stroke: '#262E3D' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}/100`, 'Avg Coding Score']}
                  contentStyle={{
                    backgroundColor: '#222936',
                    borderRadius: '8px',
                    border: '1px solid #262E3D',
                    color: '#F1F3F5',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine
                  y={65}
                  stroke="#F2C94C"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Min 65.0',
                    fill: '#F2C94C',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />
                <Bar
                  dataKey="avg_coding_score"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                >
                  {deptScores.map((entry, index) => (
                    <Cell
                      key={`dept-bar-${index}`}
                      fill={entry.avg_coding_score < 66.5 ? '#EB5757' : '#6EA8FE'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#AAB2C0] pt-2 border-t border-[#262E3D]">
            <span>Highest: AI & DS (67.4) & CSE (67.2)</span>
            <span className="text-[#EB5757]">Lowest: Civil (65.9) & Mechanical (66.1)</span>
          </div>
        </div>

        {/* Chart 2: Coding Score Distribution */}
        <div className="lg:col-span-5 bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-[#F1F3F5] uppercase tracking-wider">
                Coding Score Distribution
              </h3>
              <p className="text-[11px] text-[#AAB2C0]">Campus-wide score stratification</p>
            </div>
            <span className="text-[10px] text-[#AAB2C0] bg-[#151923] px-2 py-0.5 rounded border border-[#262E3D]">
              4,000 Cohort
            </span>
          </div>

          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`dist-${index}`} fill={entry.color} stroke="#1B202B" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${Number(val).toLocaleString()} students (${item.payload.percentage}%)`,
                    item.payload.range,
                  ]}
                  contentStyle={{
                    backgroundColor: '#222936',
                    borderRadius: '8px',
                    border: '1px solid #262E3D',
                    color: '#F1F3F5',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262E3D] text-[11px]">
            {distribution.map((d) => (
              <div key={d.range} className="p-1.5 rounded bg-[#151923] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#AAB2C0] truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  {d.range}
                </span>
                <span className="font-bold text-[#F1F3F5] shrink-0">
                  {d.count} ({d.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Technical Skill vs Coding Score by Department */}
        <div className="lg:col-span-12 bg-[#1B202B] border border-[#262E3D] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-[#F1F3F5] uppercase tracking-wider">
                Technical Skill vs Coding Score by Department
              </h3>
              <p className="text-[11px] text-[#AAB2C0]">
                Comparing practical lab proficiency against core programming assessment scores
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptScores}
                margin={{ top: 15, right: 15, left: -20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#222936" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 10, fill: '#AAB2C0' }}
                  axisLine={{ stroke: '#262E3D' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 85]}
                  tick={{ fontSize: 10, fill: '#AAB2C0' }}
                  axisLine={{ stroke: '#262E3D' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#222936',
                    borderRadius: '8px',
                    border: '1px solid #262E3D',
                    color: '#F1F3F5',
                    fontSize: '11px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#AAB2C0', paddingTop: '8px' }}
                  iconSize={8}
                />
                <Bar
                  dataKey="avg_coding_score"
                  name="Coding Score"
                  fill="#6EA8FE"
                  radius={[3, 3, 0, 0]}
                  barSize={16}
                />
                <Bar
                  dataKey="avg_technical_skill"
                  name="Technical Skill"
                  fill="#8B9CFF"
                  radius={[3, 3, 0, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table: Students Needing Coding Support */}
      <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-[#F1F3F5] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#EB5757]" />
              Students Needing Coding Support
            </h3>
            <p className="text-[11px] text-[#AAB2C0]">
              Students flagged with critical coding deficit (&lt; 55.0) prioritizing placement intervention
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-[#7A8499] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-[#151923] border border-[#262E3D] rounded text-[#F1F3F5] placeholder-[#7A8499] focus:outline-none focus:border-[#6EA8FE]"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="py-1 px-2.5 text-xs bg-[#151923] border border-[#262E3D] rounded text-[#F1F3F5] focus:outline-none focus:border-[#6EA8FE]"
            >
              <option value="all">All Depts</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151923] text-[#AAB2C0] uppercase font-bold text-[10px] tracking-wider border-y border-[#262E3D]">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Coding Score</th>
                <th className="py-2.5 px-3">Technical Skill</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Assigned Mentor</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262E3D]">
              {filteredStudents.slice(0, 25).map((s) => (
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
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] border ${
                        s.coding_score < 40
                          ? 'bg-[#2E1A1D] text-[#EB5757] border-[#5A242B]'
                          : 'bg-[#2B2616] text-[#F2C94C] border-[#4E3F1F]'
                      }`}
                    >
                      {s.coding_score}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#F1F3F5]">
                    {s.technical_skill}/100
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskBadge level={s.predicted_risk_level} size="xs" />
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
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onAssignInterview && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignInterview(s);
                          }}
                          className="px-2 py-1 rounded bg-[#182338] hover:bg-[#253A5E] text-[#6EA8FE] font-medium text-xs border border-[#253A5E] transition-colors inline-flex items-center gap-1"
                          title="Assign Mock Interview"
                        >
                          <CalendarCheck className="w-3 h-3" />
                          <span className="hidden sm:inline">Assign Mock</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStudent(s);
                        }}
                        className="px-2.5 py-1 rounded bg-[#222936] hover:bg-[#2B3344] text-[#F1F3F5] font-medium text-xs transition-colors border border-[#262E3D] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-[#AAB2C0]" />
                        Profile
                      </button>
                    </div>
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
