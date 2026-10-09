import React, { createContext, useContext, useState, useEffect } from 'react';
import { Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/mockData';
import { useCourses } from './CourseContext';

interface CartContextType {
  cartCourseIds: string[];
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
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
    return ['course-3'];
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

  const addToCart = (courseId: string) => {
    setCartCourseIds(prev => (prev.includes(courseId) ? prev : [...prev, courseId]));
  };

  const removeFromCart = (courseId: string) => {
    setCartCourseIds(prev => prev.filter(id => id !== courseId));
  };

  const clearCart = () => {
    setCartCourseIds([]);
    setAppliedCoupon(null);
  };

  const isInCart = (courseId: string) => cartCourseIds.includes(courseId);

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find(c => c.code === trimmed && c.active);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon applied: ${found.discountPercent}% off!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartCourseIds.reduce((sum, id) => {
    const course = courses.find(c => c.id === id);
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
