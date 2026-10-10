import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  BarChart3,
  BookOpen,
  HelpCircle,
  Users,
  MoreVertical,
  Edit3,
  Eye,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Course } from '../../types';

interface CourseManagementCardProps {
  course: Course;
  categoryName?: string;
  authorName?: string;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onPublishToggle?: (course: Course) => void;
  onDuplicate?: (course: Course) => void;
  editUrl?: string;
}

export const CourseManagementCard: React.FC<CourseManagementCardProps> = ({
  course,
  categoryName,
  authorName,
  onEdit,
  onDelete,
  onPublishToggle,
  onDuplicate,
  editUrl,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const instructorDisplay = authorName || course.instructor?.name || 'admin';
  const categoryDisplay = categoryName || course.subcategory || 'Artificial Intelligence';

  // Format currency
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const durationWeeks = course.durationWeeks || (course.durationHours > 0 ? Math.max(1, Math.round(course.durationHours / 4)) : 10);
  const quizzesCount = course.settings?.quizCount ?? 0;

  const targetEditUrl = editUrl || `/instructor/courses/${course.id}/edit`;

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col md:flex-row gap-5 items-stretch text-left">
      {/* Thumbnail Container */}
      <div className="relative w-full md:w-64 lg:w-72 aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-100 shrink-0">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
          }}
        />
        {course.featured && (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold tracking-wide flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            <span>Featured</span>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Top Title & Metadata */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                to={targetEditUrl}
                className="text-base sm:text-lg font-bold text-slate-900 hover:text-purple-700 transition-colors line-clamp-2 tracking-tight"
                title={course.title}
              >
                {course.title}
              </Link>

              {/* Author & Categories subtitle */}
              <p className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                <span>by <strong className="text-slate-700 font-semibold">{instructorDisplay}</strong></span>
                <span>in</span>
                <span className="inline-flex items-center text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                  {categoryDisplay}
                </span>
              </p>
            </div>

            {/* Edit Button & Context Menu */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onEdit) onEdit(course);
                  else navigate(targetEditUrl);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      to={`/student/course/${course.id}`}
                      target="_blank"
                      className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview Live</span>
                    </Link>

                    {onPublishToggle && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onPublishToggle(course);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{course.status === 'published' ? 'Unpublish to Draft' : 'Publish to Live'}</span>
                      </button>
                    )}

                    {onDuplicate && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDuplicate(course);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Duplicate Course</span>
                      </button>
                    )}

                    {onDelete && (
                      <>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onDelete(course);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-50 text-rose-600 text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Course</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Chips: Duration, Level, Lessons, Quizzes, Students */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-150">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{durationWeeks} Weeks</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-150">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{course.level || 'All levels'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-150">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>{course.lectureCount || (course.curriculum?.reduce((acc, s) => acc + (s.lectures?.length || 0), 0) || 0)} Lessons</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-150">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{quizzesCount} Quizzes</span>
            </span>

            <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-150">
              <Users className="w-3.5 h-3.5 text-violet-500" />
              <span>{course.studentCount.toLocaleString('en-IN')} Students</span>
            </span>
          </div>
        </div>

        {/* Bottom Bar: Price, Status Pill, Last Updated */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Pricing & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              {course.originalPrice > course.price && !course.isFree && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatINR(course.originalPrice)}
                </span>
              )}
              <span className="text-base sm:text-lg font-extrabold text-rose-600 tabular-nums tracking-tight">
                {course.isFree ? 'Free' : formatINR(course.price)}
              </span>
            </div>

            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                course.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : course.status === 'in_review'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : course.status === 'changes_requested'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {course.status === 'published'
                ? 'Published'
                : course.status === 'in_review'
                ? 'In Review'
                : course.status === 'changes_requested'
                ? 'Changes Requested'
                : 'Draft'}
            </span>
          </div>

          {/* Timestamp */}
          <div className="text-[11px] text-slate-400">
            Last Updated on {course.lastUpdated || 'recently'}
          </div>
        </div>
      </div>
    </div>
  );
};
