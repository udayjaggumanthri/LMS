import { apiClient } from './client';
import { Order } from '../types';

export const orderService = {
  async checkout(data: {
    courseIds?: string[];
    couponCode?: string;
    paymentMethod: 'card' | 'upi' | 'netbanking';
  }): Promise<{ success: boolean; message: string; order: Order; gateway: any }> {
    const res = await apiClient.post('/orders/checkout/', data);
    return res.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await apiClient.get('/orders/my-orders/');
    return res.data;
  },

  async initiateToucanPayment(data: {
    courseIds?: string[];
    couponCode?: string;
    name?: string;
    phone?: string;
    email?: string;
  }): Promise<{
    success: boolean;
    redirectUrl: string;
    invoiceNumber: string;
    orderId: number | string;
    orderNumber: string;
    isSimulated?: boolean;
    notice?: string;
  }> {
    const res = await apiClient.post('/payments/toucan/initiate/', data);
    return res.data;
  },

  async verifyToucanPayment(data: {
    invoiceNumber?: string;
    orderId?: number | string;
    simulateConfirm?: boolean;
  }): Promise<{
    success: boolean;
    status: string;
    order?: Order;
    error?: string;
  }> {
    const res = await apiClient.post('/payments/toucan/verify/', data);
    return res.data;
  },
};
