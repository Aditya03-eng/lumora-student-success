import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Plus,
  Send,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import type {
  FeedbackItem,
  FeedbackCategory,
  FeedbackAnalytics,
  Student,
  Mentor,
  User,
} from '../../types';
import { studentDataService } from '../../services/dataService';

interface FeedbackPageProps {
  currentUser: User;
  onSelectStudent: (student: Student) => void;
  preSelectedStudent?: Student | null;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  currentUser,
  onSelectStudent: _onSelectStudent,
  preSelectedStudent,
}) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [_analytics, setAnalytics] = useState<FeedbackAnalytics>({
    avg_rating: 4.1,
    total_feedbacks: 5,
    category_distribution: [],
    most_common_issue: 'Coding',
    department_comparison: [],
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('Coding');
  const [rating, setRating] = useState<number>(4);
  const [comment, setComment] = useState('');
  const [submittedToast, setSubmittedToast] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const categories: FeedbackCategory[] = [
    'Academic',
    'Coding',
    'Communication',
    'Placement',
    'Attendance',
    'Overall',
  ];

  const loadData = async () => {
    const [fbList, anal, sList, mList] = await Promise.all([
      studentDataService.getFeedbacks(categoryFilter, deptFilter),
      studentDataService.getFeedbackAnalytics(),
      studentDataService.getStudents({ pageSize: 100 }),
      studentDataService.getMentors('all'),
    ]);
    setFeedbacks(fbList);
    setAnalytics(anal);
    setStudents(sList.data);
    setMentors(mList);

    // Auto-select mentor if current user is faculty
    if (currentUser.role === 'faculty') {
      const match = mList.find((m) => m.mentor_name.toLowerCase().includes('rahul'));
      if (match) setSelectedMentorId(match.mentor_id);
    } else if (mList.length > 0 && !selectedMentorId) {
      setSelectedMentorId(mList[0].mentor_id);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = studentDataService.subscribe(loadData);
    return unsub;
  }, [categoryFilter, deptFilter]);

  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.student_id);
    }
  }, [preSelectedStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedMentorId || !comment.trim()) return;

    await studentDataService.submitFeedback({
      student_id: selectedStudentId,
      mentor_id: selectedMentorId,
      category,
      rating,
      comment,
    });

    setSubmittedToast('Feedback logged successfully into student profile.');
    setComment('');
    setSelectedStudentId('');
    loadData();

    setTimeout(() => {
      setSubmittedToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#6EA8FE]" />
            Faculty & Mentor Feedback Management
          </h2>
          <p className="text-xs text-[#8F9BAD] mt-0.5">
            Log student observations across Academic, Technical, Communication, Placement, Attendance, and Overall categories
          </p>
        </div>
      </div>

      {submittedToast && (
        <div className="p-3 bg-[#6FCF97]/10 border border-[#6FCF97]/25 text-[#6FCF97] rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {submittedToast}
          </div>
          <button onClick={() => setSubmittedToast(null)} className="text-[#6FCF97]/80 hover:text-[#6FCF97] cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Log Feedback Form Card */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#F5F7FA] mb-1 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#6EA8FE]" />
          Record Observation / Feedback
        </h3>
        <p className="text-xs text-[#8F9BAD] mb-4">
          Observations are instantly synchronized to the student&apos;s institutional profile
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Student */}
            <div>
              <label className="text-xs font-medium text-[#8F9BAD] block mb-1.5">
                Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full text-xs py-2 px-3 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
              >
                <option value="">-- Choose student --</option>
                {students.slice(0, 100).map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.name} ({s.student_id}) — {s.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Mentor */}
            <div>
              <label className="text-xs font-medium text-[#8F9BAD] block mb-1.5">
                Faculty Mentor
              </label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                required
                className="w-full text-xs py-2 px-3 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
              >
                {mentors.map((m) => (
                  <option key={m.mentor_id} value={m.mentor_id}>
                    {m.mentor_name} ({m.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-[#8F9BAD] block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full text-xs py-2 px-3 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Stars Selector */}
          <div>
            <label className="text-xs font-medium text-[#8F9BAD] block mb-1.5">
              Rating (1 - 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#0A0F1A] p-1.5 rounded-xl border border-white/[0.08]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating ? 'fill-[#F2C94C] text-[#F2C94C]' : 'text-[#657083]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-[#F5F7FA]">{rating} of 5</span>
              <span className="text-[11px] text-[#8F9BAD]">
                ({rating === 5 ? 'Exceptional' : rating === 4 ? 'Good' : rating === 3 ? 'Satisfactory' : 'Needs Support'})
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-xs font-medium text-[#8F9BAD] block mb-1.5">
              Comments & Observations
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              placeholder="Provide constructive feedback regarding student progress, specific weaknesses, or remediation steps..."
              className="w-full text-xs py-2 px-3 bg-[#0A0F1A] border border-white/[0.08] rounded-xl text-[#F5F7FA] placeholder-[#657083] focus:outline-none focus:border-[#6EA8FE]/60"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#6EA8FE] hover:bg-[#8B9CFF] text-[#070B14] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>

      {/* Recent Feedback Log Table */}
      <div className="bg-[#111827] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-[#0A0F1A] border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
              Recent Feedback Submissions
            </h3>
            <p className="text-[11px] text-[#8F9BAD]">Chronological log of mentor evaluations</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[#111827] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[#111827] border border-white/[0.08] rounded-xl text-[#F5F7FA] focus:outline-none focus:border-[#6EA8FE]/60"
            >
              <option value="all">All Depts</option>
              {['CSE', 'AI & DS', 'BCA', 'ECE', 'Mechanical', 'BBA', 'Civil'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0F1A] text-[#657083] uppercase font-bold text-[10px] tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4 font-semibold">Student</th>
                <th className="py-3 px-4 font-semibold">Mentor</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Rating</th>
                <th className="py-3 px-4 font-semibold">Feedback / Comment</th>
                <th className="py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {feedbacks.length > 0 ? (
                feedbacks.map((f) => (
                  <tr key={f.id} className="hover:bg-[#1B263A]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F5F7FA]">{f.student_name}</div>
                      <div className="text-[10px] text-[#657083] font-mono">
                        {f.student_id} • {f.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#F5F7FA] font-medium flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#6FCF97] shrink-0" />
                        {f.mentor_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6EA8FE]/10 text-[#6EA8FE] border border-[#6EA8FE]/20 font-medium">
                        {f.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center text-[#F2C94C]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= f.rating ? 'fill-[#F2C94C]' : 'text-white/[0.1]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-[#F5F7FA] text-[11px] ml-1">
                          {f.rating}/5
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#8F9BAD] max-w-md">{f.comment}</td>
                    <td className="py-3.5 px-4 text-[#657083] text-[11px] whitespace-nowrap font-mono">
                      {f.created_at}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#657083]">
                    No feedback records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
