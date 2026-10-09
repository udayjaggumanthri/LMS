import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourses } from '../../context/CourseContext';
import { CourseCard } from '../../components/ui/CourseCard';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, courses } = useCourses();

  const category = categories.find(c => c.slug === slug);
  const categoryCourses = courses.filter(
    c => c.categoryId === category?.id && c.status === 'published'
  );

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold font-display text-slate-900">Category Not Found</h2>
        <p className="mt-2 text-xs text-slate-500">The requested learning discipline could not be found.</p>
        <Link to="/courses" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            View All Categories &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/courses' },
          { label: category.name }
        ]}
        className="mb-4"
      />

      {/* Category Hero Banner */}
      <div className="p-8 sm:p-10 border border-slate-200 rounded bg-slate-50 mb-10">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
            Skill Discipline
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-slate-950">
            {category.name} Masterclasses
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {category.description}
          </p>

          {/* Subcategories tags (unboxed text or clean buttons) */}
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-700">Sub-disciplines:</span>
            {category.subcategories.map((sub, i) => (
              <Link
                key={sub}
                to={`/courses?category=${category.slug}&q=${encodeURIComponent(sub)}`}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                {sub}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Courses in this category */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-display text-slate-900">
            Available Courses ({categoryCourses.length})
          </h2>
          <Link to={`/courses?category=${category.slug}`} className="text-xs font-semibold text-emerald-800 hover:underline">
            Open with filters &rarr;
          </Link>
        </div>

        {categoryCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded bg-white">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">No published courses in this category yet</h3>
            <p className="text-xs text-slate-500 mt-1">Our curriculum review team is approving new submissions.</p>
          </div>
        )}
      </div>
    </div>
  );
};
