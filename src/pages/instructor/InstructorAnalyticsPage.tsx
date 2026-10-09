import React from 'react';
import { TrendingUp, Users, Eye, ShoppingCart, Award } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const InstructorAnalyticsPage: React.FC = () => {
  const { courses } = useCourses();
  const { currentUser } = useAuth();

  const myCourses = courses.filter(
    c => c.instructorId === currentUser?.id || c.instructorId === 'inst-7'
  );

  return (
    <div className="text-left space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Performance Analytics & Conversion Funnel
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor course traffic views, syllabus conversion rates, and student completion milestones
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Total Syllabus Views
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">142,800</div>
          <div className="mt-2 text-[11px] text-emerald-800 font-semibold">+18.4% this quarter</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Visitors to Enrollment Conversion
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">11.5%</div>
          <div className="mt-2 text-[11px] text-slate-500">Industry benchmark: 4.2%</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Course Completion Rate
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">64.2%</div>
          <div className="mt-2 text-[11px] text-emerald-800 font-semibold">High learner engagement</div>
        </div>

        <div className="p-5 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Certificates Awarded
          </div>
          <div className="text-2xl font-bold font-display text-emerald-900 tabular-nums">12,410</div>
          <div className="mt-2 text-[11px] text-slate-500">Passed technical assessments</div>
        </div>
      </div>

      {/* Course Revenue & Performance Table */}
      <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
          Course Performance Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Course Title</th>
                <th className="py-2.5 px-3 text-right">Students</th>
                <th className="py-2.5 px-3 text-right">Gross GMV</th>
                <th className="py-2.5 px-3 text-right">Net Revenue (85%)</th>
                <th className="py-2.5 px-3 text-center">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myCourses.map((c) => {
                const gross = c.studentCount * c.price;
                const net = Math.round(gross * 0.85);
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900 truncate max-w-sm">{c.title}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{c.studentCount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium">₹{gross.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-emerald-900">₹{net.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-center tabular-nums text-amber-900 font-bold">★ {c.rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
