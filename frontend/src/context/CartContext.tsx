import React, { createContext, useContext, useState, useEffect } from 'react';
import { Coupon } from '../types';
import { useCourses } from './CourseContext';
import { cartService } from '../api/cartService';

interface CartContextType {
  cartCourseIds: string[];
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'prajnadhara_cart_v1';
const COUPON_STORAGE_KEY = 'prajnadhara_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { courses } = useCourses();
  const [cartCourseIds, setCartCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartCourseIds));
  }, [cartCourseIds]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const addToCart = (courseId: string | number) => {
    const sId = String(courseId);
    setCartCourseIds(prev => (prev.some(id => String(id) === sId) ? prev : [...prev, sId]));
    cartService.addToCart(sId).catch(() => {});
  };

  const removeFromCart = (courseId: string | number) => {
    const sId = String(courseId);
    setCartCourseIds(prev => prev.filter(id => String(id) !== sId));
    cartService.removeFromCart(sId).catch(() => {});
  };

  const clearCart = () => {
    setCartCourseIds([]);
    setAppliedCoupon(null);
    cartService.clearCart().catch(() => {});
  };

  const isInCart = (courseId: string | number) => cartCourseIds.some(id => String(id) === String(courseId));

  const applyCoupon = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    try {
      const res = await cartService.validateCoupon(trimmed);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        return { success: true, message: res.message || `Coupon applied: ${res.coupon.discountPercent}% off!` };
      }
      return { success: false, message: res.message || 'Invalid or expired coupon code.' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid or expired coupon code.';
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartCourseIds.reduce((sum, id) => {
    const course = courses.find(c => String(c.id) === String(id));
    return sum + (course ? course.price : 0);
  }, 0);

  const discount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        cartCourseIds,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        total,
        itemCount: cartCourseIds.length
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
