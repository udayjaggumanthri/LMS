import React, { useState } from 'react';
import { UserCheck, UserPlus, Upload, Search, Shield, GraduationCap, Award, Trash2 } from 'lucide-react';
import { INSTRUCTORS, DEMO_USERS, MOCK_STUDENTS_LIST } from '../../data/mockData';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { UserRole } from '../../types';

interface UnifiedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  enrolledCount?: number;
  joinedDate: string;
}

export const AdminUsersPage: React.FC = () => {
  // Combine all mock users into one rich directory
  const initialUsers: UnifiedUser[] = [
    {
      id: DEMO_USERS.admin.id,
      name: DEMO_USERS.admin.name,
      email: DEMO_USERS.admin.email,
      role: 'admin',
      avatar: DEMO_USERS.admin.avatar,
      joinedDate: DEMO_USERS.admin.joinedAt
    },
    ...INSTRUCTORS.map(i => ({
      id: i.id,
      name: i.name,
      email: i.email,
      role: 'instructor' as UserRole,
      avatar: i.avatar,
      enrolledCount: i.studentsCount,
      joinedDate: i.joinedAt
    })),
    ...MOCK_STUDENTS_LIST.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: 'student' as UserRole,
      avatar: s.avatar,
      enrolledCount: s.enrolledCount,
      joinedDate: s.joinedDate
    }))
  ];

  const [usersList, setUsersList] = useState<UnifiedUser[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [bulkCsvModalOpen, setBulkCsvModalOpen] = useState(false);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('student');

  // Bulk CSV Import State
  const defaultCsvSample = `name,email,role\nRohit Sen,rohit.sen@example.com,student\nSneha Kapoor,sneha.kapoor@example.com,instructor\nTanmay Rao,tanmay.rao@example.com,student`;
  const [csvText, setCsvText] = useState(defaultCsvSample);
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);

  const filteredUsers = usersList.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    const newUser: UnifiedUser = {
      id: `user-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      enrolledCount: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsersList(prev => [newUser, ...prev]);
    setInviteName('');
    setInviteEmail('');
    setInviteModalOpen(false);
  };

  const handleParseCsv = () => {
    const lines = csvText.trim().split('\n');
    const rows: any[] = [];
    lines.slice(1).forEach((line, idx) => {
      const [name, email, role] = line.split(',').map(s => s.trim());
      const isValid = name && email && email.includes('@') && ['student', 'instructor', 'admin'].includes(role);
      rows.push({
        id: `row-${idx}`,
        name: name || '',
        email: email || '',
        role: (role as UserRole) || 'student',
        valid: isValid,
        error: !isValid ? 'Invalid format or email' : null
      });
    });
    setCsvPreviewRows(rows);
  };

  const handleConfirmCsvImport = () => {
    const validUsers: UnifiedUser[] = csvPreviewRows
      .filter(r => r.valid)
      .map(r => ({
        id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: r.name,
        email: r.email,
        role: r.role,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        joinedDate: new Date().toISOString().split('T')[0]
      }));

    setUsersList(prev => [...validUsers, ...prev]);
    setBulkCsvModalOpen(false);
    setCsvPreviewRows([]);
  };

  const columns: Column<UnifiedUser>[] = [
    {
      key: 'name',
      header: 'User Account',
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar}
            alt={u.name}
            className="w-8 h-8 rounded object-cover border border-slate-200"
          />
          <div>
            <div className="font-bold text-slate-900">{u.name}</div>
            <div className="text-[11px] text-slate-500">{u.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Badge
          variant={
            u.role === 'admin'
              ? 'danger'
              : u.role === 'instructor'
              ? 'warning'
              : 'neutral'
          }
        >
          {u.role}
        </Badge>
      )
    },
    {
      key: 'enrolledCount',
      header: 'Activity Metric',
      align: 'right',
      render: (u) => (
        <span className="tabular-nums font-semibold text-slate-700">
          {u.role === 'instructor'
            ? `${(u.enrolledCount || 0).toLocaleString('en-IN')} students`
            : `${u.enrolledCount || 1} courses`}
        </span>
      )
    },
    {
      key: 'joinedDate',
      header: 'Joined Date',
      render: (u) => <span className="text-slate-500">{u.joinedDate}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setUsersList(prev => prev.filter(item => item.id !== u.id))}
            className="text-slate-400 hover:text-rose-600 p-1 rounded"
            title="Remove User"
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
            Platform Users Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage students, instructors, and system administrators across the marketplace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => {
              setBulkCsvModalOpen(true);
              handleParseCsv();
            }}
          >
            Bulk CSV Import
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setInviteModalOpen(true)}
          >
            Onboard User
          </Button>
        </div>
      </div>

      {/* Role Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {(['all', 'student', 'instructor', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded capitalize whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? `All Users (${usersList.length})` : `${r}s`}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        pageSize={12}
      />

      {/* Onboard User Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Onboard or Invite User"
        size="md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="e.g. Anand Murthy"
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="anand@example.com"
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Assigned Platform Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="student">Student (Learner)</option>
              <option value="instructor">Instructor (Course Publisher)</option>
              <option value="admin">Administrator (Full Rights)</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Account &rarr;
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Import Modal */}
      <Modal
        isOpen={bulkCsvModalOpen}
        onClose={() => setBulkCsvModalOpen(false)}
        title="Bulk CSV Import with Validation Preview"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Raw CSV Input (name, email, role)
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full font-mono bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex justify-between items-center">
            <Button variant="secondary" size="sm" onClick={handleParseCsv}>
              Validate & Preview Rows
            </Button>
            <span className="text-slate-500">
              {csvPreviewRows.length} rows parsed
            </span>
          </div>

          {/* Validation Preview Table */}
          {csvPreviewRows.length > 0 && (
            <div className="border border-slate-200 rounded overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {csvPreviewRows.map((r, i) => (
                    <tr key={i} className={r.valid ? 'bg-white' : 'bg-rose-50/50'}>
                      <td className="p-2 font-medium">{r.name}</td>
                      <td className="p-2 text-slate-600">{r.email}</td>
                      <td className="p-2 capitalize">{r.role}</td>
                      <td className="p-2">
                        {r.valid ? (
                          <span className="text-emerald-700 font-bold text-[10px]">Valid</span>
                        ) : (
                          <span className="text-rose-700 font-bold text-[10px]">{r.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkCsvModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={csvPreviewRows.filter(r => r.valid).length === 0}
              onClick={handleConfirmCsvImport}
            >
              Import {csvPreviewRows.filter(r => r.valid).length} Valid Users &rarr;
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
