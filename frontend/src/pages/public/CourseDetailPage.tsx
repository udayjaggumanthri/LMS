import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  BarChart2,
  Globe,
  Calendar,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  Download,
  ShieldCheck,
  Award,
  Infinity,
  Heart,
  Share2,
  Tag,
  Star,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  Linkedin
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { CartAuthError, useCart } from '../../context/CartContext';
import { apiErrorMessage } from '../../api/client';
import { useWishlist } from '../../context/WishlistContext';
import { useLearning } from '../../context/LearningContext';
import { orderService } from '../../api/orderService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Rating } from '../../components/ui/Rating';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Accordion } from '../../components/ui/Accordion';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Avatar } from '../../components/ui/Avatar';
import { CourseCard } from '../../components/ui/CourseCard';
import { CourseCover } from '../../components/courses/CourseCover';
import { Modal } from '../../components/ui/Modal';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courses, getCourseBySlug, fetchCourseBySlug, reviews, qaQuestions } = useCourses();
  const { addToCart, isInCart, applyCoupon } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isEnrolled, refreshLearning } = useLearning();
  const { showToast } = useNotifications();

  const [couponCode, setCouponCode] = useState('');
  const [registering, setRegistering] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ success?: boolean; text?: string } | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPreviewVideo, setSelectedPreviewVideo] = useState<string | null>(null);
  const [reviewFilterRating, setReviewFilterRating] = useState<number>(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cachedCourse = getCourseBySlug(slug || '');
  const [asyncCourse, setAsyncCourse] = useState<any>(null);
  const course = asyncCourse || cachedCourse;
  const [isLoadingCourse, setIsLoadingCourse] = useState<boolean>(!course);

  React.useEffect(() => {
    if (slug) {
      if (!course || !course.curriculum || course.curriculum.length === 0) {
        if (!course) setIsLoadingCourse(true);
        fetchCourseBySlug(slug)
          .then((c) => {
            if (c) setAsyncCourse(c);
          })
          .catch(() => {})
          .finally(() => setIsLoadingCourse(false));
      } else {
        setIsLoadingCourse(false);
      }
    }
  }, [slug]);

  if (isLoadingCourse && !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-900">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-base font-bold font-display">Loading Course Syllabus...</h2>
        <p className="mt-1 text-xs text-slate-500">Retrieving curriculum, modules, and instructor profile...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-900">
        <h2 className="text-xl font-bold font-display">Course Not Found</h2>
        <p className="mt-2 text-xs text-slate-500">The syllabus you are looking for does not exist or has been unpublished.</p>
        <Link to="/courses" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Browse Catalog &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  const instructor = course.instructor || {
    id: course.instructorId,
    name: (course as any).instructorName || (course as any).author || 'Prajnadhara Faculty',
    title: (course as any).instructorTitle || 'Course Instructor',
    bio: (course as any).instructorBio || 'Subject matter expert and industry practitioner.',
    avatar: (course as any).instructorAvatar || '',
    rating: course.rating || 0,
    studentsCount: course.studentCount || 0,
    reviewsCount: course.reviewsCount || 0
  };
  const instructorName = instructor?.name || 'Prajnadhara Instructor';
  const teachingTeam = (course.instructors && course.instructors.length > 0)
    ? course.instructors
    : [{ id: String(course.instructorId || ''), name: instructorName, title: instructor?.title || '' }];
  const enrolled = isEnrolled(course.id);
  const isFreeCourse = Boolean(course.isFree) || Number(course.price) === 0;
  const inCart = isInCart(course.id);
  const wishlisted = isInWishlist(course.id);

  const courseCurriculum = Array.isArray(course.curriculum) ? course.curriculum : [];
  const courseBadges = Array.isArray(course.badges) ? course.badges : [];
  const whatYouWillLearn = Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn : [];
  const requirements = Array.isArray(course.requirements) ? course.requirements : [];
  const targetAudience = Array.isArray(course.targetAudience) ? course.targetAudience : [];
  const keyFeatures = Array.isArray(course.settings?.keyFeatures) ? course.settings.keyFeatures : [];
  const faqs = Array.isArray(course.settings?.faqs) ? course.settings.faqs : [];
  const lengthLabel = (course.durationHours || 0) > 0
    ? `${course.durationHours} hours`
    : (course.durationWeeks || 0) > 0
      ? `${course.durationWeeks} weeks`
      : '';

  const courseReviews = reviews.filter(r => r.courseId === course.id);
  const courseQA = qaQuestions.filter(q => q.courseId === course.id);
  const relatedCourses = courses
    .filter(c => String(c.categoryId) === String(course.categoryId) && String(c.id) !== String(course.id) && c.status === 'published')
    .slice(0, 3);

  // Rating distribution
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  courseReviews.forEach(r => {
    const star = Math.floor(r.rating);
    if (ratingCounts[star] !== undefined) ratingCounts[star]++;
  });

  const totalReviewsCount = courseReviews.length || 1;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await applyCoupon(couponCode);
    setCouponMessage({ success: res.success, text: res.message });
  };

  const handleAddToCart = async () => {
    if (inCart) {
      navigate('/cart');
      return;
    }
    try {
      await addToCart(course.id);
      showToast('success', `Added "${course.title}" to your cart.`);
    } catch (err) {
      if (err instanceof CartAuthError) {
        navigate(`/signin?redirect=${encodeURIComponent(`/course/${course.slug}`)}`);
        return;
      }
      showToast('error', apiErrorMessage(err, 'Could not add this course to the cart.'));
    }
  };

  const handleRegisterFree = async () => {
    if (!currentUser) {
      navigate(`/signin?redirect=${encodeURIComponent(`/course/${course.slug}`)}`);
      return;
    }
    setRegistering(true);
    try {
      const result = await orderService.initiateToucanPayment({
        courseIds: [String(course.id)],
        name: currentUser.name,
        email: currentUser.email,
      });
      if ((result as { free?: boolean }).free) {
        await refreshLearning();
        navigate(`/student/course/${course.id}`);
        return;
      }
      showToast('error', 'This course could not be registered.');
    } catch (err) {
      showToast('error', apiErrorMessage(err, 'Could not register for this course.'));
    } finally {
      setRegistering(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!inCart) await addToCart(course.id);
      if (!currentUser) {
        navigate('/signin?redirect=/checkout');
        return;
      }
      navigate('/checkout');
    } catch (err) {
      if (err instanceof CartAuthError) {
        navigate('/signin?redirect=/checkout');
        return;
      }
      showToast('error', apiErrorMessage(err, 'Could not start checkout for this course.'));
    }
  };

  // Build curriculum accordion items
  const curriculumAccordionItems = courseCurriculum.map((section: any, secIndex: number) => {
    const lectures = Array.isArray(section.lectures) ? section.lectures : [];
    const totalMinutes = lectures.reduce((acc: number, l: any) => acc + (l.durationMinutes || 0), 0);
    return {
      id: section.id || `section-${secIndex}`,
      defaultOpen: secIndex === 0,
      title: (
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900">
          <span>{section.title}</span>
          <span className="text-[11px] font-normal text-slate-500 tabular-nums">
            {lectures.length} lectures · {totalMinutes}m
          </span>
        </div>
      ),
      content: (
        <div className="divide-y divide-slate-100">
          {lectures.length === 0 && (
            <p className="py-2.5 text-xs text-slate-500">Covered in live classes.</p>
          )}
          {lectures.map((lecture: any, lIdx: number) => (
            <div key={lecture.id || `lec-${lIdx}`} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                {lecture.type === 'video' && <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {lecture.type === 'article' && <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {lecture.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {lecture.type === 'resource' && <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <span className="font-medium text-slate-900">{lecture.title}</span>
              </div>
              <div className="flex items-center gap-3">
                {lecture.previewFree && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPreviewVideo(lecture.videoUrl || course.previewVideoUrl || '');
                      setPreviewModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline-offset-2 hover:underline"
                  >
                    Preview
                  </button>
                )}
                {(lecture.durationMinutes || 0) > 0 && (
                  <span className="text-slate-400 tabular-nums text-[11px]">
                    {lecture.durationMinutes}m
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    };
  });

  const filteredReviews = reviewFilterRating > 0
    ? courseReviews.filter(r => Math.floor(r.rating) === reviewFilterRating)
    : courseReviews;

  return (
    <div className="w-full text-slate-900 text-left">
      {/* 1. Header Banner / Overview */}
      <div className="bg-slate-950 text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              {/* Breadcrumbs */}
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Courses', href: '/courses' },
                  { label: course.subcategory || 'Course', href: `/courses?category=${course.categoryId}` },
                  { label: course.title }
                ]}
                className="mb-4 text-slate-400"
              />

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                {courseBadges.map((b: string) => (
                  <Badge
                    key={b}
                    variant={b === 'Bestseller' ? 'bestseller' : b === 'Highest rated' ? 'highest-rated' : 'new'}
                  >
                    {b}
                  </Badge>
                ))}
                <span className="text-xs text-slate-400 font-medium">{course.subcategory}</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight text-white leading-tight">
                {course.title}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {course.subtitle}
              </p>

              {/* Metadata strip */}
              <div className="mt-5 flex items-center gap-x-4 gap-y-2 flex-wrap text-xs text-slate-300">
                <Rating rating={course.rating || 0} reviewsCount={course.reviewsCount || 0} size="sm" />
                <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
                <span className="tabular-nums">{(course.studentCount || (course as any).studentsCount || 0).toLocaleString('en-IN')} students enrolled</span>
                <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
                <span>Created by {teachingTeam.map((person, index) => (
                  <React.Fragment key={person.id || person.name}>
                    {index > 0 ? ', ' : ''}
                    <Link to={`/instructor/${person.id}`} className="text-emerald-400 hover:underline font-semibold">{person.name}</Link>
                  </React.Fragment>
                ))}</span>
              </div>

              <div className="mt-3 flex items-center gap-x-4 gap-y-2 flex-wrap text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Last updated {course.lastUpdated || 'Recently'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>{course.language || 'English'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Certificate included</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Layout (Left Syllabus / Details + Right Sticky Purchase Card) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: What you'll learn, Curriculum, Requirements, Description, Instructor, Reviews */}
          <div className="lg:col-span-8 order-2 lg:order-1 space-y-8 sm:space-y-10">
            {/* What you'll learn card */}
            <div className="p-6 border border-slate-200 rounded bg-white">
              <h2 className="text-base font-bold font-display text-slate-900 mb-4">
                What you'll learn in this masterclass
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                {whatYouWillLearn.map((pt: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content / Curriculum Accordion */}
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    Course Curriculum
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {courseCurriculum.length} sections · {course.lectureCount || 0} lectures{lengthLabel ? ` · ${lengthLabel}` : ''}
                  </p>
                </div>
              </div>

              <Accordion items={curriculumAccordionItems} />
            </div>

            {/* Prerequisites & Requirements */}
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 mb-3">
                Requirements
              </h2>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                {requirements.map((req: string, i: number) => (
                  <li key={i} className="leading-relaxed">{req}</li>
                ))}
              </ul>
            </div>

            {targetAudience.length > 0 && (
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 mb-3">Who this is for</h2>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                  {targetAudience.map((item: string, i: number) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {keyFeatures.length > 0 && (
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 mb-3">Key features</h2>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
                  {keyFeatures.map((item: string, i: number) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {faqs.length > 0 && (
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 mb-3">Frequently asked questions</h2>
                <div className="space-y-3">
                  {faqs.map((item: { question?: string; answer?: string }, i: number) => (
                    <div key={i}>
                      <p className="text-xs font-bold text-slate-900">{item.question}</p>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed space-y-3">
              <h2 className="text-lg font-bold font-display text-slate-900 not-prose mb-3">
                Course Description
              </h2>
              <div className="whitespace-pre-line">{course.description || course.subtitle || ''}</div>
            </div>

            {/* Instructor Profile Card */}
            <div className="p-6 border border-slate-200 rounded bg-slate-50 space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {teachingTeam.length > 1 ? 'Instructors' : 'Lead Instructor'}
              </div>
              {teachingTeam.map((person, index) => (
              <div key={person.id || person.name} className="flex items-start gap-4">
                <Avatar name={person.name} size="lg" />
                <div>
                  <Link
                    to={`/instructor/${person.id}`}
                    className="text-base font-bold text-slate-900 hover:text-emerald-900"
                  >
                    {person.name}
                  </Link>
                  <p className="text-xs text-slate-600 mt-0.5">{person.title || (index === 0 ? instructor?.title : '')}</p>
                  {index === 0 && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <strong className="text-slate-900 tabular-nums">{instructor?.rating || 4.9}</strong> Instructor Rating
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums"><strong>{instructor?.studentsCount?.toLocaleString('en-IN') || '40,000+'}</strong> Students</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums"><strong>{instructor?.reviewsCount?.toLocaleString('en-IN') || '3,000+'}</strong> Reviews</span>
                  </div>
                  )}
                </div>
              </div>
              ))}
              {instructor?.bio ? (
              <p className="text-xs text-slate-700 leading-relaxed border-t border-slate-200/80 pt-3">
                {instructor.bio}
              </p>
              ) : null}
            </div>

            {/* Reviews Section & Rating Distribution */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-xl font-bold font-display text-slate-900 mb-6">
                Student Feedback & Reviews
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center p-6 border border-slate-200 rounded bg-white mb-6">
                <div className="sm:col-span-4 text-center sm:text-left sm:border-r sm:border-slate-100 sm:pr-6">
                  <div className="text-4xl font-bold font-display text-amber-900 tabular-nums">
                    {(course.rating || 0).toFixed(1)}
                  </div>
                  <div className="mt-1">
                    <Rating rating={course.rating || 0} showCount={false} size="md" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 tabular-nums">
                    Course Rating · {(course.reviewsCount || 0).toLocaleString()} reviews
                  </div>
                </div>

                {/* Rating Distribution Bars */}
                <div className="sm:col-span-8 space-y-1.5 text-xs text-slate-600">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star] || 0;
                    const pct = Math.round((count / totalReviewsCount) * 100);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFilterRating(prev => prev === star ? 0 : star)}
                        className={`flex items-center gap-3 w-full hover:bg-slate-50 p-0.5 rounded transition-colors ${
                          reviewFilterRating === star ? 'font-bold text-slate-900' : ''
                        }`}
                      >
                        <span className="w-12 text-left tabular-nums">{star} stars</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                          <div className="bg-amber-400 h-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right tabular-nums text-slate-400">{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Filter Notice */}
              {reviewFilterRating > 0 && (
                <div className="mb-4 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded">
                  <span>Filtered to show {reviewFilterRating}-star reviews only.</span>
                  <button onClick={() => setReviewFilterRating(0)} className="text-emerald-800 font-semibold underline">
                    Clear review filter
                  </button>
                </div>
              )}

              {/* Review Items List */}
              <div className="space-y-4">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="p-4 border border-slate-200 rounded bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={rev.userName} size="sm" />
                        <span className="font-semibold text-xs text-slate-900">{rev.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Rating rating={rev.rating} showCount={false} size="sm" />
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                    {rev.instructorReply && (
                      <div className="mt-3 p-3 bg-slate-50 border-l-2 border-emerald-700 rounded-r text-xs text-slate-700">
                        <div className="font-bold text-slate-900 text-[11px] mb-0.5">
                          Instructor Response ({rev.instructorReply.date}):
                        </div>
                        <p>{rev.instructorReply.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Q&A Forum Preview */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-xl font-bold font-display text-slate-900 mb-4">
                Questions & Answers ({courseQA.length})
              </h2>
              {courseQA.length > 0 ? (
                <div className="space-y-3">
                  {courseQA.map((qa) => (
                    <div key={qa.id} className="p-4 border border-slate-200 rounded bg-white">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-900">{qa.userName}</span>
                        <span>{qa.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{qa.title}</h4>
                      <p className="mt-1 text-xs text-slate-600">{qa.content}</p>

                      {qa.answers.map((ans) => (
                        <div key={ans.id} className="mt-3 p-2.5 bg-slate-50 rounded text-xs text-slate-700">
                          <div className="font-semibold text-[11px] text-slate-900 flex items-center gap-1.5">
                            <span>{ans.userName}</span>
                            {ans.isInstructor && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1 rounded font-bold uppercase">
                                Instructor
                              </span>
                            )}
                          </div>
                          <div className="mt-1 whitespace-pre-line text-slate-600">{ans.content}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No public questions asked yet for this syllabus.</p>
              )}
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <h2 className="text-xl font-bold font-display text-slate-900 mb-4">
                  Related Masterclasses in {course.subcategory}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedCourses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Purchase Card */}
          <div className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-20">
            <div className="border border-slate-200 rounded bg-white shadow-sm overflow-hidden">
              {/* Preview Image / Video Banner */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden group cursor-pointer" onClick={() => setPreviewModalOpen(true)}>
                <CourseCover
                  title={course.title}
                  category={course.subcategory}
                  categoryId={course.categoryId}
                  thumbnail={course.thumbnail}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white group-hover:bg-black/50 transition-colors">
                  <PlayCircle className="w-12 h-12 mb-1" />
                  <span className="text-xs font-semibold">Preview Course Syllabus</span>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="p-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold font-display text-slate-950 tabular-nums">
                    {isFreeCourse ? 'Free' : `₹${Number(course.price).toLocaleString('en-IN')}`}
                  </span>
                  {!isFreeCourse && course.originalPrice && course.price && course.originalPrice > course.price && (
                    <span className="text-sm text-slate-400 line-through tabular-nums">
                      ₹{Number(course.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                  {!isFreeCourse && course.originalPrice && course.price && course.originalPrice > course.price && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {enrolled ? (
                  <div className="space-y-3">
                    <Link to={`/student/course/${course.id}`} className="block">
                      <Button variant="primary" size="lg" className="w-full">
                        Resume Learning &rarr;
                      </Button>
                    </Link>
                    <p className="text-[11px] text-center text-emerald-800 font-semibold">
                      You are enrolled in this masterclass.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {isFreeCourse ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={registering}
                        onClick={handleRegisterFree}
                      >
                        {registering ? 'Registering...' : 'Register for free'}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full"
                          onClick={handleBuyNow}
                        >
                          Buy Now (Lifetime Access)
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          className="w-full"
                          onClick={handleAddToCart}
                        >
                          {inCart ? 'View in Cart' : 'Add to Cart'}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {!isFreeCourse && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
                )}

                {/* Course Inclusions List */}
                <div className="mt-5 space-y-2 text-xs text-slate-600">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                    This course includes:
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.durationHours || 0} hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.lectureCount || 0} coding & practical exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Downloadable production repositories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Infinity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Verifiable Certificate of Completion</span>
                  </div>
                </div>

                {!isFreeCourse && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      Apply
                    </Button>
                  </form>
                  {couponMessage && (
                    <p className={`mt-1.5 text-[11px] ${couponMessage.success ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>
                )}

                {/* Wishlist & Share buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist(course.id);
                      if (!wishlisted) {
                        showToast('success', `Saved "${course.title}" to your wishlist.`);
                      } else {
                        showToast('info', `Removed "${course.title}" from your wishlist.`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'text-rose-600 fill-rose-600' : ''}`} />
                    <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Course</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Lecture Preview Video Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={`Course Preview: ${course.title}`}
        size="lg"
      >
        <div className="aspect-video bg-black rounded overflow-hidden mb-4">
          <video
            controls
            autoPlay
            src={selectedPreviewVideo || course.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            className="w-full h-full"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Free preview lecture · Complete course includes {course.durationHours} hours of material
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setPreviewModalOpen(false);
              if (isFreeCourse) handleRegisterFree();
              else handleBuyNow();
            }}
          >
            {isFreeCourse ? 'Register for free' : 'Enroll in Masterclass'}
          </Button>
        </div>
      </Modal>

      {/* Share Course Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Masterclass"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Invite your team or classmates to study <strong>{course.title}</strong> by sharing the direct enrollment link below.
          </p>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700">
              Direct Course Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? window.location.href : ''}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono text-slate-800 select-all"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  showToast('success', 'Course link copied to clipboard!');
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedLink ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              leftIcon={<Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />}
              onClick={() => {
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
            >
              Share on LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out this engineering masterclass "${course.title}" on @PrajnadharaEDU: ${window.location.href}`
                  )}`,
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
            >
              Share on X
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                window.open(
                  `mailto:?subject=${encodeURIComponent(
                    `Recommendation: ${course.title}`
                  )}&body=${encodeURIComponent(
                    `Hi,\n\nI recommend checking out this masterclass on PrajnadharaEdu:\n${course.title}\n${window.location.href}\n`
                  )}`,
                  '_self'
                );
              }}
            >
              Email Colleague
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
