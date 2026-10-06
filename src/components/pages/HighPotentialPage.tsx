import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Search,
  Filter,
  ExternalLink,
  Code2,
  Users,
  Briefcase,
  Star,
  CheckCircle,
} from 'lucide-react';
import type { Student, HighPotentialStudent, PotentialArea } from '../../types';
import { studentDataService } from '../../services/dataService';

interface HighPotentialPageProps {
  onSelectStudent: (student: Student) => void;
}

export const HighPotentialPage: React.FC<HighPotentialPageProps> = ({
  onSelectStudent,
}) => {
  const [highPotential, setHighPotential] = useState<HighPotentialStudent[]>([]);
  const [selectedPotentialArea, setSelectedPotentialArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPotential = async () => {
      const data = await studentDataService.getHighPotentialStudents(60);
      setHighPotential(data);
      setLoading(false);
    };
    fetchPotential();
  }, []);

  const potentialAreas: PotentialArea[] = [
    'Academic Excellence',
    'Technical Excellence',
    'Leadership',
    'Placement Readiness',
    'Engagement',
  ];

  const filtered = highPotential.filter((hp) => {
    if (selectedPotentialArea !== 'all' && hp.potential_area !== selectedPotentialArea) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        hp.student.name.toLowerCase().includes(q) ||
        hp.student.student_id.toLowerCase().includes(q) ||
        hp.student.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getAreaColorBadge = (area: PotentialArea) => {
    switch (area) {
      case 'Technical Excellence':
        return 'bg-[#6EA8FE]/10 text-[#6EA8FE] border-[#6EA8FE]/25';
      case 'Leadership':
        return 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/25';
      case 'Placement Readiness':
        return 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/25';
      case 'Academic Excellence':
        return 'bg-[#8B9CFF]/10 text-[#8B9CFF] border-[#8B9CFF]/25';
      case 'Engagement':
      default:
        return 'bg-[#6EE7F9]/10 text-[#6EE7F9] border-[#6EE7F9]/25';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            <span>High Potential Talent Roster</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/25 font-medium">
              Decision-Oriented Cohort
            </span>
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Exceptional achievers qualified for Hackathon Team Leadership, Placement Ambassadorship, and Peer Mentoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-[#111827] border border-white/[0.06] px-3 py-1.5 rounded-xl text-[#8F9BAD]">
            {highPotential.length} High Potential Scholars Identified
          </span>
        </div>
      </div>

      {/* 5 Potential Area Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedPotentialArea('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedPotentialArea === 'all'
              ? 'bg-[#6EA8FE] text-[#070B14] font-bold shadow-xs'
              : 'bg-[#111827] text-[#8F9BAD] hover:text-[#F5F7FA] border border-white/[0.06]'
          }`}
        >
          All High Potential ({highPotential.length})
        </button>
        {potentialAreas.map((area) => {
          const count = highPotential.filter((h) => h.potential_area === area).length;
          return (
            <button
              key={area}
              onClick={() => setSelectedPotentialArea(area)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedPotentialArea === area
                  ? 'bg-[#6EA8FE] text-[#070B14] font-bold shadow-xs'
                  : 'bg-[#111827] text-[#8F9BAD] hover:text-[#F5F7FA] border border-white/[0.06]'
              }`}
            >
              {area} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search high potential student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60"
          />
        </div>
        <span className="text-xs text-[#8F9BAD]">
          Showing <strong className="text-[#F5F7FA]">{filtered.length}</strong> qualified candidates
        </span>
      </div>

      {/* High Potential Decision Table */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Success Score</th>
                <th className="py-3 px-4 font-semibold">Coding Score</th>
                <th className="py-3 px-4 font-semibold">Placement Score</th>
                <th className="py-3 px-4 font-semibold">Segment</th>
                <th className="py-3 px-4 font-semibold">Potential Area</th>
                <th className="py-3 px-4 font-semibold">Recommended Deployment</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
              {filtered.map((hp) => (
                <tr
                  key={hp.student.student_id}
                  className="hover:bg-[#1B263A]/50 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#F5F7FA] group-hover:text-[#6EA8FE]">
                      {hp.student.name}
                    </div>
                    <div className="text-[11px] text-[#657083] font-mono">
                      {hp.student.student_id}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#8F9BAD]">
                    {hp.student.department}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#6FCF97]">
                    {hp.student.student_success_score}
                    <span className="text-[10px] text-[#657083] font-normal"> / 100</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#6EA8FE]">
                    {hp.student.coding_score}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#A78BFA]">
                    {hp.student.placement_readiness}
                  </td>
                  <td className="py-3.5 px-4 text-[#8F9BAD]">
                    {hp.student.segment_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border inline-flex items-center gap-1 ${getAreaColorBadge(
                        hp.potential_area
                      )}`}
                    >
                      <Star className="w-2.5 h-2.5" />
                      {hp.potential_area}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#8F9BAD] max-w-xs truncate">
                    <span className="text-[#F5F7FA] font-medium">{hp.recommended_role}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectStudent(hp.student)}
                      className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#6EA8FE] text-[#6EA8FE] hover:text-[#070B14] font-semibold text-xs border border-white/[0.08] hover:border-[#6EA8FE] transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Deploy</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0A0F1A] border-t border-white/[0.06] text-xs text-[#8F9BAD] flex items-center justify-between">
          <span>Ready for institutional honors & scholarship recommendation</span>
          <span>Automatic criteria: Score &ge; 78 or Coding &ge; 85</span>
        </div>
      </div>
    </div>
  );
};
