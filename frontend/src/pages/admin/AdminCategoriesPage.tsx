import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useNotifications } from '../../context/NotificationContext';
import { apiErrorMessage } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCourses();
  const { showToast } = useNotifications();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isTop, setIsTop] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsTop(Boolean(cat.isTop));
  };

  const resetForm = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setIsTop(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, {
          name: name.trim(),
          description: description.trim(),
          isTop,
        });
        showToast('Category updated.', 'success');
      } else {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await addCategory({
          name: name.trim(),
          slug: slug || 'category',
          description: description.trim(),
          subcategories: [],
          iconName: 'BookOpen',
          isTop,
        });
        showToast('Category added.', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not save the category.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleHomepage = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { isTop: !cat.isTop });
      showToast(!cat.isTop ? `${cat.name} is on the homepage.` : `${cat.name} was removed from the homepage.`, 'success');
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not update the homepage setting.'), 'error');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Remove the category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      if (editing?.id === cat.id) resetForm();
      showToast('Category removed.', 'info');
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not remove the category.'), 'error');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add a category such as Development or Mobile Development. Courses choose one category when they are created.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="category-name">
            Name
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1" htmlFor="category-description">
            Description
          </label>
          <textarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input type="checkbox" checked={isTop} onChange={(e) => setIsTop(e.target.checked)} />
          Show on the homepage
        </label>
        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            <Plus className="w-3.5 h-3.5" />
            {editing ? 'Save changes' : 'Add category'}
          </Button>
          {editing && (
            <button type="button" onClick={resetForm} className="text-sm text-slate-600 hover:text-slate-900">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {categories.length === 0 && (
          <p className="p-5 text-sm text-slate-500">No categories yet. Add the first one above.</p>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={() => startEdit(cat)}
              className="min-w-0 text-left flex-1"
            >
              <div className="font-semibold text-slate-900">{cat.name}</div>
              {cat.description && <p className="text-sm text-slate-600 mt-0.5">{cat.description}</p>}
              <p className="text-xs text-slate-400 mt-1">
                {cat.courseCount || 0} {cat.courseCount === 1 ? 'course' : 'courses'}
              </p>
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(cat.isTop)}
                  onChange={() => toggleHomepage(cat)}
                />
                Show on the homepage
              </label>
              <button
                type="button"
                onClick={() => startEdit(cat)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
                aria-label={`Edit ${cat.name}`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat)}
                className="p-2 text-slate-400 hover:text-rose-700 rounded-lg"
                aria-label={`Remove ${cat.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
