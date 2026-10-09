import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit3, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Course, CourseStatus } from '../../types';

export const InstructorCoursesPage: React.FC = () => {
  const { courses, updateCourseStatus } = useCourses();
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const myCourses = courses.filter(
    c => c.instructorId === currentUser?.id || c.instructorId === 'inst-7'
  );

  const filtered = myCourses.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchFilter && !c.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const columns: Column<Course>[] = [
    {
      key: 'title',
      header: 'Course Details',
      render: (c) => (
        <div className="flex items-center gap-3">
          <img
            src={c.thumbnail}
            alt={c.title}
            className="w-14 aspect-video rounded object-cover border border-slate-200 shrink-0"
          />
          <div className="truncate max-w-sm">
            <Link to={`/student/course/${c.id}`} className="font-bold text-slate-900 hover:text-emerald-900 truncate block">
              {c.title}
            </Link>
            <span className="text-[11px] text-slate-500">{c.subcategory} · {c.durationHours}h total</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <Badge
          variant={
            c.status === 'published'
              ? 'success'
              : c.status === 'in_review'
              ? 'warning'
              : c.status === 'changes_requested'
              ? 'danger'
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
      key: 'rating',
      header: 'Rating',
      align: 'center',
      render: (c) => (
        <span className="font-semibold text-amber-900 tabular-nums">
          {c.rating > 0 ? `★ ${c.rating}` : '—'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          {c.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateCourseStatus(c.id, 'in_review')}
            >
              Submit for Review
            </Button>
          )}
          {c.status === 'in_review' && (
            <span className="text-[11px] text-slate-400 italic">Under Admin Review</span>
          )}
          <Link to={`/student/course/${c.id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              Preview
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Course Catalog Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author new syllabi, track approval statuses, and monitor student metrics
          </p>
        </div>

        <Link to="/instructor/courses/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {['all', 'published', 'in_review', 'draft', 'changes_requested'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search my courses..."
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        pageSize={8}
      />
    </div>
  );
};
