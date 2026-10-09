import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Eye, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Course } from '../../types';

export const AdminCourseManagementPage: React.FC = () => {
  const { courses, updateCourse, deleteCourse } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = courses.filter(c => {
    if (categoryFilter !== 'all' && c.categoryId !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.subcategory.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleFeatured = (course: Course) => {
    updateCourse(course.id, { featured: !course.featured });
  };

  const columns: Column<Course>[] = [
    {
      key: 'title',
      header: 'Masterclass',
      render: (c) => (
        <div className="flex items-center gap-3">
          <img
            src={c.thumbnail}
            alt={c.title}
            className="w-14 aspect-video rounded object-cover border border-slate-200 shrink-0"
          />
          <div className="truncate max-w-sm">
            <Link to={`/student/course/${c.id}`} className="font-bold text-slate-900 hover:text-emerald-900 block truncate">
              {c.title}
            </Link>
            <div className="text-[11px] text-slate-500">
              {c.subcategory} · {c.durationHours}h · {c.level}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Catalog Status',
      render: (c) => (
        <Badge
          variant={
            c.status === 'published'
              ? 'success'
              : c.status === 'in_review'
              ? 'warning'
              : 'neutral'
          }
        >
          {c.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'studentCount',
      header: 'Enrollments',
      align: 'right',
      sortable: true,
      render: (c) => <span className="tabular-nums font-semibold">{c.studentCount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'price',
      header: 'Price (INR)',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-bold text-slate-900 tabular-nums">
          {c.isFree ? 'Free' : `₹${c.price.toLocaleString('en-IN')}`}
        </span>
      )
    },
    {
      key: 'featured',
      header: 'Featured',
      align: 'center',
      render: (c) => (
        <button
          onClick={() => toggleFeatured(c)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
            c.featured
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {c.featured ? 'Featured' : 'Standard'}
        </button>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/student/course/${c.id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              View
            </Button>
          </Link>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${c.title}"?`)) {
                deleteCourse(c.id);
              }
            }}
            className="text-slate-400 hover:text-rose-600 p-1 rounded"
            title="Delete course"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Catalog Course Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global catalog oversight: manage featured status, edit metadata, or unpublish courses
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded text-xs">
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across all catalog titles..."
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
        <span className="text-slate-500 tabular-nums">
          Showing {filtered.length} of {courses.length} courses
        </span>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        pageSize={10}
      />
    </div>
  );
};
