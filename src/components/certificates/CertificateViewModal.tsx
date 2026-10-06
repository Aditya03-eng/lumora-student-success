import React from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Calendar,
  Printer,
  Download,
  CheckCircle2,
} from 'lucide-react';
import type { CertificateItem } from '../../types';

interface CertificateViewModalProps {
  certificate: CertificateItem | null;
  onClose: () => void;
  onVerifyToggle?: (certId: string) => void;
}

export const CertificateViewModal: React.FC<CertificateViewModalProps> = ({
  certificate,
  onClose,
  onVerifyToggle,
}) => {
  if (!certificate) return null;

  const isVerified = certificate.status === 'Verified';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#151923] border border-[#262E3D] rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-[#F1F3F5] animate-in fade-in zoom-in-95 flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7A8499] hover:text-[#F1F3F5] p-1.5 rounded-lg bg-[#1B202B] border border-[#262E3D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate Frame Container */}
        <div className="bg-[#0F1117] border-2 border-[#262E3D] rounded-xl p-8 relative overflow-hidden text-center my-2 select-none shadow-inner">
          {/* Institutional Corner Accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#6EA8FE]" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#6EA8FE]" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#6EA8FE]" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#6EA8FE]" />

          {/* Watermark Crest */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1B202B] border border-[#262E3D] text-[#6EA8FE] mb-2 shadow-sm">
            <Award className="w-6 h-6" />
          </div>

          <div className="text-[10px] tracking-widest font-bold text-[#AAB2C0] uppercase">
            Lumora Institutional Certification Authority
          </div>

          <h2 className="text-xl font-black text-[#F1F3F5] uppercase tracking-wide mt-1">
            Certificate of Achievement
          </h2>

          <p className="text-xs text-[#AAB2C0] mt-3 italic">
            This credential is officially conferred upon
          </p>

          {/* Recipient Name */}
          <div className="text-2xl font-black text-[#6EA8FE] tracking-tight my-2">
            {certificate.student_name}
          </div>

          <div className="text-xs text-[#AAB2C0] font-mono">
            Student ID: {certificate.student_id} • Dept of {certificate.department}
          </div>

          <p className="text-xs text-[#F1F3F5] max-w-md mx-auto mt-4 leading-relaxed">
            for meritorious performance serving as <strong className="text-[#8B9CFF]">{certificate.role}</strong>{' '}
            at the <strong className="text-[#F1F3F5]">{certificate.hackathon_name}</strong>, achieving the distinguished rank of:
          </p>

          {/* Achievement Pill */}
          <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-[#182338] border border-[#253A5E] text-[#6EA8FE] text-xs font-bold uppercase tracking-wider shadow-sm">
            ★ {certificate.achievement} ★
          </div>

          {/* Verification Metadata Section */}
          <div className="mt-8 pt-4 border-t border-[#262E3D] flex flex-col sm:flex-row items-center justify-between text-left text-[11px] text-[#AAB2C0] gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#7A8499]">Credential ID</div>
              <div className="font-mono text-xs text-[#F1F3F5]">{certificate.credential_id}</div>
              <div className="text-[10px] text-[#7A8499]">Issue Date: {certificate.certificate_date}</div>
            </div>

            <div className="flex items-center gap-2 bg-[#1B202B] px-3 py-1.5 rounded-lg border border-[#262E3D]">
              <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-[#6FCF97]' : 'text-[#F2C94C]'}`} />
              <div>
                <span className={`font-bold block text-xs ${isVerified ? 'text-[#6FCF97]' : 'text-[#F2C94C]'}`}>
                  {isVerified ? 'Cryptographically Verified' : 'Pending Formal Verification'}
                </span>
                <span className="text-[9px] text-[#7A8499]">
                  {certificate.verified_by ? `By ${certificate.verified_by}` : 'University Registrar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 text-xs">
          <div className="text-[11px] text-[#7A8499]">
            Certified on Smart Campus Blockchain Registry
          </div>

          <div className="flex items-center gap-2">
            {onVerifyToggle && (
              <button
                onClick={() => onVerifyToggle(certificate.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-colors ${
                  isVerified
                    ? 'bg-[#2E1A1D] hover:bg-[#5A242B] text-[#EB5757] border-[#5A242B]'
                    : 'bg-[#162722] hover:bg-[#224738] text-[#6FCF97] border-[#224738]'
                }`}
              >
                {isVerified ? 'Revoke Verification' : 'Verify Certificate Now'}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#222936] hover:bg-[#2B3344] text-[#F1F3F5] font-semibold text-xs rounded-lg border border-[#262E3D] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
