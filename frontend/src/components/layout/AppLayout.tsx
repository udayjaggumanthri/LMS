import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  ChevronRight,
  Layers,
  Image,
  Mail,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useCourse } from '../../context/CourseContext';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';

export const AppLayout: React.FC = () => {
  const { currentUser, currentRole, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { courses } = useCourse();
  const { instructorApplications } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/signin" replace />;
  }

  const pendingApps = instructorApplications?.filter(a => a.status === 'pending').length || 0;
  const pendingReviews = courses?.filter(c => c.status === 'review_pending').length || 0;

  const adminSections = [
    {
      title: 'Platform Control',
      items: [
        { label: 'Admin Overview', to: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Financial Reports', to: '/admin/reports', icon: <TrendingUp className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Academics & Catalog',
      items: [
        { label: 'Course Catalog', to: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Course Review Queue', to: '/admin/course-reviews', icon: <ShieldAlert className="w-4 h-4" />, badge: pendingReviews > 0 ? pendingReviews : undefined },
        { label: 'Semester Taxonomy', to: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Users & Faculty',
      items: [
        { label: 'Users Directory', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Instructor Applications', to: '/admin/instructor-applications', icon: <FileText className="w-4 h-4" />, badge: pendingApps > 0 ? pendingApps : undefined }
      ]
    },
    {
      title: 'Content & Media',
      items: [
        { label: 'Media Library', to: '/admin/media-library', icon: <Image className="w-4 h-4" /> },
        { label: 'Visual Page Editor', to: '/admin/page-editor', icon: <Layers className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Commerce & Orders',
      items: [
        { label: 'Orders & Invoices', to: '/admin/orders-refunds', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Instructor Payouts', to: '/admin/payouts', icon: <Banknote className="w-4 h-4" /> },
        { label: 'Payment Gateway (Toucan)', to: '/admin/payment-gateway', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Coupons & Promos', to: '/admin/coupons', icon: <Ticket className="w-4 h-4" /> }
      ]
    },
    {
      title: 'System & Governance',
      items: [
        { label: 'Mail SMTP Settings', to: '/admin/smtp', icon: <Mail className="w-4 h-4" /> },
        { label: 'Platform Settings', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const instructorSections = [
    {
      title: 'Teaching Studio',
      items: [
        { label: 'Studio Dashboard', to: '/instructor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'My Courses', to: '/instructor/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Create New Course', to: '/instructor/courses/new', icon: <PlusCircle className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Learners & Interaction',
      items: [
        { label: 'Enrolled Students', to: '/instructor/students', icon: <Users className="w-4 h-4" /> },
        { label: 'Q&A Inbox', to: '/instructor/qa', icon: <MessageSquare className="w-4 h-4" /> },
        { label: 'Student Reviews', to: '/instructor/reviews', icon: <Star className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Analytics & Profile',
      items: [
        { label: 'Course Analytics', to: '/instructor/analytics', icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Earnings & Payouts', to: '/instructor/payouts', icon: <Banknote className="w-4 h-4" /> },
        { label: 'Instructor Profile', to: '/instructor/profile', icon: <UserIcon className="w-4 h-4" /> }
      ]
    }
  ];

  const studentSections = [
    {
      title: 'My Academics',
      items: [
        { label: 'My Learning', to: '/student/my-learning', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Browse Catalog', to: '/courses', icon: <Compass className="w-4 h-4" /> },
        { label: 'Certificates', to: '/student/certificates', icon: <Award className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Account & Billing',
      items: [
        { label: 'Purchase History', to: '/student/orders', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Account Settings', to: '/student/account', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const currentSections =
    currentRole === 'admin'
      ? adminSections
      : currentRole === 'instructor'
      ? instructorSections
      : studentSections;

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
          mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl' : 'hidden'
        } md:static md:flex md:w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-screen z-30`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-800 rounded"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Mode Badge */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100/60 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Portal
            </div>
            <div className="text-xs font-bold text-slate-900 font-display flex items-center gap-1.5">
              <span>{roleTitles[currentRole]}</span>
            </div>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {currentSections.map((section, sIdx) => (
            <div key={section.title || sIdx} className="space-y-1">
              <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 group ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200/90 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="shrink-0 transition-transform duration-150 group-hover:scale-105">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Authenticated User Profile Card in Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={currentUser?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.name || currentUser?.username || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 truncate capitalize font-medium">
                {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role === 'instructor' ? 'Instructor' : 'Student'}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/90 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
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

          <div className="flex items-center gap-3">
            {/* Single Clean Storefront Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-950 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
              title="Visit Public Storefront"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

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

            {/* User Profile Thumbnail & Quick Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize font-medium">{currentUser.role}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
