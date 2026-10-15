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
import { courseService } from '../../api/courseService';
import { useLearning } from '../../context/LearningContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Rating } from '../../components/ui/Rating';
import { Course, Lecture, QAQuestion, Review } from '../../types';
import { RichContentViewer } from '../../components/common/RichContentViewer';

export const CoursePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const {
    enrollments,
    markLectureCompleted,
    unmarkLectureCompleted,
    notes,
    addNote,
    deleteNote,
    claimCertificate,
    certificates
  } = useLearning();
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [playerStatus, setPlayerStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [playerReviews, setPlayerReviews] = useState<Review[]>([]);
  const [playerQA, setPlayerQA] = useState<QAQuestion[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: number; title: string; body: string; authorName: string; createdAt: string }[]>([]);
  const [noteError, setNoteError] = useState('');
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPlayerStatus('loading');
    setDetailCourse(null);
    setCurrentLectureIndex(0);
    if (!id) {
      setPlayerStatus('missing');
      return;
    }
    courseService.getCourseBySlug(id)
      .then((row) => {
        if (cancelled) return;
        setDetailCourse(row || null);
        setPlayerStatus(row ? 'ready' : 'missing');
      })
      .catch(() => {
        if (!cancelled) setPlayerStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([
      courseService.getReviews(id).catch(() => []),
      courseService.getQA(id).catch(() => []),
      courseService.getAnnouncements(id).catch(() => []),
    ]).then(([reviewRows, qaRows, announcementRows]) => {
      if (cancelled) return;
      setPlayerReviews(Array.isArray(reviewRows) ? reviewRows : []);
      setPlayerQA(Array.isArray(qaRows) ? qaRows : []);
      setAnnouncements(Array.isArray(announcementRows) ? announcementRows : []);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const course = detailCourse || courses.find(c => String(c.id) === String(id));
  const sameId = (left: unknown, right: unknown) => String(left) === String(right);
  const isLectureDone = (lectureId: string | number) => completedLectureIds.some((item) => sameId(item, lectureId));
  const progressData = enrollments[course?.id || ''];
  const completedLectureIds = progressData?.completedLectureIds || [];

  const allLectures: { sectionTitle: string; lecture: Lecture }[] = [];
  (course?.curriculum || []).forEach(section => {
    (section.lectures || []).forEach(lecture => {
      allLectures.push({ sectionTitle: section.title, lecture });
    });
  });
  const currentItem = allLectures[currentLectureIndex] || allLectures[0];
  const currentLecture = currentItem?.lecture;

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

  if (playerStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <p className="text-sm text-slate-300">Opening your course…</p>
      </div>
    );
  }

  if (!course || !currentLecture) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold">This course is not available.</h1>
          <Link to="/student/my-learning" className="mt-3 inline-block text-sm text-emerald-300">Back to My Learning</Link>
        </div>
      </div>
    );
  }

  const finishedCount = completedLectureIds.filter((item) => allLectures.some((row) => sameId(row.lecture.id, item))).length;
  const courseProgress = allLectures.length ? Math.min(100, Math.round((finishedCount / allLectures.length) * 100)) : 0;
  const lectureNotes = notes.filter((note) => sameId(note.courseId, course.id) && currentLecture && sameId(note.lectureId, currentLecture.id));
  const courseQA = playerQA;
  const courseReviews = playerReviews;
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

  const markCurrentIfNeeded = async () => {
    if (!currentLecture || isLectureDone(currentLecture.id)) return;
    await markLectureCompleted(course.id, currentLecture.id);
  };

  const handleNextLecture = () => {
    if (currentLectureIndex < allLectures.length - 1) {
      markCurrentIfNeeded().catch(() => setNoteError('Could not save your progress.'));
      setCurrentLectureIndex(currentLectureIndex + 1);
      setIsPlaying(false);
    }
  };

  const toggleLectureCompletion = (lectureId: string) => {
    const action = isLectureDone(lectureId)
      ? unmarkLectureCompleted(course.id, lectureId)
      : markLectureCompleted(course.id, lectureId);
    action.catch(() => setNoteError('Could not save your progress.'));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentLecture) return;
    setNoteError('');
    addNote(course.id, currentLecture.id, currentLecture.title, Math.floor(currentTime), newNoteText)
      .then(() => setNewNoteText(''))
      .catch(() => setNoteError('Could not save this note.'));
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) return;
    courseService.addQAQuestion(course.id, { title: newQTitle, content: newQContent })
      .then((saved) => {
        setPlayerQA((prev) => [{ ...saved, answers: saved.answers || [] }, ...prev]);
        setNewQTitle('');
        setNewQContent('');
        setQaModalOpen(false);
      })
      .catch(() => setNoteError('Could not post your question.'));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    courseService.addReview(course.id, { rating: reviewRating, comment: reviewComment })
      .then((saved) => {
        setPlayerReviews((prev) => [saved, ...prev.filter((row) => String(row.id) !== String(saved.id))]);
        setReviewComment('');
        setReviewModalOpen(false);
      })
      .catch(() => setNoteError('Could not save your review.'));
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
          <div className={currentLecture.type === 'article'
            ? 'bg-slate-950 w-full max-h-[70vh] overflow-y-auto'
            : 'bg-black relative aspect-video max-h-[65vh] w-full flex items-center justify-center'}>
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
              <article className="mx-4 my-4 max-w-3xl rounded border border-slate-200 bg-white p-6 text-left text-slate-800 sm:mx-auto sm:my-6 sm:p-8">
                <h3 className="mb-4 text-lg font-bold font-display text-slate-950">{currentLecture.title}</h3>
                {currentLecture.content ? (
                  <RichContentViewer content={currentLecture.content} className="text-slate-800" />
                ) : (
                  <p className="text-sm leading-relaxed text-slate-600">This lesson is ready. Mark it complete when you want to continue.</p>
                )}
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      markCurrentIfNeeded()
                        .then(() => {
                          if (currentLectureIndex < allLectures.length - 1) {
                            setCurrentLectureIndex(currentLectureIndex + 1);
                            setIsPlaying(false);
                          }
                        })
                        .catch(() => setNoteError('Could not save your progress.'));
                    }}
                  >
                    Mark as Completed & Continue
                  </Button>
                </div>
              </article>
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
                Notes ({lectureNotes.length})
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
              <div className="pt-6 text-sm text-slate-300 space-y-4 max-w-3xl leading-relaxed">
                <div>
                  <h3 className="font-bold text-white mb-1">{currentLecture.title}</h3>
                  <p className="text-xs text-slate-400">Part of {currentItem.sectionTitle}</p>
                </div>
                {course.description ? (
                  /<[a-z][\s\S]*>/i.test(course.description) ? (
                    <RichContentViewer content={course.description} className="text-slate-200 [&_p]:text-slate-200" />
                  ) : (
                    <p className="whitespace-pre-line text-slate-300">{course.description}</p>
                  )
                ) : (
                  course.subtitle ? <p>{course.subtitle}</p> : null
                )}
                {(course.whatYouWillLearn || []).length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2">What you will learn</h4>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {course.whatYouWillLearn.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
                  {courseQA.length === 0 && <p className="text-xs text-slate-400">No questions yet. Ask the first one.</p>}
                  {courseQA.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-950 border border-slate-800 rounded text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-white">{q.userName}</span>
                        <span>{q.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{q.title}</h4>
                      <p className="text-slate-300 leading-relaxed">{q.content}</p>

                      {(q.answers || []).map((ans) => (
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
                  {noteError && <p className="text-xs text-rose-300">{noteError}</p>}
                  {lectureNotes.length === 0 && <p className="text-xs text-slate-400">No notes for this lesson yet.</p>}
                  {lectureNotes.map((note) => (
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
                {announcements.length === 0 && <p className="text-slate-400">No announcements for this course yet.</p>}
                {announcements.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400">
                      <span className="font-bold text-white">{item.title}</span>
                      <span>{item.createdAt}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pt-1 whitespace-pre-line">{item.body}</p>
                    {item.authorName && <p className="text-[11px] text-slate-500">Posted by {item.authorName}</p>}
                  </div>
                ))}
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
                  {courseReviews.length === 0 && <p className="text-xs text-slate-400">No reviews yet.</p>}
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
                {(currentLecture.resources || []).length === 0 && (
                  <p className="text-slate-400">No files for this lesson yet.</p>
                )}
                {(currentLecture.resources || []).map((file) => (
                  <div key={file.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="font-bold text-white block">{file.name}</span>
                      {file.size && <span className="text-slate-500 text-[11px]">{file.size}</span>}
                    </div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" leftIcon={<Download className="w-3 h-3" />}>
                        Download
                      </Button>
                    </a>
                  </div>
                ))}
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
                      const isCompleted = isLectureDone(lecture.id);
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
