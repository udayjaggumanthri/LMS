import { apiClient } from './client';
import { User, UserRole } from '../types';

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<User> {
    const response = await apiClient.post('/auth/token/', {
      username: usernameOrEmail.trim(),
      password: password
    });
    const { access, refresh, user } = response.data;
    localStorage.setItem('prajnadhara_token', access);
    localStorage.setItem('prajnadhara_refresh_token', refresh);
    if (user) {
      return user as User;
    }
    const profileRes = await apiClient.get('/auth/profile/');
    return profileRes.data as User;
  },

  async register(data: { name: string; email: string; role: UserRole; password?: string }): Promise<User> {
    const username = (data.email.split('@')[0] + Math.floor(100 + Math.random() * 900)).toLowerCase();
    const response = await apiClient.post('/auth/register/', {
      username,
      email: data.email.trim(),
      name: data.name.trim(),
      role: data.role,
      password: data.password || 'Prajnadhar@Pass2026',
    });
    const { access, refresh } = response.data.tokens;
    localStorage.setItem('prajnadhara_token', access);
    localStorage.setItem('prajnadhara_refresh_token', refresh);
    return response.data.user as User;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch('/auth/profile/', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('prajnadhara_token');
    localStorage.removeItem('prajnadhara_refresh_token');
  },
};
