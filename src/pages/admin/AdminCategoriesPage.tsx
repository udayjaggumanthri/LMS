import React, { useState } from 'react';
import { FolderTree, Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory } = useCourses();

  const [addCatModalOpen, setAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newSubcatInput, setNewSubcatInput] = useState<Record<string, string>>({});

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    addCategory({
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || 'Practical curriculum discipline',
      subcategories: ['General', 'Advanced Topics'],
      iconName: 'BookOpen'
    });
    setNewCatName('');
    setNewCatDesc('');
    setAddCatModalOpen(false);
  };

  const handleAddSubcategory = (catId: string) => {
    const text = newSubcatInput[catId]?.trim();
    if (!text) return;
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      updateCategory(catId, {
        subcategories: [...cat.subcategories, text]
      });
      setNewSubcatInput(prev => ({ ...prev, [catId]: '' }));
    }
  };

  const handleRemoveSubcategory = (catId: string, subName: string) => {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      updateCategory(catId, {
        subcategories: cat.subcategories.filter(s => s !== subName)
      });
    }
  };

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Categories & Taxonomy Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage the 10 skill disciplines, assign nested subcategories, and govern marketplace navigation
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setAddCatModalOpen(true)}
        >
          Add Discipline
        </Button>
      </div>

      {/* Category Tree Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="p-6 border border-slate-200 rounded bg-white space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-display">{cat.name}</h3>
                <p className="text-slate-500 mt-0.5">{cat.description}</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                {cat.courseCount} Courses
              </span>
            </div>

            {/* Subcategories nested tree list */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Nested Sub-disciplines ({cat.subcategories.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cat.subcategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(cat.id, sub)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add subcategory input */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={newSubcatInput[cat.id] || ''}
                  onChange={(e) => setNewSubcatInput(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  placeholder="New subcategory..."
                  className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <Button variant="secondary" size="sm" onClick={() => handleAddSubcategory(cat.id)}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={addCatModalOpen}
        onClose={() => setAddCatModalOpen(false)}
        title="Add New Category Discipline"
        size="md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <Input
            label="Category Name"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Artificial Intelligence Engineering"
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="What will learners study in this discipline?"
              className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Discipline
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
