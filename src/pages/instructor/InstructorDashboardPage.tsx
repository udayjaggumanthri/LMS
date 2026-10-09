import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Star,
  MessageSquare,
  BookOpen,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const InstructorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, qaQuestions, reviews } = useCourses();

  const myCourses = courses.filter(c => c.instructorId === currentUser?.id || c.instructorId === 'inst-7');
  const myQA = qaQuestions.filter(q => myCourses.some(c => c.id === q.courseId));
  const myReviews = reviews.filter(r => myCourses.some(c => c.id === r.courseId));

  const totalEnrollments = myCourses.reduce((sum, c) => sum + c.studentCount, 0);
  const totalGross = myCourses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);
  const instructorNetEarnings = currentUser?.totalEarnings || Math.round(totalGross * 0.85);

  const unansweredQA = myQA.filter(q => q.answers.length === 0);

  return (
    <div className="text-left space-y-8">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Instructor Studio Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {currentUser?.name}. Here is your catalog performance and student activity overview.
          </p>
        </div>

        <Link to="/instructor/courses/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Masterclass
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Net Earnings (85%)
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tabular-nums">
            ₹{instructorNetEarnings.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs last month</span>
          </div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Enrolled Learners
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tabular-nums">
            {totalEnrollments.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across {myCourses.length} published courses
          </div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Instructor Rating
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-amber-900 tabular-nums">
            {currentUser?.rating || 4.92}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Based on {myReviews.length + 4100} reviews
          </div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Pending Q&A Questions
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tabular-nums">
            {unansweredQA.length}
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-semibold">
            <Link to="/instructor/qa" className="hover:underline">
              Reply to students &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Active Courses Quick Table */}
      <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-slate-900">
            My Published Courses ({myCourses.length})
          </h2>
          <Link to="/instructor/courses" className="text-xs font-semibold text-emerald-800 hover:underline">
            Manage All Courses &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {myCourses.map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-12 aspect-video rounded object-cover border border-slate-200 shrink-0"
                />
                <div className="truncate">
                  <div className="font-bold text-slate-900 truncate">{c.title}</div>
                  <div className="text-[11px] text-slate-500">
                    {c.studentCount.toLocaleString('en-IN')} students · Rating {c.rating || 'New'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Badge
                  variant={
                    c.status === 'published'
                      ? 'success'
                      : c.status === 'in_review'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {c.status.replace('_', ' ')}
                </Badge>
                <span className="font-bold tabular-nums text-slate-900">
                  ₹{c.price.toLocaleString('en-IN')}
                </span>
                <Link to={`/student/course/${c.id}`} className="text-emerald-800 hover:underline font-semibold">
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Activity Feeds: Unanswered Q&A + Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Q&A Feed */}
        <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Student Inquiries Requiring Reply</h3>
            <Link to="/instructor/qa" className="text-emerald-800 hover:underline font-semibold text-[11px]">
              View All Q&A
            </Link>
          </div>

          <div className="space-y-3">
            {myQA.slice(0, 3).map((q) => (
              <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span className="font-semibold text-slate-900">{q.userName}</span>
                  <span>{q.createdAt}</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">{q.title}</div>
                <p className="text-slate-600 line-clamp-2">{q.content}</p>
                <div className="pt-1 text-right">
                  <Link to="/instructor/qa" className="text-emerald-800 font-semibold hover:underline text-[11px]">
                    Answer question &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Student Reviews */}
        <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Student Reviews</h3>
            <Link to="/instructor/reviews" className="text-emerald-800 hover:underline font-semibold text-[11px]">
              Manage Reviews
            </Link>
          </div>

          <div className="space-y-3">
            {myReviews.slice(0, 3).map((r) => (
              <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-900">{r.userName}</span>
                  <span className="text-amber-800 font-bold tabular-nums">★ {r.rating}.0</span>
                </div>
                <p className="text-slate-600 line-clamp-2">{r.comment}</p>
                {r.instructorReply ? (
                  <div className="text-[10px] text-emerald-800 font-medium">Replied</div>
                ) : (
                  <Link to="/instructor/reviews" className="text-[11px] text-emerald-800 font-semibold hover:underline block pt-1">
                    Send instructor reply &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
