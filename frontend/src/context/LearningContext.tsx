import React, { createContext, useContext, useState, useEffect } from 'react';
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
  markLectureCompleted: (courseId: string, lectureId: string) => void;
  unmarkLectureCompleted: (courseId: string, lectureId: string) => void;
  setLastAccessedLecture: (courseId: string, lectureId: string) => void;
  getCourseProgressPercent: (courseId: string) => number;
  addNote: (courseId: string, lectureId: string, lectureTitle: string, timestampSeconds: number, text: string) => void;
  deleteNote: (noteId: string) => void;
  getNotesForLecture: (courseId: string, lectureId: string) => UserNote[];
  getNotesForCourse: (courseId: string) => UserNote[];
  addOrder: (order: Order) => void;
  refreshLearning: () => Promise<void>;
  claimCertificate: (courseId: string) => Certificate | null;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const PROGRESS_STORAGE_KEY = 'prajnadhara_progress_v1';
const NOTES_STORAGE_KEY = 'prajnadhara_notes_v1';
const CERTS_STORAGE_KEY = 'prajnadhara_certs_v1';
const ORDERS_STORAGE_KEY = 'prajnadhara_orders_v1';

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
    return {};
  });

  const [notes, setNotes] = useState<UserNote[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem(CERTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Synchronize orders, enrollments, certificates, and notes from backend API
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setEnrollments({});
      setCertificates([]);
      setNotes([]);
      return;
    }

    orderService.getMyOrders()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(() => {});

    learningService.getMyCourses()
      .then((data) => {
        if (data && Array.isArray(data)) {
          const map: Record<string, UserCourseProgress> = {};
          data.forEach((enr: any) => {
            const cId = String(enr.course?.id || enr.course_id || enr.courseId || enr.id);
            map[cId] = {
              courseId: cId,
              completedLectureIds: (enr.completed_lectures || []).map(String),
              lastAccessedLectureId: enr.last_accessed_lecture ? String(enr.last_accessed_lecture) : undefined,
              archived: false
            };
          });
          setEnrollments(map);
        }
      })
      .catch(() => {});

    learningService.getCertificates()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setCertificates(data);
        }
      })
      .catch(() => {});

    learningService.getNotes()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setNotes(data);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const refreshLearning = async () => {
    if (!currentUser) return;
    try {
      const [ordersData, coursesData] = await Promise.all([
        orderService.getMyOrders(),
        learningService.getMyCourses()
      ]);
      if (ordersData && Array.isArray(ordersData)) {
        setOrders(ordersData);
      }
      if (coursesData && Array.isArray(coursesData)) {
        const map: Record<string, UserCourseProgress> = {};
        coursesData.forEach((enr: any) => {
          const cId = String(enr.course?.id || enr.course_id || enr.courseId || enr.id);
          map[cId] = {
            courseId: cId,
            completedLectureIds: (enr.completed_lectures || []).map(String),
            lastAccessedLectureId: enr.last_accessed_lecture ? String(enr.last_accessed_lecture) : undefined,
            archived: false
          };
        });
        setEnrollments(map);
      }
    } catch {
      // ignore
    }
  };

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

  const isEnrolled = (courseId: string | number) => {
    return !!enrollments[String(courseId)] || !!enrollments[courseId as string];
  };

  const enrollInCourse = (courseId: string) => {
    if (enrollments[courseId]) return;
    const course = courses.find(c => String(c.id) === String(courseId));
    const firstLectureId = course?.curriculum?.[0]?.lectures?.[0]?.id;
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
    learningService.toggleLectureProgress(lectureId).catch(() => {});
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
    learningService.toggleLectureProgress(lectureId).catch(() => {});
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
    const course = courses.find(c => String(c.id) === String(courseId));
    if (!course || !course.curriculum) return 0;
    const totalLectures = course.curriculum.reduce((acc, sec) => acc + sec.lectures.length, 0);
    if (totalLectures === 0) return 0;
    const completed = progress.completedLectureIds.length;
    return Math.min(100, Math.round((completed / totalLectures) * 100));
  };

  const addNote = (courseId: string, lectureId: string, lectureTitle: string, timestampSeconds: number, text: string) => {
    const newNote: UserNote = {
      id: `note-${Date.now()}`,
      userId: currentUser?.id ? String(currentUser.id) : 'anon',
      courseId,
      lectureId,
      lectureTitle,
      timestampSeconds,
      text,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setNotes(prev => [newNote, ...prev]);
    learningService.addNote({
      course: courseId,
      lecture: lectureId,
      timestampSeconds,
      text
    }).catch(() => {});
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const getNotesForLecture = (courseId: string, lectureId: string) => {
    return notes.filter(n => String(n.courseId) === String(courseId) && String(n.lectureId) === String(lectureId));
  };

  const getNotesForCourse = (courseId: string) => {
    return notes.filter(n => String(n.courseId) === String(courseId));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    order.items.forEach(item => {
      enrollInCourse(String(item.courseId));
    });
  };

  const claimCertificate = (courseId: string): Certificate | null => {
    const course = courses.find(c => String(c.id) === String(courseId));
    if (!course) return null;
    const existing = certificates.find(c => String(c.courseId) === String(courseId));
    if (existing) return existing;

    const certNum = `PJE-CERT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      courseId,
      courseTitle: course.title,
      userId: currentUser?.id ? String(currentUser.id) : 'student',
      userName: currentUser?.name || 'Student',
      instructorName: typeof course.instructor === 'object' ? course.instructor?.name || 'Faculty Dean' : 'Faculty Dean',
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
