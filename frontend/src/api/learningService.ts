import { apiClient } from './client';
import { Certificate, UserNote } from '../types';

export const learningService = {
  async getMyCourses(): Promise<any[]> {
    const res = await apiClient.get('/learning/my-courses/');
    return res.data;
  },

  async getCourseProgress(courseId: string | number) {
    const res = await apiClient.get(`/learning/progress/${courseId}/`);
    return res.data;
  },

  async toggleLectureProgress(lectureId: string | number) {
    const res = await apiClient.post(`/learning/lectures/${lectureId}/toggle/`);
    return res.data;
  },

  async getCertificates(): Promise<Certificate[]> {
    const res = await apiClient.get('/learning/certificates/');
    return res.data.results || res.data;
  },

  async verifyCertificate(certNumber: string): Promise<Certificate> {
    const res = await apiClient.get(`/learning/certificates/verify/${certNumber}/`);
    return res.data;
  },

  async getNotes(courseId?: string | number): Promise<UserNote[]> {
    const res = await apiClient.get('/learning/notes/', { params: { courseId } });
    return res.data.results || res.data;
  },

  async addNote(data: { course: number | string; lecture: number | string; timestampSeconds: number; text: string }): Promise<UserNote> {
    const res = await apiClient.post('/learning/notes/', data);
    return res.data;
  },
};
