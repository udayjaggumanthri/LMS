import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserCourseProgress, UserNote, Certificate, Order } from '../types';
import { useAuth } from './AuthContext';
import { useCourses } from './CourseContext';
import { learningService } from '../api/learningService';
import { orderService } from '../api/orderService';

interface LearningContextType {
  enrollments: Record<string, UserCourseProgress>;
  notes: UserNote[];
  certificates: Certificate[];
  orders: Order[];
  isEnrolled: (courseId: string) => boolean;
  enrollInCourse: (courseId: string) => void;
  markLectureCompleted: (courseId: string, lectureId: string) => Promise<void>;
  unmarkLectureCompleted: (courseId: string, lectureId: string) => Promise<void>;
  setLastAccessedLecture: (courseId: string, lectureId: string) => void;
  getCourseProgressPercent: (courseId: string) => number;
  addNote: (courseId: string, lectureId: string, lectureTitle: string, timestampSeconds: number, text: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  getNotesForLecture: (courseId: string, lectureId: string) => UserNote[];
  getNotesForCourse: (courseId: string) => UserNote[];
  addOrder: (order: Order) => void;
  refreshLearning: () => Promise<void>;
  claimCertificate: (courseId: string) => Promise<Certificate | null>;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

function mapNote(note: any): UserNote {
  return {
    id: String(note.id),
    userId: String(note.userId || note.user || ''),
    courseId: String(note.courseId || note.course),
    lectureId: String(note.lectureId || note.lecture),
    lectureTitle: note.lectureTitle || note.lecture_title || '',
    timestampSeconds: Number(note.timestampSeconds ?? note.timestamp_seconds ?? 0),
    text: note.text || '',
    createdAt: note.createdAt || (note.created_at ? String(note.created_at).slice(0, 10) : ''),
  };
}

function mapEnrollment(enr: any): [string, UserCourseProgress] | null {
  const cId = String(enr.course?.id || enr.course_id || enr.courseId || '');
  if (!cId) return null;
  const completed = enr.completedLectureIds || enr.completed_lectures || [];
  return [cId, {
    courseId: cId,
    completedLectureIds: completed.map(String),
    lastAccessedLectureId: enr.last_accessed_lecture ? String(enr.last_accessed_lecture) : undefined,
    archived: false,
  }];
}

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { courses } = useCourses();
  const [enrollments, setEnrollments] = useState<Record<string, UserCourseProgress>>({});
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshLearning = useCallback(async () => {
    if (!currentUser) {
      setOrders([]);
      setEnrollments({});
      setCertificates([]);
      setNotes([]);
      return;
    }
    const [ordersData, coursesData, certs, noteRows] = await Promise.all([
      orderService.getMyOrders(),
      learningService.getMyCourses(),
      learningService.getCertificates(),
      learningService.getNotes(),
    ]);
    setOrders(Array.isArray(ordersData) ? ordersData : []);
    const map: Record<string, UserCourseProgress> = {};
    (coursesData || []).forEach((enr: any) => {
      const mapped = mapEnrollment(enr);
      if (mapped) map[mapped[0]] = mapped[1];
    });
    setEnrollments(map);
    setCertificates(Array.isArray(certs) ? certs : []);
    setNotes(Array.isArray(noteRows) ? noteRows.map(mapNote) : []);
  }, [currentUser]);

  useEffect(() => {
    ['prajnadhara_progress_v1', 'prajnadhara_notes_v1', 'prajnadhara_certs_v1', 'prajnadhara_orders_v1'].forEach((key) => {
      localStorage.removeItem(key);
    });
    refreshLearning().catch(() => undefined);
  }, [refreshLearning]);

  const isEnrolled = (courseId: string | number) => !!enrollments[String(courseId)];

  const enrollInCourse = (courseId: string) => {
    if (enrollments[String(courseId)]) return;
    setEnrollments((prev) => ({
      ...prev,
      [String(courseId)]: { courseId: String(courseId), completedLectureIds: [], archived: false },
    }));
  };

  const markLectureCompleted = async (courseId: string, lectureId: string) => {
    const result = await learningService.toggleLectureProgress(lectureId);
    setEnrollments((prev) => {
      const key = String(courseId);
      const current = prev[key] || { courseId: key, completedLectureIds: [], archived: false };
      const completed = result.completed
        ? Array.from(new Set([...current.completedLectureIds, String(lectureId)]))
        : current.completedLectureIds.filter((id) => String(id) !== String(lectureId));
      return { ...prev, [key]: { ...current, completedLectureIds: completed, lastAccessedLectureId: String(lectureId) } };
    });
    if (result.certificateAwarded) {
      setCertificates((prev) => [result.certificateAwarded, ...prev.filter((c: Certificate) => String(c.id) !== String(result.certificateAwarded.id))]);
    }
  };

  const unmarkLectureCompleted = async (courseId: string, lectureId: string) => {
    await markLectureCompleted(courseId, lectureId);
  };

  const setLastAccessedLecture = (courseId: string, lectureId: string) => {
    setEnrollments((prev) => {
      const key = String(courseId);
      const current = prev[key];
      if (!current) return prev;
      return { ...prev, [key]: { ...current, lastAccessedLectureId: lectureId } };
    });
  };

  const getCourseProgressPercent = (courseId: string): number => {
    const progress = enrollments[String(courseId)];
    if (!progress) return 0;
    const course = courses.find((c) => String(c.id) === String(courseId));
    if (!course) return 0;
    const fromCurriculum = (course.curriculum || []).reduce((acc, sec) => acc + (sec.lectures || []).length, 0);
    const totalLectures = fromCurriculum || Number(course.lectureCount || 0);
    if (totalLectures === 0) return 0;
    return Math.min(100, Math.round((progress.completedLectureIds.length / totalLectures) * 100));
  };

  const addNote = async (courseId: string, lectureId: string, lectureTitle: string, timestampSeconds: number, text: string) => {
    const saved = await learningService.addNote({
      course: courseId,
      lecture: lectureId,
      timestampSeconds,
      text,
    });
    setNotes((prev) => [mapNote({ ...saved, lectureTitle }), ...prev]);
  };

  const deleteNote = async (noteId: string) => {
    await learningService.deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => String(n.id) !== String(noteId)));
  };

  const getNotesForLecture = (courseId: string, lectureId: string) =>
    notes.filter((n) => String(n.courseId) === String(courseId) && String(n.lectureId) === String(lectureId));

  const getNotesForCourse = (courseId: string) => notes.filter((n) => String(n.courseId) === String(courseId));

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    order.items.forEach((item) => enrollInCourse(String(item.courseId)));
  };

  const claimCertificate = async (courseId: string): Promise<Certificate | null> => {
    const existing = certificates.find((c) => String(c.courseId) === String(courseId));
    if (existing) return existing;
    const cert = await learningService.claimCertificate(courseId);
    setCertificates((prev) => [cert, ...prev]);
    return cert;
  };

  return (
    <LearningContext.Provider
      value={{
        enrollments,
        notes,
        certificates,
        orders,
        isEnrolled,
        enrollInCourse,
        markLectureCompleted,
        unmarkLectureCompleted,
        setLastAccessedLecture,
        getCourseProgressPercent,
        addNote,
        deleteNote,
        getNotesForLecture,
        getNotesForCourse,
        addOrder,
        refreshLearning,
        claimCertificate,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) throw new Error('useLearning must be used within a LearningProvider');
  return context;
};
