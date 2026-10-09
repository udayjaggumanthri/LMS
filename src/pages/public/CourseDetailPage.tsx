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
  User as UserIcon,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLearning } from '../../context/LearningContext';
import { Rating } from '../../components/ui/Rating';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Accordion } from '../../components/ui/Accordion';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CourseCard } from '../../components/ui/CourseCard';
import { Modal } from '../../components/ui/Modal';
import { INSTRUCTORS } from '../../data/mockData';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { courses, getCourseBySlug, reviews, qaQuestions } = useCourses();
  const { addToCart, isInCart, applyCoupon } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isEnrolled } = useLearning();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success?: boolean; text?: string } | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPreviewVideo, setSelectedPreviewVideo] = useState<string | null>(null);
  const [reviewFilterRating, setReviewFilterRating] = useState<number>(0);

  const course = getCourseBySlug(slug || '');

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

  const instructor = INSTRUCTORS.find(i => i.id === course.instructorId);
  const instructorName = instructor?.name || 'Prajnadhara Instructor';
  const enrolled = isEnrolled(course.id);
  const inCart = isInCart(course.id);
  const wishlisted = isInWishlist(course.id);

  const courseReviews = reviews.filter(r => r.courseId === course.id);
  const courseQA = qaQuestions.filter(q => q.courseId === course.id);
  const relatedCourses = courses
    .filter(c => c.categoryId === course.categoryId && c.id !== course.id && c.status === 'published')
    .slice(0, 3);

  // Rating distribution
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  courseReviews.forEach(r => {
    const star = Math.floor(r.rating);
    if (ratingCounts[star] !== undefined) ratingCounts[star]++;
  });

  const totalReviewsCount = courseReviews.length || 1;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCoupon(couponCode);
    setCouponMessage({ success: res.success, text: res.message });
  };

  const handleBuyNow = () => {
    if (!inCart) addToCart(course.id);
    navigate('/checkout');
  };

  // Build curriculum accordion items
  const curriculumAccordionItems = course.curriculum.map((section, secIndex) => {
    const totalMinutes = section.lectures.reduce((acc, l) => acc + l.durationMinutes, 0);
    return {
      id: section.id,
      defaultOpen: secIndex === 0,
      title: (
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900">
          <span>{section.title}</span>
          <span className="text-[11px] font-normal text-slate-500 tabular-nums">
            {section.lectures.length} lectures · {totalMinutes}m
          </span>
        </div>
      ),
      content: (
        <div className="divide-y divide-slate-100">
          {section.lectures.map((lecture) => (
            <div key={lecture.id} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
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
                <span className="text-slate-400 tabular-nums text-[11px]">
                  {lecture.durationMinutes}m
                </span>
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
                  { label: course.subcategory, href: `/courses?category=${course.categoryId}` },
                  { label: course.title }
                ]}
                className="mb-4 text-slate-400"
              />

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                {course.badges.map((b) => (
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
              <div className="mt-5 flex items-center gap-4 flex-wrap text-xs text-slate-300">
                <Rating rating={course.rating} reviewsCount={course.reviewsCount} size="sm" />
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="tabular-nums">{course.studentCount.toLocaleString('en-IN')} students enrolled</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Created by <Link to={`/instructor/${course.instructorId}`} className="text-emerald-400 hover:underline font-semibold">{instructorName}</Link></span>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Last updated {course.lastUpdated}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{course.language}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
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
                {course.whatYouWillLearn.map((pt, i) => (
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
                    {course.curriculum.length} sections · {course.lectureCount} lectures · {course.durationHours} hours total length
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
                {course.requirements.map((req, i) => (
                  <li key={i} className="leading-relaxed">{req}</li>
                ))}
              </ul>
            </div>

            {/* Detailed Description */}
            <div className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed space-y-3">
              <h2 className="text-lg font-bold font-display text-slate-900 not-prose mb-3">
                Course Description
              </h2>
              <div className="whitespace-pre-line">{course.description}</div>
            </div>

            {/* Instructor Profile Card */}
            <div className="p-6 border border-slate-200 rounded bg-slate-50">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Lead Instructor
              </div>
              <div className="flex items-start gap-4">
                <img
                  src={instructor?.avatar}
                  alt={instructorName}
                  className="w-16 h-16 rounded object-cover border border-slate-200"
                />
                <div>
                  <Link
                    to={`/instructor/${course.instructorId}`}
                    className="text-base font-bold text-slate-900 hover:text-emerald-900"
                  >
                    {instructorName}
                  </Link>
                  <p className="text-xs text-slate-600 mt-0.5">{instructor?.title}</p>

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
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-700 leading-relaxed border-t border-slate-200/80 pt-3">
                {instructor?.bio}
              </p>
            </div>

            {/* Reviews Section & Rating Distribution */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-xl font-bold font-display text-slate-900 mb-6">
                Student Feedback & Reviews
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center p-6 border border-slate-200 rounded bg-white mb-6">
                <div className="sm:col-span-4 text-center sm:text-left sm:border-r sm:border-slate-100 sm:pr-6">
                  <div className="text-4xl font-bold font-display text-amber-900 tabular-nums">
                    {course.rating.toFixed(1)}
                  </div>
                  <div className="mt-1">
                    <Rating rating={course.rating} showCount={false} size="md" />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 tabular-nums">
                    Course Rating · {course.reviewsCount.toLocaleString()} reviews
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
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-7 h-7 rounded object-cover border border-slate-200"
                        />
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
                    <CourseCard key={c.id} course={c} showHoverPopover={false} />
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
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
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
                    {course.isFree || course.price === 0 ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                  </span>
                  {course.originalPrice > course.price && !course.isFree && (
                    <span className="text-sm text-slate-400 line-through tabular-nums">
                      ₹{course.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {course.originalPrice > course.price && !course.isFree && (
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
                      onClick={() => {
                        if (inCart) navigate('/cart');
                        else addToCart(course.id);
                      }}
                    >
                      {inCart ? 'View in Cart' : 'Add to Cart'}
                    </Button>
                  </div>
                )}

                {/* 30-Day Guarantee Notice */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>

                {/* Course Inclusions List */}
                <div className="mt-5 space-y-2 text-xs text-slate-600">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                    This course includes:
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.durationHours} hours on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.lectureCount} coding & practical exercises</span>
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

                {/* Coupon Code Input */}
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

                {/* Wishlist & Share buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(course.id)}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'text-rose-600 fill-rose-600' : ''}`} />
                    <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Course URL copied to clipboard!');
                    }}
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
              handleBuyNow();
            }}
          >
            Enroll in Masterclass &rarr;
          </Button>
        </div>
      </Modal>
    </div>
  );
};
