import { apiClient } from './client';
import { Order } from '../types';

export interface AdminGatewayPayment {
  invoice: string;
  applicationId: string;
  applicationOrderId: string;
  amount: string;
  paymentStatus: string;
  customerEmail: string;
  createdAt: string;
  actionCode?: string;
}

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

  async getAdminOrders(q?: string): Promise<Order[]> {
    const res = await apiClient.get('/admin/orders/', { params: { page_size: 200, q: q || undefined } });
    return res.data.results || res.data;
  },

  async searchAdminPayments(q?: string): Promise<{ orders: Order[]; payments: AdminGatewayPayment[] }> {
    const res = await apiClient.get('/admin/payments/', { params: { q: q || undefined } });
    return res.data;
  },

  async checkAdminPayment(data: { invoice?: string; orderId?: string | number }): Promise<{
    success: boolean;
    invoice?: string;
    applicationId?: string;
    applicationOrderId?: string;
    paymentStatus?: string;
    actionCode?: string;
    message?: string;
  }> {
    const res = await apiClient.post('/admin/payments/status-check/', data);
    return res.data;
  },

  async refundOrder(orderId: string | number): Promise<Order> {
    const res = await apiClient.post(`/admin/orders/${orderId}/refund/`);
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

  async abandonToucanPayment(data: {
    invoiceNumber?: string;
    orderId?: number | string;
  }): Promise<Order> {
    const res = await apiClient.post('/payments/toucan/abandon/', data);
    return res.data;
  },

  async checkToucanStatus(orderId: string | number): Promise<{
    success: boolean;
    status: string;
    message?: string;
    actionCode?: string;
    order?: Order;
  }> {
    const res = await apiClient.post(`/admin/orders/${orderId}/status-check/`);
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

  async getTaxInvoice(orderId: string | number) {
    const res = await apiClient.get(`/orders/${orderId}/invoice/`);
    return res.data as TaxInvoice;
  },
};

export interface TaxInvoice {
  company: {
    legalName: string;
    companyLine: string;
    fullName: string;
    address: string;
    phone: string;
    email: string;
    gstNumber: string;
    declaration: string;
    signatureUrl: string;
    stampUrl: string;
  };
  invoiceNumber: string;
  date: string;
  customer: { name: string; email: string; phone: string; address: string };
  courseTitle: string;
  paymentMethod: string;
  lines: { title: string; quantity: number; price: string; amount: string }[];
  quantity: number;
  taxable: string;
  cgstRate: string;
  cgst: string;
  sgstRate: string;
  sgst: string;
  roundOff: string;
  total: string;
  amountInWords: string;
}
