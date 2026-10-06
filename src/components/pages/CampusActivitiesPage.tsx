import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Award,
  FileCheck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Trophy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import type { CampusEvent, CampusHackathon, CertificateItem, EventCategory, EventStatus } from '../../types';
import { studentDataService } from '../../services/dataService';
import { CertificateViewModal } from '../certificates/CertificateViewModal';

interface CampusActivitiesPageProps {
  initialSubTab?: 'events' | 'hackathons' | 'certificates';
}

export const CampusActivitiesPage: React.FC<CampusActivitiesPageProps> = ({
  initialSubTab = 'events',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'hackathons' | 'certificates'>(initialSubTab);

  // Sync prop changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Events State
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<{ status: string; category: string; search: string }>({
    status: 'all',
    category: 'all',
    search: '',
  });

  // Hackathons State
  const [hackathons, setHackathons] = useState<CampusHackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<CampusHackathon | null>(null);

  // Certificates State
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [certFilter, setCertFilter] = useState<'all' | 'Verified' | 'Pending Verification'>('all');
  const [certSearch, setCertSearch] = useState('');

  const loadData = async () => {
    const [evts, hacks, certs] = await Promise.all([
      studentDataService.getCampusEvents(),
      studentDataService.getCampusHackathons(),
      studentDataService.getCertificates(),
    ]);
    setEvents(evts);
    setHackathons(hacks);
    if (!selectedHackathon && hacks.length > 0) {
      setSelectedHackathon(hacks[0]);
    }
    setCertificates(certs);
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, []);

  const handleVerifyCert = async (certId: string) => {
    await studentDataService.verifyCertificate(certId, 'Dean of Academic Affairs');
    loadData();
    if (selectedCert && selectedCert.id === certId) {
      const fresh = await studentDataService.getCertificates();
      const updated = fresh.find((c) => c.id === certId);
      if (updated) setSelectedCert(updated);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    if (eventFilter.status !== 'all' && evt.status !== eventFilter.status) return false;
    if (eventFilter.category !== 'all' && evt.category !== eventFilter.category) return false;
    if (eventFilter.search.trim()) {
      const q = eventFilter.search.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Certificates
  const filteredCertificates = certificates.filter((cert) => {
    if (certFilter !== 'all' && cert.status !== certFilter) return false;
    if (certSearch.trim()) {
      const q = certSearch.toLowerCase();
      return (
        cert.student_name.toLowerCase().includes(q) ||
        cert.student_id.toLowerCase().includes(q) ||
        cert.hackathon_name.toLowerCase().includes(q) ||
        cert.credential_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Campus Activities & Student Engagements
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Institutional hub managing campus events, collegiate hackathons, and verifiable student credentials
          </p>
        </div>

        {/* 3 Sub-Navigation Tabs */}
        <div className="flex items-center bg-[#111827] p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'events'
                ? 'bg-[#151D2D] text-[#6EA8FE] shadow-xs border border-white/[0.08]'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('hackathons')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'hackathons'
                ? 'bg-[#151D2D] text-[#8B9CFF] shadow-xs border border-white/[0.08]'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Hackathons ({hackathons.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('certificates')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'certificates'
                ? 'bg-[#151D2D] text-[#6EE7F9] shadow-xs border border-white/[0.08]'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Certificates ({certificates.length})</span>
          </button>
        </div>
      </div>

      {/* ================= 1. EVENTS SECTION ================= */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          {/* Events Filter Controls */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events by name, location..."
                  value={eventFilter.search}
                  onChange={(e) => setEventFilter({ ...eventFilter, search: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] text-xs focus:outline-none focus:border-[#6EA8FE]/60"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center rounded-xl bg-[#0A0F1A] border border-white/[0.08] p-1">
                {(['all', 'Upcoming', 'Past'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setEventFilter({ ...eventFilter, status: st })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize cursor-pointer transition-colors ${
                      eventFilter.status === st
                        ? 'bg-[#151D2D] text-[#6EA8FE] font-semibold shadow-xs'
                        : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={eventFilter.category}
                onChange={(e) => setEventFilter({ ...eventFilter, category: e.target.value })}
                className="bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
              >
                <option value="all">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Career">Career & Placement</option>
                <option value="Academic">Academic</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <span className="text-[11px] text-[#8F9BAD]">
              Showing {filteredEvents.length} of {events.length} campus events
            </span>
          </div>

          {/* Events Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4.5 flex flex-col justify-between card-hover-lift shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                        evt.category === 'Technical'
                          ? 'bg-[#6EA8FE]/10 text-[#6EA8FE] border-[#6EA8FE]/25'
                          : evt.category === 'Career'
                          ? 'bg-[#8B9CFF]/10 text-[#8B9CFF] border-[#8B9CFF]/25'
                          : evt.category === 'Sports'
                          ? 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/25'
                          : evt.category === 'Cultural'
                          ? 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/25'
                          : 'bg-white/[0.04] text-[#8F9BAD] border-white/[0.08]'
                      }`}
                    >
                      {evt.category}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        evt.status === 'Upcoming'
                          ? 'bg-[#6EA8FE]/10 text-[#6EA8FE] border border-[#6EA8FE]/25'
                          : 'bg-white/[0.04] text-[#8F9BAD] border border-white/[0.06]'
                      }`}
                    >
                      {evt.status === 'Upcoming' && <Clock className="w-2.5 h-2.5" />}
                      {evt.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#F5F7FA] leading-snug mb-1.5">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#8F9BAD] line-clamp-2 leading-relaxed mb-3">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.04] text-[11px] text-[#8F9BAD] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#657083]" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-[#657083]" />
                      {evt.participants_count} Registered
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#657083]">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {evt.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 2. HACKATHONS SECTION ================= */}
      {activeSubTab === 'hackathons' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hackathon Selector Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#657083] uppercase tracking-wider px-1">
                Collegiate Hackathons ({hackathons.length})
              </h3>
              {hackathons.map((hack) => {
                const isSelected = selectedHackathon?.id === hack.id;
                return (
                  <div
                    key={hack.id}
                    onClick={() => setSelectedHackathon(hack)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#151D2D] border-[#6EA8FE]/40 shadow-md'
                        : 'bg-[#111827] border-white/[0.06] hover:bg-[#1B263A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#8B9CFF]/10 text-[#8B9CFF] border border-[#8B9CFF]/25">
                        {hack.status}
                      </span>
                      <span className="text-[11px] text-[#657083] font-mono">{hack.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F5F7FA] mb-1">{hack.name}</h4>
                    <p className="text-xs text-[#8F9BAD] line-clamp-2">Winners: {hack.winners}</p>
                    <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#8F9BAD]">
                      <span>{hack.teams_count} Teams</span>
                      <span>{hack.participants_count} Competitors</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hackathon Detailed View */}
            {selectedHackathon && (
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#8B9CFF] uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[#8B9CFF]" />
                      Competition Profile
                    </span>
                    <span className="text-xs bg-[#0A0F1A] border border-white/[0.08] px-2.5 py-1 rounded-xl text-[#F5F7FA] font-mono">
                      {selectedHackathon.date}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F5F7FA] mb-1">
                    {selectedHackathon.name}
                  </h3>
                  <p className="text-xs text-[#8F9BAD] leading-relaxed mb-4">
                    Grand Champion: <strong className="text-[#6FCF97]">{selectedHackathon.winners}</strong>
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.04] text-center">
                    <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04]">
                      <div className="text-lg font-bold text-[#F5F7FA]">{selectedHackathon.participants_count}</div>
                      <div className="text-[10px] text-[#8F9BAD]">Participants</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04]">
                      <div className="text-lg font-bold text-[#F5F7FA]">{selectedHackathon.teams_count}</div>
                      <div className="text-[10px] text-[#8F9BAD]">Teams Formed</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A0F1A] border border-white/[0.04]">
                      <div className="text-lg font-bold text-[#6FCF97]">1</div>
                      <div className="text-[10px] text-[#8F9BAD]">Champion Team</div>
                    </div>
                  </div>
                </div>

                {/* Key Student Competitors Table */}
                {selectedHackathon.participants && selectedHackathon.participants.length > 0 && (
                  <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#F2C94C]" />
                        Key Student Competitors & Recognitions
                      </h4>
                    </div>
                    <div className="divide-y divide-white/[0.04] text-xs">
                      {selectedHackathon.participants.map((part, pIdx) => (
                        <div key={pIdx} className="p-4 flex items-center justify-between hover:bg-[#1B263A]/40 transition-colors">
                          <div className="flex items-center space-x-3">
                            <span className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs bg-[#8B9CFF]/15 text-[#8B9CFF] border border-[#8B9CFF]/30">
                              #{pIdx + 1}
                            </span>
                            <div>
                              <div className="font-semibold text-[#F5F7FA]">{part.name} ({part.department})</div>
                              <div className="text-[11px] text-[#8F9BAD]">Team: {part.team} • Role: {part.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#6FCF97]/15 text-[#6FCF97] border border-[#6FCF97]/30 font-medium">
                              {part.achievement}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 3. CERTIFICATES SECTION ================= */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-4">
          {/* Certificate Filter Bar */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student, ID, or hackathon..."
                  value={certSearch}
                  onChange={(e) => setCertSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] text-xs focus:outline-none focus:border-[#6EA8FE]/60"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center rounded-xl bg-[#0A0F1A] border border-white/[0.08] p-1">
                {(['all', 'Verified', 'Pending Verification'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setCertFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      certFilter === st
                        ? 'bg-[#151D2D] text-[#6EA8FE] font-semibold shadow-xs'
                        : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {st === 'all' ? 'All Credentials' : st}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[11px] text-[#8F9BAD]">
              Showing {filteredCertificates.length} credentials
            </span>
          </div>

          {/* Certificates Table */}
          <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Certificate ID</th>
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Event / Hackathon</th>
                    <th className="py-3 px-4 font-semibold">Achievement</th>
                    <th className="py-3 px-4 font-semibold">Issue Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
                  {filteredCertificates.map((cert) => {
                    const isVerified = cert.status === 'Verified';
                    return (
                      <tr key={cert.id} className="hover:bg-[#1B263A]/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#6EA8FE]">
                          {cert.credential_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#F5F7FA]">{cert.student_name}</div>
                          <div className="text-[10px] text-[#657083] font-mono">{cert.student_id}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#8F9BAD]">{cert.department}</td>
                        <td className="py-3.5 px-4 font-medium max-w-xs truncate">
                          {cert.hackathon_name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#F5F7FA]">{cert.achievement}</span>
                          <span className="text-[10px] text-[#657083] block">Role: {cert.role}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#8F9BAD] font-mono text-[11px]">
                          {cert.certificate_date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border inline-flex items-center gap-1 ${
                              isVerified
                                ? 'bg-[#6FCF97]/10 text-[#6FCF97] border-[#6FCF97]/25'
                                : 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/25'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isVerified ? 'bg-[#6FCF97]' : 'bg-[#F2C94C]'
                              }`}
                            />
                            {cert.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedCert(cert)}
                            className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium border border-white/[0.08] text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleVerifyCert(cert.id)}
                            className={`px-2.5 py-1 rounded-lg font-semibold text-xs border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                              isVerified
                                ? 'bg-[#151D2D] text-[#8F9BAD] hover:text-[#EB5757] border-white/[0.08]'
                                : 'bg-[#6FCF97] hover:bg-[#5db883] text-[#070B14] border-[#6FCF97]'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{isVerified ? 'Revoke' : 'Verify'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Certificate View Modal */}
      {selectedCert && (
        <CertificateViewModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
          onVerifyToggle={(id) => handleVerifyCert(id)}
        />
      )}
    </div>
  );
};
