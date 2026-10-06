import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  Info,
} from 'lucide-react';
import type { User, UserRole } from '../../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('dean');
  const [email, setEmail] = useState('dean@lumora.edu');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const deanUser: User = {
    id: 'USR-DEAN-01',
    name: 'Dr. A. K. Banerjee',
    email: 'dean@lumora.edu',
    role: 'dean',
    title: 'Dean of Academic Affairs',
    department: 'University Administration',
    avatarInitials: 'AB',
  };

  const facultyUser: User = {
    id: 'USR-FAC-01',
    name: 'Dr. Rahul Sharma',
    email: 'rahul.sharma@lumora.edu',
    role: 'faculty',
    title: 'Associate Professor & Mentor Coordinator',
    department: 'Computer Science & Engineering (CSE)',
    avatarInitials: 'RS',
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'dean') {
      setEmail('dean@lumora.edu');
    } else {
      setEmail('rahul.sharma@lumora.edu');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'dean') {
      onLogin(deanUser);
    } else {
      onLogin(facultyUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F5F7FA] flex flex-col justify-center items-center p-4 selection:bg-[#6EA8FE]/30 relative overflow-hidden">
      {/* Background subtle geometry */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#6EA8FE]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#8B9CFF]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* University Header / Official Lumora Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black/40 border border-white/[0.08] shadow-2xl mb-3.5 p-1.5 overflow-hidden">
            <img
              src="/lumora-logo.png"
              alt="Lumora Official Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F7FA]">
            Lumora
          </h1>
          <p className="text-xs text-[#8F9BAD] mt-1 font-medium tracking-wide">
            Student Success Intelligence
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/80">
          {/* Quick Role Selection Tabs */}
          <div className="mb-5">
            <label className="text-[11px] font-bold text-[#657083] uppercase tracking-wider block mb-2">
              Select Institutional Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#0A0F1A] p-1 rounded-xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => handleRoleSelect('dean')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'dean'
                    ? 'bg-[#151D2D] text-[#6EA8FE] border border-[#6EA8FE]/30 shadow-xs'
                    : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Dean / Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('faculty')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'faculty'
                    ? 'bg-[#151D2D] text-[#8B9CFF] border border-[#8B9CFF]/30 shadow-xs'
                    : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Faculty / Mentor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8F9BAD] mb-1.5">
                University Email or User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#657083]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60 transition-colors"
                  placeholder="name@lumora.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-[#8F9BAD]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(true)}
                  className="text-[11px] text-[#6EA8FE] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#657083]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {showForgotNotice && (
              <div className="p-2.5 rounded-lg bg-[#151D2D] border border-white/[0.06] text-[11px] text-[#8F9BAD] flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#6EA8FE] shrink-0 mt-0.5" />
                <span>
                  Demo Mode: Local credentials are preloaded. Click &ldquo;Sign In to Lumora&rdquo; to proceed.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-[#8F9BAD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#0A0F1A] border-white/[0.08] text-[#6EA8FE] focus:ring-0 w-3.5 h-3.5"
                />
                <span>Remember institutional session</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Lumora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Switcher Footer */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-[11px] text-[#657083]">
              Active Role:{' '}
              <span className="text-[#6EA8FE] font-semibold">
                {role === 'dean' ? 'Executive Dean (Institutional Oversight)' : 'CSE Faculty (Student Cohort)'}
              </span>
            </p>
          </div>
        </div>

        {/* Security & Confidentiality Tag */}
        <p className="text-center text-[10px] text-[#657083] mt-5">
          Protected Institutional Access • Lumora Student Success Intelligence System
        </p>
      </div>
    </div>
  );
};
