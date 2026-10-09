import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Category, Review, QAQuestion, CourseStatus } from '../types';
import { COURSES, CATEGORIES, REVIEWS, QA_QUESTIONS } from '../data/mockData';

interface CourseContextType {
  courses: Course[];
  categories: Category[];
  reviews: Review[];
  qaQuestions: QAQuestion[];
  getCourseById: (id: string) => Course | undefined;
  getCourseBySlug: (slug: string) => Course | undefined;
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
    return COURSES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return CATEGORIES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return REVIEWS;
  });

  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(QA_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return QA_QUESTIONS;
  });

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

  const getCourseById = (id: string) => courses.find(c => c.id === id);
  const getCourseBySlug = (slug: string) => courses.find(c => c.slug === slug);

  const addCourse = (newCourseData: Omit<Course, 'id' | 'rating' | 'reviewsCount' | 'studentCount'>): Course => {
    const newCourse: Course = {
      ...newCourseData,
      id: `course-${Date.now()}`,
      rating: 0,
      reviewsCount: 0,
      studentCount: 0
    };
    setCourses(prev => [newCourse, ...prev]);
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
  };

  const addQAQuestion = (questionData: Omit<QAQuestion, 'id' | 'createdAt' | 'answers'>) => {
    const newQ: QAQuestion = {
      ...questionData,
      id: `qa-${Date.now()}`,
      createdAt: 'Just now',
      answers: []
    };
    setQaQuestions(prev => [newQ, ...prev]);
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
  };

  const addCategory = (catData: Omit<Category, 'id' | 'courseCount'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      courseCount: 0
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updated } : cat));
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
        addCourse,
        updateCourse,
        deleteCourse,
        updateCourseStatus,
        addReview,
        addInstructorReply,
        addQAQuestion,
        addQAAnswer,
        addCategory,
        updateCategory
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
