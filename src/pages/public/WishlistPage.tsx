import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';
import { CourseCard } from '../../components/ui/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export const WishlistPage: React.FC = () => {
  const { wishlistCourseIds, clearWishlist } = useWishlist();
  const { courses } = useCourses();

  const wishlistedCourses = courses.filter(c => wishlistCourseIds.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Wishlist' }
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            My Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {wishlistedCourses.length} {wishlistedCourses.length === 1 ? 'course' : 'courses'} saved for later
          </p>
        </div>

        {wishlistedCourses.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearWishlist}
          >
            Clear Wishlist
          </Button>
        )}
      </div>

      {wishlistedCourses.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-300 rounded bg-slate-50/50 max-w-lg mx-auto">
          <Heart className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
          <p className="mt-1 text-xs text-slate-500">
            Explore our curriculum catalog and save courses to monitor updates or enroll later.
          </p>
          <div className="mt-5">
            <Link to="/courses">
              <Button variant="primary" size="md">
                Explore Courses &rarr;
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
};
