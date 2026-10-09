import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserCourseProgress, UserNote, Certificate, Order, RefundRequest } from '../types';
import { INITIAL_PROGRESS, INITIAL_ORDERS, INITIAL_REFUNDS, INITIAL_CERTIFICATES } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useCourses } from './CourseContext';

interface LearningContextType {
  enrollments: Record<string, UserCourseProgress>;
  notes: UserNote[];
  certificates: Certificate[];
  orders: Order[];
  refundRequests: RefundRequest[];
  isEnrolled: (courseId: string) => boolean;
  enrollInCourse: (courseId: string) => void;
  markLectureCompleted: (courseId: string, lectureId: string) => void;
  unmarkLectureCompleted: (courseId: string, lectureId: string) => void;
  setLastAccessedLecture: (courseId: string, lectureId: string) => void;
  getCourseProgressPercent: (courseId: string) => number;
  addNote: (courseId: string, lectureId: string, lectureTitle: string, timestampSeconds: number, text: string) => void;
  deleteNote: (noteId: string) => void;
  getNotesForLecture: (courseId: string, lectureId: string) => UserNote[];
  getNotesForCourse: (courseId: string) => UserNote[];
  addOrder: (order: Order) => void;
  requestRefund: (orderId: string, courseId: string, courseTitle: string, amount: number, reason: string) => { success: boolean; message: string };
  approveRefund: (refundId: string) => void;
  rejectRefund: (refundId: string, feedback?: string) => void;
  claimCertificate: (courseId: string) => Certificate | null;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const PROGRESS_STORAGE_KEY = 'prajnadhara_progress_v1';
const NOTES_STORAGE_KEY = 'prajnadhara_notes_v1';
const CERTS_STORAGE_KEY = 'prajnadhara_certs_v1';
const ORDERS_STORAGE_KEY = 'prajnadhara_orders_v1';
const REFUNDS_STORAGE_KEY = 'prajnadhara_refunds_v1';

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { courses } = useCourses();

  const [enrollments, setEnrollments] = useState<Record<string, UserCourseProgress>>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROGRESS;
  });

  const [notes, setNotes] = useState<UserNote[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'note-1',
        userId: 'user-student-1',
        courseId: 'course-1',
        lectureId: 'lec-1-2',
        lectureTitle: 'Strict TypeScript: Generics, Discriminated Unions & Utility Types',
        timestampSeconds: 142,
        text: 'Key insight: Always use satisfies to validate literal config without widening to Record<string, any>.',
        createdAt: '2 days ago'
      }
    ];
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem(CERTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CERTIFICATES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(() => {
    try {
      const saved = localStorage.getItem(REFUNDS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_REFUNDS;
  });

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(REFUNDS_STORAGE_KEY, JSON.stringify(refundRequests));
  }, [refundRequests]);

  const isEnrolled = (courseId: string) => {
    return !!enrollments[courseId];
  };

  const enrollInCourse = (courseId: string) => {
    if (enrollments[courseId]) return;
    const course = courses.find(c => c.id === courseId);
    const firstLectureId = course?.curriculum[0]?.lectures[0]?.id;
    setEnrollments(prev => ({
      ...prev,
      [courseId]: {
        courseId,
        completedLectureIds: [],
        lastAccessedLectureId: firstLectureId,
        archived: false
      }
    }));
  };

  const markLectureCompleted = (courseId: string, lectureId: string) => {
    setEnrollments(prev => {
      const current = prev[courseId] || { courseId, completedLectureIds: [], archived: false };
      if (current.completedLectureIds.includes(lectureId)) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          completedLectureIds: [...current.completedLectureIds, lectureId],
          lastAccessedLectureId: lectureId
        }
      };
    });
  };

  const unmarkLectureCompleted = (courseId: string, lectureId: string) => {
    setEnrollments(prev => {
      const current = prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          completedLectureIds: current.completedLectureIds.filter(id => id !== lectureId)
        }
      };
    });
  };

  const setLastAccessedLecture = (courseId: string, lectureId: string) => {
    setEnrollments(prev => {
      const current = prev[courseId];
      if (!current) return prev;
      return {
        ...prev,
        [courseId]: {
          ...current,
          lastAccessedLectureId: lectureId
        }
      };
    });
  };

  const getCourseProgressPercent = (courseId: string): number => {
    const progress = enrollments[courseId];
    if (!progress) return 0;
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.curriculum) return 0;
    const totalLectures = course.curriculum.reduce((acc, sec) => acc + sec.lectures.length, 0);
    if (totalLectures === 0) return 0;
    const completed = progress.completedLectureIds.length;
    return Math.min(100, Math.round((completed / totalLectures) * 100));
  };

  const addNote = (courseId: string, lectureId: string, lectureTitle: string, timestampSeconds: number, text: string) => {
    const newNote: UserNote = {
      id: `note-${Date.now()}`,
      userId: currentUser?.id || 'anon',
      courseId,
      lectureId,
      lectureTitle,
      timestampSeconds,
      text,
      createdAt: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const getNotesForLecture = (courseId: string, lectureId: string) => {
    return notes.filter(n => n.courseId === courseId && n.lectureId === lectureId);
  };

  const getNotesForCourse = (courseId: string) => {
    return notes.filter(n => n.courseId === courseId);
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    // Automatically enroll user in all courses in the order
    order.items.forEach(item => {
      enrollInCourse(item.courseId);
    });
  };

  const requestRefund = (orderId: string, courseId: string, courseTitle: string, amount: number, reason: string) => {
    // Check if already requested
    const existing = refundRequests.find(r => r.orderId === orderId && r.courseId === courseId);
    if (existing) {
      return { success: false, message: 'A refund request for this course is already recorded.' };
    }
    const newReq: RefundRequest = {
      id: `ref-${Date.now()}`,
      orderId,
      courseId,
      courseTitle,
      userId: currentUser?.id || 'user-student-1',
      userName: currentUser?.name || 'Student',
      userEmail: currentUser?.email || 'student@example.com',
      amount,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRefundRequests(prev => [newReq, ...prev]);
    return { success: true, message: 'Refund request submitted successfully. You will receive an update within 24-48 hours.' };
  };

  const approveRefund = (refundId: string) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === refundId) {
        return {
          ...r,
          status: 'approved',
          processedAt: new Date().toISOString().split('T')[0]
        };
      }
      return r;
    }));
  };

  const rejectRefund = (refundId: string, feedback?: string) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === refundId) {
        return {
          ...r,
          status: 'rejected',
          processedAt: new Date().toISOString().split('T')[0],
          adminNotes: feedback
        };
      }
      return r;
    }));
  };

  const claimCertificate = (courseId: string): Certificate | null => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;
    const existing = certificates.find(c => c.courseId === courseId && c.userId === (currentUser?.id || 'user-student-1'));
    if (existing) return existing;

    const certNum = `PJE-CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      courseId,
      courseTitle: course.title,
      userId: currentUser?.id || 'user-student-1',
      userName: currentUser?.name || 'Arjun Nambiar',
      instructorName: 'Neha Deshmukh',
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      grade: 'Distinction (96%)',
      totalHours: course.durationHours,
      verifyUrl: `https://prajnadhara.edu/verify/${certNum}`
    };
    setCertificates(prev => [newCert, ...prev]);
    return newCert;
  };

  return (
    <LearningContext.Provider
      value={{
        enrollments,
        notes,
        certificates,
        orders,
        refundRequests,
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
        requestRefund,
        approveRefund,
        rejectRefund,
        claimCertificate
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
