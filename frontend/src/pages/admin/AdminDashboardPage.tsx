import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAdmin } from '../../context/AdminContext';
import { useLearning } from '../../context/LearningContext';
import { adminService } from '../../api/adminService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const { courses, updateCourseStatus } = useCourses();
  const { instructorApplications } = useAdmin();
  const { orders } = useLearning();

  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.status === 'published').length,
    inReviewCourses: courses.filter(c => c.status === 'in_review').length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
  });

  useEffect(() => {
    adminService.getDashboardStats()
      .then((data) => {
        if (data) {
          setDbStats(prev => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch(() => {});
  }, [courses, orders]);

  const pendingCourses = courses.filter(c => c.status === 'in_review');
  const pendingApps = instructorApplications.filter(a => a.status === 'pending');

  return (
    <div className="text-left space-y-8">
      {/* Page Title */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Platform Administration Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global governance: editorial approvals, course publishing, verified orders, and academic safety
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/courses">
            <Button variant="primary" size="sm">
              Manage Courses
            </Button>
          </Link>
          <Link to="/admin/course-reviews">
            <Button variant="outline" size="sm">
              Review Queue ({pendingCourses.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Completed Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-950 tabular-nums">
            {dbStats.totalOrders}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Curriculum order receipts</div>
        </div>

        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Platform Net Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-950 tabular-nums">
            ₹{dbStats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 font-semibold">100% Retained Platform Intake</div>
        </div>

        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Catalog Masterclasses</span>
            <BookOpen className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-950 tabular-nums">
            {dbStats.totalCourses}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">{dbStats.publishedCourses} live on storefront</div>
        </div>

        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Registered Learners</span>
            <Users className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-950 tabular-nums">
            {dbStats.totalStudents || dbStats.totalUsers}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Verified platform student accounts</div>
        </div>
      </div>

      {/* Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Pending Courses Approval Queue */}
        <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
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

        {/* Live Catalog Snapshot */}
        <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900">
              Live Storefront Courses ({courses.length})
            </h2>
            <Link to="/admin/courses" className="text-emerald-800 hover:underline font-semibold text-[11px]">
              Manage Catalog &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {courses.slice(0, 3).map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={c.thumbnail} alt={c.title} className="w-12 h-8 rounded object-cover border border-slate-200" />
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-xs">{c.title}</div>
                    <div className="text-[11px] text-slate-500">₹{Number(c.price).toLocaleString('en-IN')} · {c.level}</div>
                  </div>
                </div>
                <Badge variant={c.status === 'published' ? 'success' : 'neutral'}>
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
