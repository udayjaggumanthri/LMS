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
  Layers,
  Image,
  Mail,
  CreditCard
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AppLayout: React.FC = () => {
  const { currentUser, currentRole, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/signin" replace />;
  }

  const adminSections: NavSection[] = [
    {
      title: '',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Reports', to: '/admin/reports', icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Courses', to: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Reviews', to: '/admin/course-reviews', icon: <ShieldAlert className="w-4 h-4" /> },
        { label: 'Categories', to: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
        { label: 'Students', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Applications', to: '/admin/instructor-applications', icon: <FileText className="w-4 h-4" /> },
        { label: 'Blog', to: '/admin/blogs', icon: <FileText className="w-4 h-4" /> },
        { label: 'Media', to: '/admin/media-library', icon: <Image className="w-4 h-4" /> },
        { label: 'Pages', to: '/admin/page-editor', icon: <Layers className="w-4 h-4" /> },
        { label: 'Orders', to: '/admin/orders-refunds', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Payments', to: '/admin/payment-gateway', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Coupons', to: '/admin/coupons', icon: <Ticket className="w-4 h-4" /> },
        { label: 'Mail', to: '/admin/smtp', icon: <Mail className="w-4 h-4" /> },
        { label: 'Templates', to: '/admin/mail-templates', icon: <Bell className="w-4 h-4" /> },
        { label: 'Settings', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const instructorSections: NavSection[] = [
    {
      title: '',
      items: [
        { label: 'Dashboard', to: '/instructor/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Courses', to: '/instructor/courses', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'New course', to: '/instructor/courses/new', icon: <PlusCircle className="w-4 h-4" /> },
        { label: 'Students', to: '/instructor/students', icon: <Users className="w-4 h-4" /> },
        { label: 'Questions', to: '/instructor/qa', icon: <MessageSquare className="w-4 h-4" /> },
        { label: 'Reviews', to: '/instructor/reviews', icon: <Star className="w-4 h-4" /> },
        { label: 'Analytics', to: '/instructor/analytics', icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Profile', to: '/instructor/profile', icon: <UserIcon className="w-4 h-4" /> }
      ]
    }
  ];

  const studentSections: NavSection[] = [
    {
      title: '',
      items: [
        { label: 'My learning', to: '/student/my-learning', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Catalog', to: '/courses', icon: <Compass className="w-4 h-4" /> },
        { label: 'Certificates', to: '/student/certificates', icon: <Award className="w-4 h-4" /> },
        { label: 'Purchases', to: '/student/orders', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Account', to: '/student/account', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const currentSections =
    currentRole === 'admin'
      ? adminSections
      : currentRole === 'instructor'
      ? instructorSections
      : studentSections;

  const pageRules: [RegExp, string][] = [
    [/\/lessons\/new$/, 'New lesson'],
    [/\/lessons\//, 'Lesson'],
    [/\/courses\/new$/, 'New course'],
    [/\/courses\/[^/]+\/edit$/, 'Edit course'],
    [/\/course-reviews$/, 'Reviews'],
    [/\/categories$/, 'Categories'],
    [/\/instructor-applications$/, 'Applications'],
    [/\/media-library$/, 'Media'],
    [/\/page-editor$/, 'Pages'],
    [/\/orders-refunds$/, 'Orders'],
    [/\/payment-gateway$/, 'Payments'],
    [/\/my-learning$/, 'My learning'],
    [/\/dashboard$/, 'Dashboard'],
    [/\/reports$/, 'Reports'],
    [/\/courses$/, 'Courses'],
    [/\/users$/, 'Students'],
    [/\/blogs$/, 'Blog'],
    [/\/coupons$/, 'Coupons'],
    [/\/mail-templates\/.+/, 'Edit template'],
    [/\/mail-templates$/, 'Templates'],
    [/\/smtp$/, 'Mail'],
    [/\/settings$/, 'Settings'],
    [/\/students$/, 'Students'],
    [/\/qa$/, 'Questions'],
    [/\/reviews$/, 'Reviews'],
    [/\/analytics$/, 'Analytics'],
    [/\/profile$/, 'Profile'],
    [/\/certificates$/, 'Certificates'],
    [/\/orders$/, 'Purchases'],
    [/\/account$/, 'Account'],
  ];
  const pageName = pageRules.find(([pattern]) => pattern.test(location.pathname))?.[1] || 'Workspace';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 overflow-x-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen max-h-screen bg-white shadow-2xl flex flex-col md:static md:z-auto md:w-64 md:h-screen md:sticky md:top-0 md:shadow-none border-r border-slate-200 shrink-0 transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ backgroundColor: '#ffffff' }}
        aria-label="Navigation Sidebar"
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          {currentSections.map((section, sIdx) => (
            <div key={section.title || sIdx} className="space-y-0.5">
              {section.title ? (
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              ) : null}
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
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand / Workspace Badge */}
            <div className="md:hidden flex items-center gap-2">
              <Logo size="sm" />
            </div>

            {/* Desktop Breadcrumbs */}
            <div className="hidden md:block text-sm font-semibold text-slate-900 truncate">
              {pageName}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Single Clean Storefront Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-950 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
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
                <Avatar name={currentUser.name} size="sm" />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize font-medium">{currentUser.role}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
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
