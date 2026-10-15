import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { courseService } from '../../api/courseService';
import { apiErrorMessage } from '../../api/client';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { useNotifications } from '../../context/NotificationContext';
import { Course, Lecture, LectureResource, Section } from '../../types';

type LessonType = Lecture['type'];

export const LessonEditorPage: React.FC = () => {
  const { courseId, sectionId, lectureId } = useParams<{
    courseId: string;
    sectionId: string;
    lectureId?: string;
  }>();
  const isNew = !lectureId || lectureId === 'new';
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const base = window.location.pathname.startsWith('/admin') ? '/admin' : '/instructor';

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('article');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [resources, setResources] = useState<LectureResource[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    setLoading(true);
    courseService.getManagedCourse(courseId).then((loaded) => {
      if (!active) return;
      setCourse(loaded);
      const section = (loaded.curriculum || []).find((item) => String(item.id) === String(sectionId));
      const lesson = section?.lectures?.find((item) => String(item.id) === String(lectureId));
      if (lesson) {
        setTitle(lesson.title || '');
        setLessonType(lesson.type || 'article');
        setDurationMinutes(lesson.durationMinutes || 10);
        setVideoUrl(lesson.videoUrl || '');
        setContent(lesson.content || '');
        setResources(lesson.resources || []);
      }
      setLoading(false);
    }).catch((err) => {
      if (!active) return;
      showToast(apiErrorMessage(err, 'Could not open this lesson.'), 'error');
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [courseId, sectionId, lectureId, showToast]);

  const section = useMemo(
    () => (course?.curriculum || []).find((item) => String(item.id) === String(sectionId)),
    [course, sectionId]
  );

  const flatLessons = useMemo(() => {
    const rows: { section: Section; lecture: Lecture; sectionIndex: number; lectureIndex: number }[] = [];
    (course?.curriculum || []).forEach((item, sectionIndex) => {
      (item.lectures || []).forEach((lecture, lectureIndex) => {
        rows.push({ section: item, lecture, sectionIndex, lectureIndex });
      });
    });
    return rows;
  }, [course]);

  const currentIndex = flatLessons.findIndex(
    (row) => String(row.section.id) === String(sectionId) && String(row.lecture.id) === String(lectureId)
  );
  const previous = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const lessonPath = (targetSectionId: string | number, targetLectureId: string | number) =>
    `${base}/courses/${courseId}/sections/${targetSectionId}/lessons/${targetLectureId}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !section || !title.trim()) {
      showToast('Add a lesson title first.', 'error');
      return;
    }
    setSaving(true);
    const sectionIndex = (course.curriculum || []).findIndex((item) => String(item.id) === String(section.id));
    const lectureIndex = isNew
      ? -1
      : (section.lectures || []).findIndex((lesson) => String(lesson.id) === String(lectureId));
    const curriculum = (course.curriculum || []).map((item, index) => {
      if (index !== sectionIndex) return item;
      const lectures = [...(item.lectures || [])];
      const payload: Lecture = {
        id: isNew ? `new-${Date.now()}` : String(lectureId),
        title: title.trim(),
        durationMinutes: Number(durationMinutes) || 0,
        type: lessonType,
        videoUrl: lessonType === 'video' ? videoUrl.trim() : '',
        content,
        resources: resources.filter((file) => file.name.trim() && file.url.trim()),
      };
      if (isNew || lectureIndex < 0) {
        lectures.push(payload);
      } else {
        lectures[lectureIndex] = { ...lectures[lectureIndex], ...payload };
      }
      return { ...item, lectures };
    });

    try {
      await courseService.updateCourse(course.id, { curriculum });
      showToast('Lesson saved.', 'success');
      navigate(`${base}/courses/${course.id}/edit?tab=curriculum`);
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not save the lesson.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading lesson...</p>;
  }

  if (!section) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-700">This section is not on the course yet.</p>
        <Link to={`${base}/courses/${courseId}/edit`} className="text-sm text-emerald-800 font-semibold">
          Back to the course
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-5 text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to={`${base}/courses/${courseId}/edit`} className="text-sm text-emerald-800 font-semibold">
            Back to {course?.title || 'course'}
          </Link>
          <h1 className="text-2xl font-bold text-slate-950 mt-1">{isNew ? 'New lesson' : 'Edit lesson'}</h1>
          <p className="text-sm text-slate-500 mt-1">Section: {section.title}</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save lesson'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="lesson-title">Title</label>
          <input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="lesson-type">Type</label>
            <select
              id="lesson-type"
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value as LessonType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
            >
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="quiz">Quiz</option>
              <option value="resource">Download</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="lesson-minutes">Minutes</label>
            <input
              id="lesson-minutes"
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>
        </div>
        {lessonType === 'video' && (
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="lesson-video">Video link</label>
            <input
              id="lesson-video"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Lesson files</h2>
          <button
            type="button"
            className="text-sm font-semibold text-emerald-800"
            onClick={() => setResources((prev) => [...prev, { id: `new-${Date.now()}`, name: '', size: '', url: '' }])}
          >
            Add file
          </button>
        </div>
        {resources.length === 0 && <p className="text-sm text-slate-500">No files yet. Students see an empty Resources tab until you add one.</p>}
        {resources.map((file, index) => (
          <div key={file.id || index} className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-2">
            <input
              value={file.name}
              onChange={(e) => setResources((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, name: e.target.value } : row))}
              placeholder="File name"
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
            <input
              value={file.url}
              onChange={(e) => setResources((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, url: e.target.value } : row))}
              placeholder="https:// link"
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
            <button
              type="button"
              className="text-sm text-rose-700 font-semibold"
              onClick={() => setResources((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <RichTextEditor
          label="Lesson content"
          value={content}
          onChange={setContent}
          placeholder="Write the lesson. You can use headings, lists, links, images, and code."
          minHeight="320px"
        />
      </div>

      {!isNew && (
        <div className="flex items-center justify-between text-sm">
          {previous ? (
            <Link to={lessonPath(previous.section.id, previous.lecture.id)} className="text-emerald-800 font-semibold">
              Previous: {previous.lecture.title}
            </Link>
          ) : <span />}
          {next ? (
            <Link to={lessonPath(next.section.id, next.lecture.id)} className="text-emerald-800 font-semibold">
              Next: {next.lecture.title}
            </Link>
          ) : <span />}
        </div>
      )}
    </form>
  );
};
