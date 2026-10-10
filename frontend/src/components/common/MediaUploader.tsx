import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, Link as LinkIcon, FolderOpen, X } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { Button } from '../ui/Button';

interface MediaUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  accept?: string;
  className?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  value = '',
  onChange,
  label = 'Media Asset / Image',
  helperText = 'Upload high-resolution PNG, JPG, WebP, or SVG (Max 25MB)',
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,application/pdf',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState(value);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryMedia, setLibraryMedia] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);

    try {
      const res = await adminService.uploadMedia(file);
      if (res?.url) {
        onChange(res.url);
        setUrlInputValue(res.url);
      } else {
        setError('Upload succeeded but no asset URL was returned.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to upload asset to media storage.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleOpenLibrary = async () => {
    setShowLibrary(true);
    setIsLoadingLibrary(true);
    try {
      const data = await adminService.getMediaList();
      setLibraryMedia(Array.isArray(data) ? data : data?.results || []);
    } catch {
      setLibraryMedia([]);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  return (
    <div className={`space-y-2 text-left ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleOpenLibrary}
              className="text-emerald-800 hover:text-emerald-950 font-medium inline-flex items-center gap-1 hover:underline"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? 'Hide URL' : 'Paste URL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Raw URL Input mode if toggled */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="https://... or /media/uploads/..."
            className="flex-1 bg-white text-xs border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              onChange(urlInputValue.trim());
              setShowUrlInput(false);
            }}
          >
            Apply
          </Button>
        </div>
      )}

      {/* Upload Box / Active Preview */}
      {value ? (
        <div className="relative border border-slate-200 rounded p-3 bg-slate-50 flex items-center gap-4">
          <div className="w-20 h-16 bg-slate-200 rounded overflow-hidden flex items-center justify-center border border-slate-300 shrink-0">
            {value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || value.includes('unsplash') || value.includes('uploads') ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Active Media Asset</span>
            </div>
            <p className="text-xs text-slate-600 truncate font-mono">{value}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setUrlInputValue('');
              }}
              className="p-1 text-slate-400 hover:text-rose-600 rounded"
              title="Remove media"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-emerald-600 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-700 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-white rounded-full border border-slate-200 shadow-2xs">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-emerald-800" />
              )}
            </div>
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-emerald-900">Click to upload</span> or drag and drop
            </div>
            <p className="text-[11px] text-slate-500">{helperText}</p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="text-xs text-rose-600 flex items-center gap-1.5 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Platform Media Library</h3>
                <p className="text-xs text-slate-500">Pick previously uploaded assets or upload a new one</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {isLoadingLibrary ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading media library...</div>
              ) : libraryMedia.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {libraryMedia.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        onChange(m.url);
                        setUrlInputValue(m.url);
                        setShowLibrary(false);
                      }}
                      className="group cursor-pointer border border-slate-200 rounded p-1.5 hover:border-emerald-700 hover:shadow-xs transition-all flex flex-col bg-slate-50"
                    >
                      <div className="aspect-square bg-slate-200 rounded overflow-hidden mb-1 flex items-center justify-center">
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="text-[11px] font-medium text-slate-800 truncate">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.createdAt || 'Uploaded'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No media files uploaded yet in the library.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setShowLibrary(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    Upload First Asset
                  </Button>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 flex justify-between items-center text-xs bg-slate-50">
              <span className="text-slate-500">{libraryMedia.length} files available</span>
              <Button variant="outline" size="sm" onClick={() => setShowLibrary(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
