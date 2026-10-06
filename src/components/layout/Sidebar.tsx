import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  BarChart3,
  Sparkles,
  Code2,
  CalendarCheck,
  UserCheck,
  Award,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Calendar,
  Trophy,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { NavItem, User } from '../../types';

interface SidebarProps {
  activeTab: NavItem;
  onSelectTab: (tab: NavItem, subTab?: string) => void;
  currentUser: User;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  highRiskCount?: number;
  totalStudents?: number;
  pendingInterviewsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenHelp,
  highRiskCount = 1127,
  totalStudents = 4000,
  pendingInterviewsCount = 3,
}) => {
  const isDean = currentUser.role === 'dean';
  const [campusExpanded, setCampusExpanded] = useState(true);

  return (
    <aside className="w-[260px] bg-[#0A0F1A] border-r border-white/[0.06] flex flex-col shrink-0 min-h-screen text-[#F5F7FA] select-none sticky top-0 h-screen z-30 transition-all duration-200">
      {/* Brand Header with OFFICIAL LUMORA LOGO */}
      <div className="p-4.5 border-b border-white/[0.06] flex items-center space-x-3.5 bg-[#090E18]">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-black/40 border border-white/[0.08] shadow-md">
          <img
            src="/lumora-logo.png"
            alt="Lumora Official Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#F5F7FA] tracking-tight">Lumora</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-white/[0.06] text-[#6EA8FE] border border-white/[0.08]">
              {isDean ? 'DEAN' : 'FACULTY'}
            </span>
          </div>
          <p className="text-[11px] text-[#8F9BAD] truncate font-normal leading-tight">
            Student Success Intelligence
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3.5 space-y-5 overflow-y-auto overflow-x-hidden text-xs">
        {/* SECTION: OVERVIEW */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-[#657083] uppercase tracking-wider">
            Overview
          </div>
          <button
            onClick={() => onSelectTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <LayoutDashboard
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'overview' ? 'text-[#6EA8FE]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">Overview</span>
            </div>
          </button>
        </div>

        {/* SECTION: STUDENT INTELLIGENCE */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-[#657083] uppercase tracking-wider">
            Student Intelligence
          </div>

          {/* Students */}
          <button
            onClick={() => onSelectTab('students')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Users
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'students' ? 'text-[#6EA8FE]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">{isDean ? 'Students' : 'My Students'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#8F9BAD] border border-white/[0.06] font-mono">
              {totalStudents.toLocaleString()}
            </span>
          </button>

          {/* Risk Intelligence */}
          <button
            onClick={() => onSelectTab('risk_intelligence')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'risk_intelligence'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <ShieldAlert
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'risk_intelligence' ? 'text-[#EB5757]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">Risk Intelligence</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EB5757]/10 text-[#EB5757] border border-[#EB5757]/20 font-mono">
              {highRiskCount}
            </span>
          </button>

          {/* Skill Gap Intelligence */}
          <button
            onClick={() => onSelectTab('skill_gap_intelligence')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'skill_gap_intelligence'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <BarChart3
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'skill_gap_intelligence' ? 'text-[#6EE7F9]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">Skill Gap Intelligence</span>
            </div>
          </button>

          {/* High Potential */}
          <button
            onClick={() => onSelectTab('high_potential')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'high_potential'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Sparkles
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'high_potential' ? 'text-[#A78BFA]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">High Potential</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20 font-mono">
              Cohort
            </span>
          </button>
        </div>

        {/* SECTION: STUDENT DEVELOPMENT */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-[#657083] uppercase tracking-wider">
            Student Development
          </div>

          {/* Skills & Assessments */}
          <button
            onClick={() => onSelectTab('skills_assessments')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'skills_assessments'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Code2
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'skills_assessments' ? 'text-[#6EA8FE]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">Skills & Assessments</span>
            </div>
          </button>

          {/* Mock Interviews */}
          <button
            onClick={() => onSelectTab('mock_interviews')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'mock_interviews'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <CalendarCheck
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'mock_interviews' ? 'text-[#F2C94C]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">Mock Interviews</span>
            </div>
            {pendingInterviewsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/20 font-mono">
                {pendingInterviewsCount}
              </span>
            )}
          </button>

          {/* Mentors */}
          <button
            onClick={() => onSelectTab('mentors')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'mentors'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <UserCheck
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'mentors' ? 'text-[#6FCF97]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">Mentors</span>
            </div>
          </button>
        </div>

        {/* SECTION: CAMPUS */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-[#657083] uppercase tracking-wider">
            Campus
          </div>

          {/* Campus Activities (with Events, Hackathons, Certificates sub-items) */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectTab('campus_activities');
                setCampusExpanded((prev) => !prev);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'campus_activities'
                  ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                  : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Award
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    activeTab === 'campus_activities' ? 'text-[#8B9CFF]' : 'text-[#657083]'
                  }`}
                />
                <span className="truncate">Campus Activities</span>
              </div>
              {campusExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#657083]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#657083]" />
              )}
            </button>

            {/* Sub-items: Events, Hackathons, Certificates */}
            {campusExpanded && (
              <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-white/[0.04] ml-4">
                <button
                  onClick={() => onSelectTab('campus_activities', 'events')}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11px] text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#657083]" />
                  <span>Events</span>
                </button>
                <button
                  onClick={() => onSelectTab('campus_activities', 'hackathons')}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11px] text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#657083]" />
                  <span>Hackathons</span>
                </button>
                <button
                  onClick={() => onSelectTab('campus_activities', 'certificates')}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11px] text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-[#657083]" />
                  <span>Certificates</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback */}
          <button
            onClick={() => onSelectTab('feedback')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-gradient-to-r from-[#6EA8FE]/15 to-[#8B9CFF]/10 text-white font-semibold border border-[#6EA8FE]/25 shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <MessageSquare
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeTab === 'feedback' ? 'text-[#6EA8FE]' : 'text-[#657083]'
                }`}
              />
              <span className="truncate">Feedback</span>
            </div>
          </button>
        </div>

        {/* SECTION: SYSTEM */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-bold text-[#657083] uppercase tracking-wider">
            System
          </div>

          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              else onSelectTab('settings');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Settings className="w-4 h-4 text-[#657083]" />
              <span className="truncate">Settings</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (onOpenHelp) onOpenHelp();
              else onSelectTab('help_support');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <HelpCircle className="w-4 h-4 text-[#657083]" />
              <span className="truncate">Help & Support</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Footer Profile & Sign Out Controls */}
      <div className="p-3 border-t border-white/[0.06] bg-[#090E18]">
        <div className="p-2.5 rounded-xl bg-[#111827] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isDean
                  ? 'bg-[#6EA8FE]/15 text-[#6EA8FE] border border-[#6EA8FE]/30'
                  : 'bg-[#8B9CFF]/15 text-[#8B9CFF] border border-[#8B9CFF]/30'
              }`}
            >
              {currentUser.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#F5F7FA] truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-[#8F9BAD] truncate mt-0.5">
                {isDean ? 'Dean • Administrator' : 'Faculty • Mentor'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[#8F9BAD] hover:text-[#EB5757] hover:bg-[#EB5757]/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
