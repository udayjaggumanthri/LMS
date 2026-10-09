import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, RotateCcw, Search } from 'lucide-react';
import { CourseCard } from '../../components/ui/CourseCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { useCourses } from '../../context/CourseContext';
import { CourseLevel } from '../../types';

export const CoursesCatalogPage: React.FC = () => {
  const { courses, categories } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';

  // Local filter states
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<CourseLevel[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price-low' | 'price-high' | 'newest'>('popularity');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter logic
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Must be published
      if (course.status !== 'published') return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesSubtitle = course.subtitle.toLowerCase().includes(query);
        const matchesSubcategory = course.subcategory.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubtitle && !matchesSubcategory) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const cat = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
        if (cat && course.categoryId !== cat.id) return false;
      }

      // Subcategories
      if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(course.subcategory)) {
        return false;
      }

      // Levels
      if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
        return false;
      }

      // Rating
      if (minRating > 0 && course.rating < minRating) {
        return false;
      }

      // Price filter
      if (priceFilter === 'free' && (!course.isFree && course.price > 0)) return false;
      if (priceFilter === 'paid' && (course.isFree || course.price === 0)) return false;

      // Duration
      if (selectedDurations.length > 0) {
        const matchesDuration = selectedDurations.some((dur) => {
          if (dur === 'short' && course.durationHours < 15) return true;
          if (dur === 'medium' && course.durationHours >= 15 && course.durationHours <= 25) return true;
          if (dur === 'long' && course.durationHours > 25) return true;
          return false;
        });
        if (!matchesDuration) return false;
      }

      return true;
    });
  }, [courses, categories, searchQuery, selectedCategory, selectedSubcategories, selectedLevels, minRating, priceFilter, selectedDurations]);

  // Sort logic
  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      if (sortBy === 'popularity') return b.studentCount - a.studentCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return b.lastUpdated.localeCompare(a.lastUpdated);
      return 0;
    });
  }, [filteredCourses, sortBy]);

  const totalPages = Math.ceil(sortedCourses.length / pageSize) || 1;
  const paginatedCourses = sortedCourses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetAllFilters = () => {
    setSelectedSubcategories([]);
    setSelectedLevels([]);
    setMinRating(0);
    setPriceFilter('all');
    setSelectedDurations([]);
    setSearchParams({});
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedSubcategories.length > 0 ||
    selectedLevels.length > 0 ||
    minRating > 0 ||
    priceFilter !== 'all' ||
    selectedDurations.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-slate-900 text-left">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Course Catalog' }
        ]}
        className="mb-4"
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : selectedCategory !== 'all'
              ? `${categories.find(c => c.slug === selectedCategory)?.name || 'Category'} Masterclasses`
              : 'All Skill-Based Masterclasses'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Showing <strong className="text-slate-900 tabular-nums">{sortedCourses.length}</strong> vetted courses across 10 disciplines
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            onClick={() => setMobileFilterOpen(prev => !prev)}
          >
            Filters
          </Button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 text-xs w-40"
              options={[
                { value: 'popularity', label: 'Most Popular' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'newest', label: 'Recently Updated' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Active Filter Chips Strip */}
      {hasActiveFilters && (
        <div className="py-3 flex items-center gap-2 flex-wrap border-b border-slate-100 text-xs">
          <span className="font-semibold text-slate-600">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
              Query: {searchQuery}
              <button onClick={() => setSearchParams({})} className="hover:text-slate-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
              Category: {selectedCategory}
              <button onClick={() => setSearchParams({})} className="hover:text-slate-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
              {minRating}+ Stars
              <button onClick={() => setMinRating(0)} className="hover:text-slate-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {priceFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
              {priceFilter === 'free' ? 'Free Courses' : 'Paid Courses'}
              <button onClick={() => setPriceFilter('all')} className="hover:text-slate-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline-offset-2 hover:underline ml-1 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear all
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar Filters + Courses Catalog */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside
          className={`${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto block md:static md:z-auto md:p-0 md:bg-transparent'
              : 'hidden md:block'
          } md:col-span-1 space-y-6 text-xs`}
        >
          {/* Mobile Filter Header */}
          <div className="flex md:hidden items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Filter Courses</h2>
              <p className="text-[11px] text-slate-500">Narrow down {sortedCourses.length} courses</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded border border-slate-200"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Category Filter */}
          <div className="pb-5 border-b border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-3 text-[11px]">
              Categories
            </h3>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className={`block w-full text-left py-1 px-2 rounded transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Disciplines ({courses.filter(c => c.status === 'published').length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSearchParams({ category: cat.slug })}
                  className={`flex items-center justify-between w-full text-left py-1 px-2 rounded transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-slate-400 tabular-nums">({cat.courseCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pb-5 border-b border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-3 text-[11px]">
              Ratings
            </h3>
            <div className="space-y-1.5">
              {[4.8, 4.5, 4.0].map((starVal) => (
                <label key={starVal} className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={minRating === starVal}
                    onChange={() => setMinRating(starVal)}
                    className="text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>{starVal} & up</span>
                </label>
              ))}
              {minRating > 0 && (
                <button onClick={() => setMinRating(0)} className="text-[11px] text-emerald-800 font-semibold mt-1">
                  Clear rating filter
                </button>
              )}
            </div>
          </div>

          {/* Difficulty Level Filter */}
          <div className="pb-5 border-b border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-3 text-[11px]">
              Skill Level
            </h3>
            <div className="space-y-2">
              {(['Beginner', 'Intermediate', 'Expert', 'All Levels'] as CourseLevel[]).map((level) => (
                <Checkbox
                  key={level}
                  label={level}
                  checked={selectedLevels.includes(level)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedLevels(prev => [...prev, level]);
                    else setSelectedLevels(prev => prev.filter(l => l !== level));
                  }}
                />
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="pb-5 border-b border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-3 text-[11px]">
              Price
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === 'all'}
                  onChange={() => setPriceFilter('all')}
                  className="text-emerald-800 focus:ring-emerald-700"
                />
                <span>All Prices</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === 'paid'}
                  onChange={() => setPriceFilter('paid')}
                  className="text-emerald-800 focus:ring-emerald-700"
                />
                <span>Paid (INR ₹)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="priceFilter"
                  checked={priceFilter === 'free'}
                  onChange={() => setPriceFilter('free')}
                  className="text-emerald-800 focus:ring-emerald-700"
                />
                <span>Free Courses</span>
              </label>
            </div>
          </div>

          {/* Video Duration Filter */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-3 text-[11px]">
              Video Duration
            </h3>
            <div className="space-y-2">
              <Checkbox
                label="0–15 Hours"
                checked={selectedDurations.includes('short')}
                onChange={(e) => {
                  if (e.target.checked) setSelectedDurations(prev => [...prev, 'short']);
                  else setSelectedDurations(prev => prev.filter(d => d !== 'short'));
                }}
              />
              <Checkbox
                label="15–25 Hours"
                checked={selectedDurations.includes('medium')}
                onChange={(e) => {
                  if (e.target.checked) setSelectedDurations(prev => [...prev, 'medium']);
                  else setSelectedDurations(prev => prev.filter(d => d !== 'medium'));
                }}
              />
              <Checkbox
                label="25+ Hours"
                checked={selectedDurations.includes('long')}
                onChange={(e) => {
                  if (e.target.checked) setSelectedDurations(prev => [...prev, 'long']);
                  else setSelectedDurations(prev => prev.filter(d => d !== 'long'));
                }}
              />
            </div>
          </div>

          {/* Mobile Apply Filters Action */}
          <div className="md:hidden pt-4 border-t border-slate-200">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center bg-emerald-800 hover:bg-emerald-900"
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply &amp; View {sortedCourses.length} Courses
            </Button>
          </div>
        </aside>

        {/* Right Course Grid */}
        <div className="md:col-span-3">
          {paginatedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-slate-300 rounded bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-900">No courses match your active criteria</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your search keywords, clearing specific rating boundaries, or resetting your category filter.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={resetAllFilters}>
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="tabular-nums">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 text-xs rounded font-medium border tabular-nums transition-colors ${
                      currentPage === i + 1
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
