import React, { useState, useMemo } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Rating } from '../../components/ui/Rating';
import {
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Filter,
  Send,
  ThumbsUp,
  Clock
} from 'lucide-react';

export const InstructorReviewsPage: React.FC = () => {
  const { courses, reviews, addInstructorReply } = useCourses();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const myCourses = useMemo(() => {
    return courses.filter(
      c => c.instructorId === currentUser?.id || c.instructorId === 'inst-7'
    );
  }, [courses, currentUser]);

  const myReviews = useMemo(() => {
    return reviews.filter(r => myCourses.some(c => c.id === r.courseId));
  }, [reviews, myCourses]);

  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');

  // KPI calculations
  const totalReviews = myReviews.length;
  const avgRating = totalReviews > 0
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';
  const fiveStarCount = myReviews.filter(r => r.rating === 5).length;
  const unrepliedCount = myReviews.filter(r => !r.instructorReply).length;

  const filteredReviews = useMemo(() => {
    return myReviews.filter(r => {
      if (ratingFilter === 'unreplied') return !r.instructorReply;
      if (ratingFilter === '5') return r.rating === 5;
      if (ratingFilter === '4') return r.rating === 4;
      if (ratingFilter === '3') return r.rating <= 3;
      return true;
    });
  }, [myReviews, ratingFilter]);

  const handleSendReply = (reviewId: string) => {
    if (!replyComment.trim()) {
      showToast('error', 'Reply text cannot be empty.');
      return;
    }
    addInstructorReply(reviewId, replyComment.trim());
    showToast('success', 'Public instructor reply published to review!');
    setReplyComment('');
    setReplyingReviewId(null);
  };

  return (
    <div className="text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Student Reviews & Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor learner satisfaction, track course feedback, and publicly answer student reviews
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{avgRating} / 5.0</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Top 5% on platform</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{totalReviews}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across your curriculum</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>5-Star Testimonials</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{fiveStarCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalReviews > 0 ? `${Math.round((fiveStarCount / totalReviews) * 100)}% of total` : '100%'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Awaiting Response</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-600">{unrepliedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Unreplied student reviews</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        <span className="font-semibold text-slate-500 flex items-center gap-1 mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        <button
          onClick={() => setRatingFilter('all')}
          className={`px-3 py-1 rounded transition-colors shrink-0 ${
            ratingFilter === 'all'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All ({totalReviews})
        </button>
        <button
          onClick={() => setRatingFilter('unreplied')}
          className={`px-3 py-1 rounded transition-colors shrink-0 ${
            ratingFilter === 'unreplied'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Needs Reply ({unrepliedCount})
        </button>
        <button
          onClick={() => setRatingFilter('5')}
          className={`px-3 py-1 rounded transition-colors shrink-0 ${
            ratingFilter === '5'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          5 Stars ({fiveStarCount})
        </button>
        <button
          onClick={() => setRatingFilter('4')}
          className={`px-3 py-1 rounded transition-colors shrink-0 ${
            ratingFilter === '4'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          4 Stars ({myReviews.filter(r => r.rating === 4).length})
        </button>
      </div>

      {/* Reviews Thread List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => {
            const courseTitle = courses.find(c => c.id === rev.courseId)?.title || 'Course';
            const isReplying = replyingReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className="p-6 border border-slate-200 rounded-lg bg-white space-y-3.5 text-xs shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{rev.userName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{courseTitle} &bull; {rev.date}</div>
                    </div>
                  </div>
                  <Rating rating={rev.rating} showCount={false} size="sm" />
                </div>

                <p className="text-slate-700 leading-relaxed text-xs">{rev.comment}</p>

                {rev.instructorReply && (
                  <div className="p-3.5 bg-emerald-50/40 border-l-3 border-emerald-700 rounded-r-lg space-y-1 mt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                      <span>Your Public Instructor Response:</span>
                      <span className="font-normal text-slate-400">{rev.instructorReply.date}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{rev.instructorReply.comment}</p>
                  </div>
                )}

                {isReplying ? (
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <textarea
                      rows={3}
                      value={replyComment}
                      onChange={(e) => setReplyComment(e.target.value)}
                      placeholder="Write a supportive, professional public response to this learner..."
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReplyingReviewId(null)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                        onClick={() => handleSendReply(rev.id)}
                      >
                        Publish Response
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
                      Reply to Student Review &rarr;
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-16 text-center border border-dashed border-slate-200 rounded-lg bg-white max-w-lg mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base font-display">No Reviews Found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              No reviews currently match your chosen filter. Change the filter above to view all learner reviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
