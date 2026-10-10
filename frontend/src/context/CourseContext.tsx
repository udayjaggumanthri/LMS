import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Category, Review, QAQuestion, CourseStatus } from '../types';
import { courseService } from '../api/courseService';

interface CourseContextType {
  courses: Course[];
  categories: Category[];
  reviews: Review[];
  qaQuestions: QAQuestion[];
  getCourseById: (id: string | number) => Course | undefined;
  getCourseBySlug: (slug: string | number) => Course | undefined;
  fetchCourseBySlug: (slug: string) => Promise<Course | null>;
  addCourse: (course: Omit<Course, 'id' | 'rating' | 'reviewsCount' | 'studentCount'>) => Course;
  updateCourse: (id: string, updatedCourse: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  updateCourseStatus: (id: string, status: CourseStatus, feedback?: string) => void;
  addReview: (review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
  addInstructorReply: (reviewId: string, comment: string) => void;
  addQAQuestion: (question: Omit<QAQuestion, 'id' | 'createdAt' | 'answers'>) => void;
  addQAAnswer: (questionId: string, content: string, userId: string, userName: string, userAvatar: string, isInstructor?: boolean) => void;
  addCategory: (category: Omit<Category, 'id' | 'courseCount'>) => void;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const COURSES_STORAGE_KEY = 'prajnadhara_courses_v2';
const REVIEWS_STORAGE_KEY = 'prajnadhara_reviews_v1';
const QA_STORAGE_KEY = 'prajnadhara_qa_v1';
const CATEGORIES_STORAGE_KEY = 'prajnadhara_cats_v2';

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(COURSES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(QA_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Synchronize from backend API on mount
  useEffect(() => {
    courseService.getCourses()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch(() => {
        // Fallback to initial data gracefully
      });

    courseService.getCategories()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Fallback
      });
  }, []);

  useEffect(() => {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(qaQuestions));
  }, [qaQuestions]);

  const getCourseById = (id: string | number) => courses.find(c => String(c.id) === String(id));
  const getCourseBySlug = (slug: string | number) => courses.find(c => c.slug === slug || String(c.id) === String(slug));

  const fetchCourseBySlug = async (slug: string): Promise<Course | null> => {
    const existing = courses.find(c => c.slug === slug || String(c.id) === String(slug));
    if (existing && Array.isArray(existing.curriculum) && existing.curriculum.length > 0) {
      return existing;
    }
    try {
      const fetched = await courseService.getCourseBySlug(slug);
      if (fetched) {
        setCourses(prev => {
          const filtered = prev.filter(c => String(c.id) !== String(fetched.id) && c.slug !== fetched.slug);
          return [fetched, ...filtered];
        });
        return fetched;
      }
    } catch {
      // not found
    }
    return existing || null;
  };

  const addCourse = (newCourseData: Omit<Course, 'id' | 'rating' | 'reviewsCount' | 'studentCount'>): Course => {
    const newCourse: Course = {
      ...newCourseData,
      id: `course-${Date.now()}`,
      rating: 0,
      reviewsCount: 0,
      studentCount: 0
    };
    setCourses(prev => [newCourse, ...prev]);
    courseService.createCourse(newCourseData).catch(() => {});
    return newCourse;
  };

  const updateCourse = (id: string, updatedCourse: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedCourse } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const updateCourseStatus = (id: string, status: CourseStatus, feedback?: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          reviewFeedback: feedback || c.reviewFeedback
        };
      }
      return c;
    }));
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      helpfulCount: 0
    };
    setReviews(prev => [newReview, ...prev]);

    // Recalculate course rating
    setCourses(prev => prev.map(c => {
      if (c.id === reviewData.courseId) {
        const existingForCourse = reviews.filter(r => r.courseId === c.id);
        const totalRating = existingForCourse.reduce((acc, r) => acc + r.rating, reviewData.rating);
        const count = existingForCourse.length + 1;
        const newAvg = Number((totalRating / count).toFixed(1));
        return {
          ...c,
          rating: newAvg,
          reviewsCount: count
        };
      }
      return c;
    }));

    courseService.addReview(reviewData.courseId, { rating: reviewData.rating, comment: reviewData.content }).catch(() => {});
  };

  const addInstructorReply = (reviewId: string, comment: string) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          instructorReply: {
            date: 'Just now',
            comment
          }
        };
      }
      return r;
    }));
    courseService.replyReview(reviewId, comment).catch(() => {});
  };

  const addQAQuestion = (questionData: Omit<QAQuestion, 'id' | 'createdAt' | 'answers'>) => {
    const newQ: QAQuestion = {
      ...questionData,
      id: `qa-${Date.now()}`,
      createdAt: 'Just now',
      answers: []
    };
    setQaQuestions(prev => [newQ, ...prev]);
    courseService.addQAQuestion(questionData.courseId, { title: questionData.title, content: questionData.content }).catch(() => {});
  };

  const addQAAnswer = (questionId: string, content: string, userId: string, userName: string, userAvatar: string, isInstructor = false) => {
    const newAns = {
      id: `ans-${Date.now()}`,
      userId,
      userName,
      userAvatar,
      isInstructor,
      content,
      createdAt: 'Just now'
    };
    setQaQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [...q.answers, newAns]
        };
      }
      return q;
    }));
    courseService.addQAAnswer(questionId, content).catch(() => {});
  };

  const addCategory = (catData: Omit<Category, 'id' | 'courseCount'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      courseCount: 0
    };
    setCategories(prev => [...prev, newCat]);
    courseService.createCategory(catData).catch(() => {});
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updated } : cat));
    const target = categories.find(c => c.id === id);
    if (target) {
      courseService.updateCategory(target.slug, updated).catch(() => {});
    }
  };

  const deleteCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    if (target) {
      courseService.deleteCategory(target.slug).catch(() => {});
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        categories,
        reviews,
        qaQuestions,
        getCourseById,
        getCourseBySlug,
        fetchCourseBySlug,
        addCourse,
        updateCourse,
        deleteCourse,
        updateCourseStatus,
        addReview,
        addInstructorReply,
        addQAQuestion,
        addQAAnswer,
        addCategory,
        updateCategory,
        deleteCategory
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourses must be used within a CourseProvider');
  return context;
};

export const useCourse = useCourses;
