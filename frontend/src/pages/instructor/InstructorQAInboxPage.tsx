import React, { useState, useMemo } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import {
  MessageSquare,
  CheckCircle2,
  Send,
  HelpCircle,
  Clock,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';

export const InstructorQAInboxPage: React.FC = () => {
  const { courses, qaQuestions, addQAAnswer } = useCourses();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const myCourses = useMemo(() => {
    return courses.filter(
      c => c.instructorId === currentUser?.id || c.instructorId === 'inst-7'
    );
  }, [courses, currentUser]);

  const myQA = useMemo(() => {
    return qaQuestions.filter(q => myCourses.some(c => c.id === q.courseId));
  }, [qaQuestions, myCourses]);

  const [activeTab, setActiveTab] = useState<'unanswered' | 'all'>('unanswered');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // KPI Calculations
  const totalQuestions = myQA.length;
  const unansweredCount = myQA.filter(q => q.answers.length === 0).length;
  const answeredCount = totalQuestions - unansweredCount;

  const displayedQA = useMemo(() => {
    return myQA.filter(q => {
      if (activeTab === 'unanswered' && q.answers.length > 0) return false;
      if (courseFilter !== 'all' && q.courseId !== courseFilter) return false;
      return true;
    });
  }, [myQA, activeTab, courseFilter]);

  const handleSendReply = (qId: string) => {
    if (!replyText.trim()) {
      showToast('error', 'Response text cannot be empty.');
      return;
    }
    addQAAnswer(
      qId,
      replyText.trim(),
      currentUser?.id || 'inst-7',
      currentUser?.name || 'Instructor',
      currentUser?.avatar || 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
      true
    );
    showToast('success', 'Your instructor solution has been posted to the discussion thread!');
    setReplyText('');
    setSelectedQuestionId(null);
  };

  return (
    <div className="text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Student Technical Q&A Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Answer student coding inquiries, unblock technical issues, and provide direct mentor guidance
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded text-xs">
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'unanswered' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Reply ({unansweredCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'all' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Threads ({totalQuestions})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Awaiting Reply</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-600">{unansweredCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Direct student questions</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Answered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-800">{answeredCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalQuestions > 0 ? `${Math.round((answeredCount / totalQuestions) * 100)}% resolution rate` : '100%'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Response SLA</span>
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">&lt; 4 Hours</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Fast mentor turnaround</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Q&A Inquiries</span>
            <HelpCircle className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{totalQuestions}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across active courses</div>
        </div>
      </div>

      {/* Filter by Course Dropdown */}
      <div className="flex items-center justify-between bg-white p-3 border border-slate-200 rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-700">Course Filter:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">All Masterclasses ({myCourses.length})</option>
            {myCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 tabular-nums">
          Showing {displayedQA.length} of {myQA.length} threads
        </div>
      </div>

      {/* Questions Thread List */}
      <div className="space-y-4">
        {displayedQA.length > 0 ? (
          displayedQA.map((q) => {
            const courseTitle = courses.find(c => c.id === q.courseId)?.title || 'Course';
            const isReplying = selectedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 text-xs shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={q.userAvatar}
                      alt={q.userName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{q.userName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{courseTitle} &bull; {q.createdAt}</div>
                    </div>
                  </div>
                  {q.answers.length > 0 ? (
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" />
                      Answered ({q.answers.length})
                    </span>
                  ) : (
                    <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 text-[10px]">
                      Awaiting Reply
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-950 font-display mb-1.5">{q.title}</h3>
                  <p className="text-slate-700 leading-relaxed text-xs bg-slate-50/50 p-3 rounded border border-slate-100">
                    {q.content}
                  </p>
                </div>

                {/* Answers thread */}
                {q.answers.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Instructor & Mentor Answers
                    </div>
                    {q.answers.map((ans) => (
                      <div key={ans.id} className="p-3.5 bg-emerald-50/40 border-l-3 border-emerald-700 rounded-r-lg text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-emerald-950 text-[11px]">
                          <span>{ans.userName} (Instructor)</span>
                          <span className="text-slate-400 font-normal">{ans.createdAt}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{ans.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {isReplying ? (
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your authoritative instructor response with code snippets or explanation..."
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white font-mono"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedQuestionId(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                        onClick={() => handleSendReply(q.id)}
                      >
                        Publish Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        setReplyText('');
                      }}
                    >
                      {q.answers.length > 0 ? 'Add Follow-up Answer' : 'Answer Question &rarr;'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center border border-dashed border-slate-200 rounded-lg bg-white max-w-lg mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base font-display">Inbox Up to Date</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              No questions matching this filter need attention right now. Your students are well supported!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
