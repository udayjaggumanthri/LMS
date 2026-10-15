import React, { useState } from 'react';
import { TrendingUp, Users, Eye, ShoppingCart, Award, Download, ArrowUpRight, BarChart3, CheckCircle2 } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { userTeachesCourse } from '../../utils/courseFaculty';

export const InstructorAnalyticsPage: React.FC = () => {
  const { courses } = useCourses();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [dateRange, setDateRange] = useState('q3-2026');

  const myCourses = courses.filter(
    c => currentUser?.role === 'admin' || userTeachesCourse(c, currentUser?.id)
  );

  const totalStudents = myCourses.reduce((sum, c) => sum + c.studentCount, 0);

  const ratedCourses = myCourses.filter((c) => Number(c.reviewsCount) > 0);
  const averageRating = ratedCourses.length
    ? ratedCourses.reduce((sum, c) => sum + Number(c.rating || 0), 0) / ratedCourses.length
    : 0;

  const funnelSteps = [
    { label: 'Published courses', value: myCourses.length.toLocaleString('en-IN'), percent: myCourses.length ? 100 : 0 },
    { label: 'Enrolled students', value: totalStudents.toLocaleString('en-IN'), percent: totalStudents ? 100 : 0 },
  ];

  const handleExportCsv = () => {
    let csv = "data:text/csv;charset=utf-8,Course_Title,Students,Price_INR,Rating\n";
    myCourses.forEach(c => {
      csv += `"${c.title}",${c.studentCount},${c.price},${c.rating}\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `instructor-analytics-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', `Exported performance analytics CSV for ${dateRange.toUpperCase()}.`);
  };

  return (
    <div className="text-left space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Performance Analytics & Conversion Funnel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor course traffic views, syllabus conversion rates, and student completion milestones
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="q3-2026">Q3 2026 (July – September)</option>
            <option value="q2-2026">Q2 2026 (April – June)</option>
            <option value="ytd-2026">Year to Date 2026</option>
            <option value="all-time">All Time Cumulative</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Published courses
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tabular-nums">
            {myCourses.length.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Courses you can edit from this studio</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Total Enrolled Students
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tabular-nums">
            {totalStudents.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Across {myCourses.length} published courses</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Course Completion Rate
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tabular-nums">—</div>
          <div className="mt-2 text-[11px] text-slate-500">Available after learners finish lessons</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Average Student Rating
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-amber-900 tabular-nums">{averageRating ? averageRating.toFixed(2) : '—'}</div>
          <div className="mt-2 text-[11px] text-slate-500">From reviews on your courses</div>
        </div>
      </div>

      {/* Conversion Funnel Card */}
      <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
          Student Acquisition & Conversion Funnel
        </h3>
        <p className="text-xs text-slate-500">
          Tracks the visitor journey from marketplace search discovery to confirmed enrollment.
        </p>

        <div className="space-y-3 pt-2">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{step.label}</span>
                <span className="tabular-nums font-bold text-slate-900">{step.value}</span>
              </div>
              <div className="w-full bg-slate-100 rounded h-2 overflow-hidden">
                <div
                  className="bg-emerald-800 h-full rounded transition-all duration-300"
                  style={{ width: `${step.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Revenue & Performance Table */}
      <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
          Course Performance Breakdown ({myCourses.length} Syllabi)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Course Title</th>
                <th className="py-2.5 px-3 text-right">Students</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-center">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900 truncate max-w-sm">{c.title}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{c.studentCount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">₹{c.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-center tabular-nums text-amber-900 font-bold">★ {c.rating}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
