import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  Layers,
  BookOpen,
  GraduationCap,
  Calendar,
  Sparkles,
  ChevronRight,
  Tag
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Category } from '../../types';

const SEMESTER_OPTIONS = [
  'Semester 1 - Foundation & Fundamentals',
  'Semester 2 - Core Systems & Engineering',
  'Semester 3 - Advanced Architecture & Scale',
  'Semester 4 - Specialization & Capstone',
  'Electives & Professional Certifications'
];

export const AdminCategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCourses();
  const { showToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [addCatModalOpen, setAddCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Add form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSemester, setNewCatSemester] = useState(SEMESTER_OPTIONS[0]);
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSubtopics, setNewCatSubtopics] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editSemester, setEditSemester] = useState(SEMESTER_OPTIONS[0]);
  const [editDesc, setEditDesc] = useState('');

  // Inline topic add state
  const [newSubtopicInput, setNewSubtopicInput] = useState<Record<string, string>>({});

  const totalSubtopics = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
  const totalCoursesMapped = categories.reduce((sum, c) => sum + (c.courseCount || 0), 0);

  // Group categories by semester
  const getSemesterForCat = (cat: Category): string => {
    if (cat.semester) return cat.semester;
    // Derive sensible default semester based on category name or order
    if (cat.slug.includes('foundation') || cat.slug === 'development') return SEMESTER_OPTIONS[0];
    if (cat.slug.includes('cloud') || cat.slug === 'cloud-devops') return SEMESTER_OPTIONS[1];
    if (cat.slug === 'ai' || cat.slug.includes('intelligence')) return SEMESTER_OPTIONS[2];
    if (cat.slug.includes('fellowship') || cat.slug === 'design') return SEMESTER_OPTIONS[3];
    return SEMESTER_OPTIONS[4];
  };

  const filteredCategories = categories.filter(c => {
    const sem = getSemesterForCat(c);
    const matchesSemester = selectedSemesterFilter === 'all' || sem === selectedSemesterFilter;
    if (!matchesSemester) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.subcategories?.some(s => s.toLowerCase().includes(q))
    );
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const initialSubs = newCatSubtopics.trim()
      ? newCatSubtopics.split(',').map(s => s.trim()).filter(Boolean)
      : ['Core Foundations', 'Practical Lab Implementation'];

    addCategory({
      name: newCatName.trim(),
      slug,
      semester: newCatSemester,
      description: newCatDesc.trim() || 'Academic engineering and skill discipline',
      subcategories: initialSubs,
      iconName: 'BookOpen'
    });

    showToast('New academic discipline created successfully!', 'success');
    setNewCatName('');
    setNewCatDesc('');
    setNewCatSubtopics('');
    setNewCatSemester(SEMESTER_OPTIONS[0]);
    setAddCatModalOpen(false);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSemester(getSemesterForCat(cat));
    setEditDesc(cat.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    updateCategory(editingCategory.id, {
      name: editName.trim(),
      semester: editSemester,
      description: editDesc.trim()
    });

    showToast(`Updated academic discipline "${editName.trim()}".`, 'success');
    setEditingCategory(null);
  };

  const handleDeleteCategory = (cat: Category) => {
    if (!window.confirm(`Are you sure you want to remove the discipline "${cat.name}"?`)) return;
    deleteCategory(cat.id);
    showToast(`Discipline "${cat.name}" deleted.`, 'info');
  };

  const handleAddSubtopic = (catId: string) => {
    const text = newSubtopicInput[catId]?.trim();
    if (!text) return;
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      if (cat.subcategories.includes(text)) {
        showToast(`Topic "${text}" already exists in ${cat.name}.`, 'warning');
        return;
      }
      updateCategory(catId, {
        subcategories: [...cat.subcategories, text]
      });
      showToast(`Added topic "${text}" to ${cat.name}.`, 'success');
      setNewSubtopicInput(prev => ({ ...prev, [catId]: '' }));
    }
  };

  const handleRemoveSubtopic = (catId: string, subName: string) => {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      updateCategory(catId, {
        subcategories: cat.subcategories.filter(s => s !== subName)
      });
      showToast(`Removed topic "${subName}".`, 'info');
    }
  };

  // Group filtered categories by Semester
  const groupedBySemester: Record<string, Category[]> = {};
  SEMESTER_OPTIONS.forEach(sem => {
    groupedBySemester[sem] = [];
  });

  filteredCategories.forEach(cat => {
    const sem = getSemesterForCat(cat);
    if (!groupedBySemester[sem]) {
      groupedBySemester[sem] = [];
    }
    groupedBySemester[sem].push(cat);
  });

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Curriculum Taxonomy & Semester Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize academic semesters, engineering disciplines, and modular sub-topics for learner progression
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddCatModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Discipline
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Academic Disciplines
          </div>
          <div className="text-2xl font-bold font-display text-slate-950 tabular-nums">
            {categories.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Core curriculum areas</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Specialized Topics
          </div>
          <div className="text-2xl font-bold font-display text-emerald-950 tabular-nums">
            {totalSubtopics}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Modular syllabus tags</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Academic Tracks / Terms
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 tabular-nums">
            {SEMESTER_OPTIONS.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Structured semesters</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Catalog Courses Mapped
          </div>
          <div className="text-2xl font-bold font-display text-slate-950 tabular-nums">
            {totalCoursesMapped}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Mapped across catalog</div>
        </div>
      </div>

      {/* Search & Semester Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search disciplines or topics..."
            className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        {/* Semester Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedSemesterFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSemesterFilter === 'all'
                ? 'bg-emerald-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Tracks ({categories.length})
          </button>
          {SEMESTER_OPTIONS.map((sem, idx) => (
            <button
              key={sem}
              type="button"
              onClick={() => setSelectedSemesterFilter(sem)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSemesterFilter === sem
                  ? 'bg-emerald-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sem {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Semester-by-Semester List View */}
      <div className="space-y-6">
        {SEMESTER_OPTIONS.map((semesterTitle, semIdx) => {
          const semesterCats = groupedBySemester[semesterTitle] || [];
          if (semesterCats.length === 0 && selectedSemesterFilter !== 'all') return null;

          return (
            <div key={semesterTitle} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
              {/* Semester Group Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold font-display">
                    S{semIdx + 1}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{semesterTitle}</h2>
                    <p className="text-[11px] text-slate-500">
                      {semesterCats.length} {semesterCats.length === 1 ? 'discipline' : 'disciplines'} configured in this curriculum term
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {semesterCats.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)} Topics
                </span>
              </div>

              {/* Disciplines List under Semester */}
              {semesterCats.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {semesterCats.map((cat) => (
                    <div key={cat.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Discipline Info */}
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{cat.name}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              /{cat.slug}
                            </span>
                            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {cat.courseCount} Courses
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {cat.description}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(cat)}
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete discipline"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sub-Topics List */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          <span>Curriculum Sub-topics & Modules ({cat.subcategories?.length || 0})</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {cat.subcategories?.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-medium border border-slate-200 group hover:border-slate-300"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubtopic(cat.id, sub)}
                                className="text-slate-400 hover:text-rose-600 font-bold"
                                title="Remove topic"
                              >
                                &times;
                              </button>
                            </span>
                          ))}

                          {/* Quick inline topic add */}
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="text"
                              value={newSubtopicInput[cat.id] || ''}
                              onChange={(e) => setNewSubtopicInput({ ...newSubtopicInput, [cat.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSubtopic(cat.id);
                                }
                              }}
                              placeholder="+ Add topic..."
                              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 w-28 focus:w-44 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                            {newSubtopicInput[cat.id]?.trim() && (
                              <button
                                type="button"
                                onClick={() => handleAddSubtopic(cat.id)}
                                className="px-2 py-1 bg-emerald-900 text-white rounded text-xs font-bold"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No disciplines mapped to this semester yet. Click &quot;Add New Discipline&quot; to assign topics here.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Discipline */}
      {addCatModalOpen && (
        <Modal
          isOpen={addCatModalOpen}
          onClose={() => setAddCatModalOpen(false)}
          title="Create New Academic Discipline"
        >
          <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
            <Input
              label="Discipline Name"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Distributed Cloud Systems"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Academic Semester / Track
              </label>
              <select
                value={newCatSemester}
                onChange={(e) => setNewCatSemester(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Curriculum Description
              </label>
              <textarea
                rows={3}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Overview of subject matter and engineering domain..."
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <Input
              label="Initial Sub-Topics (comma separated)"
              value={newCatSubtopics}
              onChange={(e) => setNewCatSubtopics(e.target.value)}
              placeholder="e.g. Microservices, Raft Consensus, Docker Orchestration"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddCatModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create Discipline
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Discipline */}
      {editingCategory && (
        <Modal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          title={`Edit Discipline: ${editingCategory.name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <Input
              label="Discipline Name"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Academic Semester / Track
              </label>
              <select
                value={editSemester}
                onChange={(e) => setEditSemester(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Curriculum Description
              </label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
