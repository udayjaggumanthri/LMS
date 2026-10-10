import { apiClient } from './client';
import { Course, Category, Review, QAQuestion } from '../types';

export const courseService = {
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get('/categories/');
    return res.data.results || res.data;
  },

  async getCourses(params?: { category?: string; level?: string; price?: string; search?: string }): Promise<Course[]> {
    const res = await apiClient.get('/courses/', { params });
    return res.data.results || res.data;
  },

  async getCourseBySlug(slug: string): Promise<Course> {
    const res = await apiClient.get(`/courses/${slug}/`);
    return res.data;
  },

  async createCourse(data: any): Promise<Course> {
    const res = await apiClient.post('/instructor/courses/', data);
    return res.data;
  },

  async updateCourse(courseId: string | number, data: any): Promise<Course> {
    const res = await apiClient.patch(`/instructor/courses/${courseId}/`, data);
    return res.data;
  },

  async publishCourse(courseId: string | number): Promise<any> {
    const res = await apiClient.post(`/instructor/courses/${courseId}/publish/`);
    return res.data;
  },

  async deleteCourse(courseId: string | number): Promise<any> {
    const res = await apiClient.delete(`/instructor/courses/${courseId}/`);
    return res.data;
  },

  async createCategory(data: any): Promise<Category> {
    const res = await apiClient.post('/categories/', data);
    return res.data;
  },

  async updateCategory(slug: string, data: any): Promise<Category> {
    const res = await apiClient.patch(`/categories/${slug}/`, data);
    return res.data;
  },

  async deleteCategory(slug: string): Promise<any> {
    const res = await apiClient.delete(`/categories/${slug}/`);
    return res.data;
  },

  async getReviews(courseId: string | number): Promise<Review[]> {
    const res = await apiClient.get(`/courses/${courseId}/reviews/`);
    return res.data;
  },

  async addReview(courseId: string | number, data: { rating: number; comment: string }): Promise<Review> {
    const res = await apiClient.post(`/courses/${courseId}/reviews/`, data);
    return res.data;
  },

  async replyReview(reviewId: string | number, comment: string): Promise<Review> {
    const res = await apiClient.post(`/instructor/reviews/${reviewId}/reply/`, { comment });
    return res.data;
  },

  async getQA(courseId: string | number): Promise<QAQuestion[]> {
    const res = await apiClient.get(`/courses/${courseId}/qa/`);
    return res.data;
  },

  async addQAQuestion(courseId: string | number, data: { title: string; content: string }): Promise<QAQuestion> {
    const res = await apiClient.post(`/courses/${courseId}/qa/`, data);
    return res.data;
  },

  async addQAAnswer(questionId: string | number, content: string): Promise<any> {
    const res = await apiClient.post(`/qa/${questionId}/answers/`, { content });
    return res.data;
  },
};
