import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  X,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type {
  MockInterview,
  InterviewStatus,
  InterviewType,
  Student,
  Mentor,
} from '../../types';
import { studentDataService } from '../../services/dataService';

interface MockInterviewsPageProps {
  onSelectStudent: (student: Student) => void;
  preSelectedStudent?: Student | null;
}

export const MockInterviewsPage: React.FC<MockInterviewsPageProps> = ({
  onSelectStudent,
  preSelectedStudent,
}) => {
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'scheduled' | 'completed'>('scheduled');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('Technical Coding');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const loadData = async () => {
    const [mockList, mentorList, studentList] = await Promise.all([
      studentDataService.getMockInterviews(),
      studentDataService.getMentors('all'),
      studentDataService.getStudents({ pageSize: 200 }),
    ]);
    setInterviews(mockList);
    setMentors(mentorList);
    setStudents(studentList.data);

    if (mentorList.length > 0 && !selectedMentorId) {
      setSelectedMentorId(mentorList[0].mentor_id);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, []);

  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.student_id);
      setIsAssignModalOpen(true);
    }
  }, [preSelectedStudent]);

  // Tab Filtering
  const filteredInterviews = interviews.filter((item) => {
    const matchSearch =
      !search.trim() ||
      item.student_name.toLowerCase().includes(search.toLowerCase()) ||
      item.student_id.toLowerCase().includes(search.toLowerCase()) ||
      item.mentor_name.toLowerCase().includes(search.toLowerCase());

    const matchDept = deptFilter === 'all' || item.department === deptFilter;

    let matchTab = false;
    if (activeTab === 'pending') {
      matchTab = item.status === 'Not Scheduled' || item.status === 'Needs Follow-up';
    } else if (activeTab === 'scheduled') {
      matchTab = item.status === 'Scheduled';
    } else if (activeTab === 'completed') {
      matchTab = item.status === 'Completed';
    }

    return matchSearch && matchDept && matchTab;
  });

  const pendingCount = interviews.filter(
    (i) => i.status === 'Not Scheduled' || i.status === 'Needs Follow-up'
  ).length;
  const scheduledCount = interviews.filter((i) => i.status === 'Scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'Completed').length;

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedMentorId) return;

    await studentDataService.assignMockInterview({
      student_id: selectedStudentId,
      mentor_id: selectedMentorId,
      interview_type: interviewType,
      scheduled_date: date,
      scheduled_time: time,
      notes,
    });

    setSavedToast(`Mock interview scheduled successfully.`);
    setIsAssignModalOpen(false);
    setSelectedStudentId('');
    setNotes('');
    loadData();

    setTimeout(() => {
      setSavedToast(null);
    }, 4000);
  };

  const handleStatusChange = async (interviewId: string, newStatus: InterviewStatus) => {
    await studentDataService.updateMockInterviewStatus(interviewId, newStatus);
    loadData();
  };

  const handleOpenProfile = async (studentId: string) => {
    const student = await studentDataService.getStudentById(studentId);
    if (student) {
      onSelectStudent(student);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#6EA8FE]" />
            Mock Interview Operations
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Coordinate placement practice, technical screenings, and follow-ups with faculty interviewers
          </p>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="px-3.5 py-2 bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Assign Mock Interview
        </button>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="p-3 bg-[#6FCF97]/10 border border-[#6FCF97]/25 text-[#6FCF97] rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {savedToast}
          </div>
          <button onClick={() => setSavedToast(null)} className="text-[#6FCF97]/80 hover:text-[#6FCF97] cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3 Page Sections Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-1.5 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#151D2D] text-[#F2C94C] border border-white/[0.08] shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            1. Pending Pipeline
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F2C94C]/10 text-[#F2C94C] border border-[#F2C94C]/25">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-[#151D2D] text-[#6EA8FE] border border-white/[0.08] shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            2. Scheduled Interviews
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#6EA8FE]/10 text-[#6EA8FE] border border-[#6EA8FE]/25">
              {scheduledCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#151D2D] text-[#6FCF97] border border-white/[0.08] shadow-xs'
                : 'text-[#8F9BAD] hover:text-[#F5F7FA]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            3. Completed Interviews
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#6FCF97]/10 text-[#6FCF97] border border-[#6FCF97]/25">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search & Dept */}
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-[#657083] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or mentor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
          >
            <option value="all">All Depts</option>
            <option value="Computer Science & Engineering (CSE)">CSE</option>
            <option value="Information Technology (IT)">IT</option>
            <option value="Electronics & Comm (ECE)">ECE</option>
            <option value="Mechanical Engineering (ME)">ME</option>
            <option value="Civil Engineering (CE)">CE</option>
            <option value="Electrical Engineering (EE)">EE</option>
          </select>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#657083] uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Interviewer / Mentor</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Schedule Date & Time</th>
                <th className="py-3 px-4 font-semibold">Notes</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#F5F7FA]">
              {filteredInterviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8F9BAD]">
                    No mock interviews found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1B263A]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F5F7FA]">{item.student_name}</div>
                      <div className="text-[10px] text-[#657083] font-mono">{item.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#8F9BAD]">{item.department}</td>
                    <td className="py-3.5 px-4 text-[#F5F7FA] font-medium">{item.mentor_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/[0.04] text-[#8F9BAD] border border-white/[0.06]">
                        {item.interview_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#8F9BAD] font-mono">
                      {item.scheduled_date} • {item.scheduled_time}
                    </td>
                    <td className="py-3.5 px-4 text-[#8F9BAD] max-w-xs truncate">{item.notes}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as InterviewStatus)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border bg-[#0A0F1A] focus:outline-none cursor-pointer ${
                          item.status === 'Completed'
                            ? 'text-[#6FCF97] border-[#6FCF97]/30'
                            : item.status === 'Scheduled'
                            ? 'text-[#6EA8FE] border-[#6EA8FE]/30'
                            : item.status === 'Needs Follow-up'
                            ? 'text-[#F2C94C] border-[#F2C94C]/30'
                            : 'text-[#EB5757] border-[#EB5757]/30'
                        }`}
                      >
                        <option value="Not Scheduled">Not Scheduled</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Needs Follow-up">Needs Follow-up</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenProfile(item.student_id)}
                        className="px-2.5 py-1 rounded-lg bg-[#151D2D] hover:bg-[#1B263A] text-[#6EA8FE] font-medium border border-white/[0.08] text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Schedule Placement Mock Interview</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-[#8F9BAD] hover:text-[#F5F7FA]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8F9BAD] font-medium mb-1.5">Candidate Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                >
                  <option value="">Select student...</option>
                  {students.slice(0, 100).map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.student_id} • {s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8F9BAD] font-medium mb-1.5">Interviewer / Mentor</label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  required
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                >
                  {mentors.map((m) => (
                    <option key={m.mentor_id} value={m.mentor_id}>
                      {m.mentor_name} ({m.department} • {Array.isArray(m.expertise) ? m.expertise.join(', ') : m.expertise_raw})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8F9BAD] font-medium mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                  />
                </div>
                <div>
                  <label className="block text-[#8F9BAD] font-medium mb-1.5">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8F9BAD] font-medium mb-1.5">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                >
                  <option value="Technical Coding">Technical Coding</option>
                  <option value="HR & Culture Fit">HR & Culture Fit</option>
                  <option value="Placement Readiness">Placement Readiness</option>
                  <option value="System Design">System Design</option>
                  <option value="Communication Skills">Communication Skills</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8F9BAD] font-medium mb-1.5">Focus Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Focus on dynamic programming and problem explanation..."
                  rows={2}
                  className="w-full bg-[#0A0F1A] border border-white/[0.08] rounded-xl px-3 py-2 text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#151D2D] text-[#8F9BAD] hover:text-[#F5F7FA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-bold shadow-xs cursor-pointer"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
