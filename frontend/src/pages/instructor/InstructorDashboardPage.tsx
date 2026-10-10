import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  GraduationCap,
  PlusCircle,
  FileText,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Star,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { CourseManagementCard } from '../../components/courses/CourseManagementCard';

export const InstructorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, qaQuestions, reviews } = useCourses();

  const myCourses = courses.filter(
    c => String(c.instructorId) === String(currentUser?.id) || currentUser?.role === 'admin'
  );

  const publishedCourses = myCourses.filter(c => c.status === 'published');
  const pendingCourses = myCourses.filter(c => c.status === 'in_review' || c.status === 'changes_requested');
  const totalStudents = myCourses.reduce((sum, c) => sum + (c.studentCount || 0), 0);

  const recentCourses = myCourses.slice(0, 3);

  return (
    <div className="text-left space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {currentUser?.name || 'Instructor'}. Overview of your academic programs and learner progress.
          </p>
        </div>

        <Link
          to="/instructor/courses/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Course</span>
        </Link>
      </div>

      {/* 5 KPI Cards Strip (Exact layout from Screenshot 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. Total Courses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Courses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {myCourses.length}
          </div>
        </div>

        {/* 2. Published Courses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Published</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {publishedCourses.length}
          </div>
        </div>

        {/* 3. Pending Courses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {pendingCourses.length}
          </div>
        </div>

        {/* 4. Total Students */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {totalStudents.toLocaleString('en-IN')}
          </div>
        </div>

        {/* 5. Rating & Inquiries */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Instructor Rating</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-amber-900 tabular-nums">
            {currentUser?.rating || 5.0} ★
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Matching Screenshot 5) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/instructor/courses/new"
            className="p-3.5 rounded-xl border border-rose-150 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center gap-3 text-rose-900 group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 group-hover:bg-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold">Create Course</div>
              <div className="text-[10px] text-rose-700/80 truncate">New Masterclass</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (myCourses.length > 0) {
                navigate(`/instructor/courses/${myCourses[0].id}/edit`);
              } else {
                navigate('/instructor/courses/new');
              }
            }}
            className="p-3.5 rounded-xl border border-indigo-150 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-3 text-indigo-900 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold">Create Lesson</div>
              <div className="text-[10px] text-indigo-700/80 truncate">Add to Curriculum</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (myCourses.length > 0) {
                navigate(`/instructor/courses/${myCourses[0].id}/edit`);
              } else {
                navigate('/instructor/courses/new');
              }
            }}
            className="p-3.5 rounded-xl border border-amber-150 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 transition-all flex items-center gap-3 text-amber-900 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 group-hover:bg-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold">Create Quiz</div>
              <div className="text-[10px] text-amber-700/80 truncate">Interactive Quiz</div>
            </div>
          </button>

          <Link
            to="/instructor/qa"
            className="p-3.5 rounded-xl border border-cyan-150 bg-cyan-50/50 hover:bg-cyan-50 hover:border-cyan-300 transition-all flex items-center gap-3 text-cyan-900 group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-100 group-hover:bg-cyan-200 text-cyan-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold">Q&A Inbox</div>
              <div className="text-[10px] text-cyan-700/80 truncate">{qaQuestions.length} Student Questions</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Courses Section (Matching Screenshot 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Courses</h2>
          <Link
            to="/instructor/courses"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentCourses.map(course => (
            <CourseManagementCard
              key={course.id}
              course={course}
              editUrl={`/instructor/courses/${course.id}/edit`}
              onEdit={() => navigate(`/instructor/courses/${course.id}/edit`)}
            />
          ))}

          {recentCourses.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
              No courses created yet. Click "Add New Course" above to create your first masterclass!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
