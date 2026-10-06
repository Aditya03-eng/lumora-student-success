import React, { useState, useEffect } from 'react';
import {
  Award,
  Users,
  Trophy,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import type { CertificateItem, HackathonStats } from '../../types';
import { studentDataService } from '../../services/dataService';
import { CertificateViewModal } from '../certificates/CertificateViewModal';

export const HackathonCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [stats, setStats] = useState<HackathonStats>({
    total_certificates: 6,
    students_participated: 128,
    winners_count: 4,
    certificates_issued: 4,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Modal
  const [viewingCertificate, setViewingCertificate] = useState<CertificateItem | null>(null);

  const loadData = async () => {
    const [list, s] = await Promise.all([
      studentDataService.getCertificates(),
      studentDataService.getHackathonStats(),
    ]);
    setCertificates(list);
    setStats(s);

    if (viewingCertificate) {
      const fresh = list.find((c) => c.id === viewingCertificate.id);
      if (fresh) setViewingCertificate(fresh);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, []);

  const handleVerifyToggle = async (certId: string) => {
    await studentDataService.verifyCertificate(certId);
    await loadData();
  };

  const filteredCerts = certificates.filter((c) => {
    const matchSearch =
      !search.trim() ||
      c.student_name.toLowerCase().includes(search.toLowerCase()) ||
      c.student_id.toLowerCase().includes(search.toLowerCase()) ||
      c.hackathon_name.toLowerCase().includes(search.toLowerCase()) ||
      c.achievement.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchDept = deptFilter === 'all' || c.department === deptFilter;

    return matchSearch && matchStatus && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#262E3D]">
        <div>
          <h2 className="text-lg font-bold text-[#F1F3F5] tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-[#6FCF97]" />
            Hackathon Certificates & Competitive Achievements
          </h2>
          <p className="text-xs text-[#AAB2C0] mt-0.5">
            Dedicated university credential verification repository (independent of student academic risk analysis)
          </p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Certificates */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Certificates</span>
            <Award className="w-4 h-4 text-[#6EA8FE]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] tracking-tight">
            {stats.total_certificates}
          </div>
          <div className="text-[10px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
            Official competition credentials
          </div>
        </div>

        {/* KPI 2: Students Participated */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Students Participated</span>
            <Users className="w-4 h-4 text-[#8B9CFF]" />
          </div>
          <div className="text-2xl font-bold text-[#F1F3F5] tracking-tight">
            {stats.students_participated}
          </div>
          <div className="text-[10px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
            Active hackathon entrants
          </div>
        </div>

        {/* KPI 3: Winners & Finalists */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F2C94C]">
              Winners & Finalists
            </span>
            <Trophy className="w-4 h-4 text-[#F2C94C]" />
          </div>
          <div className="text-2xl font-bold text-[#F2C94C] tracking-tight">
            {stats.winners_count}
          </div>
          <div className="text-[10px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
            Podium & finalist distinctions
          </div>
        </div>

        {/* KPI 4: Certificates Issued / Verified */}
        <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#AAB2C0] mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6FCF97]">
              Certificates Issued
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#6FCF97]" />
          </div>
          <div className="text-2xl font-bold text-[#6FCF97] tracking-tight">
            {stats.certificates_issued}
          </div>
          <div className="text-[10px] text-[#AAB2C0] mt-1 pt-1.5 border-t border-[#262E3D]">
            Verified with institutional seal
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#7A8499] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, hackathon, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] placeholder-[#7A8499] focus:outline-none focus:border-[#6EA8FE]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] focus:outline-none focus:border-[#6EA8FE]"
          >
            <option value="all">All Verification Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-[#151923] border border-[#262E3D] rounded-lg text-[#F1F3F5] focus:outline-none focus:border-[#6EA8FE]"
          >
            <option value="all">All Departments</option>
            {['CSE', 'AI & DS', 'BCA', 'ECE', 'Mechanical', 'BBA', 'Civil'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[11px] text-[#AAB2C0] self-start sm:self-auto">
          Showing {filteredCerts.length} of {certificates.length} entries
        </span>
      </div>

      {/* Certificate Table */}
      <div className="bg-[#1B202B] border border-[#262E3D] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151923] text-[#AAB2C0] uppercase font-bold text-[10px] tracking-wider border-b border-[#262E3D]">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Hackathon</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Position / Achievement</th>
                <th className="py-2.5 px-3">Certificate Status</th>
                <th className="py-2.5 px-3">Certificate Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262E3D]">
              {filteredCerts.map((c) => {
                const isVerified = c.status === 'Verified';
                return (
                  <tr key={c.id} className="hover:bg-[#222936] transition-colors group">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#F1F3F5] group-hover:text-[#6EA8FE] transition-colors">
                        {c.student_name}
                      </div>
                      <div className="text-[10px] text-[#7A8499] font-mono">
                        {c.student_id} • {c.department}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#F1F3F5]">{c.hackathon_name}</td>
                    <td className="py-2.5 px-3 text-[#AAB2C0]">{c.role}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#8B9CFF] flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-[#F2C94C] shrink-0" />
                        {c.achievement}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {isVerified ? (
                        <span className="text-[10px] bg-[#162722] text-[#6FCF97] border border-[#224738] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#2B2616] text-[#F2C94C] border border-[#4E3F1F] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#7A8499] text-[11px] font-mono">
                      {c.certificate_date}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingCertificate(c)}
                          className="px-2.5 py-1 rounded bg-[#222936] hover:bg-[#2B3344] text-[#6EA8FE] font-medium text-xs border border-[#262E3D] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Certificate
                        </button>

                        <button
                          onClick={() => handleVerifyToggle(c.id)}
                          className={`px-2 py-1 rounded text-xs font-medium border transition-colors inline-flex items-center gap-1 ${
                            isVerified
                              ? 'bg-[#2E1A1D] hover:bg-[#5A242B] text-[#EB5757] border-[#5A242B]'
                              : 'bg-[#162722] hover:bg-[#224738] text-[#6FCF97] border-[#224738]'
                          }`}
                          title={isVerified ? 'Toggle verification status' : 'Verify Certificate'}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {isVerified ? 'Revoke' : 'Verify Certificate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      <CertificateViewModal
        certificate={viewingCertificate}
        onClose={() => setViewingCertificate(null)}
        onVerifyToggle={handleVerifyToggle}
      />
    </div>
  );
};
