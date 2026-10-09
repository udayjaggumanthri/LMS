import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { MessageSquare, CheckCircle2, Send } from 'lucide-react';

export const InstructorQAInboxPage: React.FC = () => {
  const { courses, qaQuestions, addQAAnswer } = useCourses();
  const { currentUser } = useAuth();

  const myCourses = courses.filter(
    c => c.instructorId === currentUser?.id || c.instructorId === 'inst-7'
  );
  const myQA = qaQuestions.filter(q => myCourses.some(c => c.id === q.courseId));

  const [activeTab, setActiveTab] = useState<'unanswered' | 'all'>('unanswered');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const displayedQA = activeTab === 'unanswered'
    ? myQA.filter(q => q.answers.length === 0)
    : myQA;

  const handleSendReply = (qId: string) => {
    if (!replyText.trim()) return;
    addQAAnswer(
      qId,
      replyText.trim(),
      currentUser?.id || 'inst-7',
      currentUser?.name || 'Instructor',
      currentUser?.avatar || 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
      true
    );
    setReplyText('');
    setSelectedQuestionId(null);
  };

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Student Q&A Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Answer student inquiries, unblock technical issues, and provide direct mentor guidance
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded text-xs">
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'unanswered' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Reply ({myQA.filter(q => q.answers.length === 0).length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'all' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Questions ({myQA.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {displayedQA.length > 0 ? (
          displayedQA.map((q) => {
            const courseTitle = courses.find(c => c.id === q.courseId)?.title || 'Course';
            const isReplying = selectedQuestionId === q.id;

            return (
              <div key={q.id} className="p-6 border border-slate-200 rounded bg-white space-y-4 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={q.userAvatar}
                      alt={q.userName}
                      className="w-8 h-8 rounded object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{q.userName}</div>
                      <div className="text-[11px] text-slate-500">{courseTitle} · {q.createdAt}</div>
                    </div>
                  </div>
                  {q.answers.length > 0 && (
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      Answered
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-950 mb-1">{q.title}</h3>
                  <p className="text-slate-700 leading-relaxed">{q.content}</p>
                </div>

                {/* Answers thread */}
                {q.answers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {q.answers.map((ans) => (
                      <div key={ans.id} className="p-3 bg-slate-50 border-l-2 border-emerald-700 rounded-r text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
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
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your authoritative instructor response..."
                      className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                      {q.answers.length > 0 ? 'Add Follow-Up Reply' : 'Answer Question'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded bg-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Inbox Zero Achieved</h3>
            <p className="text-xs text-slate-500 mt-1">All student questions have received an instructor reply.</p>
          </div>
        )}
      </div>
    </div>
  );
};
