import React, { useState, useEffect } from 'react';
import {
  Layers,
  Edit3,
  Eye,
  Save,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { cmsService, CMSPageData, CMSSectionData } from '../../api/cmsService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MediaUploader } from '../../components/common/MediaUploader';

export const AdminVisualPageEditorPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [pages, setPages] = useState<CMSPageData[]>([]);
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>('home');
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Editable Form State
  const [editFormData, setEditFormData] = useState<Partial<CMSSectionData>>({});

  useEffect(() => {
    loadCMSPages();
  }, []);

  const loadCMSPages = async () => {
    try {
      setLoading(true);
      const data = await cmsService.getAdminPages();
      setPages(data);
      if (data.length > 0) {
        const home = data.find(p => p.slug === 'home') || data[0];
        setSelectedPageSlug(home.slug);
        if (home.sections.length > 0) {
          selectSection(home.sections[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load CMS pages', err);
    } finally {
      setLoading(false);
    }
  };

  const currentPage = pages.find(p => p.slug === selectedPageSlug) || pages[0];

  const selectSection = (sec: CMSSectionData) => {
    setActiveSectionId(sec.id);
    setEditFormData({
      title: sec.title,
      subtitle: sec.subtitle || '',
      badgeText: sec.badgeText || '',
      content: sec.content || '',
      mediaUrl: sec.mediaUrl || '',
      primaryBtnText: sec.primaryBtnText || '',
      primaryBtnLink: sec.primaryBtnLink || '',
      secondaryBtnText: sec.secondaryBtnText || '',
      secondaryBtnLink: sec.secondaryBtnLink || '',
    });
  };

  const handlePageChange = (slug: string) => {
    setSelectedPageSlug(slug);
    const target = pages.find(p => p.slug === slug);
    if (target && target.sections.length > 0) {
      selectSection(target.sections[0]);
    } else {
      setActiveSectionId(null);
      setEditFormData({});
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionId) return;

    try {
      setSaving(true);
      const updated = await cmsService.updateSection(activeSectionId, editFormData);
      showToast('success', `Saved changes to section: "${updated.sectionName || updated.title}"!`);
      // Update local state
      setPages(prev => prev.map(p => {
        if (p.slug === selectedPageSlug) {
          return {
            ...p,
            sections: p.sections.map(s => s.id === activeSectionId ? { ...s, ...updated } : s)
          };
        }
        return p;
      }));
    } catch (err) {
      showToast('error', 'Failed to save section changes to backend.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
              Inbuilt Visual Page Editor (CMS)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              Elementor Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live content management: Edit headings, subheadings, copy, banners, and buttons across storefront pages
          </p>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Select Page:</span>
          <select
            value={selectedPageSlug}
            onChange={(e) => handlePageChange(e.target.value)}
            className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            {pages.map(p => (
              <option key={p.slug} value={p.slug}>
                {p.title} (/{p.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
          Loading page sections from backend CMS engine...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sections Navigation */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Page Sections ({currentPage?.sections.length || 0})</span>
              <Layers className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2">
              {currentPage?.sections.map((sec, idx) => {
                const isSelected = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => selectSection(sec)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-700 text-emerald-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-slate-400">
                      <span>Section #{idx + 1} &bull; {sec.sectionKey}</span>
                      {isSelected && <span className="text-emerald-700 font-bold">Editing Now</span>}
                    </div>
                    <div className="font-bold text-xs truncate text-slate-900">{sec.sectionName || sec.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{sec.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Section Editor Form & Preview */}
          <div className="lg:col-span-8 space-y-6">
            {activeSectionId ? (
              <form onSubmit={handleSaveSection} className="p-6 bg-white border border-slate-200 rounded-lg space-y-5 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Edit Section: {currentPage?.sections.find(s => s.id === activeSectionId)?.sectionName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Key: {currentPage?.sections.find(s => s.id === activeSectionId)?.sectionKey}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={saving}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    Publish Changes
                  </Button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Pill Badge Text"
                    value={editFormData.badgeText || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, badgeText: e.target.value })}
                    placeholder="e.g. Enterprise-Grade Engineering Curriculum"
                  />

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Main Heading / Title
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      placeholder="e.g. Master High-Impact Technical Skills from Proven Staff Architects"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Subheading / Supporting Description
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.subtitle || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white leading-relaxed"
                      placeholder="Detailed value proposition..."
                    />
                  </div>

                  <MediaUploader
                    label="Section Media Asset / Banner Image"
                    value={editFormData.mediaUrl || ''}
                    onChange={(newUrl) => setEditFormData({ ...editFormData, mediaUrl: newUrl })}
                    helperText="Upload banner image or pick from Media Library (JPG, PNG, WebP, SVG)"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <Input
                      label="Primary CTA Button Label"
                      value={editFormData.primaryBtnText || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, primaryBtnText: e.target.value })}
                      placeholder="e.g. Explore All Masterclasses"
                    />
                    <Input
                      label="Primary CTA Link Target"
                      value={editFormData.primaryBtnLink || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, primaryBtnLink: e.target.value })}
                      placeholder="/courses"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Secondary CTA Button Label"
                      value={editFormData.secondaryBtnText || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, secondaryBtnText: e.target.value })}
                      placeholder="e.g. Become an Instructor"
                    />
                    <Input
                      label="Secondary CTA Link Target"
                      value={editFormData.secondaryBtnLink || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, secondaryBtnLink: e.target.value })}
                      placeholder="/teach"
                    />
                  </div>
                </div>

                {/* Real-time Visual Simulation Card */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Live In-Page Rendering Simulation</span>
                  </div>
                  <div className="p-6 bg-slate-900 text-white rounded-lg space-y-3">
                    {editFormData.badgeText && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {editFormData.badgeText}
                      </span>
                    )}
                    <h2 className="text-lg font-bold font-display leading-tight">{editFormData.title || 'Untitled Section'}</h2>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{editFormData.subtitle}</p>
                    <div className="flex gap-2 pt-2">
                      {editFormData.primaryBtnText && (
                        <span className="px-3 py-1.5 rounded bg-emerald-800 text-white text-[11px] font-bold">
                          {editFormData.primaryBtnText} &rarr;
                        </span>
                      )}
                      {editFormData.secondaryBtnText && (
                        <span className="px-3 py-1.5 rounded bg-slate-800 text-slate-200 text-[11px] font-bold border border-slate-700">
                          {editFormData.secondaryBtnText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={saving}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save & Publish to Storefront
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-16 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                <Edit3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">Select a section to begin editing</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any section card on the left to edit its text, copy, or media.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
