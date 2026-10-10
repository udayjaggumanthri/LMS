import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Circle,
  Menu,
  X,
  Award,
  Star,
  MessageSquare,
  FileText,
  HelpCircle,
  Download,
  Share2,
  ArrowLeft,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLearning } from '../../context/LearningContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Rating } from '../../components/ui/Rating';
import { Lecture } from '../../types';

export const CoursePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, qaQuestions, addQAQuestion, reviews, addReview } = useCourses();
  const {
    enrollments,
    markLectureCompleted,
    unmarkLectureCompleted,
    getCourseProgressPercent,
    notes,
    addNote,
    deleteNote,
    claimCertificate,
    certificates
  } = useLearning();
  const { currentUser } = useAuth();

  const course = courses.find(c => c.id === id) || courses[0];
  const progressData = enrollments[course?.id || ''];
  const completedLectureIds = progressData?.completedLectureIds || [];

  // Flatten lectures for navigation
  const allLectures: { sectionTitle: string; lecture: Lecture }[] = [];
  course.curriculum.forEach(section => {
    section.lectures.forEach(lecture => {
      allLectures.push({ sectionTitle: section.title, lecture });
    });
  });

  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const currentItem = allLectures[currentLectureIndex] || allLectures[0];
  const currentLecture = currentItem.lecture;

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tabs & Modals
  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'notes' | 'announcements' | 'reviews' | 'resources'>('overview');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Note form state
  const [newNoteText, setNewNoteText] = useState('');

  // Q&A form state
  const [newQTitle, setNewQTitle] = useState('');
  const [newQContent, setNewQContent] = useState('');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const courseProgress = getCourseProgressPercent(course.id);
  const courseNotes = notes.filter(n => n.courseId === course.id);
  const courseQA = qaQuestions.filter(q => q.courseId === course.id);
  const courseReviews = reviews.filter(r => r.courseId === course.id);
  const userCertificate = certificates.find(c => c.courseId === course.id);

  // Video event listeners
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 120);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  const handlePreviousLecture = () => {
    if (currentLectureIndex > 0) {
      setCurrentLectureIndex(currentLectureIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleNextLecture = () => {
    if (currentLectureIndex < allLectures.length - 1) {
      // Mark current complete when moving forward
      markLectureCompleted(course.id, currentLecture.id);
      setCurrentLectureIndex(currentLectureIndex + 1);
      setIsPlaying(false);
    }
  };

  const toggleLectureCompletion = (lectureId: string) => {
    if (completedLectureIds.includes(lectureId)) {
      unmarkLectureCompleted(course.id, lectureId);
    } else {
      markLectureCompleted(course.id, lectureId);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addNote(course.id, currentLecture.id, currentLecture.title, Math.floor(currentTime), newNoteText);
    setNewNoteText('');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) return;
    addQAQuestion({
      courseId: course.id,
      lectureId: currentLecture.id,
      userId: currentUser?.id || 'anon',
      userName: currentUser?.name || 'Student',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      title: newQTitle,
      content: newQContent
    });
    setNewQTitle('');
    setNewQContent('');
    setQaModalOpen(false);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addReview({
      courseId: course.id,
      userId: currentUser?.id || 'anon',
      userName: currentUser?.name || 'Student',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rating: reviewRating,
      comment: reviewComment
    });
    setReviewComment('');
    setReviewModalOpen(false);
  };

  const handleClaimCertificate = () => {
    claimCertificate(course.id);
    setCertModalOpen(true);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col text-left">
      {/* 1. Player Top Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4 overflow-hidden">
          <Link
            to="/student/my-learning"
            className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Courses</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 shrink-0" />
          <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xl">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Progress Percentage Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-24">
              <ProgressBar value={courseProgress} size="sm" showPercent={false} />
            </div>
            <span className="text-xs font-bold text-emerald-400 tabular-nums">
              {courseProgress}% Complete
            </span>
          </div>

          {/* Certificate Action */}
          {courseProgress >= 80 ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              leftIcon={<Award className="w-3.5 h-3.5" />}
              onClick={handleClaimCertificate}
            >
              Certificate
            </Button>
          ) : (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 p-1 rounded font-medium"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Leave Rating</span>
            </button>
          )}

          {/* Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Syllabus Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Stage: Video Screen + Right Syllabus Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video & Tabs Workspace */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto">
          {/* Video Container */}
          <div className="bg-black relative aspect-video max-h-[65vh] w-full flex items-center justify-center">
            {currentLecture.type === 'quiz' ? (
              <div className="p-8 text-center max-w-md space-y-4">
                <HelpCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold font-display text-white">{currentLecture.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This lecture is a scored technical assessment. You will have 10 minutes to complete 5 architectural questions. An 80% score unlocks your verifiable certificate.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                    onClick={() => navigate(`/student/quiz/${currentLecture.quizId || 'quiz-1'}`)}
                  >
                    Start Assessment Quiz Now &rarr;
                  </Button>
                </div>
              </div>
            ) : currentLecture.type === 'article' ? (
              <div className="p-8 max-w-2xl text-left bg-slate-950 border border-slate-800 rounded m-4 overflow-y-auto max-h-[85%] text-xs text-slate-200 space-y-3">
                <h3 className="text-base font-bold text-white font-display">{currentLecture.title}</h3>
                <p className="leading-relaxed whitespace-pre-line">
                  {currentLecture.content || 'Read through the architectural specifications carefully before proceeding to the coding section.'}
                </p>
                <div className="pt-4 border-t border-slate-800">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => markLectureCompleted(course.id, currentLecture.id)}
                  >
                    Mark as Completed & Continue
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleNextLecture}
                  src={currentLecture.videoUrl || course.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  className="w-full h-full object-contain"
                  onClick={togglePlay}
                />

                {/* Video Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 border-t border-slate-800/80 px-4 py-2 flex flex-col gap-1.5 text-xs text-white">
                  {/* Scrubber Timeline */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 accent-emerald-500 bg-slate-700 cursor-pointer"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlay} className="p-1 hover:text-emerald-400">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={handlePreviousLecture} className="p-1 hover:text-emerald-400" title="Previous Lecture">
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button onClick={handleNextLecture} className="p-1 hover:text-emerald-400" title="Next Lecture">
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <span className="text-[11px] font-mono tabular-nums text-slate-300">
                        {formatSeconds(currentTime)} / {formatSeconds(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Playback speed selector */}
                      <div className="flex items-center gap-1 text-[11px]">
                        {[1, 1.25, 1.5, 2].map((sp) => (
                          <button
                            key={sp}
                            onClick={() => handleSpeedChange(sp)}
                            className={`px-1.5 py-0.5 rounded ${playbackSpeed === sp ? 'bg-emerald-800 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                          >
                            {sp}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.muted = !isMuted;
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="p-1 hover:text-emerald-400"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. Bottom Panels (Tabs: Overview, Q&A, Notes, Announcements, Reviews, Resources) */}
          <div className="p-6 bg-slate-900 border-t border-slate-800 flex-1">
            {/* Tabs Header */}
            <div className="flex items-center gap-6 border-b border-slate-800 pb-3 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-3 -mb-3' : 'text-slate-400 hover:text-white'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`transition-colors whitespace-nowrap ${activeTab === 'qa' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-3 -mb-3' : 'text-slate-400 hover:text-white'}`}
              >
                Q&A ({courseQA.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`transition-colors whitespace-nowrap ${activeTab === 'notes' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-3 -mb-3' : 'text-slate-400 hover:text-white'}`}
              >
                Notes ({courseNotes.length})
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`transition-colors whitespace-nowrap ${activeTab === 'announcements' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-3 -mb-3' : 'text-slate-400 hover:text-white'}`}
              >
                Announcements
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-3 -mb-3' : 'text-slate-400 hover:text-white'}`}
              >
                Reviews ({courseReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`transition-colors whitespace-nowrap ${activeTab === 'resources' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-3 -mb-3' : 'text-slate-400 hover:text-white'}`}
              >
                Resources
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="pt-6 text-xs text-slate-300 space-y-4 max-w-3xl leading-relaxed">
                <div>
                  <h3 className="font-bold text-sm text-white mb-1">About This Lecture</h3>
                  <p>{currentLecture.title} is part of {currentItem.sectionTitle}.</p>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2">What you will master</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    {course.whatYouWillLearn.slice(0, 3).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Q&A */}
            {activeTab === 'qa' && (
              <div className="pt-6 space-y-4 max-w-3xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Ask questions and review answers from your instructor and fellow learners.
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-3 h-3" />}
                    onClick={() => setQaModalOpen(true)}
                  >
                    Ask a Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {courseQA.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-950 border border-slate-800 rounded text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-white">{q.userName}</span>
                        <span>{q.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{q.title}</h4>
                      <p className="text-slate-300 leading-relaxed">{q.content}</p>

                      {q.answers.map((ans) => (
                        <div key={ans.id} className="mt-3 p-3 bg-slate-900 border-l-2 border-emerald-500 rounded-r text-xs">
                          <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                            <span>{ans.userName}</span>
                            {ans.isInstructor && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 rounded uppercase font-bold">
                                Instructor
                              </span>
                            )}
                          </div>
                          <div className="text-slate-300 whitespace-pre-line leading-relaxed">{ans.content}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Notes */}
            {activeTab === 'notes' && (
              <div className="pt-6 space-y-4 max-w-3xl">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Create a note at <strong className="text-white font-mono">{formatSeconds(currentTime)}</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type your personal note for this timestamp..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-600"
                    />
                    <Button type="submit" variant="primary" size="sm">
                      Save Note
                    </Button>
                  </div>
                </form>

                <div className="space-y-2 pt-2">
                  {courseNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex items-start justify-between text-xs gap-4">
                      <div>
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = note.timestampSeconds;
                              setCurrentTime(note.timestampSeconds);
                            }
                          }}
                          className="font-mono text-emerald-400 font-bold hover:underline mb-1 inline-block"
                        >
                          [{formatSeconds(note.timestampSeconds)}] {note.lectureTitle}
                        </button>
                        <p className="text-slate-300">{note.text}</p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-slate-500 hover:text-rose-400 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Announcements */}
            {activeTab === 'announcements' && (
              <div className="pt-6 space-y-3 max-w-3xl text-xs text-slate-300">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-white">Course Curriculum Update for React 19</span>
                    <span>1 week ago</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pt-1">
                    Welcome to the 2026 revision! We updated Section 2 with new lectures on the React Compiler and Actions. Downloadable repositories on GitHub have been synchronized.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 5: Reviews */}
            {activeTab === 'reviews' && (
              <div className="pt-6 space-y-4 max-w-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rating rating={course.rating} reviewsCount={course.reviewsCount} size="md" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(true)}>
                    Write a Review
                  </Button>
                </div>

                <div className="space-y-3">
                  {courseReviews.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{r.userName}</span>
                        <Rating rating={r.rating} showCount={false} size="sm" />
                      </div>
                      <p className="text-slate-300 pt-1 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 6: Resources */}
            {activeTab === 'resources' && (
              <div className="pt-6 space-y-2 max-w-3xl text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">production-architecture-v1.zip</span>
                    <span className="text-slate-500 text-[11px]">8.2 MB · Complete Source Code</span>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-3 h-3" />}>
                    Download
                  </Button>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">react19-compiler-reference-guide.pdf</span>
                    <span className="text-slate-500 text-[11px]">1.4 MB · Architecture Cheatsheet</span>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-3 h-3" />}>
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Collapsible Right Syllabus Sidebar */}
        {sidebarOpen && (
          <aside className="w-full lg:w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0 h-auto lg:h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Course Curriculum
              </span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 divide-y divide-slate-800 text-xs">
              {course.curriculum.map((section, sIdx) => (
                <div key={section.id}>
                  <div className="p-3 bg-slate-900/80 font-bold text-slate-200 text-[11px]">
                    {section.title}
                  </div>
                  <div className="divide-y divide-slate-900">
                    {section.lectures.map((lecture) => {
                      const isCompleted = completedLectureIds.includes(lecture.id);
                      const isSelected = lecture.id === currentLecture.id;
                      const globalIdx = allLectures.findIndex(l => l.lecture.id === lecture.id);

                      return (
                        <div
                          key={lecture.id}
                          className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-900 text-slate-400'
                          }`}
                          onClick={() => {
                            if (globalIdx !== -1) setCurrentLectureIndex(globalIdx);
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLectureCompletion(lecture.id);
                            }}
                            className="mt-0.5 text-slate-500 hover:text-emerald-400 shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="truncate text-xs text-white">{lecture.title}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              {lecture.type === 'video' && <span>Video</span>}
                              {lecture.type === 'quiz' && <span className="text-emerald-400 font-bold">Quiz</span>}
                              {lecture.type === 'article' && <span>Article</span>}
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{lecture.durationMinutes}m</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Leave a Rating & Review"
        size="md"
      >
        <form onSubmit={handleAddReview} className="space-y-4 text-xs text-slate-900">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex gap-2 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1"
                >
                  <Star className={`w-6 h-6 ${reviewRating >= star ? 'fill-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Review Comments
            </label>
            <textarea
              required
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What did you like about this course? How did it help your work?"
              className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Q&A Question Modal */}
      <Modal
        isOpen={qaModalOpen}
        onClose={() => setQaModalOpen(false)}
        title="Ask the Instructor a Question"
        size="md"
      >
        <form onSubmit={handleAddQuestion} className="space-y-4 text-xs text-slate-900">
          <Input
            label="Question Title or Summary"
            required
            value={newQTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewQTitle(e.target.value)}
            placeholder="e.g. How do I resolve circular dependency warnings in Section 2?"
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description & Context
            </label>
            <textarea
              required
              rows={4}
              value={newQContent}
              onChange={(e) => setNewQContent(e.target.value)}
              placeholder="Paste relevant error messages or describe your specific setup..."
              className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setQaModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Post Question
            </Button>
          </div>
        </form>
      </Modal>

      {/* Certificate Claim Modal */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title="Congratulations! Certificate Unlocked"
        size="md"
      >
        <div className="p-6 text-center space-y-4 text-slate-900">
          <Award className="w-12 h-12 text-emerald-700 mx-auto" />
          <h3 className="font-bold text-base">You have earned your Certificate of Completion!</h3>
          <p className="text-xs text-slate-600">
            You successfully completed the curriculum for <strong>{course.title}</strong>.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/student/certificates">
              <Button variant="primary" size="sm">
                View & Print Official Certificate &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};
