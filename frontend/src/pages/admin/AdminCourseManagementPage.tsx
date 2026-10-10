import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Trash2,
  RotateCcw,
  Users,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { CourseManagementCard } from '../../components/courses/CourseManagementCard';
import { Course, CourseStatus } from '../../types';

export const AdminCourseManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, categories, addCourse, updateCourse, deleteCourse, updateCourseStatus } = useCourses();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);

  const publishedCount = courses.filter(c => c.status === 'published').length;
  const inReviewCount = courses.filter(c => c.status === 'in_review').length;
  const draftCount = courses.filter(c => c.status === 'draft').length;
  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);

  const filtered = useMemo(() => {
    return courses.filter(c => {
      if (categoryFilter !== 'all') {
        if (String(c.categoryId) !== categoryFilter && c.subcategory !== categoryFilter) return false;
      }
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.subcategory?.toLowerCase().includes(q) ||
          c.level?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [courses, categoryFilter, statusFilter, searchTerm]);

  const handlePublishToggle = (course: Course) => {
    const nextStatus: CourseStatus = course.status === 'published' ? 'draft' : 'published';
    updateCourseStatus(course.id, nextStatus);
    showToast(
      nextStatus === 'published'
        ? `Masterclass "${course.title}" is now Live on the public Storefront!`
        : `Course "${course.title}" reverted to Draft status.`,
      'success'
    );
  };

  const handleDuplicateCourse = (course: Course) => {
    const duplicate = {
      ...course,
      title: `${course.title} (Admin Copy)`,
      slug: `${course.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft' as CourseStatus,
      studentCount: 0,
      rating: 0,
      reviewsCount: 0,
    };
    delete (duplicate as any).id;
    addCourse(duplicate as any);
    showToast(`Masterclass duplicated into a draft.`, 'success');
  };

  const handleDeleteConfirmed = () => {
    if (!deleteConfirmCourse) return;
    deleteCourse(deleteConfirmCourse.id);
    showToast(`Course "${deleteConfirmCourse.title}" was removed from catalog.`, 'info');
    setDeleteConfirmCourse(null);
  };

  return (
    <div className="text-left space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-950">
            Catalog Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global catalog management: create, publish, and structure masterclasses and enterprise curricula.
          </p>
        </div>

        <Link
          to="/admin/courses/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4" />
          <span>Create & Publish Course</span>
        </Link>
      </div>

      {/* KPI Metric Cards (Matching Screenshot 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Courses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {courses.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across {categories.length} faculties</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Published Courses</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {publishedCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Live on storefront</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Drafts / In Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {draftCount + inReviewCount}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">{inReviewCount} pending review</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tabular-nums">
            {totalStudents.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active learners</div>
        </div>
      </div>

      {/* Filter Bar (Matching Screenshot 1) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input (5 cols) */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search catalog by title, faculty, or level..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Category Dropdown (4 cols) */}
          <div className="lg:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown & Reset (3 cols) */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="changes_requested">Changes Requested</option>
            </select>

            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Courses Feed (Card Stack Layout) */}
      <div className="space-y-4">
        {filtered.map(course => (
          <CourseManagementCard
            key={course.id}
            course={course}
            editUrl={`/admin/courses/${course.id}/edit`}
            onEdit={() => navigate(`/admin/courses/${course.id}/edit`)}
            onDelete={() => setDeleteConfirmCourse(course)}
            onPublishToggle={handlePublishToggle}
            onDuplicate={handleDuplicateCourse}
          />
        ))}

        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No courses match filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Adjust search keywords or category filters to locate courses.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Masterclass?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">"{deleteConfirmCourse.title}"</strong>? This will permanently remove its curriculum, lectures, and resources from the platform.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
