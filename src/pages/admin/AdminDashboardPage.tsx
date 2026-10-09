import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  ShieldAlert,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAdmin } from '../../context/AdminContext';
import { useLearning } from '../../context/LearningContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const { courses, updateCourseStatus } = useCourses();
  const { instructorApplications, payoutRequests, approvePayout } = useAdmin();
  const { orders, refundRequests, approveRefund } = useLearning();

  const pendingCourses = courses.filter(c => c.status === 'in_review');
  const pendingApps = instructorApplications.filter(a => a.status === 'pending');
  const pendingRefunds = refundRequests.filter(r => r.status === 'pending');
  const pendingPayouts = payoutRequests.filter(p => p.status === 'pending');

  const totalGMV = courses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);
  const platformNetFee = Math.round(totalGMV * 0.15);
  const totalLearners = courses.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <div className="text-left space-y-8">
      {/* Page Title */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Platform Administration Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global governance: editorial approvals, marketplace economics, refunds, and user safety
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/course-reviews">
            <Button variant="outline" size="sm">
              Review Queue ({pendingCourses.length})
            </Button>
          </Link>
          <Link to="/admin/instructor-applications">
            <Button variant="primary" size="sm">
              Applications ({pendingApps.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Gross Marketplace Volume (GMV)
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
            ₹{(totalGMV / 10000000).toFixed(2)} Cr
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Across {courses.length} courses</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Platform Net Revenue (15%)
          </div>
          <div className="text-2xl font-bold font-display text-emerald-950 tabular-nums">
            ₹{(platformNetFee / 100000).toFixed(1)} Lakhs
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-semibold">+22.4% YoY</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Active Marketplace Learners
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
            {totalLearners.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Global registered accounts</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Pending Action Queues
          </div>
          <div className="text-2xl font-bold font-display text-amber-900 tabular-nums">
            {pendingCourses.length + pendingApps.length + pendingRefunds.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Courses, apps & refunds</div>
        </div>
      </div>

      {/* Two-Column Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Pending Courses Approval Queue */}
        <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900">
              Courses Pending Editorial Approval ({pendingCourses.length})
            </h2>
            <Link to="/admin/course-reviews" className="text-emerald-800 hover:underline font-semibold text-[11px]">
              Full Queue &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {pendingCourses.length > 0 ? (
              pendingCourses.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{c.title}</div>
                      <div className="text-[11px] text-slate-500">{c.subcategory} · {c.durationHours}h</div>
                    </div>
                    <Badge variant="warning">In Review</Badge>
                  </div>
                  {c.reviewFeedback && (
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                      {c.reviewFeedback}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCourseStatus(c.id, 'changes_requested', 'Please provide additional code examples in Section 2.')}
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateCourseStatus(c.id, 'published')}
                    >
                      Approve & Publish
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 py-4 text-center">No courses currently waiting in the review queue.</p>
            )}
          </div>
        </div>

        {/* Pending Instructor Applications Queue */}
        <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900">
              Pending Instructor Applications ({pendingApps.length})
            </h2>
            <Link to="/admin/instructor-applications" className="text-emerald-800 hover:underline font-semibold text-[11px]">
              Review All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {pendingApps.length > 0 ? (
              pendingApps.map((app) => (
                <div key={app.id} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900">{app.applicantName}</div>
                      <div className="text-[11px] text-slate-500">{app.email}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">{app.submittedAt}</span>
                  </div>
                  <div className="text-slate-700 font-medium">Topic: {app.sampleTopic}</div>
                  <p className="text-slate-500 text-[11px] line-clamp-2">{app.experienceBio}</p>
                  <div className="flex justify-end gap-2 pt-1">
                    <Link to="/admin/instructor-applications">
                      <Button variant="outline" size="sm">
                        Inspect Application &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 py-4 text-center">All instructor applications processed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
