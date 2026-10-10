import { apiClient } from './client';

export interface CMSSectionData {
  id: number;
  sectionKey: string;
  sectionName: string;
  badgeText?: string;
  title: string;
  subtitle?: string;
  content?: string;
  mediaUrl?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  jsonData?: Record<string, any>;
  order?: number;
  isActive?: boolean;
}

export interface CMSPageData {
  id: number;
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  sections: CMSSectionData[];
  sectionMap: Record<string, CMSSectionData>;
}

export const cmsService = {
  async getPage(slug: string): Promise<CMSPageData> {
    const res = await apiClient.get(`/cms/pages/${slug}/`);
    return res.data;
  },

  async getAdminPages(): Promise<CMSPageData[]> {
    const res = await apiClient.get('/admin/cms/pages/');
    return res.data.results || res.data;
  },

  async updateSection(sectionId: number, data: Partial<CMSSectionData>): Promise<CMSSectionData> {
    const res = await apiClient.patch(`/admin/cms/sections/${sectionId}/`, data);
    return res.data;
  },

  async createSection(data: Partial<CMSSectionData> & { pageId: number }): Promise<CMSSectionData> {
    const res = await apiClient.post('/admin/cms/sections/', data);
    return res.data;
  },

  async deleteSection(sectionId: number): Promise<void> {
    await apiClient.delete(`/admin/cms/sections/${sectionId}/`);
  }
};
