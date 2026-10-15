import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Settings as SettingsIcon,
  Video,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  ArrowLeft,
  Save,
  Globe,
  Award,
  Download,
  X,
  DollarSign
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { MediaUploader } from '../common/MediaUploader';
import { RichTextEditor } from '../common/RichTextEditor';
import { Course, Section, Lecture, CourseLevel, CourseStatus } from '../../types';
import { apiErrorMessage } from '../../api/client';
import { courseService } from '../../api/courseService';
import { adminService } from '../../api/adminService';
import { courseFacultyIds } from '../../utils/courseFaculty';
import { CourseCover } from './CourseCover';
import { CourseAnnouncementsPanel } from './CourseAnnouncementsPanel';

interface CourseBuilderProps {
  courseId?: string;
  onSaved?: (course: Course) => void;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({ courseId: propCourseId, onSaved }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { id: paramCourseId } = useParams<{ id: string }>();
  const courseId = propCourseId || paramCourseId;

  const { courses, categories, addCourse, updateCourse } = useCourses();
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  // Find existing course if editing
  const existingCourse = useMemo(() => {
    if (!courseId) return null;
    return courses.find(c => String(c.id) === String(courseId)) || null;
  }, [courseId, courses]);

  // Main Builder Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'settings' | 'announcements'>(
    searchParams.get('tab') === 'curriculum' ? 'curriculum' : searchParams.get('tab') === 'announcements' ? 'announcements' : 'overview'
  );
  const [isSaving, setIsSaving] = useState(false);

  // --- OVERVIEW TAB STATE ---
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [status, setStatus] = useState<CourseStatus>('published');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'password'>('public');
  const [publishedAt, setPublishedAt] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [description, setDescription] = useState('');

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([]);
  const [faculty, setFaculty] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [instructorToAdd, setInstructorToAdd] = useState('');

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // --- CURRICULUM TAB STATE ---
  const [sections, setSections] = useState<Section[]>([]);
  const [curriculumReady, setCurriculumReady] = useState(!courseId);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});
  const [newSectionTitleInput, setNewSectionTitleInput] = useState('');
  const [lessonDraft, setLessonDraft] = useState<{
    sectionIndex: number;
    lectureIndex: number | null;
    title: string;
    type: Lecture['type'];
    durationMinutes: number;
    videoUrl: string;
    content: string;
  } | null>(null);

  // --- SETTINGS TAB STATE ---
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'pricing' | 'extra' | 'assessment' | 'materials'>('general');

  // General Settings
  const [durationNumber, setDurationNumber] = useState(10);
  const [durationUnit, setDurationUnit] = useState<'Week(s)' | 'Hour(s)' | 'Day(s)' | 'Month(s)'>('Week(s)');
  const [blockContent, setBlockContent] = useState(false);
  const [blockAfterFinished, setBlockAfterFinished] = useState(false);
  const [allowRepurchase, setAllowRepurchase] = useState(false);
  const [repurchaseAction, setRepurchaseAction] = useState<'reset' | 'keep'>('reset');
  const [level, setLevel] = useState<CourseLevel>('All Levels');
  const [maxStudents, setMaxStudents] = useState(0);
  const [retakeCourse, setRetakeCourse] = useState(0);
  const [finishButton, setFinishButton] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [featuredReview, setFeaturedReview] = useState('');
  const [externalLink, setExternalLink] = useState('');

  // Pricing Settings
  const [price, setPrice] = useState(1299);
  const [originalPrice, setOriginalPrice] = useState(2499);
  const [isFree, setIsFree] = useState(false);

  // Extra Information
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([]);
  const [newLearnInput, setNewLearnInput] = useState('');

  const [requirements, setRequirements] = useState<string[]>([]);
  const [newReqInput, setNewReqInput] = useState('');

  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [newAudienceInput, setNewAudienceInput] = useState('');

  // Assessment Settings
  const [passingScorePercent, setPassingScorePercent] = useState(80);
  const [certificateEnabled, setCertificateEnabled] = useState(true);

  // Downloadable Materials
  const [materials, setMaterials] = useState<{ id: string; name: string; size: string; url: string }[]>([]);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [newMaterialSize, setNewMaterialSize] = useState('1.5 MB');

  // Populate data when editing existing course
  useEffect(() => {
    if (existingCourse) {
      setTitle(existingCourse.title || '');
      setSubtitle(existingCourse.subtitle || '');
      setSlug(existingCourse.slug || '');
      setStatus(existingCourse.status || 'published');
      setThumbnail(existingCourse.thumbnail || '');
      setPreviewVideoUrl(existingCourse.previewVideoUrl || '');
      setDescription(existingCourse.description || '');
      setPrice(existingCourse.price || 0);
      setOriginalPrice(existingCourse.originalPrice || existingCourse.price || 0);
      setIsFree(Boolean(existingCourse.isFree));
      setLevel(existingCourse.level || 'All Levels');
      setFeatured(Boolean(existingCourse.featured));
      setWhatYouWillLearn(existingCourse.whatYouWillLearn || []);
      setRequirements(existingCourse.requirements || []);
      setTargetAudience(existingCourse.targetAudience || []);
      setTags(existingCourse.tags || []);

      if (existingCourse.categoryId) {
        setSelectedCategoryIds([String(existingCourse.categoryId)]);
      }
      setSelectedInstructorIds(courseFacultyIds(existingCourse));

      if (existingCourse.durationWeeks) {
        setDurationNumber(existingCourse.durationWeeks);
        setDurationUnit('Week(s)');
      } else if (existingCourse.durationHours) {
        setDurationNumber(existingCourse.durationHours);
        setDurationUnit('Hour(s)');
      }

      if (existingCourse.curriculum && existingCourse.curriculum.length > 0) {
        setSections(existingCourse.curriculum);
        // Expand first section by default
        setExpandedSectionIds({ [existingCourse.curriculum[0].id]: true });
      }

      // Restore custom settings
      if (existingCourse.settings) {
        const s = existingCourse.settings;
        if (s.blockContent !== undefined) setBlockContent(s.blockContent);
        if (s.blockAfterFinished !== undefined) setBlockAfterFinished(s.blockAfterFinished);
        if (s.allowRepurchase !== undefined) setAllowRepurchase(s.allowRepurchase);
        if (s.repurchaseAction) setRepurchaseAction(s.repurchaseAction);
        if (s.maxStudents !== undefined) setMaxStudents(s.maxStudents);
        if (s.retakeCourse !== undefined) setRetakeCourse(s.retakeCourse);
        if (s.finishButton !== undefined) setFinishButton(s.finishButton);
        if (s.featuredReview) setFeaturedReview(s.featuredReview);
        if (s.externalLink) setExternalLink(s.externalLink);
        if (s.passingScorePercent) setPassingScorePercent(s.passingScorePercent);
        if (s.certificateEnabled !== undefined) setCertificateEnabled(s.certificateEnabled);
        if (s.materials) setMaterials(s.materials);
      }
    } else {
      // Default published date for new course
      setPublishedAt(new Date().toISOString().slice(0, 16));
      if (categories.length > 0) {
        setSelectedCategoryIds([String(categories[0].id)]);
      }
      setExpandedSectionIds({ [sections[0]?.id]: true });
    }
  }, [existingCourse, categories]);

  useEffect(() => {
    if (!courseId) {
      setCurriculumReady(true);
      return;
    }
    let active = true;
    setCurriculumReady(false);
    courseService.getManagedCourse(courseId).then((loaded) => {
      if (!active || !loaded) return;
      if (loaded.description) setDescription(loaded.description);
      if (loaded.previewVideoUrl) setPreviewVideoUrl(loaded.previewVideoUrl);
      if (loaded.targetAudience?.length) setTargetAudience(loaded.targetAudience);
      setFeatured(Boolean(loaded.featured));
      setSections(loaded.curriculum || []);
      if (loaded.curriculum && loaded.curriculum.length > 0) {
        setExpandedSectionIds({ [loaded.curriculum[0].id]: true });
      }
      setCurriculumReady(true);
    }).catch(() => {
      if (active) setCurriculumReady(true);
    });
    return () => {
      active = false;
    };
  }, [courseId]);

  // Auto-generate slug from title if not custom-edited
  useEffect(() => {
    if (!isEditingSlug && !existingCourse) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, isEditingSlug, existingCourse]);

  // Aggregate curriculum counts
  const totalLecturesCount = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0);
  }, [sections]);

  // Tag Management
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleaned = tagInput.trim().toLowerCase();
    if (!tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Section Management
  const handleAddSection = () => {
    const sectionTitle = newSectionTitleInput.trim() || `Section ${sections.length + 1}: New Topic`;
    const newSec: Section = {
      id: `sec-${Date.now()}`,
      title: sectionTitle,
      lectures: []
    };
    setSections([...sections, newSec]);
    setExpandedSectionIds(prev => ({ ...prev, [newSec.id]: true }));
    setNewSectionTitleInput('');
    showToast(`Added section "${sectionTitle}".`, 'info');
  };

  const handleDeleteSection = (secId: string) => {
    if (sections.length <= 1) {
      showToast('Course must have at least one section.', 'warning');
      return;
    }
    setSections(sections.filter(s => s.id !== secId));
  };

  const toggleSectionExpand = (secId: string) => {
    setExpandedSectionIds(prev => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleExpandAllSections = () => {
    const allExpanded: Record<string, boolean> = {};
    sections.forEach(s => { allExpanded[s.id] = true; });
    setExpandedSectionIds(allExpanded);
  };

  const handleCollapseAllSections = () => {
    setExpandedSectionIds({});
  };

  const handleDeleteLecture = (sectionId: string, lectureId: string) => {
    setSections(prevSections =>
      prevSections.map(sec =>
        sec.id === sectionId
          ? { ...sec, lectures: sec.lectures.filter(l => l.id !== lectureId) }
          : sec
      )
    );
  };

  // Learning Outcomes & Requirements Handlers
  const handleAddLearn = () => {
    if (!newLearnInput.trim()) return;
    setWhatYouWillLearn([...whatYouWillLearn, newLearnInput.trim()]);
    setNewLearnInput('');
  };

  const handleRemoveLearn = (idx: number) => {
    setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== idx));
  };

  const handleAddReq = () => {
    if (!newReqInput.trim()) return;
    setRequirements([...requirements, newReqInput.trim()]);
    setNewReqInput('');
  };

  const handleRemoveReq = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleAddMaterial = () => {
    if (!newMaterialName.trim() || !newMaterialUrl.trim()) return;
    setMaterials([
      ...materials,
      {
        id: `mat-${Date.now()}`,
        name: newMaterialName.trim(),
        size: newMaterialSize.trim() || '1.0 MB',
        url: newMaterialUrl.trim(),
      }
    ]);
    setNewMaterialName('');
    setNewMaterialUrl('');
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const workspaceBase = location.pathname.startsWith('/admin') ? '/admin' : '/instructor';
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    adminService.getUsers()
      .then((rows) => {
        const list = (Array.isArray(rows) ? rows : [])
          .filter((user) => user.role === 'instructor' || user.role === 'admin')
          .map((user) => ({
            id: String(user.id),
            name: user.name || user.email,
            email: user.email || '',
            role: user.role,
          }));
        setFaculty(list);
      })
      .catch(() => setFaculty([]));
  }, [isAdmin]);

  // Master Save Handler
  const persistCourse = async (curriculumOverride?: Section[]): Promise<Course | null> => {
    if (!title.trim()) {
      showToast('Course title is required.', 'error');
      setActiveTab('overview');
      return null;
    }
    if (courseId && !curriculumReady) {
      showToast('The curriculum is still loading. Wait a moment, then try again.', 'error');
      return null;
    }

    const curriculumSections = curriculumOverride || sections;
    setIsSaving(true);
    const chosenCategoryId = selectedCategoryIds[0] || '';
    const matchedCategory = categories.find(c => String(c.id) === String(chosenCategoryId));

    const totalMinutes = curriculumSections.reduce((acc, s) => {
      return acc + (s.lectures || []).reduce((lAcc, l) => lAcc + (l.durationMinutes || 0), 0);
    }, 0);
    const calculatedHours = totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(1)) : 10;

    const payload: Partial<Course> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      slug: slug.trim() || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: String(chosenCategoryId),
      subcategory: matchedCategory?.name || '',
      instructorId: (isAdmin ? selectedInstructorIds[0] : currentUser?.id) || currentUser?.id || '1',
      ...(isAdmin ? { instructorIds: selectedInstructorIds } : {}),
      price: isFree ? 0 : Number(price),
      originalPrice: isFree ? 0 : Number(originalPrice || price),
      isFree,
      durationHours: calculatedHours,
      durationWeeks: durationUnit === 'Week(s)' ? Number(durationNumber) : Math.max(1, Math.round(calculatedHours / 4)),
      lectureCount: curriculumSections.reduce((acc, s) => acc + (s.lectures?.length || 0), 0),
      level,
      language: 'English',
      lastUpdated: new Date().toISOString().split('T')[0],
      badges: featured ? ['Featured'] : [],
      thumbnail: thumbnail || '',
      previewVideoUrl,
      whatYouWillLearn,
      requirements,
      targetAudience,
      description,
      curriculum: curriculumSections,
      status,
      featured,
      tags,
      settings: {
        blockContent,
        blockAfterFinished,
        allowRepurchase,
        repurchaseAction,
        maxStudents: Number(maxStudents),
        retakeCourse: Number(retakeCourse),
        finishButton,
        featuredReview,
        externalLink,
        passingScorePercent: Number(passingScorePercent),
        certificateEnabled,
        materials,
        quizCount: curriculumSections.reduce((acc, s) => acc + (s.lectures || []).filter(l => l.type === 'quiz').length, 0)
      }
    };

    try {
      if (!selectedCategoryIds[0] || String(selectedCategoryIds[0]).startsWith('cat-')) {
        showToast('Choose a category before saving this course.', 'error');
        setIsSaving(false);
        return null;
      }
      if (existingCourse) {
        const saved = await updateCourse(existingCourse.id, payload);
        if (onSaved) onSaved(saved);
        return saved;
      }
      const created = await addCourse(payload as any);
      if (onSaved) onSaved(created);
      return created;
    } catch (err) {
      showToast(apiErrorMessage(err, 'Error saving course. Please check inputs.'), 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCourse = async () => {
    const saved = await persistCourse();
    if (!saved) return;
    showToast(`Course "${title}" saved.`, 'success');
    if (!existingCourse) {
      navigate(`${workspaceBase}/courses/${saved.id}/edit`);
    }
  };

  const openLessonForm = (sectionIndex: number, lectureIndex: number | null) => {
    const section = sections[sectionIndex];
    const lecture = lectureIndex === null ? null : section?.lectures?.[lectureIndex];
    setLessonDraft({
      sectionIndex,
      lectureIndex,
      title: lecture?.title || '',
      type: lecture?.type || 'article',
      durationMinutes: lecture?.durationMinutes || 10,
      videoUrl: lecture?.videoUrl || '',
      content: lecture?.content || '',
    });
    setActiveTab('curriculum');
  };

  const saveLessonDraft = async () => {
    if (!lessonDraft) return;
    if (!lessonDraft.title.trim()) {
      showToast('Add a lesson title first.', 'error');
      return;
    }
    const nextSections = sections.map((section, index) => {
      if (index !== lessonDraft.sectionIndex) return section;
      const lectures = [...(section.lectures || [])];
      const existing = lessonDraft.lectureIndex === null ? null : lectures[lessonDraft.lectureIndex];
      const payload: Lecture = {
        id: existing?.id || `new-${Date.now()}`,
        title: lessonDraft.title.trim(),
        durationMinutes: Number(lessonDraft.durationMinutes) || 0,
        type: lessonDraft.type,
        videoUrl: lessonDraft.type === 'video' ? lessonDraft.videoUrl.trim() : '',
        content: lessonDraft.content,
        previewFree: existing?.previewFree || false,
      };
      if (lessonDraft.lectureIndex === null || !existing) {
        lectures.push(payload);
      } else {
        lectures[lessonDraft.lectureIndex] = { ...existing, ...payload };
      }
      return { ...section, lectures };
    });
    setSections(nextSections);
    const saved = await persistCourse(nextSections);
    if (!saved) return;
    if (saved.curriculum) setSections(saved.curriculum);
    setLessonDraft(null);
    showToast('Lesson saved.', 'success');
    if (!existingCourse) {
      navigate(`${workspaceBase}/courses/${saved.id}/edit?tab=curriculum`);
    }
  };

  const moveLecture = (sectionIndex: number, lectureIndex: number, direction: -1 | 1) => {
    setSections((prev) => prev.map((section, index) => {
      if (index !== sectionIndex) return section;
      const nextIndex = lectureIndex + direction;
      if (nextIndex < 0 || nextIndex >= section.lectures.length) return section;
      const lectures = [...section.lectures];
      const [item] = lectures.splice(lectureIndex, 1);
      lectures.splice(nextIndex, 0, item);
      return { ...section, lectures };
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 text-left">
      {/* Top Header & Sticky Navigation */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 truncate">
                  {title || 'New Course Draft'}
                </h1>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : status === 'in_review'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {status === 'published' ? 'Published' : status === 'in_review' ? 'In Review' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                Course Builder · Enterprise Curriculum Suite
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            {existingCourse && (
              <Link
                to={`/student/course/${existingCourse.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview</span>
              </Link>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveCourse}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : existingCourse ? 'Update Course' : 'Publish Course'}</span>
            </button>
          </div>
        </div>

        {/* 3 Main Tabs: Overview | Curriculum | Settings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center border-t border-slate-100 gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Curriculum</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              {sections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          {courseId && (
            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'announcements'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>Announcements</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Title, Slug, Publish Box, Featured Image (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Course Title Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Course Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {title.length} characters
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quantum AI & Advanced Computing Architect Program"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all"
                />

                {/* Subtitle / Tagline */}
                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Subtitle / Headline
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Brief 1-line headline summarizing the masterclass outcomes"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-900 placeholder-slate-400 transition-all"
                  />
                </div>

                <label className="mt-4 flex items-start gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={featured}
                    onChange={async (e) => {
                      const next = e.target.checked;
                      setFeatured(next);
                      if (!existingCourse) return;
                      try {
                        await updateCourse(existingCourse.id, { featured: next });
                        showToast(next ? 'This course is on the homepage.' : 'Removed from the homepage.', 'success');
                      } catch (err) {
                        setFeatured(!next);
                        showToast(apiErrorMessage(err, 'Could not update the homepage setting.'), 'error');
                      }
                    }}
                  />
                  <span>
                    <span className="font-semibold">Show this course on the homepage</span>
                    <span className="block text-xs text-slate-500">Featured courses are the only ones on the homepage. Other courses stay on All courses.</span>
                  </span>
                </label>

                {/* Permalink Editor */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">Permalink</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingSlug(!isEditingSlug)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingSlug ? 'Done' : 'Edit'}</span>
                    </button>
                  </div>
                  {isEditingSlug ? (
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-300 text-xs text-indigo-900 font-mono"
                    />
                  ) : (
                    <div className="text-[11px] text-slate-500 font-mono truncate bg-slate-50 p-2 rounded-lg border border-slate-150">
                      https://prajnadharaedu.com/courses/<strong className="text-indigo-700">{slug || 'your-course-slug'}</strong>/
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Instructors</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Assign one or more instructors. Removing someone only takes them off this course. The course stays with you.
                    </p>
                  </div>
                  {selectedInstructorIds.length === 0 ? (
                    <p className="text-xs text-slate-600">No instructor assigned. Saving keeps this course under your admin account.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedInstructorIds.map((id, index) => {
                        const person = faculty.find((user) => user.id === id);
                        return (
                          <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">{person?.name || `Instructor ${id}`}</div>
                              <div className="text-[11px] text-slate-500">{index === 0 ? 'Lead instructor' : 'Instructor'}</div>
                            </div>
                            <button
                              type="button"
                              className="text-xs font-semibold text-rose-700 hover:text-rose-900"
                              onClick={() => setSelectedInstructorIds((current) => current.filter((item) => item !== id))}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <select
                      value={instructorToAdd}
                      onChange={(e) => setInstructorToAdd(e.target.value)}
                      className="min-w-0 flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                    >
                      <option value="">Choose an instructor</option>
                      {faculty.filter((user) => !selectedInstructorIds.includes(user.id)).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}{user.role === 'admin' ? ' (Admin)' : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
                      disabled={!instructorToAdd}
                      onClick={() => {
                        setSelectedInstructorIds((current) => current.includes(instructorToAdd) ? current : [...current, instructorToAdd]);
                        setInstructorToAdd('');
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <Link to="/admin/users" className="inline-block text-xs font-semibold text-indigo-700 hover:text-indigo-900">
                    Add a new instructor account
                  </Link>
                </div>
              )}

              {/* Publish Meta Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Publish Details</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CourseStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="in_review">In Review</option>
                      <option value="changes_requested">Changes Requested</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="password">Password Protected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Published On</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
                  />
                </div>
              </div>

              {/* Featured Image Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Featured Image
                  </h3>
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setThumbnail('')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {!thumbnail && (
                  <div className="mb-3 aspect-video overflow-hidden rounded-xl border border-slate-200">
                    <CourseCover
                      title={title || 'Course title'}
                      category={categories.find((item) => String(item.id) === String(selectedCategoryIds[0]))?.name}
                      categoryId={selectedCategoryIds[0]}
                      thumbnail=""
                    />
                  </div>
                )}

                <MediaUploader
                  value={thumbnail}
                  onChange={(url) => setThumbnail(url)}
                  label="Course Thumbnail / Banner"
                  helperText="Leave this empty to use the generated cover. Adding a picture replaces it."
                />

                {/* Preview Video URL */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Promotional Video (URL)
                  </label>
                  <input
                    type="url"
                    value={previewVideoUrl}
                    onChange={(e) => setPreviewVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or .mp4 URL"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Description, Categories, Tags (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <RichTextEditor
                  label="Course description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe what the student will learn."
                  minHeight="220px"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <label htmlFor="course-category" className="block text-sm font-semibold text-slate-800 mb-2">
                  Category
                </label>
                <select
                  id="course-category"
                  value={selectedCategoryIds[0] || ''}
                  onChange={(e) => setSelectedCategoryIds(e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value="">Choose a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">An admin needs to add a category before this course can be saved.</p>
                )}
              </div>

              {/* Tags Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Course Tags
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag and press Enter..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                {/* Tags Pill Display */}
                <div className="flex flex-wrap gap-2 min-h-8">
                  {tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No tags added yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CURRICULUM */}
        {/* ============================================================ */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            {/* Header Details Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Curriculum Structure</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organize your course into structured thematic sections, video lectures, reading modules, and quizzes.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-600">
                {sections.length} sections · {totalLecturesCount} lessons
              </span>
            </div>

            {/* Sections Accordion Stack */}
            <div className="space-y-4">
              {sections.map((section, secIdx) => {
                return (
                  <div
                    key={section.id}
                    className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
                  >
                    {/* Section Header Bar */}
                    <div className="p-4 sm:p-4.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                        <span className="text-xs font-bold text-slate-400 shrink-0">
                          0{secIdx + 1}
                        </span>

                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setSections(prev =>
                              prev.map(s => s.id === section.id ? { ...s, title: newTitle } : s)
                            );
                          }}
                          className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white px-2 py-1 text-sm font-bold text-slate-900 rounded transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                          {section.lectures?.length || 0} Items
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 bg-white">
                        <div className="space-y-2">
                          {section.lectures?.map((lecture, lecIdx) => (
                            <div
                              key={lecture.id}
                              className="flex items-center justify-between gap-3 py-2 border-b border-slate-100"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 truncate">
                                  {lecIdx + 1}. {lecture.title}
                                </div>
                                <div className="text-xs text-slate-500 capitalize">{lecture.type}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-xs font-semibold">
                                <button type="button" onClick={() => moveLecture(secIdx, lecIdx, -1)} className="text-slate-500 hover:text-slate-900">Up</button>
                                <button type="button" onClick={() => moveLecture(secIdx, lecIdx, 1)} className="text-slate-500 hover:text-slate-900">Down</button>
                                <button type="button" onClick={() => openLessonForm(secIdx, lecIdx)} className="text-emerald-800 hover:text-emerald-950">Edit</button>
                                <button type="button" onClick={() => handleDeleteLecture(section.id, lecture.id)} className="text-rose-700 hover:text-rose-900">Delete</button>
                              </div>
                            </div>
                          ))}

                          {(!section.lectures || section.lectures.length === 0) && (
                            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                              No lessons in this section yet. Add your first lesson below.
                            </div>
                          )}
                        </div>

                        {/* Quick Add Buttons inside Section */}
                        {lessonDraft?.sectionIndex === secIdx && (
                          <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                            <div className="text-sm font-bold text-slate-900">
                              {lessonDraft.lectureIndex === null ? 'New lesson' : 'Edit lesson'}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                              <input
                                value={lessonDraft.title}
                                onChange={(e) => setLessonDraft({ ...lessonDraft, title: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                                placeholder="Lesson title"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                                <select
                                  value={lessonDraft.type}
                                  onChange={(e) => setLessonDraft({ ...lessonDraft, type: e.target.value as Lecture['type'] })}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                                >
                                  <option value="video">Video</option>
                                  <option value="article">Article</option>
                                  <option value="quiz">Quiz</option>
                                  <option value="resource">Download</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Minutes</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={lessonDraft.durationMinutes}
                                  onChange={(e) => setLessonDraft({ ...lessonDraft, durationMinutes: Number(e.target.value) })}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                                />
                              </div>
                            </div>
                            {lessonDraft.type === 'video' && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Video link</label>
                                <input
                                  value={lessonDraft.videoUrl}
                                  onChange={(e) => setLessonDraft({ ...lessonDraft, videoUrl: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                                  placeholder="https://"
                                />
                              </div>
                            )}
                            <RichTextEditor
                              label="Lesson content"
                              value={lessonDraft.content}
                              onChange={(html) => setLessonDraft((current) => current ? { ...current, content: html } : current)}
                              placeholder="Write the lesson."
                              minHeight="220px"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={saveLessonDraft}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-60"
                              >
                                {isSaving ? 'Saving...' : 'Save lesson'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setLessonDraft(null)}
                                className="px-3 py-2 text-xs font-semibold text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openLessonForm(secIdx, null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add lesson</span>
                          </button>
                        </div>
                      </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Section Creator Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newSectionTitleInput}
                onChange={(e) => setNewSectionTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSection();
                  }
                }}
                placeholder="+ Create a new section (e.g. Advanced Cloud Architecture)"
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddSection}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SETTINGS */}
        {/* ============================================================ */}
        {activeTab === 'announcements' && courseId && (
          <CourseAnnouncementsPanel courseId={courseId} />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            {/* Sub-Navigation Sidebar (4 cols) */}
            <div className="md:col-span-3 border-r border-slate-200 p-3 sm:p-4 bg-slate-50/60 space-y-1">
              <button
                type="button"
                onClick={() => setSettingsSubTab('general')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  settingsSubTab === 'general'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>General Rules</span>
                <Clock className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('pricing')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  settingsSubTab === 'pricing'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>Pricing & Access</span>
                <DollarSign className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('extra')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  settingsSubTab === 'extra'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>Requirements & Outcomes</span>
                <Sparkles className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('assessment')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  settingsSubTab === 'assessment'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>Assessment & Certificates</span>
                <Award className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('materials')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  settingsSubTab === 'materials'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span>Downloadable Materials</span>
                <Download className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>

            {/* Sub-Panel Contents (9 cols) */}
            <div className="md:col-span-9 p-6 sm:p-8 space-y-6">
              {/* --- GENERAL SUB-TAB --- */}
              {settingsSubTab === 'general' && (
                <div className="space-y-6 divide-y divide-slate-100">
                  {/* Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">Duration</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Set to 0 for lifetime access.</p>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={durationNumber}
                        onChange={(e) => setDurationNumber(Number(e.target.value))}
                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                      <select
                        value={durationUnit}
                        onChange={(e) => setDurationUnit(e.target.value as any)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                      >
                        <option value="Week(s)">Week(s)</option>
                        <option value="Hour(s)">Hour(s)</option>
                        <option value="Day(s)">Day(s)</option>
                        <option value="Month(s)">Month(s)</option>
                      </select>
                    </div>
                  </div>

                  {/* Block Content Toggle */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">Block Content</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">When duration expires, course is blocked.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blockContent}
                          onChange={(e) => setBlockContent(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Block After Finished Toggle */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">Block After Finished</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Block the course once student completes all lessons.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blockAfterFinished}
                          onChange={(e) => setBlockAfterFinished(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Allow Repurchase */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">Allow Repurchase</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Allow users to repurchase after completion.</p>
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowRepurchase}
                          onChange={(e) => setAllowRepurchase(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                      {allowRepurchase && (
                        <select
                          value={repurchaseAction}
                          onChange={(e) => setRepurchaseAction(e.target.value as any)}
                          className="w-48 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        >
                          <option value="reset">Reset Course Progress</option>
                          <option value="keep">Keep Course Progress</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">Difficulty Level</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Select target learner proficiency.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as CourseLevel)}
                        className="w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                      >
                        <option value="All Levels">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  {/* Maximum Students */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">Max Students</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Set 0 for unlimited enrollments.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(Number(e.target.value))}
                        className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Featured on Homepage */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">Show on the homepage</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Only ticked courses appear in Featured Courses.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* External Class Link */}
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs font-bold text-slate-800">External / Contact Link</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Used for offline workshops or specialized onboarding.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="url"
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        placeholder="https://example.com/special-inquiry"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- PRICING SUB-TAB --- */}
              {settingsSubTab === 'pricing' && (
                <div className="space-y-6">
                  {/* Free Course Toggle */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-900">Make this Course 100% Free</label>
                      <p className="text-[11px] text-slate-500 mt-0.5">Students can enroll without any payment.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {!isFree && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Regular Price (INR ₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(Number(e.target.value))}
                          placeholder="e.g. 2499"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Discounted Sale Price (INR ₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          placeholder="e.g. 1299"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-rose-600"
                        />
                      </div>

                      {originalPrice > price && (
                        <div className="sm:col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>
                            Learners save {Math.round(((originalPrice - price) / originalPrice) * 100)}% on this masterclass.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- REQUIREMENTS & OUTCOMES SUB-TAB --- */}
              {settingsSubTab === 'extra' && (
                <div className="space-y-6">
                  {/* What you will learn */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      What Will Students Learn?
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newLearnInput}
                        onChange={(e) => setNewLearnInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLearn();
                          }
                        }}
                        placeholder="e.g. Architect fault-tolerant distributed microservices"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddLearn}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                      >
                        Add Outcome
                      </button>
                    </div>

                    <div className="space-y-2">
                      {whatYouWillLearn.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLearn(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements / Prerequisites */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Course Prerequisites & Requirements
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newReqInput}
                        onChange={(e) => setNewReqInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddReq();
                          }
                        }}
                        placeholder="e.g. Familiarity with JavaScript or Python"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddReq}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                      >
                        Add Requirement
                      </button>
                    </div>

                    <div className="space-y-2">
                      {requirements.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-800">
                          <span className="truncate">• {item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReq(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- ASSESSMENT SUB-TAB --- */}
              {settingsSubTab === 'assessment' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Passing Grade Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={passingScorePercent}
                        onChange={(e) => setPassingScorePercent(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Minimum score required to pass quizzes & earn certificate.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Completion Certificate
                      </label>
                      <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={certificateEnabled}
                            onChange={(e) => setCertificateEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        <span className="text-xs font-medium text-slate-700">
                          {certificateEnabled ? 'Automated Verified Certificate Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- DOWNLOADABLE MATERIALS SUB-TAB --- */}
              {settingsSubTab === 'materials' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                      Attach Downloadable Course Assets
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Provide supplementary cheatsheets, slides, architecture diagrams, or source code zips.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4">
                      <input
                        type="text"
                        value={newMaterialName}
                        onChange={(e) => setNewMaterialName(e.target.value)}
                        placeholder="File name (e.g. Architecture Guide PDF)"
                        className="sm:col-span-5 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                      <input
                        type="url"
                        value={newMaterialUrl}
                        onChange={(e) => setNewMaterialUrl(e.target.value)}
                        placeholder="Download link / URL"
                        className="sm:col-span-5 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddMaterial}
                        className="sm:col-span-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                      >
                        Add Asset
                      </button>
                    </div>

                    <div className="space-y-2">
                      {materials.map(m => (
                        <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold text-slate-800">{m.name}</span>
                            <span className="text-slate-400">({m.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(m.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {materials.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No attachments added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

    </div>
  );
};
