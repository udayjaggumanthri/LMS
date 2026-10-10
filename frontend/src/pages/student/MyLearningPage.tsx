import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, Award, BookOpen, Heart, Archive } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCourses } from '../../context/CourseContext';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { CourseCard } from '../../components/ui/CourseCard';

export const MyLearningPage: React.FC = () => {
  const { enrollments, getCourseProgressPercent } = useLearning();
  const { wishlistCourseIds } = useWishlist();
  const { courses } = useCourses();
  const [activeTab, setActiveTab] = useState<'all' | 'wishlist' | 'archived'>('all');

  const enrolledCourseIds = Object.keys(enrollments);
  const enrolledCourses = courses.filter(c => enrolledCourseIds.some(id => String(id) === String(c.id)));
  const wishlistedCourses = courses.filter(c => wishlistCourseIds.some(id => String(id) === String(c.id)));

  return (
    <div className="text-left space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            My Learning Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track course progress, resume active lectures, and review earned certificates
          </p>
        </div>

        <Tabs
          variant="segmented"
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as any)}
          tabs={[
            { id: 'all', label: 'All Courses', count: enrolledCourses.length },
            { id: 'wishlist', label: 'Wishlist', count: wishlistedCourses.length },
            { id: 'archived', label: 'Archived', count: 0 }
          ]}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'all' && (
        <div>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                const percent = getCourseProgressPercent(String(course.id));
                const progressData = enrollments[String(course.id)] || enrollments[course.id];
                const completedCount = progressData?.completedLectureIds?.length || 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white border border-slate-200 rounded overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      {/* Thumbnail */}
                      <Link to={`/student/course/${course.id}`} className="block aspect-video bg-slate-100 overflow-hidden relative group">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-10 h-10 text-white" />
                        </div>
                      </Link>

                      <div className="p-4 space-y-3">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {course.subcategory}
                        </div>
                        <Link
                          to={`/student/course/${course.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-900 line-clamp-2 block"
                        >
                          {course.title}
                        </Link>

                        {/* Progress Bar */}
                        <div className="pt-1">
                          <ProgressBar value={percent} size="sm" />
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="tabular-nums">{completedCount} of {course.lectureCount} lectures completed</span>
                            {percent === 100 && (
                              <span className="text-emerald-800 font-bold flex items-center gap-1">
                                <Award className="w-3 h-3" /> Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link to={`/student/course/${course.id}`} className="block">
                        <Button
                          variant={percent === 100 ? 'outline' : 'primary'}
                          size="sm"
                          className="w-full"
                          leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                        >
                          {percent === 0 ? 'Start Course' : percent === 100 ? 'Review Course' : 'Resume Learning'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-slate-200 rounded bg-white max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No active enrollments found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Browse our practical course catalog and start mastering in-demand skills today.
              </p>
              <div className="mt-4">
                <Link to="/courses">
                  <Button variant="primary" size="sm">
                    Browse 24+ Masterclasses &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          {wishlistedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-slate-200 rounded bg-white">
              <Heart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Your wishlist is currently empty.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'archived' && (
        <div className="p-12 text-center border border-dashed border-slate-200 rounded bg-white">
          <Archive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">You have no archived courses.</p>
        </div>
      )}
    </div>
  );
};
