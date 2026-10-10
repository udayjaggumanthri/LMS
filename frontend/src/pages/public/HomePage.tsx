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
  Star,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CourseCard } from '../../components/ui/CourseCard';
import { Accordion } from '../../components/ui/Accordion';
import { useCourses } from '../../context/CourseContext';
import { cmsService } from '../../api/cmsService';

const HERO_IMAGE = '/src/assets/images/hero_learning_lifestyle_1791558511252.jpg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, categories } = useCourses();
  const [showSampleArticles, setShowSampleArticles] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
  const [articleCategory, setArticleCategory] = useState<string>('all');

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
          mediaUrl: hero.mediaUrl || prev.mediaUrl
        }));
      }
    }).catch(() => {});
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

  // Specific 8 top categories as requested
  const topCategories = [
    { id: 'cat-ai', name: 'AI', slug: 'ai', count: 4, icon: <Cpu className="w-5 h-5 text-emerald-800" /> },
    { id: 'cat-artificial-intelligence', name: 'Artificial Intelligence', slug: 'artificial-intelligence', count: 8, icon: <Sparkles className="w-5 h-5 text-emerald-800" /> },
    { id: 'cat-cybersecurity', name: 'Cybersecurity', slug: 'cybersecurity', count: 2, icon: <Shield className="w-5 h-5 text-emerald-800" /> },
    { id: 'cat-data-science', name: 'Data Science', slug: 'data-science', count: 3, icon: <BarChart3 className="w-5 h-5 text-emerald-800" /> },
    { id: 'cat-database', name: 'Database', slug: 'database', count: 2, icon: <Database className="w-5 h-5 text-emerald-800" /> },
    { id: 'cat-devops', name: 'DevOps', slug: 'devops', count: 2, icon: <GitMerge className="w-5 h-5 text-emerald-800" /> },
    { id: 'cat-digital-marketing', name: 'Digital Marketing', slug: 'digital-marketing', count: 1, icon: <Megaphone className="w-5 h-5 text-emerald-800" /> },
    { id: 'cat-mobile-app', name: 'Mobile App Development', slug: 'mobile-app-development', count: 1, icon: <Smartphone className="w-5 h-5 text-emerald-800" /> }
  ];

  // Top categories with dynamic fallback
  const dynamicCategories = categories.length > 0 
    ? categories.slice(0, 8).map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.courseCount || courses.filter(c => c.categorySlug === cat.slug || c.category === cat.name).length,
        icon: categoryIcons[cat.id] || categoryIcons[`cat-${cat.slug}`] || <BookOpen className="w-5 h-5 text-emerald-800" />
      }))
    : topCategories;

  const articles = [
    {
      id: 'art-1',
      title: 'Roadmap to Becoming a Full-Stack Engineer in 2026',
      category: 'Technology',
      readTime: '6 min read',
      date: 'Oct 2026',
      excerpt: 'Essential fundamentals: strict TypeScript, React Server Components, database normalization, and automated CI/CD.'
    },
    {
      id: 'art-2',
      title: 'Why Autonomous Multi-Agent AI is Transforming Systems Architecture',
      category: 'AI',
      readTime: '8 min read',
      date: 'Oct 2026',
      excerpt: 'How tool-calling LLMs, vector memory pools, and supervisory orchestrators replace brittle monolithic codebases.'
    },
    {
      id: 'art-3',
      title: 'Demystifying Modern Cloud Deployments with Kubernetes and Terraform',
      category: 'DevOps',
      readTime: '5 min read',
      date: 'Sep 2026',
      excerpt: 'Practical infrastructure-as-code patterns to provision reliable, self-healing container clusters on any cloud provider.'
    }
  ];

  const filteredArticles =
    articleCategory === 'all'
      ? articles
      : articles.filter(a => a.category.toLowerCase() === articleCategory.toLowerCase());

  const faqItems = [
    {
      id: 'faq-1',
      title: 'How does Prajnadhara Edu differ from traditional institutes or universities?',
      content:
        'Prajnadhara Edu operates as an open, practical marketplace for skill-based learning. There are no rigid admissions, semesters, batches, or academic quotas. Every course is crafted by industry practitioners and comes with lifetime access, practical projects, and a verifiable certificate of completion.'
    },
    {
      id: 'faq-2',
      title: 'Do I get lifetime access to purchased courses?',
      content:
        'Yes! Once enrolled in any course on Prajnadhara Edu, you receive unlimited lifetime access to all course lectures, resources, exercise files, and future curriculum updates at no extra charge.'
    },
    {
      id: 'faq-3',
      title: 'Are Prajnadhara Edu certificates industry-recognized?',
      content:
        'Yes. Upon completing all lessons and passing assessment evaluations, you receive a verifiable digital certificate with a unique cryptographic verification serial number that you can attach to resumes and LinkedIn.'
    },
    {
      id: 'faq-4',
      title: 'Can anyone apply to teach on Prajnadhara Edu?',
      content:
        'Yes. Experienced practitioners and instructors can apply to publish courses, set their own prices in INR, launch coupons, and earn revenue after a transparent platform commission.'
    }
  ];

  return (
    <div className="w-full text-slate-900 bg-white">
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section className="border-b border-slate-200 bg-white pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, Copy, Search, CTAs */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold text-slate-800 mb-6">
                <span className="text-emerald-800 font-bold uppercase tracking-wider">PrajnadharaEdu</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span>{heroCMS.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-slate-950 leading-[1.12]">
                {heroCMS.title}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {heroCMS.subtitle}
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link to={heroCMS.primaryBtnLink} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 border-emerald-800 text-white font-semibold justify-center">
                    {heroCMS.primaryBtnText}
                  </Button>
                </Link>
                <Link to={heroCMS.secondaryBtnLink} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold justify-center">
                    {heroCMS.secondaryBtnText}
                  </Button>
                </Link>
              </div>

              {/* Course Search Box */}
              <form onSubmit={handleHeroSearch} className="mt-8 max-w-xl">
                <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-1.5 border border-slate-300 rounded focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/20">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search courses (e.g. AI, Data Science, Python, DevOps)..."
                      className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md" className="bg-emerald-800 hover:bg-emerald-900">
                    Search
                  </Button>
                </div>

                {/* Popular searches tags */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="font-semibold text-slate-700">Popular:</span>
                  <Link to="/category/ai" className="hover:text-emerald-800 underline-offset-2 hover:underline">AI</Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/category/artificial-intelligence" className="hover:text-emerald-800 underline-offset-2 hover:underline">Artificial Intelligence</Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/category/data-science" className="hover:text-emerald-800 underline-offset-2 hover:underline">Data Science</Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/category/devops" className="hover:text-emerald-800 underline-offset-2 hover:underline">DevOps</Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/category/cybersecurity" className="hover:text-emerald-800 underline-offset-2 hover:underline">Cybersecurity</Link>
                </div>
              </form>
            </div>

            {/* Right Column: Authentic Photography */}
            <div className="lg:col-span-5">
              <div className="border border-slate-200 rounded overflow-hidden bg-slate-50 shadow-sm">
                <div className="relative">
                  <img
                    src={heroCMS.mediaUrl || HERO_IMAGE}
                    alt="PrajnadharaEdu student engaged in practical coding project"
                    className="w-full aspect-[4/3] object-cover"
                    loading="eager"
                  />
                  <div className="p-4 bg-white border-t border-slate-200 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Practical Tech Masterclasses</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">33 Courses across AI, Cloud & Data</div>
                      </div>
                      <Link to="/courses">
                        <Button variant="outline" size="sm">
                          Browse Catalog
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
            {dynamicCategories.map((cat) => (
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
            {courses.length > 0 ? (
              courses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                Loading courses from catalogue...
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

      {/* ---------------- 4. WHY CHOOSE PRAJNADHARA EDU? ---------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                your skill
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight leading-tight">
                Why Choose Prajnadhara Edu?
              </h2>

              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                At Prajnadhara Edu, we build a complete learning ecosystem for students and professionals. Learning here is not limited to watching lessons. Tt’s about practicing skills, collaborating with peers, and growing together with guidance from experienced mentors.
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
                  Every curriculum on Prajnadhara Edu contains realistic exercises, source repositories, verified quiz assessments, and instructor support.
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

      {/* ---------------- 5. KEY METRICS STATS BAND ---------------- */}
      <section className="py-12 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                103 +
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Active Students
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                33
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Total Courses
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                11
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Instructors
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                100 %
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 6. STUDENT FEEDBACKS (TESTIMONIALS) ---------------- */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-left">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Student Feedbacks
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Discover how our learners gained real-world skills, boosted confidence, and achieved their career goals through PrajnadharaEdu.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sneha Reddy */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "Prajnadhara Edu helped me start my journey in web development from zero. The courses are very well structured and easy to follow. I was able to build my own website within a few weeks. Highly recommended for beginners!"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                  SR
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Sneha Reddy</div>
                  <div className="text-xs text-slate-500">Aspiring Web Developer</div>
                </div>
              </div>
            </div>

            {/* Rahul Kumar */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "The Data Science course was amazing! The explanations were simple, and the practical examples made it easy to understand complex concepts. I feel confident working with data now. Thank you Prajnadhara Edu!"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                  RK
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Rahul Kumar</div>
                  <div className="text-xs text-slate-500">Data Science Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 7. LATEST ARTICLES ---------------- */}
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
              to="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>All articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {['all', 'Technology', 'AI', 'DevOps', 'Mobile'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setArticleCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  articleCategory === cat
                    ? 'bg-emerald-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          {/* Filter Results */}
          {!showSampleArticles ? (
            <div className="p-10 bg-white border border-slate-200 rounded text-center">
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                No data were found matching your selection, you need to create Post or select Category of Widget.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowSampleArticles(true)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                >
                  Click to preview sample articles &rarr;
                </button>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded text-center">
              <p className="text-xs text-slate-500">
                No data were found matching your selection, you need to create Post or select Category of Widget.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSampleArticles(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Hide preview
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-5 bg-white border border-slate-200 rounded flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                        <span className="font-semibold text-emerald-800 uppercase tracking-wider">{art.category}</span>
                        <span>{art.readTime}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {art.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{art.date}</span>
                      <Link to="/courses" className="text-emerald-800 font-semibold hover:underline">
                        Read &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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
