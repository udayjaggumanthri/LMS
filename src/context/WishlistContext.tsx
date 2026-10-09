import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlistCourseIds: string[];
  toggleWishlist: (courseId: string) => void;
  isInWishlist: (courseId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'prajnadhara_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistCourseIds, setWishlistCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['course-4', 'course-6', 'course-8'];
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistCourseIds));
  }, [wishlistCourseIds]);

  const toggleWishlist = (courseId: string) => {
    setWishlistCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const isInWishlist = (courseId: string) => wishlistCourseIds.includes(courseId);

  const clearWishlist = () => setWishlistCourseIds([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistCourseIds,
        toggleWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
