import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Award,
  DollarSign,
  User as UserIcon,
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Star,
  Users,
  TrendingUp,
  CreditCard,
  Settings,
  ShieldAlert,
  FolderTree,
  Ticket,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  Compass,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';

export const AppLayout: React.FC = () => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    if (role === 'student') navigate('/student/my-learning');
    else if (role === 'instructor') navigate('/instructor/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  const studentLinks = [
    { label: 'My Learning', to: '/student/my-learning', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Browse Catalog', to: '/courses', icon: <Compass className="w-4 h-4" /> },
    { label: 'Certificates', to: '/student/certificates', icon: <Award className="w-4 h-4" /> },
    { label: 'Purchase History', to: '/student/orders', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Account Settings', to: '/student/account', icon: <Settings className="w-4 h-4" /> }
  ];

  const instructorLinks = [
    { label: 'Dashboard', to: '/instructor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Courses', to: '/instructor/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Create New Course', to: '/instructor/courses/new', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Q&A Inbox', to: '/instructor/qa', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Student Reviews', to: '/instructor/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Enrolled Students', to: '/instructor/students', icon: <Users className="w-4 h-4" /> },
    { label: 'Performance Analytics', to: '/instructor/analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Revenue & Payouts', to: '/instructor/payouts', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Public Profile', to: '/instructor/profile', icon: <UserIcon className="w-4 h-4" /> }
  ];

  const adminLinks = [
    { label: 'Admin Overview', to: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Course Review Queue', to: '/admin/course-reviews', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Course Catalog', to: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Users Directory', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Instructor Applications', to: '/admin/instructor-applications', icon: <FileText className="w-4 h-4" /> },
    { label: 'Orders & Refunds', to: '/admin/orders-refunds', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Payout Requests', to: '/admin/payouts', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Coupons & Promos', to: '/admin/coupons', icon: <Ticket className="w-4 h-4" /> },
    { label: 'Categories Taxonomy', to: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'Financial Reports', to: '/admin/reports', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Platform Settings', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const currentNavLinks =
    currentRole === 'admin'
      ? adminLinks
      : currentRole === 'instructor'
      ? instructorLinks
      : studentLinks;

  const roleTitles = {
    student: 'Student Workspace',
    instructor: 'Instructor Studio',
    admin: 'Platform Admin Center'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 overflow-x-hidden">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-40">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-1.5 rounded border border-slate-200 text-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-xl' : 'hidden'
        } md:static md:block md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen z-30`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded focus:outline-none"
              title="View Public Storefront"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-800 rounded"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Mode Badge */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current Portal
            </div>
            <div className="text-xs font-bold text-slate-900 font-display">
              {roleTitles[currentRole]}
            </div>
          </div>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {currentNavLinks.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to) && item.to !== '/admin/courses' && item.to !== '/instructor/courses');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Role Switcher in Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Switch Demo Role
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['student', 'instructor', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`py-1 text-[11px] rounded font-medium capitalize border transition-colors ${
                  currentRole === r
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <Link to="/" className="text-emerald-800 hover:underline text-[11px] font-medium">
              Public Storefront &rarr;
            </Link>
            <button
              onClick={logout}
              className="text-rose-700 hover:underline text-[11px] font-medium inline-flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-hidden min-w-0">
            <span className="font-semibold text-slate-900 shrink-0">{roleTitles[currentRole]}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-600 truncate">{location.pathname}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(prev => !prev)}
                className="relative p-2 text-slate-600 hover:text-slate-900 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded py-2 z-50 text-slate-900 shadow-md animate-in fade-in-50 duration-150"
                  onMouseLeave={() => setNotifOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-emerald-800 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 ${
                            !n.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{n.title}</span>
                            <span className="text-[10px] font-normal text-slate-400">{n.createdAt}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Thumbnail */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded object-cover border border-slate-200"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Outlet Content Area */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 overflow-y-auto min-w-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
