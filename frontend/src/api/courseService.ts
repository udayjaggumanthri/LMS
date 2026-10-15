import { API_BASE_URL, apiClient } from './client';
import { Course, Category, Review, QAQuestion } from '../types';

async function fetchPages(path: string, params?: Record<string, unknown>): Promise<any[]> {
  const collected: any[] = [];
  let next: string | null = path;
  let first = true;
  while (next) {
    const res: { data: any } = await apiClient.get(next, first ? { params: { page_size: 200, ...(params || {}) } } : undefined);
    const data: any = res.data;
    const page = Array.isArray(data) ? data : data.results;
    if (Array.isArray(page)) collected.push(...page);
    next = data && data.next ? data.next : null;
    first = false;
  }
  return collected;
}

export const courseService = {
  async getCategories(): Promise<Category[]> {
    return fetchPages('/categories/');
  },

  async getCourses(params?: { category?: string; level?: string; price?: string; search?: string }): Promise<Course[]> {
    return fetchPages('/courses/', params);
  },

  async getManagedCourses(): Promise<Course[]> {
    return fetchPages('/instructor/courses/');
  },

  async getManagedCourse(courseId: string | number): Promise<Course> {
    const res = await apiClient.get(`/instructor/courses/${courseId}/`);
    return res.data;
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

  async exportCourses(): Promise<void> {
    const token = localStorage.getItem('prajnadhara_token');
    const res = await fetch(`${API_BASE_URL}/admin/courses/export/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      throw new Error('Could not export the courses.');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prajnadhara-courses.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  async importCourses(file: File): Promise<{ created: number; updated: number; categoriesCreated: number; errors: { course: string; error: string }[] }> {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post('/admin/courses/import/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
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

  async getAnnouncements(courseId: string | number): Promise<{ id: number; title: string; body: string; authorName: string; createdAt: string }[]> {
    const res = await apiClient.get(`/courses/${courseId}/announcements/`);
    return res.data;
  },

  async addAnnouncement(courseId: string | number, data: { title: string; body: string }) {
    const res = await apiClient.post(`/courses/${courseId}/announcements/`, data);
    return res.data;
  },

  async deleteAnnouncement(courseId: string | number, announcementId: string | number) {
    await apiClient.delete(`/courses/${courseId}/announcements/${announcementId}/`);
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
