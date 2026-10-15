import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  Code,
  Briefcase,
  TrendingUp,
  Server,
  Palette,
  Camera,
  Music,
  Activity,
  Compass,
  Users,
  Award,
  BookOpen,
  Cpu,
  Sparkles,
  Shield,
  BarChart3,
  Database,
  GitMerge,
  Megaphone,
  Smartphone,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CourseCard } from '../../components/ui/CourseCard';
import { Accordion } from '../../components/ui/Accordion';
import { Avatar } from '../../components/ui/Avatar';
import { useCourses } from '../../context/CourseContext';
import { cmsService } from '../../api/cmsService';
import { resolveMediaUrl } from '../../api/client';
import { blogService, BlogPostItem } from '../../api/blogService';

const HERO_IMAGE = '';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, categories } = useCourses();
  const [heroSearch, setHeroSearch] = useState('');
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [articleCategory, setArticleCategory] = useState<string>('all');
  const [blogArticles, setBlogArticles] = useState<BlogPostItem[]>([]);
  const [blogsLoading, setBlogsLoading] = useState<boolean>(true);

  const [heroCMS, setHeroCMS] = useState({
    badge: 'Practical Skill-Based Learning Marketplace',
    title: 'Build Your Future in Technology',
    subtitle: 'Access industry-relevant courses designed to help you master programming, cloud technologies, and modern digital skills demanded by top employers.',
    primaryBtnText: 'Get Started Now',
    primaryBtnLink: '/courses',
    secondaryBtnText: 'Contact Us',
    secondaryBtnLink: '/contact',
    mediaUrl: HERO_IMAGE
  });

  React.useEffect(() => {
    cmsService.getPage('home').then((data) => {
      const hero = data?.sectionMap?.['hero'] || data?.sectionMap?.['hero_main'] || data?.sections?.find((s: any) => s.sectionKey === 'hero' || s.sectionKey === 'hero_main');
      if (hero) {
        setHeroCMS(prev => ({
          badge: hero.badgeText || prev.badge,
          title: hero.title || prev.title,
          subtitle: hero.subtitle || prev.subtitle,
          primaryBtnText: hero.primaryBtnText || prev.primaryBtnText,
          primaryBtnLink: hero.primaryBtnLink || prev.primaryBtnLink,
          secondaryBtnText: hero.secondaryBtnText || prev.secondaryBtnText,
          secondaryBtnLink: hero.secondaryBtnLink || prev.secondaryBtnLink,
          mediaUrl: resolveMediaUrl(hero.mediaUrl) || prev.mediaUrl
        }));
      }
      const faq = data?.sectionMap?.faq;
      const items = faq?.jsonData?.items;
      if (Array.isArray(items) && items.length) {
        setFaqItems(items.map((item: { title?: string; content?: string }, index: number) => ({
          id: `faq-${index + 1}`,
          title: item.title || '',
          content: item.content || '',
        })));
      }
    }).catch(() => {});

    // Fetch dynamic blog articles
    blogService.getBlogs()
      .then(data => {
        if (data && Array.isArray(data)) {
          setBlogArticles(data);
        }
      })
      .catch(() => {})
      .finally(() => setBlogsLoading(false));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/courses?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'cat-ai': <Cpu className="w-5 h-5 text-emerald-800" />,
    'cat-artificial-intelligence': <Sparkles className="w-5 h-5 text-emerald-800" />,
    'cat-cybersecurity': <Shield className="w-5 h-5 text-emerald-800" />,
    'cat-data-science': <BarChart3 className="w-5 h-5 text-emerald-800" />,
    'cat-database': <Database className="w-5 h-5 text-emerald-800" />,
    'cat-devops': <GitMerge className="w-5 h-5 text-emerald-800" />,
    'cat-digital-marketing': <Megaphone className="w-5 h-5 text-emerald-800" />,
    'cat-mobile-app': <Smartphone className="w-5 h-5 text-emerald-800" />,
    'cat-dev': <Code className="w-5 h-5 text-emerald-800" />,
    'cat-business': <Briefcase className="w-5 h-5 text-emerald-800" />
  };

  const topCategories = categories.filter((cat) => cat.isTop);
  const dynamicCategories = topCategories.length > 0
    ? topCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.courseCount || courses.filter(c => (c as any).categorySlug === cat.slug || c.categoryId === cat.id || (c as any).category === cat.name).length,
        icon: categoryIcons[cat.id] || categoryIcons[`cat-${cat.slug}`] || <BookOpen className="w-5 h-5 text-emerald-800" />
      }))
    : [];

  const filteredArticles =
    articleCategory === 'all'
      ? blogArticles
      : blogArticles.filter(a => a.category.toLowerCase() === articleCategory.toLowerCase());

  const [faqItems, setFaqItems] = useState([
    {
      id: 'faq-1',
      title: 'How does PrajnadharaEdu differ from traditional institutes or universities?',
      content:
        'PrajnadharaEdu operates as an open, practical marketplace for skill-based learning. There are no rigid admissions, semesters, batches, or academic quotas. Every course is crafted by industry practitioners and comes with lifetime access, practical projects, and a verifiable certificate of completion.'
    },
    {
      id: 'faq-2',
      title: 'Do I get lifetime access to purchased courses?',
      content:
        'Yes! Once enrolled in any course on PrajnadharaEdu, you receive unlimited lifetime access to all course lectures, resources, exercise files, and future curriculum updates at no extra charge.'
    },
    {
      id: 'faq-3',
      title: 'Are PrajnadharaEdu certificates industry-recognized?',
      content:
        'Yes. Upon completing all lessons and passing assessment evaluations, you receive a verifiable digital certificate with a unique cryptographic verification serial number that you can attach to resumes and LinkedIn.'
    },
    {
      id: 'faq-4',
      title: 'Can anyone apply to teach on PrajnadharaEdu?',
      content:
        'Yes. Experienced practitioners and instructors can apply to publish courses, set their own prices in INR, launch coupons, and earn revenue after a transparent platform commission.'
    }
  ]);

  return (
    <div className="w-full text-slate-900 bg-white">
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section className="border-b border-slate-200 bg-white pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Copy, Search, CTAs */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/80 border border-emerald-200/80 rounded-full text-[11px] sm:text-xs font-semibold text-emerald-950 mb-4 sm:mb-6 max-w-full">
                <span className="text-emerald-800 font-bold uppercase tracking-wider shrink-0">PrajnadharaEdu</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="truncate">{heroCMS.badge}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-slate-950 leading-tight sm:leading-[1.15]">
                {heroCMS.title}
              </h1>

              <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {heroCMS.subtitle}
              </p>

              {/* Responsive CTAs */}
              <div className="mt-5 sm:mt-7 flex items-center gap-3 w-full sm:w-auto">
                <Link to={heroCMS.primaryBtnLink} className="flex-1 sm:flex-initial">
                  <Button variant="primary" size="md" className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 border-emerald-800 text-white font-semibold justify-center shadow-xs">
                    {heroCMS.primaryBtnText}
                  </Button>
                </Link>
                <Link to={heroCMS.secondaryBtnLink} className="flex-1 sm:flex-initial">
                  <Button variant="outline" size="md" className="w-full sm:w-auto border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold justify-center">
                    {heroCMS.secondaryBtnText}
                  </Button>
                </Link>
              </div>

              {/* Responsive Course Search Box */}
              <form onSubmit={handleHeroSearch} className="mt-6 sm:mt-8 max-w-xl">
                <div className="flex items-center gap-2 bg-white p-1 sm:p-1.5 border border-slate-300 rounded-lg focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/20 shadow-xs">
                  <div className="relative flex-1 flex items-center min-w-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 shrink-0 pointer-events-none" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full pl-9 pr-2 py-2 text-xs sm:text-sm text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm" className="bg-emerald-800 hover:bg-emerald-900 shrink-0 font-semibold px-4">
                    Search
                  </Button>
                </div>

                {topCategories.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 overflow-x-auto no-scrollbar py-0.5">
                  <span className="font-semibold text-slate-700 shrink-0">Popular:</span>
                  {topCategories.map((cat) => (
                    <Link key={cat.id} to={`/category/${cat.slug}`} className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition-colors">{cat.name}</Link>
                  ))}
                </div>
                )}
              </form>
            </div>

            {/* Right Column: Authentic Photography */}
            <div className="lg:col-span-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm">
                <div className="relative">
                  {heroCMS.mediaUrl && !heroImageFailed ? (
                  <img
                    src={resolveMediaUrl(heroCMS.mediaUrl)}
                    alt=""
                    className="w-full aspect-[16/10] sm:aspect-[4/3] object-cover bg-white"
                    loading="eager"
                    onError={() => setHeroImageFailed(true)}
                  />
                  ) : (
                    <div className="w-full aspect-[16/10] sm:aspect-[4/3] bg-slate-100" />
                  )}
                  <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">Practical Tech Masterclasses</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">{courses.filter(c => c.status === 'published').length} published courses</div>
                      </div>
                      <Link to="/courses" className="shrink-0">
                        <Button variant="outline" size="sm">
                          Browse
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 2. TOP CATEGORIES SECTION ---------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Top Categories
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Explore our Popular Categories
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dynamicCategories.length === 0 ? (
              <div className="col-span-full p-8 bg-white border border-slate-200 rounded text-sm text-slate-600">
                Published categories will appear here.
              </div>
            ) : dynamicCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group p-5 bg-white border border-slate-200 rounded hover:border-emerald-700 transition-colors duration-150 flex flex-col justify-between text-left shadow-xs"
              >
                <div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded w-fit mb-3 group-hover:border-emerald-300 group-hover:bg-emerald-50 transition-colors">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 tabular-nums">
                    {cat.count} {cat.count === 1 ? 'Course' : 'Courses'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-800 transition-colors">
                  <span className="font-medium">Explore</span>
                  <span className="font-semibold group-hover:translate-x-0.5 transition-transform">
                    &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 3. FEATURED COURSES SECTION ---------------- */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div className="text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Featured Courses
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Explore our Popular Courses.
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>All courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Real Courses Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.filter(c => c.status === 'published' && c.featured).length > 0 ? (
              courses.filter(c => c.status === 'published' && c.featured).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full p-8 bg-slate-50 border border-slate-200 rounded text-center text-sm text-slate-600">
                Published courses will appear here.
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link to="/courses">
              <Button variant="outline" size="md">
                Browse All {courses.length > 0 ? `${courses.length} ` : ''}Courses &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- 4. WHY CHOOSE PRAJNADHARAEDU? ---------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                your skill
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight leading-tight">
                Why Choose PrajnadharaEdu?
              </h2>

              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                At PrajnadharaEdu, we build a complete learning ecosystem for students and professionals. Learning here is not limited to watching lessons. Tt’s about practicing skills, collaborating with peers, and growing together with guidance from experienced mentors.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded">
                  <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900">Structured Learning Paths</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded">
                  <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900">Free Courses</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded">
                  <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900">Industry-Recognized Certifications</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded">
                  <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
                  <span className="text-xs font-semibold text-slate-900">Lifetime Learning Access</span>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/about">
                  <Button variant="primary" size="md" className="bg-emerald-800 hover:bg-emerald-900">
                    Discover More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Feature Box */}
            <div className="lg:col-span-5">
              <div className="p-6 bg-white border border-slate-200 rounded text-left space-y-4 shadow-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded w-fit text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  The Learning Ecosystem
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Practical tradecraft over theoretical lectures
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every curriculum on PrajnadharaEdu contains realistic exercises, source repositories, verified quiz assessments, and instructor support.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>30-Day Money-Back Guarantee</span>
                  <span className="text-emerald-800 font-semibold">100% Risk Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. LATEST ARTICLES ---------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Latest Articles
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                Explore our free articles.
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>All articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {['all', ...Array.from(new Set(blogArticles.map((a) => a.category).filter(Boolean)))].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setArticleCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  articleCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All Articles' : cat}
              </button>
            ))}
          </div>

          {/* Live Articles Grid */}
          {blogsLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading latest engineering articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-10 bg-white border border-slate-200 rounded-xl text-center max-w-md mx-auto">
              <p className="text-xs text-slate-600 mb-3">
                No published articles found in the "{articleCategory}" discipline yet.
              </p>
              <button
                type="button"
                onClick={() => setArticleCategory('all')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
              >
                Show all articles &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {art.coverImage && (
                      <Link to={`/blog/${art.slug}`} className="block aspect-[16/9] overflow-hidden bg-slate-100">
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2.5">
                        <span className="font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          {art.category}
                        </span>
                        <span>{art.readTime}</span>
                      </div>
                      <Link to={`/blog/${art.slug}`}>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug line-clamp-2">
                          {art.title}
                        </h3>
                      </Link>
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar name={art.authorName} size="xs" />
                      <span className="font-medium text-slate-700 truncate max-w-[130px]">{art.authorName}</span>
                    </div>
                    <Link
                      to={`/blog/${art.slug}`}
                      className="text-emerald-800 font-semibold hover:text-emerald-950 inline-flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- 8. FAQ ACCORDION & FINAL BRAND CALL TO ACTION ---------------- */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-left">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Common Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion items={faqItems} />

          {/* Final Call to Action */}
          <div className="mt-16 p-8 sm:p-12 border border-slate-200 rounded bg-slate-900 text-white text-center">
            <h3 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              Build Your Future in Technology with PrajnadharaEdu
            </h3>
            <p className="mt-2 text-sm text-slate-300 max-w-lg mx-auto">
              At PrajnadharaEdu offers smart, career-aligned online learning designed to help you rise. Gain the skills you need and the confidence you deserve.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/courses">
                <Button variant="primary" size="lg" className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600">
                  Get Started Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
