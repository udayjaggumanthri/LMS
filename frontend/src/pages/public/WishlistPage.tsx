import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Filter,
  ArrowUpDown,
  Tag,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useCourses } from '../../context/CourseContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { CourseCard } from '../../components/ui/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Modal } from '../../components/ui/Modal';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlistCourseIds, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { courses, categories } = useCourses();
  const { showToast } = useNotifications();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const wishlistedCourses = useMemo(() => {
    return courses.filter(c => wishlistCourseIds.includes(c.id));
  }, [courses, wishlistCourseIds]);

  // Derived financial totals
  const totalOriginalPrice = useMemo(() => {
    return wishlistedCourses.reduce((sum, c) => sum + (c.originalPrice || c.price), 0);
  }, [wishlistedCourses]);

  const totalCurrentPrice = useMemo(() => {
    return wishlistedCourses.reduce((sum, c) => sum + c.price, 0);
  }, [wishlistedCourses]);

  const totalSavings = totalOriginalPrice - totalCurrentPrice;

  // Filter and sort
  const filteredCourses = useMemo(() => {
    let list = [...wishlistedCourses];

    if (selectedCategory !== 'all') {
      list = list.filter(c => c.categoryId === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [wishlistedCourses, selectedCategory, sortBy]);

  const handleMoveAllToCart = () => {
    if (wishlistedCourses.length === 0) return;
    wishlistedCourses.forEach(c => addToCart(c.id));
    clearWishlist();
    showToast('success', `Moved all ${wishlistedCourses.length} courses to your shopping cart!`);
    navigate('/cart');
  };

  const handleConfirmClear = () => {
    clearWishlist();
    setIsClearModalOpen(false);
    showToast('info', 'Your wishlist has been cleared.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Wishlist' }
        ]}
        className="mb-6"
      />

      {/* Header and Bulk Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Saved Masterclasses & Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {wishlistedCourses.length} {wishlistedCourses.length === 1 ? 'curriculum item' : 'curriculum items'} bookmarked for your learning roadmap
          </p>
        </div>

        {wishlistedCourses.length > 0 && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-400" />}
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleMoveAllToCart}
              leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
            >
              Move All to Cart ({wishlistedCourses.length})
            </Button>
          </div>
        )}
      </div>

      {wishlistedCourses.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/50 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-emerald-800" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">Your wishlist is currently empty</h3>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Explore our enterprise curriculum library, save tracks you are interested in, and monitor discounts.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/courses">
              <Button variant="primary" size="md">
                Browse Masterclasses &rarr;
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Portfolio Financial Overview Card */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-800 text-white rounded">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Total Wishlist Value: <span className="text-sm">₹{totalCurrentPrice.toLocaleString('en-IN')}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>You save ₹{totalSavings.toLocaleString('en-IN')} ({Math.round((totalSavings / totalOriginalPrice) * 100)}% off MRP)</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMoveAllToCart}
              className="bg-white hover:bg-emerald-50 text-emerald-950 border-emerald-300"
            >
              Add Everything to Cart &rarr;
            </Button>
          </div>

          {/* Filter and Sorting Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="font-semibold text-slate-600 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Category:
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded transition-colors shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-800 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All ({wishlistedCourses.length})
              </button>
              {categories.map((cat) => {
                const count = wishlistedCourses.filter(c => c.categoryId === cat.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded transition-colors shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clear Wishlist */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear Entire Wishlist"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-amber-900 leading-relaxed">
              Are you sure you want to remove all <strong>{wishlistedCourses.length}</strong> courses from your saved wishlist? This cannot be undone.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmClear}
              className="bg-rose-700 hover:bg-rose-800 text-white"
            >
              Confirm Clear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
