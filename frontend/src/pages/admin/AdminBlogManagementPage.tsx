import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  ExternalLink,
  Save,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { blogService, BlogPostItem } from '../../api/blogService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { MediaUploader } from '../../components/common/MediaUploader';

export const AdminBlogManagementPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Partial<BlogPostItem>>({
    title: '',
    slug: '',
    category: 'Technology',
    excerpt: '',
    content: '',
    coverImage: '',
    authorName: 'Prajnadhara Faculty',
    authorRole: 'Lead Technical Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    readTime: '5 min read',
    isPublished: true,
    featured: false
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAdminBlogs();
      setPosts(data || []);
    } catch (err) {
      showToast('error', 'Failed to load blog posts from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPostId(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Technology',
      excerpt: '',
      content: '',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000',
      authorName: 'Prajnadhara Faculty',
      authorRole: 'Lead Technical Architect',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      readTime: '5 min read',
      isPublished: true,
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: BlogPostItem) => {
    setEditingPostId(p.id);
    setFormData({
      title: p.title,
      slug: p.slug,
      category: p.category,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage || '',
      authorName: p.authorName,
      authorRole: p.authorRole || '',
      authorAvatar: p.authorAvatar || '',
      readTime: p.readTime,
      isPublished: p.isPublished,
      featured: p.featured
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({
      ...prev,
      title: val,
      // Only auto-update slug if creating or if slug matches old title
      slug: editingPostId ? prev.slug : autoSlug
    }));
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      showToast('error', 'Please fill in Title, Slug, and Content.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingPostId) {
        const updated = await blogService.updateBlog(editingPostId, formData);
        showToast('success', `Updated article "${updated.title}" successfully!`);
        setPosts(prev => prev.map(p => p.id === editingPostId ? updated : p));
      } else {
        const created = await blogService.createBlog(formData);
        showToast('success', `Created article "${created.title}" successfully!`);
        setPosts(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublished = async (post: BlogPostItem) => {
    try {
      const updated = await blogService.updateBlog(post.id, {
        isPublished: !post.isPublished
      });
      showToast('success', `Post is now ${updated.isPublished ? 'Published' : 'Draft'}`);
      setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
    } catch (err) {
      showToast('error', 'Failed to toggle publication status.');
    }
  };

  const handleDeletePost = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      await blogService.deleteBlog(id);
      showToast('success', `Article "${title}" deleted successfully.`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showToast('error', 'Failed to delete article.');
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
              Blog & Article Management
            </h1>
            <Badge variant="success">Dynamic CMS</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Author, publish, edit, and organize dynamic articles and engineering tutorials for storefront visitors.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-emerald-800 hover:bg-emerald-900 border-emerald-800"
        >
          New Article
        </Button>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or topic..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Topic:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">All Topics</option>
            <option value="Technology">Technology</option>
            <option value="AI">AI</option>
            <option value="DevOps">DevOps</option>
            <option value="Mobile">Mobile</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>
      </div>

      {/* 3. Posts Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-lg">
          Loading articles from backend database...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Articles Found</h4>
          <p className="text-xs text-slate-500 mt-1">Click "New Article" to publish your first post.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Read Time / Views</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-12 h-8 rounded object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{post.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">/blog/{post.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {post.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {post.authorName}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div>{post.readTime}</div>
                      <div className="text-[11px] text-slate-400">{post.viewsCount} views</div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(post)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          post.isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        {post.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{post.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Preview public page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(post)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit article"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Create / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-950">
                {editingPostId ? 'Edit Article' : 'Create New Technical Article'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Article Title"
                  value={formData.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Building Resilient Microservices with Go and gRPC"
                  required
                />
                <Input
                  label="URL Slug (/blog/<slug>)"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. building-resilient-microservices-go-grpc"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category / Topic
                  </label>
                  <select
                    value={formData.category || 'Technology'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Technology">Technology</option>
                    <option value="AI">AI</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <Input
                  label="Read Time"
                  value={formData.readTime || '5 min read'}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder="e.g. 7 min read"
                />

                <Input
                  label="Author Name"
                  value={formData.authorName || ''}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                />
              </div>

              <MediaUploader
                label="Article Cover Image"
                value={formData.coverImage || ''}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                helperText="Upload banner image or pick from Media Library"
              />

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Excerpt / Teaser Copy (for cards &amp; previews)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Concise 1-2 sentence teaser summary..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Article Body (Markdown supported: ## Headings, - lists, `code`, &gt; quotes)
                </label>
                <textarea
                  rows={8}
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full in-depth article body here..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isPublished ?? true}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-700"
                  />
                  <span>Published (Visible to Storefront)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-700"
                  />
                  <span>Featured Spotlight Post</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  className="bg-emerald-800 hover:bg-emerald-900 border-emerald-800"
                >
                  {editingPostId ? 'Save Changes' : 'Publish Article'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
