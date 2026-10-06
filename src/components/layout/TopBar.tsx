import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  X,
  ExternalLink,
  Shield,
  UserCheck,
  ChevronDown,
  CalendarCheck,
} from 'lucide-react';
import type { Student, User, UserRole } from '../../types';

interface TopBarProps {
  title: string;
  subtitle?: string;
  currentUser: User;
  onSwitchRole: (newRole: UserRole) => void;
  onLogout: () => void;
  onSearchSelect?: (student: Student) => void;
  allStudents?: Student[];
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  currentUser,
  onSwitchRole,
  onLogout: _onLogout,
  onSearchSelect,
  allStudents = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      const match = allStudents
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.student_id.toLowerCase().includes(q.toLowerCase()) ||
            s.department.toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 8);
      setSearchResults(match);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onSearchSelect) {
      onSearchSelect(student);
    }
  };

  return (
    <header className="h-16 bg-[#090E18] border-b border-white/[0.06] px-6 flex items-center justify-between sticky top-0 z-30 select-none backdrop-blur-md">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-[#F5F7FA] leading-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-[11px] text-[#8F9BAD] font-normal leading-tight">{subtitle}</p>}
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Global Instant Search */}
        <div ref={searchRef} className="relative w-64 sm:w-80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student by name, ID, or dept..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#0A0F1A] hover:bg-[#111827] focus:bg-[#111827] border border-white/[0.08] rounded-xl focus:outline-none focus:border-[#6EA8FE]/60 transition-colors text-[#F5F7FA] placeholder-[#657083]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#657083] hover:text-[#F5F7FA] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-3 py-2 bg-[#0A0F1A] border-b border-white/[0.06] text-[10px] font-semibold text-[#8F9BAD] flex justify-between">
                <span>Matching Students ({searchResults.length})</span>
                <span>Click to open profile</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                {searchResults.map((s) => (
                  <button
                    key={s.student_id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full px-3 py-2 text-left hover:bg-[#1B263A] flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#F5F7FA] group-hover:text-[#6EA8FE] flex items-center gap-1.5">
                        {s.name}
                        <span className="text-[10px] text-[#657083] font-mono font-normal">
                          ({s.student_id})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8F9BAD]">
                        {s.department} • Success: {s.student_success_score}% • Coding: {s.coding_score}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                          s.predicted_risk_level === 'High'
                            ? 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/20'
                            : s.predicted_risk_level === 'Medium'
                            ? 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/20'
                            : 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/20'
                        }`}
                      >
                        {s.predicted_risk_level}
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#657083] group-hover:text-[#6EA8FE]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Role Switcher */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#0A0F1A] hover:bg-[#111827] border border-white/[0.08] text-xs font-medium text-[#F5F7FA] transition-colors cursor-pointer"
            title="Switch demo role"
          >
            {currentUser.role === 'dean' ? (
              <Shield className="w-3.5 h-3.5 text-[#6EA8FE]" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-[#8B9CFF]" />
            )}
            <span className="hidden md:inline font-semibold">
              {currentUser.role === 'dean' ? 'Dean Role' : 'Faculty Role'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#657083]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#111827] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#657083] uppercase tracking-wider border-b border-white/[0.06]">
                Switch Active Role
              </div>
              <button
                onClick={() => {
                  onSwitchRole('dean');
                  setShowRoleMenu(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-[#1B263A] transition-colors cursor-pointer ${
                  currentUser.role === 'dean' ? 'text-[#6EA8FE] font-bold bg-white/[0.04]' : 'text-[#8F9BAD]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#6EA8FE]" />
                <div>
                  <div className="leading-tight font-semibold">Dean (Dr. A. K. Banerjee)</div>
                  <div className="text-[10px] text-[#657083]">Full institutional oversight</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSwitchRole('faculty');
                  setShowRoleMenu(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-[#1B263A] transition-colors cursor-pointer ${
                  currentUser.role === 'faculty' ? 'text-[#8B9CFF] font-bold bg-white/[0.04]' : 'text-[#8F9BAD]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#8B9CFF]" />
                <div>
                  <div className="leading-tight font-semibold">Faculty (Dr. Rahul Sharma)</div>
                  <div className="text-[10px] text-[#657083]">Department mentor cohort</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Quick Notifications Indicator */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-[#0A0F1A] hover:bg-[#111827] border border-white/[0.08] text-[#8F9BAD] hover:text-[#F5F7FA] transition-colors relative cursor-pointer"
            title="Institutional Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#EB5757] absolute top-1.5 right-1.5 ring-2 ring-[#090E18]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#111827] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 bg-[#0A0F1A] border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5F7FA]">Institutional Signals</span>
                <span className="text-[10px] text-[#6EA8FE] font-medium">3 unread</span>
              </div>
              <div className="divide-y divide-white/[0.04] text-xs">
                <div className="p-3 hover:bg-[#1B263A] transition-colors">
                  <div className="flex items-center gap-1.5 text-[#EB5757] font-semibold text-[11px] mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EB5757]" />
                    High Risk Threshold Alert
                  </div>
                  <p className="text-[11px] text-[#8F9BAD]">
                    47 students identified requiring immediate advisor allocation.
                  </p>
                  <span className="text-[9px] text-[#657083] mt-1 block">12 minutes ago</span>
                </div>
                <div className="p-3 hover:bg-[#1B263A] transition-colors">
                  <div className="flex items-center gap-1.5 text-[#F2C94C] font-semibold text-[11px] mb-0.5">
                    <CalendarCheck className="w-3 h-3 text-[#F2C94C]" />
                    Mock Interview Slots
                  </div>
                  <p className="text-[11px] text-[#8F9BAD]">
                    3 final-year placement interviews pending mentor confirmation.
                  </p>
                  <span className="text-[9px] text-[#657083] mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
