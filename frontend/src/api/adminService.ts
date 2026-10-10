import { apiClient } from './client';

export const adminService = {
  async getDashboardStats() {
    const res = await apiClient.get('/admin/dashboard-stats/');
    return res.data;
  },

  async getPlatformSettings() {
    const res = await apiClient.get('/admin/settings/');
    return res.data;
  },

  async updatePlatformSettings(data: any) {
    const res = await apiClient.put('/admin/settings/', data);
    return res.data;
  },

  async getUsers() {
    const res = await apiClient.get('/admin/users/');
    return res.data.results || res.data;
  },

  async updateUser(userId: string | number, data: any) {
    const res = await apiClient.patch(`/admin/users/${userId}/`, data);
    return res.data;
  },

  async deleteUser(userId: string | number) {
    const res = await apiClient.delete(`/admin/users/${userId}/`);
    return res.data;
  },

  async getReviewQueue() {
    const res = await apiClient.get('/admin/review-queue/');
    return res.data.results || res.data;
  },

  async approveCourse(courseId: string | number) {
    const res = await apiClient.post(`/admin/review-queue/${courseId}/approve/`);
    return res.data;
  },

  async requestCourseChanges(courseId: string | number, feedback: string) {
    const res = await apiClient.post(`/admin/review-queue/${courseId}/request_changes/`, { feedback });
    return res.data;
  },

  async getInstructorApplications() {
    const res = await apiClient.get('/instructor-applications/');
    return res.data.results || res.data;
  },

  async updateApplicationStatus(id: string | number, status: 'approved' | 'rejected', adminFeedback: string) {
    const res = await apiClient.patch(`/instructor-applications/${id}/`, {
      status,
      admin_feedback: adminFeedback,
    });
    return res.data;
  },

  async getSMTPSettings() {
    const res = await apiClient.get('/admin/smtp/');
    return res.data;
  },

  async updateSMTPSettings(data: any) {
    const res = await apiClient.put('/admin/smtp/', data);
    return res.data;
  },

  async testSMTPEmail(testEmail: string) {
    const res = await apiClient.post('/admin/smtp/test/', { testEmail });
    return res.data;
  },

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/media/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getMediaList() {
    const res = await apiClient.get('/media/');
    return res.data;
  },

  async deleteMedia(id: number | string) {
    const res = await apiClient.delete(`/media/${id}/`);
    return res.data;
  },

  async getPaymentGatewaySettings() {
    const res = await apiClient.get('/admin/payment-gateway/');
    return res.data;
  },

  async updatePaymentGatewaySettings(data: any) {
    const res = await apiClient.put('/admin/payment-gateway/', data);
    return res.data;
  },

  async testPaymentGatewayConnection(testAmount: string | number = '10') {
    const res = await apiClient.post('/admin/payment-gateway/test/', { testAmount });
    return res.data;
  },
};
