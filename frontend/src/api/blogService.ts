import { apiClient } from './client';

export interface BlogPostItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  readTime: string;
  viewsCount: number;
  isPublished: boolean;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const blogService = {
  async getBlogs(params?: { category?: string; q?: string }): Promise<BlogPostItem[]> {
    const res = await apiClient.get('/blogs/', { params });
    return res.data.results || res.data;
  },

  async getBlogBySlug(slug: string): Promise<BlogPostItem> {
    const res = await apiClient.get(`/blogs/${slug}/`);
    return res.data;
  },

  async getAdminBlogs(): Promise<BlogPostItem[]> {
    const res = await apiClient.get('/admin/blogs/');
    return res.data.results || res.data;
  },

  async createBlog(data: Partial<BlogPostItem>): Promise<BlogPostItem> {
    const res = await apiClient.post('/admin/blogs/', data);
    return res.data;
  },

  async updateBlog(id: number | string, data: Partial<BlogPostItem>): Promise<BlogPostItem> {
    const res = await apiClient.put(`/admin/blogs/${id}/`, data);
    return res.data;
  },

  async deleteBlog(id: number | string): Promise<void> {
    await apiClient.delete(`/admin/blogs/${id}/`);
  }
};
