import React, { useState } from 'react';
import {
  X,
  Settings,
  Database,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Shield,
  Server,
} from 'lucide-react';
import { CONFIG } from '../../services/dataService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  if (!isOpen) return null;

  const [minAttendance, setMinAttendance] = useState(75);
  const [minPassingScore, setMinPassingScore] = useState(60);
  const [minCodingScore, setMinCodingScore] = useState(50);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm('Reset all local mock modifications (interviews, feedback, interventions) to default initial state?')) {
      localStorage.removeItem('sc_interventions');
      localStorage.removeItem('sc_assigned_mentors');
      localStorage.removeItem('sc_mock_interviews_v2');
      localStorage.removeItem('sc_feedbacks_v2');
      localStorage.removeItem('sc_certificates_v2');
      if (onResetData) onResetData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.08] rounded-2xl shadow-2xl max-w-lg w-full p-6 text-[#F5F7FA] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
          <h3 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#6EA8FE]" />
            Institutional Analytics Settings
          </h3>
          <button
            onClick={onClose}
            className="text-[#8F9BAD] hover:text-[#F5F7FA] p-1.5 rounded-lg hover:bg-white/[0.04] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {savedToast && (
          <div className="mb-4 p-3 bg-[#6FCF97]/10 border border-[#6FCF97]/25 text-[#6FCF97] rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Institutional threshold parameters updated!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Threshold Configurations */}
          <div className="bg-[#0A0F1A] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#657083] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#6EA8FE]" />
              Risk Threshold Parameters
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#8F9BAD] block mb-1">
                  Min Attendance %
                </label>
                <input
                  type="number"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(Number(e.target.value))}
                  className="w-full py-1.5 px-2 bg-[#111827] border border-white/[0.08] rounded-lg text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8F9BAD] block mb-1">
                  Min Academic Score
                </label>
                <input
                  type="number"
                  value={minPassingScore}
                  onChange={(e) => setMinPassingScore(Number(e.target.value))}
                  className="w-full py-1.5 px-2 bg-[#111827] border border-white/[0.08] rounded-lg text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8F9BAD] block mb-1">
                  Min Coding Score
                </label>
                <input
                  type="number"
                  value={minCodingScore}
                  onChange={(e) => setMinCodingScore(Number(e.target.value))}
                  className="w-full py-1.5 px-2 bg-[#111827] border border-white/[0.08] rounded-lg text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                />
              </div>
            </div>
          </div>

          {/* Dataset Status */}
          <div className="bg-[#0A0F1A] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#657083] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#8B9CFF]" />
              Dataset & Backend Architecture
            </span>

            <div className="flex items-center justify-between text-[#8F9BAD]">
              <span>Verified Student Records:</span>
              <strong className="text-[#F5F7FA]">4,000 students (student_dashboard_data_final.csv)</strong>
            </div>
            <div className="flex items-center justify-between text-[#8F9BAD]">
              <span>Faculty Mentors:</span>
              <strong className="text-[#F5F7FA]">10 advisors (mentors_final.csv)</strong>
            </div>
            <div className="flex items-center justify-between text-[#8F9BAD]">
              <span>Data Service Mode:</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#6FCF97]/10 text-[#6FCF97] border border-[#6FCF97]/25 font-medium">
                In-Memory Synchronous Engine
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-[#EB5757] hover:underline flex items-center gap-1 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Local Storage
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-[#151D2D] hover:bg-[#1B263A] text-[#8F9BAD] hover:text-[#F5F7FA] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
