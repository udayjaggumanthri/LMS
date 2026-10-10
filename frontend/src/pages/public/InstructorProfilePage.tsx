import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { CourseCard } from '../../components/ui/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export const InstructorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses } = useCourses();

  const matchingCourse = courses.find(c => String(c.instructorId) === String(id));
  const rawInstructor: any = typeof matchingCourse?.instructor === 'object' ? matchingCourse.instructor : null;

  const instructor = {
    id: id || '1',
    name: rawInstructor?.name || (rawInstructor as any)?.first_name ? `${(rawInstructor as any).first_name} ${(rawInstructor as any).last_name || ''}`.trim() : 'Instructor Faculty',
    avatar: rawInstructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    title: rawInstructor?.title || 'Principal Distributed Systems Engineer',
    bio: rawInstructor?.bio || 'Practitioner delivering production-grade engineering curricula.',
    rating: rawInstructor?.rating || 4.9,
    studentsCount: (rawInstructor as any)?.students_count || 42000,
    reviewsCount: (rawInstructor as any)?.reviews_count || 3800
  };

  const instructorCourses = courses.filter(c => String(c.instructorId) === String(id) && c.status === 'published');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Instructors', href: '/teach' },
          { label: instructor.name }
        ]}
        className="mb-6"
      />

      {/* Instructor Hero Banner */}
      <div className="p-5 sm:p-8 border border-slate-200 rounded bg-slate-50 mb-10">
        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded object-cover border border-slate-200 shrink-0"
          />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Instructor Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">
              {instructor.name}
            </h1>
            <p className="mt-1 text-sm text-slate-700 font-medium">{instructor.title}</p>

            <div className="mt-4 flex items-center gap-4 sm:gap-6 text-xs text-slate-600 flex-wrap">
              <div>
                <strong className="text-slate-900 font-bold text-base tabular-nums">
                  {instructor.rating || 4.9}
                </strong>
                <span className="text-slate-500 ml-1">Instructor Rating</span>
              </div>
              <div className="border-l border-slate-200 pl-4 sm:pl-6">
                <strong className="text-slate-900 font-bold text-base tabular-nums">
                  {instructor.studentsCount?.toLocaleString('en-IN') || '40,000+'}
                </strong>
                <span className="text-slate-500 ml-1">Total Learners</span>
              </div>
              <div className="border-l border-slate-200 pl-4 sm:pl-6">
                <strong className="text-slate-900 font-bold text-base tabular-nums">
                  {instructorCourses.length}
                </strong>
                <span className="text-slate-500 ml-1">Courses Published</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-700 leading-relaxed max-w-3xl border-t border-slate-200/80 pt-4">
              {instructor.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Instructor Courses List */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-6">
          Courses Taught by {instructor.name} ({instructorCourses.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructorCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </div>
  );
};
