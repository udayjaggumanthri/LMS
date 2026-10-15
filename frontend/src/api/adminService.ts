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
    const res = await apiClient.get('/admin/users/', { params: { page_size: 200 } });
    return res.data.results || res.data;
  },

  async createUser(data: { name: string; email: string; password: string; role: string }) {
    const res = await apiClient.post('/admin/users/', data);
    return res.data;
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

  async submitInstructorApplication(data: {
    applicant_name: string;
    email: string;
    expertise: string;
    experience_bio: string;
    sample_topic: string;
    linkedin_or_portfolio?: string;
  }) {
    const res = await apiClient.post('/instructor-applications/', data);
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

  async getEmailTemplates() {
    const res = await apiClient.get('/admin/email-templates/');
    return res.data;
  },

  async updateEmailTemplate(key: string, data: { subject?: string; bodyHtml?: string; enabled?: boolean; label?: string }) {
    const res = await apiClient.patch(`/admin/email-templates/${key}/`, data);
    return res.data;
  },

  async testEmailTemplate(key: string, testEmail: string) {
    const res = await apiClient.post(`/admin/email-templates/${key}/`, { testEmail });
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
      transformRequest: [(data, headers) => {
        if (headers) {
          delete headers['Content-Type'];
        }
        return data;
      }],
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

  async getPayouts() {
    const res = await apiClient.get('/admin/payouts/');
    return res.data;
  },

  async getMyPayouts() {
    const res = await apiClient.get('/instructor/payouts/');
    return res.data;
  },

  async requestPayout(data: { amount: number; method: string }) {
    const res = await apiClient.post('/instructor/payouts/', data);
    return res.data;
  },

  async actOnPayout(id: string | number, actionName: 'approve' | 'reject') {
    const res = await apiClient.post(`/admin/payouts/${id}/${actionName}/`);
    return res.data;
  },

  async getCoupons() {
    const res = await apiClient.get('/admin/coupons/', { params: { page_size: 200 } });
    return res.data.results || res.data;
  },

  async createCoupon(data: any) {
    const res = await apiClient.post('/admin/coupons/', data);
    return res.data;
  },

  async updateCoupon(id: string | number, data: any) {
    const res = await apiClient.patch(`/admin/coupons/${id}/`, data);
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

  async getPaymentApplications() {
    const res = await apiClient.get('/v1/applications/');
    return res.data;
  },

  async updatePaymentApplication(id: number, data: Record<string, unknown>) {
    const res = await apiClient.patch(`/v1/applications/${id}/`, data);
    return res.data;
  },

  async rotatePaymentCredential(id: number) {
    const res = await apiClient.post(`/v1/applications/${id}/rotate-credential/`);
    return res.data;
  },
};
