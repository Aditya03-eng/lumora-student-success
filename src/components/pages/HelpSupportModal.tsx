import React from 'react';
import { X, HelpCircle, BookOpen, ShieldAlert, Cpu, Sparkles, Mail, ExternalLink, Keyboard } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.06] flex items-center justify-between bg-[#0A0F1A]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#6EA8FE]/15 text-[#6EA8FE] border border-[#6EA8FE]/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F7FA]">Lumora Help & Institutional Support</h2>
              <p className="text-xs text-[#8F9BAD]">Platform documentation, risk models, and user assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8F9BAD] hover:text-[#F5F7FA] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#8F9BAD] flex-1">
          {/* Quick Start Guide */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA] mb-2.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#6EA8FE]" />
              Quick Navigation Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#151D2D] rounded-xl border border-white/[0.04]">
                <strong className="text-[#F5F7FA] block mb-1">Executive Overview</strong>
                High-level dean intelligence, 4 summary KPIs, and top students requiring intervention.
              </div>
              <div className="p-3 bg-[#151D2D] rounded-xl border border-white/[0.04]">
                <strong className="text-[#F5F7FA] block mb-1">Student Intelligence</strong>
                Full 4,000 student roster, multi-factor risk detection, skill gap matrix, and high potential cohorts.
              </div>
              <div className="p-3 bg-[#151D2D] rounded-xl border border-white/[0.04]">
                <strong className="text-[#F5F7FA] block mb-1">Student Development</strong>
                Technical/soft assessment tracker, mock placement interviews pipeline, and faculty mentor capacity.
              </div>
              <div className="p-3 bg-[#151D2D] rounded-xl border border-white/[0.04]">
                <strong className="text-[#F5F7FA] block mb-1">Lumora AI Copilot</strong>
                Floating bottom-right assistant trained on student datasets to provide actionable risk explanations.
              </div>
            </div>
          </div>

          {/* Risk Scoring Methodology */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA] mb-2.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#EB5757]" />
              Student Success Score & Risk Index
            </h3>
            <div className="p-3.5 bg-[#151D2D] rounded-xl border border-white/[0.04] space-y-2">
              <p>
                The Lumora Success Score is computed from attendance weighted by academic GPA, coding evaluation scores, and placement interview readiness:
              </p>
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded-lg bg-[#0A0F1A] border border-white/[0.04]">
                  <span className="text-[#6FCF97] font-bold block text-sm">&gt; 75</span>
                  <span className="text-[10px] text-[#8F9BAD]">Low Risk</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0F1A] border border-white/[0.04]">
                  <span className="text-[#F2C94C] font-bold block text-sm">60 - 75</span>
                  <span className="text-[10px] text-[#8F9BAD]">Medium Risk</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0A0F1A] border border-white/[0.04]">
                  <span className="text-[#EB5757] font-bold block text-sm">&lt; 60</span>
                  <span className="text-[10px] text-[#8F9BAD]">High Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div>
            <h3 className="text-sm font-semibold text-[#F5F7FA] mb-2.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B9CFF]" />
              Administrative Support
            </h3>
            <div className="p-3.5 bg-[#151D2D] rounded-xl border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[#F5F7FA] font-medium">Academic Computing & Institutional Research Office</p>
                <p className="text-[11px] text-[#8F9BAD]">Building 4, Office 302 • Mon-Fri 9:00 AM - 5:00 PM</p>
              </div>
              <a
                href="mailto:support@lumora.edu"
                className="px-3 py-1.5 rounded-lg bg-[#6EA8FE]/15 text-[#6EA8FE] border border-[#6EA8FE]/30 font-semibold text-center hover:bg-[#6EA8FE]/25 transition-colors cursor-pointer"
              >
                support@lumora.edu
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0A0F1A] border-t border-white/[0.06] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Close Support
          </button>
        </div>
      </div>
    </div>
  );
};
