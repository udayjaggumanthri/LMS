import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Trash2
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { CourseManagementCard } from '../../components/courses/CourseManagementCard';
import { courseFacultyIds, userTeachesCourse } from '../../utils/courseFaculty';
import { Course, CourseStatus } from '../../types';
import { apiErrorMessage } from '../../api/client';

export const InstructorCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, categories, deleteCourse, updateCourse, updateCourseStatus, addCourse } = useCourses();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  // Filters State matching Reference Screenshot 1
  const [searchQuery, setSearchQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Confirmation Modal
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // All courses belonging to instructor or admin
  const availableCourses = useMemo(() => {
    return courses.filter(
      c => currentUser?.role === 'admin' || userTeachesCourse(c, currentUser?.id)
    );
  }, [courses, currentUser]);

  // Distinct authors
  const distinctAuthors = useMemo(() => {
    const map = new Map<string, string>();
    availableCourses.forEach(c => {
      const people = c.instructors?.length
        ? c.instructors
        : [{ id: String(c.instructorId), name: c.instructor?.name || 'Instructor' }];
      people.forEach((person) => map.set(String(person.id), person.name));
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [availableCourses]);

  // Filtered List
  const filteredCourses = useMemo(() => {
    return availableCourses.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesSub = c.subcategory?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub) return false;
      }
      // Author
      if (authorFilter !== 'all') {
        const authorMatch = courseFacultyIds(c).includes(authorFilter) || (c.instructor?.name === authorFilter);
        if (!authorMatch) return false;
      }
      // Category
      if (categoryFilter !== 'all') {
        if (String(c.categoryId) !== categoryFilter && c.subcategory !== categoryFilter) return false;
      }
      // Status
      if (statusFilter !== 'all') {
        if (c.status !== statusFilter) return false;
      }
      return true;
    });
  }, [availableCourses, searchQuery, authorFilter, categoryFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setAuthorFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const handleHomepageToggle = async (course: Course) => {
    try {
      await updateCourse(course.id, { featured: !course.featured });
      showToast(!course.featured ? `"${course.title}" is on the homepage.` : `"${course.title}" was removed from the homepage.`, 'success');
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not update the homepage setting.'), 'error');
    }
  };

  const handlePublishToggle = async (course: Course) => {
    const nextStatus: CourseStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await updateCourseStatus(course.id, nextStatus);
      showToast(
        nextStatus === 'published'
          ? `Course "${course.title}" is now Live!`
          : `Course "${course.title}" reverted to Draft.`,
        'success'
      );
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not update this course.'), 'error');
    }
  };

  const handleDuplicateCourse = async (course: Course) => {
    const duplicatedData = {
      ...course,
      title: `${course.title} (Copy)`,
      slug: `${course.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft' as CourseStatus,
      studentCount: 0,
      rating: 0,
      reviewsCount: 0,
      curriculum: course.curriculum || [],
    };
    delete (duplicatedData as any).id;
    try {
      await addCourse(duplicatedData as any);
      showToast('Course duplicated into a draft.', 'success');
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not duplicate this course.'), 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourse(courseToDelete.id);
      showToast(`Course "${courseToDelete.title}" deleted.`, 'info');
      setCourseToDelete(null);
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not delete this course.'), 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-950">
            Courses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your masterclasses, curriculum structures, enrollments, and live status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/instructor/courses/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Course</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar (Inspired directly by Screenshot 1) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input (4 cols) */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, keyword..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Author Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="all">All Authors</option>
              {distinctAuthors.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="lg:col-span-3">
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

          {/* Reset Action (2 cols) */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
            </select>

            {(searchQuery || authorFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
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
        {filteredCourses.map(course => (
          <CourseManagementCard
            key={course.id}
            course={course}
            editUrl={`/instructor/courses/${course.id}/edit`}
            onEdit={() => navigate(`/instructor/courses/${course.id}/edit`)}
            onDelete={() => setCourseToDelete(course)}
            onPublishToggle={handlePublishToggle}
            onHomepageToggle={handleHomepageToggle}
            onDuplicate={handleDuplicateCourse}
          />
        ))}

        {filteredCourses.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No courses found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              No masterclasses match your current filter criteria. Try resetting filters or add a new course.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Masterclass?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">"{courseToDelete.title}"</strong>? This will remove its curriculum, lectures, and resources permanently.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
