import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Eye,
  Calendar,
  Share2,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { blogService, BlogPostItem } from '../../api/blogService';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { RichContentViewer } from '../../components/common/RichContentViewer';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [post, setPost] = useState<BlogPostItem | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const data = await blogService.getBlogBySlug(postSlug);
      setPost(data);

      // Fetch related articles
      const all = await blogService.getBlogs({ category: data.category });
      setRelatedPosts((all || []).filter(p => p.slug !== postSlug).slice(0, 3));
    } catch (err) {
      console.error('Failed to load blog post', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading article contents...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Article Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The requested article may have been moved, renamed, or unpublished.
        </p>
        <Link to="/blog" className="inline-block mt-4">
          <Button variant="primary" size="sm">
            &larr; Back to All Articles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-slate-900 pb-20">
      {/* 1. Header Bar with Breadcrumbs */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title }
            ]}
          />
        </div>
      </div>

      {/* 2. Article Header Hero */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-6 text-left">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            {post.category}
          </span>
          {post.featured && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              Featured
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-slate-950 leading-[1.15]">
          {post.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Metadata & Author Row */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {post.authorName.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-slate-900">{post.authorName}</div>
              <div className="text-xs text-slate-500">{post.authorRole || 'Faculty Author'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {post.readTime}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-400" />
              {post.viewsCount} Views
            </span>
            <span>&bull;</span>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
              title="Copy article link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Featured Image */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 my-6">
          <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-sm border border-slate-200">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* 4. Article Body Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-left">
        <RichContentViewer content={post.content} className="space-y-6" />

        {/* 5. Author Biography Card */}
        <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
              {post.authorName.charAt(0)}
            </div>
          )}
          <div className="text-center sm:text-left flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-0.5">About The Author</div>
            <h4 className="text-base font-bold text-slate-900">{post.authorName}</h4>
            <p className="text-xs text-slate-500 font-medium">{post.authorRole || 'Lead Technical Instructor'}</p>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Curator of production-grade engineering courses at PrajnadharaEdu. Focused on simplifying distributed architectures, autonomous AI agents, and enterprise software engineering.
            </p>
          </div>
        </div>

        {/* CTA to Explore Courses */}
        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold font-display">Ready to level up your engineering skills?</h4>
            <p className="text-xs text-slate-300 mt-1">Explore our hands-on masterclasses with verified real-world code repositories.</p>
          </div>
          <Link to="/courses" className="shrink-0">
            <Button variant="primary" size="sm" className="bg-white text-slate-950 hover:bg-slate-100 font-bold">
              Explore Masterclasses &rarr;
            </Button>
          </Link>
        </div>
      </main>

      {/* 6. Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 border-t border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold font-display text-slate-950">Related Publications</h3>
              <p className="text-xs text-slate-500 mt-0.5">Continue reading from {post.category}</p>
            </div>
            <Link to="/blog" className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.slug}`}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col text-left"
              >
                <div className="aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={rel.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      {rel.category}
                    </span>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition-colors mt-1 line-clamp-2">
                      {rel.title}
                    </h5>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{rel.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
