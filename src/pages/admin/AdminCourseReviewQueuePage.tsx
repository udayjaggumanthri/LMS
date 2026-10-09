import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Eye, FileText, Check, X } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Course } from '../../types';

export const AdminCourseReviewQueuePage: React.FC = () => {
  const { courses, updateCourseStatus } = useCourses();
  const [selectedCourseForInspect, setSelectedCourseForInspect] = useState<Course | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackModalCourseId, setFeedbackModalCourseId] = useState<string | null>(null);

  const reviewQueueCourses = courses.filter(
    c => c.status === 'in_review' || c.status === 'changes_requested'
  );

  const handleApprove = (courseId: string) => {
    updateCourseStatus(courseId, 'published');
  };

  const handleRequestChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalCourseId) return;
    updateCourseStatus(feedbackModalCourseId, 'changes_requested', feedbackNotes || 'Please add more hands-on code examples in Section 2.');
    setFeedbackModalCourseId(null);
    setFeedbackNotes('');
  };

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Course Editorial Review Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect newly submitted course syllabi, verify code repository availability, and approve publication to catalog
        </p>
      </div>

      <div className="space-y-4">
        {reviewQueueCourses.length > 0 ? (
          reviewQueueCourses.map((course) => (
            <div
              key={course.id}
              className="p-6 border border-slate-200 rounded bg-white flex flex-col md:flex-row items-start justify-between gap-6 text-xs"
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
                    <span className="text-slate-400 font-semibold">{course.subcategory} · {course.level}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{course.title}</h3>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{course.subtitle}</p>

                  <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1">
                    <span>{course.curriculum.length} Sections</span>
                    <span>·</span>
                    <span>{course.lectureCount} Lectures</span>
                    <span>·</span>
                    <span>{course.durationHours} Hours</span>
                    <span>·</span>
                    <strong className="text-slate-900 tabular-nums">
                      {course.isFree ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                    </strong>
                  </div>

                  {course.reviewFeedback && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                      <strong>Current Reviewer Feedback:</strong> {course.reviewFeedback}
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
                  Inspect Syllabus
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
          <div className="p-12 text-center border border-dashed border-slate-200 rounded bg-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Review Queue Empty</h3>
            <p className="text-xs text-slate-500 mt-1">All instructor submissions have been audited and decided.</p>
          </div>
        )}
      </div>

      {/* Inspect Syllabus Modal */}
      {selectedCourseForInspect && (
        <Modal
          isOpen={!!selectedCourseForInspect}
          onClose={() => setSelectedCourseForInspect(null)}
          title={`Audit Syllabus: ${selectedCourseForInspect.title}`}
          size="lg"
        >
          <div className="space-y-4 text-xs text-slate-800 max-h-[70vh] overflow-y-auto">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">Description</h4>
              <p className="leading-relaxed whitespace-pre-line">{selectedCourseForInspect.description}</p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2">Curriculum Breakdown</h4>
              <div className="space-y-2">
                {selectedCourseForInspect.curriculum.map((sec, i) => (
                  <div key={sec.id} className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-slate-900 mb-1.5">{sec.title}</div>
                    <ul className="space-y-1 text-slate-600 pl-2">
                      {sec.lectures.map((l) => (
                        <li key={l.id} className="flex justify-between text-[11px]">
                          <span>• {l.title} ({l.type})</span>
                          <span className="tabular-nums text-slate-400">{l.durationMinutes}m</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
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
      <Modal
        isOpen={!!feedbackModalCourseId}
        onClose={() => setFeedbackModalCourseId(null)}
        title="Request Curriculum Revisions"
        size="md"
      >
        <form onSubmit={handleRequestChanges} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Revision Feedback for Instructor
            </label>
            <textarea
              required
              rows={4}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. Please add downloadable Dockerfile exercises for Section 3 before final approval..."
              className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setFeedbackModalCourseId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Send Revision Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
