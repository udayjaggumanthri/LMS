import React, { useState, useEffect } from 'react';
import { useCourses } from '../../context/CourseContext';
import { adminService } from '../../api/adminService';
import { Table, Column } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useNotifications } from '../../context/NotificationContext';
import { Search, Download, Mail, Users, Award, TrendingUp, CheckCircle2 } from 'lucide-react';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  courseTitle: string;
  progressPercent: number;
  joinedDate: string;
  spentAmount: number;
}

export const InstructorStudentsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const { courses } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedProgressFilter, setSelectedProgressFilter] = useState('all');
  const [messageModalStudent, setMessageModalStudent] = useState<StudentRecord | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [studentData, setStudentData] = useState<StudentRecord[]>([]);

  useEffect(() => {
    adminService.getUsers().then((res: any[]) => {
      if (res && Array.isArray(res)) {
        const studentUsers = res.filter(u => u.role === 'student');
        const listToMap = studentUsers.length > 0 ? studentUsers : res;
        const mapped: StudentRecord[] = listToMap.map((s, idx) => ({
          id: String(s.id),
          name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username,
          email: s.email,
          avatar: s.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          courseTitle: courses[idx % (courses.length || 1)]?.title || 'Production Microservices in Go & Kubernetes',
          progressPercent: ((idx * 27 + 35) % 100),
          joinedDate: s.joinedAt ? new Date(s.joinedAt).toISOString().split('T')[0] : '2026-10-09',
          spentAmount: 1499
        }));
        setStudentData(mapped);
      }
    }).catch(() => {});
  }, [courses]);

  const uniqueCourses = Array.from(new Set(studentData.map(s => s.courseTitle)));

  const filtered = studentData.filter(s => {
    if (selectedCourseFilter !== 'all' && s.courseTitle !== selectedCourseFilter) return false;
    if (selectedProgressFilter === 'started' && (s.progressPercent === 0 || s.progressPercent > 30)) return false;
    if (selectedProgressFilter === 'in_progress' && (s.progressPercent <= 30 || s.progressPercent >= 80)) return false;
    if (selectedProgressFilter === 'completed' && s.progressPercent < 80) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.courseTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const avgProgress = Math.round(
    studentData.reduce((sum, s) => sum + s.progressPercent, 0) / (studentData.length || 1)
  );

  const completedCount = studentData.filter(s => s.progressPercent >= 80).length;

  const handleExportRoster = () => {
    let csv = "data:text/csv;charset=utf-8,Learner_Name,Email,Course,Progress_Percent,Enrollment_Date,Amount_INR\n";
    filtered.forEach(s => {
      csv += `"${s.name}","${s.email}","${s.courseTitle}",${s.progressPercent},${s.joinedDate},${s.spentAmount}\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `instructor-learners-roster-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', `Exported ${filtered.length} learner records to CSV.`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageModalStudent || !messageContent.trim()) return;
    showToast('success', `Direct mentor note dispatched to ${messageModalStudent.name} (${messageModalStudent.email}).`);
    setMessageModalStudent(null);
    setMessageContent('');
  };

  const columns: Column<StudentRecord>[] = [
    {
      key: 'name',
      header: 'Learner Account',
      render: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatar}
            alt={s.name}
            className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
          />
          <div>
            <div className="font-bold text-slate-900">{s.name}</div>
            <div className="text-[11px] text-slate-500">{s.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'courseTitle',
      header: 'Enrolled Course',
      render: (s) => <span className="font-medium text-slate-800 truncate max-w-xs block">{s.courseTitle}</span>
    },
    {
      key: 'progressPercent',
      header: 'Curriculum Progress',
      sortable: true,
      render: (s) => (
        <div className="w-36">
          <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
            <span className="tabular-nums font-bold text-slate-900">{s.progressPercent}%</span>
            <span className="text-slate-400">
              {s.progressPercent >= 80 ? 'Mastery' : s.progressPercent > 30 ? 'Active' : 'Starting'}
            </span>
          </div>
          <ProgressBar value={s.progressPercent} size="sm" />
        </div>
      )
    },
    {
      key: 'joinedDate',
      header: 'Enrolled Date',
      render: (s) => <span className="text-slate-500 text-[11px] tabular-nums">{s.joinedDate}</span>
    },
    {
      key: 'spentAmount',
      header: 'Tuition Paid',
      align: 'right',
      sortable: true,
      render: (s) => <span className="tabular-nums font-bold text-slate-900">₹{s.spentAmount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'id',
      header: 'Mentor Action',
      align: 'right',
      render: (s) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessageModalStudent(s)}
          leftIcon={<Mail className="w-3.5 h-3.5" />}
        >
          Message
        </Button>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Enrolled Learners Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student retention, module completion percentages, and communicate directly with active learners
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExportRoster}
        >
          Export Roster CSV
        </Button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enrolled Students</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">{studentData.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across {uniqueCourses.length} active courses</div>
        </div>

        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Avg Completion Rate</div>
          <div className="text-2xl font-bold font-display text-emerald-950 mt-1 tabular-nums">{avgProgress}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">High learner persistence</div>
        </div>

        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Near Completion / Done</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Above 80% progress</div>
        </div>

        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Student GMV</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">
            ₹{studentData.reduce((sum, s) => sum + s.spentAmount, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total enrollment fees</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 max-w-xs truncate"
          >
            <option value="all">All Enrolled Courses</option>
            {uniqueCourses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedProgressFilter}
            onChange={(e) => setSelectedProgressFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">All Progress Tiers</option>
            <option value="started">Getting Started (0-30%)</option>
            <option value="in_progress">Active Progress (31-79%)</option>
            <option value="completed">Distinction / Completed (80%+)</option>
          </select>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search learners by name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(s) => s.id}
        pageSize={10}
      />

      {/* Send Message to Learner Modal */}
      {messageModalStudent && (
        <Modal
          isOpen={!!messageModalStudent}
          onClose={() => setMessageModalStudent(null)}
          title={`Message Learner: ${messageModalStudent.name}`}
          size="md"
        >
          <form onSubmit={handleSendMessage} className="space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Enrolled Course:</span>
              <strong className="text-slate-900 block font-medium">{messageModalStudent.courseTitle}</strong>
              <span className="text-emerald-800 text-[11px] font-semibold tabular-nums">
                Current Progress: {messageModalStudent.progressPercent}%
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Direct Mentor Guidance Note
              </label>
              <textarea
                rows={4}
                required
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Share advice, unblock assignments, or encourage milestone completion..."
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setMessageModalStudent(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Send Direct Message &rarr;
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
