import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Code2,
  Cpu,
  MessageSquare,
  Lightbulb,
  Briefcase,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';
import type { DepartmentSkillGap } from '../../types';
import { studentDataService } from '../../services/dataService';

export const SkillGapIntelligencePage: React.FC = () => {
  const [skillGaps, setSkillGaps] = useState<DepartmentSkillGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaps = async () => {
      const data = await studentDataService.getDepartmentSkillGaps();
      setSkillGaps(data);
      setLoading(false);
    };
    fetchGaps();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Skill Gap Intelligence
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Institutional competency deficits across Coding, Technical Skills, Communication, Problem Solving, and Placement Readiness
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#111827] border border-white/[0.06] px-3 py-1.5 rounded-xl text-[#8F9BAD]">
            7 Departments Audited
          </span>
        </div>
      </div>

      {/* 5 Core Competency Dimension Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Coding */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-[#657083]">Coding</span>
            <Code2 className="w-4 h-4 text-[#6EA8FE]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">66.8 <span className="text-xs text-[#657083] font-normal">/100</span></div>
          <div className="text-[11px] text-[#EB5757] font-medium mt-1">21.0% Critical Gap</div>
        </div>

        {/* Technical Skills */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-[#657083]">Technical</span>
            <Cpu className="w-4 h-4 text-[#8B9CFF]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">69.4 <span className="text-xs text-[#657083] font-normal">/100</span></div>
          <div className="text-[11px] text-[#F2C94C] font-medium mt-1">16.4% Moderate Gap</div>
        </div>

        {/* Communication */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-[#657083]">Communication</span>
            <MessageSquare className="w-4 h-4 text-[#6EE7F9]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">71.2 <span className="text-xs text-[#657083] font-normal">/100</span></div>
          <div className="text-[11px] text-[#6FCF97] font-medium mt-1">11.8% Low Gap</div>
        </div>

        {/* Problem Solving */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-[#657083]">Problem Solving</span>
            <Lightbulb className="w-4 h-4 text-[#F2C94C]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">68.5 <span className="text-xs text-[#657083] font-normal">/100</span></div>
          <div className="text-[11px] text-[#F2C94C] font-medium mt-1">18.2% Moderate Gap</div>
        </div>

        {/* Placement Readiness */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 card-hover-lift shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-[#657083]">Placement</span>
            <Briefcase className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">64.1 <span className="text-xs text-[#657083] font-normal">/100</span></div>
          <div className="text-[11px] text-[#EB5757] font-medium mt-1">24.6% Critical Gap</div>
        </div>
      </div>

      {/* Department-Level Competency Summary Matrix */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F5F7FA]">
              Departmental Competency Gap Assessment
            </h3>
            <p className="text-xs text-[#8F9BAD] mt-0.5">
              Cross-departmental deficit classification based on semester evaluations and interview telemetry
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Coding Gap</th>
                <th className="py-3 px-4 font-semibold">Technical Gap</th>
                <th className="py-3 px-4 font-semibold">Communication Gap</th>
                <th className="py-3 px-4 font-semibold">Problem Solving Gap</th>
                <th className="py-3 px-4 font-semibold">Placement Gap</th>
                <th className="py-3 px-4 font-semibold text-right">Critical Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
              {skillGaps.map((item, idx) => {
                const renderGapBadge = (gap: 'Low' | 'Medium' | 'High') => {
                  if (gap === 'High') {
                    return (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20">
                        High Gap
                      </span>
                    );
                  }
                  if (gap === 'Medium') {
                    return (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/20">
                        Medium Gap
                      </span>
                    );
                  }
                  return (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#6FCF97]/10 text-[#6FCF97] border border-[#6FCF97]/20">
                      Low Gap
                    </span>
                  );
                };

                return (
                  <tr key={idx} className="hover:bg-[#1B263A]/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#F5F7FA]">
                      {item.department}
                    </td>
                    <td className="py-3.5 px-4">{renderGapBadge(item.coding_gap)}</td>
                    <td className="py-3.5 px-4">{renderGapBadge(item.technical_gap)}</td>
                    <td className="py-3.5 px-4">{renderGapBadge(item.communication_gap)}</td>
                    <td className="py-3.5 px-4">{renderGapBadge(item.problem_solving_gap)}</td>
                    <td className="py-3.5 px-4">{renderGapBadge(item.placement_gap)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#EB5757]">
                      {item.critical_students_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0A0F1A] border-t border-white/[0.06] text-xs text-[#8F9BAD] flex items-center justify-between">
          <span>Target benchmark: Average score &gt; 70.0 across all 5 dimensions</span>
          <span className="text-[#6EA8FE]">Data refreshed from current semester marks</span>
        </div>
      </div>
    </div>
  );
};
