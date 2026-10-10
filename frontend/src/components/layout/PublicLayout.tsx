import React, { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  ChevronDown,
  User as UserIcon,
  BookOpen,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Award,
  Globe,
  DollarSign,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  FileText,
  Home,
  GraduationCap,
  Info,
  Mail,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCourses } from '../../context/CourseContext';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole, isAuthenticated, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { wishlistCourseIds } = useWishlist();
  const { categories } = useCourses();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/signin', { replace: true });
  };

  const getWorkspacePath = () => {
    if (currentRole === 'admin') return '/admin/dashboard';
    if (currentRole === 'instructor') return '/instructor/dashboard';
    return '/student/my-learning';
  };

  const getWorkspaceLabel = () => {
    if (currentRole === 'admin') return 'Admin Portal';
    if (currentRole === 'instructor') return 'Instructor Studio';
    return 'My Learning';
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Enhanced Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 lg:gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'text-emerald-950 bg-emerald-50/90 font-bold border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-emerald-950 bg-emerald-50/90 font-bold border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`
              }
            >
              <span>Courses</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                All
              </span>
            </NavLink>

            <NavLink
              to="/teach"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'text-emerald-950 bg-emerald-50/90 font-bold border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`
              }
            >
              Teach with Us
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'text-emerald-950 bg-emerald-50/90 font-bold border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`
              }
            >
              About Us
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'text-emerald-950 bg-emerald-50/90 font-bold border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`
              }
            >
              Contact
            </NavLink>

            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'text-emerald-950 bg-emerald-50/90 font-bold border border-emerald-200/70 shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`
              }
            >
              Blog
            </NavLink>
          </nav>

          {/* Action Zone: Wishlist, Cart & Authentication */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCourseIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {wishlistCourseIds.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Shopping Cart"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Authenticated State vs Guest Buttons */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                {/* Direct Workspace Pill Button */}
                <Link
                  to={getWorkspacePath()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 rounded-lg transition-colors shadow-2xs"
                  title="Open Your Workspace"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{getWorkspaceLabel()}</span>
                </Link>

                {/* User Avatar Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(prev => !prev)}
                    className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 min-h-[40px]"
                    aria-label="User menu"
                  >
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={currentUser.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl py-2 z-50 text-slate-900 shadow-xl animate-in fade-in-50 duration-150"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-950 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {currentRole} Mode
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          to={getWorkspacePath()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50/60 text-emerald-950 font-semibold"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Enter {getWorkspaceLabel()}</span>
                        </Link>

                        {currentRole === 'student' && (
                          <>
                            <Link
                              to="/student/my-learning"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>My Learning</span>
                            </Link>
                            <Link
                              to="/student/certificates"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Award className="w-3.5 h-3.5 text-slate-400" />
                              <span>My Certificates</span>
                            </Link>
                            <Link
                              to="/student/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                            >
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                              <span>Purchase History</span>
                            </Link>
                          </>
                        )}

                        {currentRole === 'instructor' && (
                          <>
                            <Link
                              to="/instructor/courses"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>Manage Courses</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 text-left transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="bg-emerald-800 hover:bg-emerald-900 border-emerald-800 text-white font-semibold shadow-xs">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ml-0.5"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- MOBILE OFF-CANVAS DRAWER (LEFT TO RIGHT) ---------------- */}
      {/* Dark Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Side Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] h-screen bg-white shadow-2xl flex flex-col lg:hidden transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        style={{ backgroundColor: '#ffffff' }}
        aria-label="Mobile Navigation Drawer"
      >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <Logo size="sm" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer User Card or Guest CTAs */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            {isAuthenticated && currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-200">
                      {currentRole}
                    </span>
                  </div>
                </div>

                <Link
                  to={getWorkspacePath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg shadow-xs transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to {getWorkspaceLabel()} &rarr;</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 font-medium">Welcome to Prajnadhara EDU</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full justify-center bg-emerald-800 hover:bg-emerald-900 border-emerald-800">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Navigation Links */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-emerald-700" />
                <span>Home</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>

            <NavLink
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Courses Catalog</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                All
              </span>
            </NavLink>

            <NavLink
              to="/teach"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Teach with Us</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>About Us</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Contact Us</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>

            <NavLink
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Articles &amp; Blog</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>

            {/* Quick Actions in Mobile Drawer */}
            <div className="pt-3 pb-1 border-t border-slate-100 my-2">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Quick Actions
              </div>

              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-slate-500" />
                  <span>Shopping Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-slate-500" />
                  <span>Saved Wishlist</span>
                </div>
                {wishlistCourseIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                    {wishlistCourseIds.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Institutional Links in Mobile Drawer */}
            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Institutional
              </div>
              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                to="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Terms &amp; Conditions</span>
              </Link>
            </div>
          </nav>

          {/* Drawer Footer / Logout */}
          {isAuthenticated && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/90 border border-rose-200 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </aside>

      {/* Main Content View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. Comprehensive Global Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">
            {/* Col 1: Brand & Sanskrit Wisdom Origin */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Logo size="md" inverted />
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                At PrajnadharaEdu offers smart, career-aligned online learning designed to help you rise. Gain the skills you need and the confidence you deserve.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Currency:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-900 text-emerald-200 border border-emerald-700">
                  ₹ INR
                </span>
              </div>
            </div>

            {/* Col 2: GET HELP */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                GET HELP
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog &amp; Articles</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Col 3: PROGRAMS */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                PROGRAMS
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/category/development" className="hover:text-white transition-colors">Web Development</Link></li>
                <li><Link to="/courses?q=programming" className="hover:text-white transition-colors">Programming Languages</Link></li>
                <li><Link to="/category/mobile-app-development" className="hover:text-white transition-colors">Mobile App Development</Link></li>
                <li><Link to="/category/data-science" className="hover:text-white transition-colors">Data Science</Link></li>
              </ul>
            </div>

            {/* Col 4: CONTACT US */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                CONTACT US
              </h4>
              <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <p>1st Floor, 7-28-6, Tanvi Castle</p>
                <p>Tyaga Raja Nagar, Rajahmundry</p>
                <p>East Godavari, Andhra Pradesh, 533101</p>
                <p className="pt-1">
                  <a href="mailto:contact@prajnadharaedu.com" className="text-emerald-400 hover:underline">
                    contact@prajnadharaedu.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              © 2026 All Rights Reserved By Prajnadhara Infotech Pvt Ltd
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
