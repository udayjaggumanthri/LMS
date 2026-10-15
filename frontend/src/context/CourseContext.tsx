import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  reloadCourses: () => Promise<void>;
  addCourse: (course: Omit<Course, 'id' | 'rating' | 'reviewsCount' | 'studentCount'>) => Promise<Course>;
  updateCourse: (id: string, updatedCourse: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  updateCourseStatus: (id: string, status: CourseStatus, feedback?: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => Promise<void>;
  addInstructorReply: (reviewId: string, comment: string) => Promise<void>;
  addQAQuestion: (question: Omit<QAQuestion, 'id' | 'createdAt' | 'answers'>) => Promise<void>;
  addQAAnswer: (questionId: string, content: string, userId: string, userName: string, userAvatar: string, isInstructor?: boolean) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'courseCount'>) => Promise<Category>;
  updateCategory: (id: string, updated: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const sameId = (a: unknown, b: unknown) => String(a) === String(b);

function mergeCourses(published: Course[], managed: Course[]): Course[] {
  const map = new Map<string, Course>();
  published.forEach((course) => map.set(String(course.id), course));
  managed.forEach((course) => map.set(String(course.id), course));
  return Array.from(map.values());
}

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qaQuestions, setQaQuestions] = useState<QAQuestion[]>([]);

  const reloadCourses = useCallback(async () => {
    const [published, categoryRows] = await Promise.all([
      courseService.getCourses(),
      courseService.getCategories(),
    ]);
    let managed: Course[] = [];
    if (localStorage.getItem('prajnadhara_token')) {
      try {
        managed = await courseService.getManagedCourses();
      } catch {
        managed = [];
      }
    }
    setCourses(mergeCourses(published, managed));
    setCategories(categoryRows);
  }, []);

  useEffect(() => {
    ['prajnadhara_courses_v2', 'prajnadhara_reviews_v1', 'prajnadhara_qa_v1', 'prajnadhara_cats_v2'].forEach((key) => {
      localStorage.removeItem(key);
    });
    reloadCourses().catch(() => {
      setCourses([]);
      setCategories([]);
    });
  }, [reloadCourses]);

  const getCourseById = (id: string | number) => courses.find((c) => sameId(c.id, id));
  const getCourseBySlug = (slug: string | number) => courses.find((c) => c.slug === slug || sameId(c.id, slug));

  const rememberCourse = (course: Course) => {
    setCourses((prev) => {
      const rest = prev.filter((c) => !sameId(c.id, course.id) && c.slug !== course.slug);
      return [course, ...rest];
    });
  };

  const fetchCourseBySlug = async (slug: string): Promise<Course | null> => {
    const fetched = await courseService.getCourseBySlug(slug);
    if (!fetched) return null;
    rememberCourse(fetched);
    const [reviewRows, qaRows] = await Promise.all([
      courseService.getReviews(fetched.id).catch(() => []),
      courseService.getQA(fetched.id).catch(() => []),
    ]);
    setReviews((prev) => [...prev.filter((r) => !sameId(r.courseId, fetched.id)), ...reviewRows]);
    setQaQuestions((prev) => [...prev.filter((q) => !sameId(q.courseId, fetched.id)), ...qaRows]);
    return fetched;
  };

  const addCourse = async (newCourseData: Omit<Course, 'id' | 'rating' | 'reviewsCount' | 'studentCount'>): Promise<Course> => {
    const created = await courseService.createCourse(newCourseData);
    rememberCourse(created);
    return created;
  };

  const updateCourse = async (id: string, updatedCourse: Partial<Course>): Promise<Course> => {
    const saved = await courseService.updateCourse(id, updatedCourse);
    rememberCourse(saved);
    return saved;
  };

  const deleteCourse = async (id: string) => {
    await courseService.deleteCourse(id);
    setCourses((prev) => prev.filter((c) => !sameId(c.id, id)));
  };

  const updateCourseStatus = async (id: string, status: CourseStatus, feedback?: string) => {
    if (status === 'published') {
      const saved = await courseService.publishCourse(id);
      if (saved && saved.id) rememberCourse(saved);
      else setCourses((prev) => prev.map((c) => (sameId(c.id, id) ? { ...c, status } : c)));
      return;
    }
    const saved = await courseService.updateCourse(id, { status, review_feedback: feedback || '' });
    rememberCourse({ ...saved, reviewFeedback: feedback || saved.reviewFeedback });
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => {
    const saved = await courseService.addReview(reviewData.courseId, {
      rating: reviewData.rating,
      comment: (reviewData as { comment?: string; content?: string }).comment || (reviewData as { content?: string }).content || '',
    });
    setReviews((prev) => [saved, ...prev.filter((r) => !sameId(r.id, saved.id))]);
  };

  const addInstructorReply = async (reviewId: string, comment: string) => {
    const saved = await courseService.replyReview(reviewId, comment);
    setReviews((prev) => prev.map((r) => (sameId(r.id, reviewId) ? { ...r, ...saved } : r)));
  };

  const addQAQuestion = async (questionData: Omit<QAQuestion, 'id' | 'createdAt' | 'answers'>) => {
    const saved = await courseService.addQAQuestion(questionData.courseId, {
      title: questionData.title,
      content: questionData.content,
    });
    setQaQuestions((prev) => [{ ...saved, answers: saved.answers || [] }, ...prev]);
  };

  const addQAAnswer = async (questionId: string, content: string) => {
    await courseService.addQAAnswer(questionId, content);
    const question = qaQuestions.find((q) => sameId(q.id, questionId));
    if (question) {
      const rows = await courseService.getQA(question.courseId);
      setQaQuestions((prev) => [...prev.filter((q) => !sameId(q.courseId, question.courseId)), ...rows]);
    }
  };

  const addCategory = async (catData: Omit<Category, 'id' | 'courseCount'>): Promise<Category> => {
    const created = await courseService.createCategory(catData);
    setCategories((prev) => [...prev.filter((c) => !sameId(c.id, created.id)), created]);
    return created;
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    const target = categories.find((c) => sameId(c.id, id));
    if (!target) throw new Error('Category not found.');
    const saved = await courseService.updateCategory(target.slug, updated);
    setCategories((prev) => prev.map((cat) => (sameId(cat.id, id) ? saved : cat)));
  };

  const deleteCategory = async (id: string) => {
    const target = categories.find((c) => sameId(c.id, id));
    if (!target) return;
    await courseService.deleteCategory(target.slug);
    setCategories((prev) => prev.filter((c) => !sameId(c.id, id)));
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
        reloadCourses,
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
        deleteCategory,
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
