import { apiClient } from './client';
import { Coupon } from '../types';

export const cartService = {
  async getCart() {
    const res = await apiClient.get('/cart/');
    return res.data;
  },

  async addToCart(courseId: string | number) {
    const res = await apiClient.post('/cart/', { courseId });
    return res.data;
  },

  async removeFromCart(courseId: string | number) {
    const res = await apiClient.delete('/cart/', { data: { courseId } });
    return res.data;
  },

  async clearCart() {
    const res = await apiClient.delete('/cart/');
    return res.data;
  },

  async validateCoupon(code: string): Promise<{ success: boolean; coupon?: Coupon; message: string }> {
    const res = await apiClient.post('/cart/validate-coupon/', { code });
    return res.data;
  },
};
