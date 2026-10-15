import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Coupon } from '../types';
import { useAuth } from './AuthContext';
import { cartService } from '../api/cartService';

export interface CartCourse {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  isFree: boolean;
  thumbnail: string;
  subcategory: string;
  level: string;
}

interface CartContextType {
  cartCourseIds: string[];
  cartItems: CartCourse[];
  cartReady: boolean;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (courseId: string) => boolean;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

const PENDING_KEY = 'prajnadhara_pending_cart';

export class CartAuthError extends Error {
  constructor() {
    super('Sign in to add this course to your cart.');
    this.name = 'CartAuthError';
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function asNumber(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function mapCart(data: { items?: Array<Record<string, unknown>> } | null | undefined): CartCourse[] {
  return (data?.items || []).map((item) => {
    const course = (item.course || {}) as Record<string, unknown>;
    const id = String(item.courseId || course.id || '');
    return {
      id,
      title: String(course.title || 'Course'),
      slug: String(course.slug || id),
      price: asNumber(course.price),
      originalPrice: asNumber(course.originalPrice ?? course.original_price),
      isFree: Boolean(course.isFree ?? course.is_free) || asNumber(course.price) === 0,
      thumbnail: String(course.thumbnail || ''),
      subcategory: String(course.subcategory || ''),
      level: String(course.level || ''),
    };
  }).filter((item) => item.id && item.id !== 'undefined');
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartCourse[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    localStorage.removeItem('prajnadhara_cart_v1');
    localStorage.removeItem('prajnadhara_coupon_v1');
  }, []);

  useEffect(() => {
    const ticket = ++generation.current;
    if (!currentUser?.id) {
      setCartItems([]);
      setAppliedCoupon(null);
      setCartReady(true);
      return;
    }
    setCartReady(false);
    (async () => {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (pending) {
        sessionStorage.removeItem(PENDING_KEY);
        try {
          await cartService.addToCart(pending);
        } catch {
          // The cart reload below shows whatever the server kept.
        }
      }
      try {
        const data = await cartService.getCart();
        if (ticket === generation.current) setCartItems(mapCart(data));
      } catch {
        if (ticket === generation.current) setCartItems([]);
      } finally {
        if (ticket === generation.current) setCartReady(true);
      }
    })();
  }, [currentUser?.id]);

  const addToCart = async (courseId: string | number) => {
    const sId = String(courseId);
    if (!currentUser?.id) {
      sessionStorage.setItem(PENDING_KEY, sId);
      throw new CartAuthError();
    }
    const ticket = ++generation.current;
    const data = await cartService.addToCart(sId);
    if (ticket === generation.current) {
      setCartItems(mapCart(data));
      setCartReady(true);
    }
  };

  const removeFromCart = async (courseId: string | number) => {
    const sId = String(courseId);
    const ticket = ++generation.current;
    const data = await cartService.removeFromCart(sId);
    if (ticket === generation.current) {
      setCartItems(mapCart(data));
      setCartReady(true);
    }
  };

  const clearCart = async () => {
    const ticket = ++generation.current;
    const data = await cartService.clearCart();
    if (ticket === generation.current) {
      setCartItems(mapCart(data));
      setAppliedCoupon(null);
      setCartReady(true);
    }
  };

  const isInCart = (courseId: string | number) => cartItems.some((item) => item.id === String(courseId));

  const applyCoupon = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    try {
      const res = await cartService.validateCoupon(trimmed);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        return { success: true, message: res.message || `Coupon applied: ${res.coupon.discountPercent}% off.` };
      }
      return { success: false, message: res.message || 'Invalid or expired coupon code.' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Invalid or expired coupon code.';
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.isFree ? 0 : item.price), 0);
  const discount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal - discount);
  const cartCourseIds = cartItems.map((item) => item.id);

  return (
    <CartContext.Provider
      value={{
        cartCourseIds,
        cartItems,
        cartReady,
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
        itemCount: cartItems.length,
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
