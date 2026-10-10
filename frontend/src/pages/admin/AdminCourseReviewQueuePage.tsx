import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Check,
  X,
  Clock,
  Filter,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Course } from '../../types';

export const AdminCourseReviewQueuePage: React.FC = () => {
  const { courses, updateCourseStatus } = useCourses();
  const { showToast } = useNotifications();

  const [selectedCourseForInspect, setSelectedCourseForInspect] = useState<Course | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackModalCourseId, setFeedbackModalCourseId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_review' | 'changes_requested'>('all');

  const inReviewCount = useMemo(() => courses.filter(c => c.status === 'in_review').length, [courses]);
  const changesRequestedCount = useMemo(() => courses.filter(c => c.status === 'changes_requested').length, [courses]);
  const publishedCount = useMemo(() => courses.filter(c => c.status === 'published').length, [courses]);

  const reviewQueueCourses = useMemo(() => {
    return courses.filter(c => {
      if (c.status !== 'in_review' && c.status !== 'changes_requested') return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      return true;
    });
  }, [courses, statusFilter]);

  const handleApprove = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    updateCourseStatus(courseId, 'published');
    showToast('success', `"${course?.title || 'Course'}" has been approved and published to the live marketplace!`);
  };

  const handleRequestChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalCourseId) return;
    const course = courses.find(c => c.id === feedbackModalCourseId);
    const feedback = feedbackNotes.trim() || 'Please add more hands-on code examples in Section 2.';
    updateCourseStatus(feedbackModalCourseId, 'changes_requested', feedback);
    showToast('warning', `Revisions requested for "${course?.title || 'Course'}". Instructor notified.`);
    setFeedbackModalCourseId(null);
    setFeedbackNotes('');
  };

  return (
    <div className="text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Course Editorial Review Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect newly submitted course syllabi, verify code repository availability, and approve publication to catalog
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-600">{inReviewCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting editorial sign-off</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Changes Requested</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-display text-rose-600">{changesRequestedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting instructor revisions</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Published Catalog</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-800">{publishedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live courses on marketplace</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Review SLA</span>
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">&lt; 24h</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Average decision turnaround</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <span className="font-semibold text-slate-500 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" />
          Queue Filter:
        </span>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded transition-colors ${
            statusFilter === 'all'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Queue ({inReviewCount + changesRequestedCount})
        </button>
        <button
          onClick={() => setStatusFilter('in_review')}
          className={`px-3 py-1 rounded transition-colors ${
            statusFilter === 'in_review'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          In Review ({inReviewCount})
        </button>
        <button
          onClick={() => setStatusFilter('changes_requested')}
          className={`px-3 py-1 rounded transition-colors ${
            statusFilter === 'changes_requested'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Changes Requested ({changesRequestedCount})
        </button>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {reviewQueueCourses.length > 0 ? (
          reviewQueueCourses.map((course) => (
            <div
              key={course.id}
              className="p-6 border border-slate-200 rounded-lg bg-white flex flex-col md:flex-row items-start justify-between gap-6 text-xs hover:border-slate-300 transition-all shadow-xs"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-28 aspect-video rounded object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={course.status === 'in_review' ? 'warning' : 'danger'}>
                      {course.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-slate-400 font-semibold">{course.subcategory} &bull; {course.level}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 font-display">{course.title}</h3>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{course.subtitle}</p>

                  <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1">
                    <span>{course.curriculum.length} Sections</span>
                    <span>&bull;</span>
                    <span>{course.lectureCount} Lectures</span>
                    <span>&bull;</span>
                    <span>{course.durationHours} Hours</span>
                    <span>&bull;</span>
                    <strong className="text-slate-900 tabular-nums">
                      {course.isFree ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                    </strong>
                  </div>

                  {course.reviewFeedback && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                      <strong>Current Reviewer Note:</strong> {course.reviewFeedback}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedCourseForInspect(course)}
                >
                  Audit Syllabus
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  onClick={() => handleApprove(course.id)}
                >
                  Approve & Publish
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setFeedbackModalCourseId(course.id);
                    setFeedbackNotes(course.reviewFeedback || '');
                  }}
                >
                  Request Changes
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center border border-dashed border-slate-200 rounded-lg bg-white max-w-lg mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base font-display">Editorial Queue Clear</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              All submitted masterclass curricula have been audited and decided. New submissions will automatically surface here.
            </p>
          </div>
        )}
      </div>

      {/* Inspect Syllabus Modal */}
      {selectedCourseForInspect && (
        <Modal
          isOpen={!!selectedCourseForInspect}
          onClose={() => setSelectedCourseForInspect(null)}
          title={`Audit Curriculum: ${selectedCourseForInspect.title}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-800 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">Course Description & Outcomes</h4>
              <p className="leading-relaxed whitespace-pre-line text-slate-700">{selectedCourseForInspect.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Instructor</span>
                <span className="font-semibold text-slate-900">
                  {typeof selectedCourseForInspect.instructor === 'object' && selectedCourseForInspect.instructor?.name
                    ? selectedCourseForInspect.instructor.name
                    : 'Faculty Member'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Tuition Price</span>
                <span className="font-semibold text-slate-900">
                  {selectedCourseForInspect.isFree ? 'Free Access' : `₹${selectedCourseForInspect.price.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2">Curriculum Breakdown</h4>
              <div className="space-y-2">
                {selectedCourseForInspect.curriculum.map((sec) => (
                  <div key={sec.id} className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                      <span>{sec.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{sec.lectures.length} lessons</span>
                    </div>
                    <ul className="space-y-1 text-slate-600 pl-2">
                      {sec.lectures.map((l) => (
                        <li key={l.id} className="flex justify-between text-[11px]">
                          <span>&bull; {l.title} ({l.type})</span>
                          <span className="tabular-nums text-slate-400">{l.durationMinutes}m</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedCourseForInspect(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleApprove(selectedCourseForInspect.id);
                  setSelectedCourseForInspect(null);
                }}
              >
                Approve & Publish to Storefront &rarr;
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Request Changes Modal */}
      {feedbackModalCourseId && (
        <Modal
          isOpen={!!feedbackModalCourseId}
          onClose={() => setFeedbackModalCourseId(null)}
          title="Request Curriculum Revisions"
          size="md"
        >
          <form onSubmit={handleRequestChanges} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Specific Revision Directives for Instructor
              </label>
              <textarea
                required
                rows={4}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="e.g. Please verify that the GitHub starter repository link in Section 2 is public, and add Dockerfile exercises before approval..."
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setFeedbackModalCourseId(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Send Revision Notice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
