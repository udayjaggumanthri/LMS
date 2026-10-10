import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  Eye,
  Calendar,
  ArrowRight,
  Sparkles,
  Tag,
  ChevronRight,
  TrendingUp,
  User
} from 'lucide-react';
import { blogService, BlogPostItem } from '../../api/blogService';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';

export const BlogListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('q') || '';

  const [articles, setArticles] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  const categories = ['All', 'Technology', 'AI', 'DevOps', 'Mobile', 'Data Science', 'Security'];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchQuery]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogs({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        q: searchQuery.trim() || undefined
      });
      setArticles(data || []);
    } catch (err) {
      console.error('Failed to load blog posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery.trim());
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
    fetchArticles();
  };

  const featuredPost = articles.find(a => a.featured) || articles[0];
  const gridArticles = featuredPost ? articles.filter(a => a.id !== featuredPost.id) : articles;

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-900 pb-20">
      {/* 1. Header & Hero Bar */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Articles & Engineering Insights' }
            ]}
            className="mb-4"
          />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Prajnadhara Engineering Blog</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-slate-950">
                Explore Our Free Articles &amp; Insights
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Deep dives into full-stack engineering, production AI workflows, systems architecture, and career-accelerating tutorials written by staff architects.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full lg:w-80 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles & tutorials..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
                />
              </div>
            </form>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl h-80 border border-slate-200" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto mt-6">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No articles found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No published articles match your current category or search criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Post Spotlight Banner */}
            {featuredPost && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-300 transition-all shadow-xs group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden bg-slate-900 relative">
                    <img
                      src={featuredPost.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000'}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-800 text-white shadow-xs">
                        Featured Article
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {featuredPost.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {featuredPost.readTime}
                        </span>
                      </div>

                      <Link to={`/blog/${featuredPost.slug}`}>
                        <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 group-hover:text-emerald-800 transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {featuredPost.authorAvatar ? (
                          <img
                            src={featuredPost.authorAvatar}
                            alt={featuredPost.authorName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {featuredPost.authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-900">{featuredPost.authorName}</div>
                          <div className="text-[11px] text-slate-500">{featuredPost.authorRole || 'Author'}</div>
                        </div>
                      </div>

                      <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 group/btn"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            {gridArticles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold font-display text-slate-950">
                    Latest Publications
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing {articles.length} article{articles.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridArticles.map((article) => (
                    <article
                      key={article.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all flex flex-col group"
                    >
                      {/* Thumbnail */}
                      <Link to={`/blog/${article.slug}`} className="block aspect-video overflow-hidden bg-slate-900 relative">
                        <img
                          src={article.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-800 border border-slate-200">
                            {article.category}
                          </span>
                        </div>
                      </Link>

                      {/* Content Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {article.readTime}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-slate-400" />
                              {article.viewsCount} reads
                            </span>
                          </div>

                          <Link to={`/blog/${article.slug}`}>
                            <h4 className="text-base font-bold font-display text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                              {article.title}
                            </h4>
                          </Link>

                          <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>

                        {/* Author info & Read link */}
                        <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {article.authorAvatar ? (
                              <img
                                src={article.authorAvatar}
                                alt={article.authorName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-[10px]">
                                {article.authorName.charAt(0)}
                              </div>
                            )}
                            <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                              {article.authorName}
                            </div>
                          </div>

                          <Link
                            to={`/blog/${article.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
