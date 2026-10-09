import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Rating } from '../../components/ui/Rating';
import { Star, MessageSquare } from 'lucide-react';

export const InstructorReviewsPage: React.FC = () => {
  const { courses, reviews, addInstructorReply } = useCourses();
  const { currentUser } = useAuth();

  const myCourses = courses.filter(
    c => c.instructorId === currentUser?.id || c.instructorId === 'inst-7'
  );
  const myReviews = reviews.filter(r => myCourses.some(c => c.id === r.courseId));

  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');

  const handleSendReply = (reviewId: string) => {
    if (!replyComment.trim()) return;
    addInstructorReply(reviewId, replyComment.trim());
    setReplyComment('');
    setReplyingReviewId(null);
  };

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Student Reviews & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor student feedback, maintain high ratings, and reply publicly to course reviews
        </p>
      </div>

      <div className="space-y-4">
        {myReviews.map((rev) => {
          const courseTitle = courses.find(c => c.id === rev.courseId)?.title || 'Course';
          const isReplying = replyingReviewId === rev.id;

          return (
            <div key={rev.id} className="p-6 border border-slate-200 rounded bg-white space-y-3 text-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.userAvatar}
                    alt={rev.userName}
                    className="w-8 h-8 rounded object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900">{rev.userName}</div>
                    <div className="text-[11px] text-slate-500">{courseTitle} · {rev.date}</div>
                  </div>
                </div>
                <Rating rating={rev.rating} showCount={false} size="sm" />
              </div>

              <p className="text-slate-700 leading-relaxed">{rev.comment}</p>

              {rev.instructorReply && (
                <div className="p-3 bg-slate-50 border-l-2 border-emerald-700 rounded-r space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                    <span>Your Public Response:</span>
                    <span className="font-normal text-slate-400">{rev.instructorReply.date}</span>
                  </div>
                  <p className="text-slate-700">{rev.instructorReply.comment}</p>
                </div>
              )}

              {isReplying ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <textarea
                    rows={2}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    placeholder="Write a professional, public response..."
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setReplyingReviewId(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSendReply(rev.id)}>
                      Post Reply
                    </Button>
                  </div>
                </div>
              ) : !rev.instructorReply && (
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingReviewId(rev.id);
                      setReplyComment('');
                    }}
                  >
                    Reply to Review
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
