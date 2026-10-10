import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  FileText
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { MediaUploader } from '../../components/common/MediaUploader';

export const AdminMediaLibraryPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await adminService.getMediaList();
      setMediaList(Array.isArray(data) ? data : data?.results || []);
    } catch {
      showToast('Failed to load media assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Asset URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this media asset?')) return;
    try {
      await adminService.deleteMedia(id);
      setMediaList(prev => prev.filter(m => m.id !== id));
      showToast('Media deleted successfully', 'success');
    } catch {
      showToast('Failed to delete media', 'error');
    }
  };

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.url.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'images') {
      return matchesSearch && (item.fileType?.includes('image') || item.url.match(/\.(jpg|jpeg|png|webp|svg)$/i));
    }
    if (filterType === 'docs') {
      return matchesSearch && (item.fileType?.includes('pdf') || item.url.endsWith('.pdf'));
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Platform Media & Asset Storage
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage banner images, course covers, PDFs, and curriculum documents
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMedia}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Library
        </Button>
      </div>

      {/* Upload Zone */}
      <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-800" />
          <span>Upload New Asset</span>
        </h2>
        <MediaUploader
          label=""
          onChange={(_newUrl) => {
            showToast('New asset uploaded and indexed to library', 'success');
            fetchMedia();
          }}
          helperText="Upload PNG, JPG, WebP, SVG, or PDF files up to 25MB"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by file name..."
            className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-emerald-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Files ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('images')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              filterType === 'images'
                ? 'bg-emerald-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Images
          </button>
          <button
            type="button"
            onClick={() => setFilterType('docs')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              filterType === 'docs'
                ? 'bg-emerald-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* Grid of Media Assets */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
          Loading media library assets...
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => {
            const isImage = item.fileType?.includes('image') || item.url.match(/\.(jpg|jpeg|png|webp|svg)$/i);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-emerald-700 hover:shadow-xs transition-all"
              >
                <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-500 font-mono">PDF/DOC</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="p-1.5 bg-white text-slate-900 rounded-full hover:bg-emerald-50 transition-colors"
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-white text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white border-t border-slate-100">
                  <div className="font-bold text-[11px] text-slate-900 truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : 'Asset'}</span>
                    <span>{item.createdAt?.split(' ')[0] || ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 border-2 border-dashed border-slate-200 rounded-lg text-center bg-white">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No media assets found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'No files match your query.' : 'Upload photos, thumbnails, and documents to populate your media repository.'}
          </p>
        </div>
      )}
    </div>
  );
};
