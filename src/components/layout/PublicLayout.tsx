import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import {
  Search,
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
  Layers,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCourses } from '../../context/CourseContext';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole, isAuthenticated, logout, switchRole } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { wishlistCourseIds } = useWishlist();
  const { categories } = useCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobilePolicyOpen, setMobilePolicyOpen] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
      {/* 1. Slim Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">PRAJNA FLOW</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Skill-based courses crafted by industry practitioners</span>
            <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
            <span className="hidden sm:inline text-slate-300">Lifetime access & 30-day refund guarantee</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 text-[11px]">
            <Link to="/brand" className="hover:text-emerald-400 transition-colors">
              Brand Guide
            </Link>
            <Link to="/teach" className="hover:text-white transition-colors">
              Become an Instructor
            </Link>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Globe className="w-3 h-3" /> India (English)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-6 shrink-0">
            <Logo size="md" />

            {/* Categories Mega Dropdown Trigger */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setCategoriesOpen(prev => !prev)}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-slate-900 px-2 py-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded py-2 z-50 text-slate-900 shadow-md animate-in fade-in-50 duration-150"
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Browse 10 Skill Disciplines
                  </div>
                  <div className="max-h-96 overflow-y-auto py-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-900 transition-colors"
                      >
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {cat.courseCount} courses
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-1.5 px-3">
                    <Link
                      to="/courses"
                      onClick={() => setCategoriesOpen(false)}
                      className="block text-xs font-semibold text-emerald-800 hover:text-emerald-950 py-1"
                    >
                      View All Courses &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg hidden sm:flex items-center relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 24+ practical courses (e.g., React, Go, Figma, Valuation)..."
              className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 border border-slate-200 rounded pl-9 pr-4 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
            />
          </form>

          {/* Nav Links & User Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-5">
              <Link
                to="/"
                className="text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-colors whitespace-nowrap"
              >
                Home
              </Link>

              <Link
                to="/about"
                className="text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-colors whitespace-nowrap"
              >
                About Us
              </Link>

              <Link
                to="/courses"
                className="text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-colors whitespace-nowrap"
              >
                Courses
              </Link>

              {/* Policy Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-colors whitespace-nowrap py-2"
                >
                  <span>Policy</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-150" />
                </button>
                <div className="absolute left-0 top-full hidden group-hover:block w-44 bg-white border border-slate-200 rounded py-1 z-50 text-xs shadow-md">
                  <Link to="/privacy" className="block px-3 py-1.5 hover:bg-slate-50 text-slate-700">Privacy Policy</Link>
                  <Link to="/terms" className="block px-3 py-1.5 hover:bg-slate-50 text-slate-700">Terms & Conditions</Link>
                  <Link to="/refund-policy" className="block px-3 py-1.5 hover:bg-slate-50 text-slate-700">Refunds Policy</Link>
                </div>
              </div>

              <Link
                to="/contact"
                className="text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(prev => !prev)}
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Search courses"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCourseIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {wishlistCourseIds.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown or Login (Desktop & Tablet) */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1 rounded hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 min-h-[40px]"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded object-cover border border-slate-200"
                  />
                  <span className="hidden xl:inline text-xs font-medium text-slate-800 max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded py-2 z-50 text-slate-900 shadow-md animate-in fade-in-50 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {currentRole} Mode
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      {currentRole === 'student' && (
                        <>
                          <Link
                            to="/student/my-learning"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>My Learning</span>
                          </Link>
                          <Link
                            to="/student/certificates"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            <span>My Certificates</span>
                          </Link>
                          <Link
                            to="/student/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            <span>Purchase History</span>
                          </Link>
                        </>
                      )}

                      {currentRole === 'instructor' && (
                        <>
                          <Link
                            to="/instructor/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                            <span>Instructor Dashboard</span>
                          </Link>
                          <Link
                            to="/instructor/courses"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>Manage My Courses</span>
                          </Link>
                        </>
                      )}

                      {currentRole === 'admin' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                            <span>Platform Admin Portal</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Role Switching Section for instant evaluation */}
                    <div className="border-t border-slate-100 py-1 px-4">
                      <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                        Switch Workspace Mode
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            switchRole('student');
                            setUserMenuOpen(false);
                            navigate('/student/my-learning');
                          }}
                          className={`px-2 py-1 text-[11px] rounded transition-colors ${
                            currentRole === 'student'
                              ? 'bg-emerald-800 text-white font-medium'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            switchRole('instructor');
                            setUserMenuOpen(false);
                            navigate('/instructor/dashboard');
                          }}
                          className={`px-2 py-1 text-[11px] rounded transition-colors ${
                            currentRole === 'instructor'
                              ? 'bg-emerald-800 text-white font-medium'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Instructor
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            switchRole('admin');
                            setUserMenuOpen(false);
                            navigate('/admin/dashboard');
                          }}
                          className={`px-2 py-1 text-[11px] rounded transition-colors ${
                            currentRole === 'admin'
                              ? 'bg-emerald-800 text-white font-medium'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown Bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-slate-50 px-4 py-2.5 animate-in slide-in-from-top-1 duration-150">
            <form
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setMobileSearchOpen(false);
              }}
              className="relative flex items-center"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses (e.g. AI, Data Science)..."
                className="w-full bg-white text-slate-900 border border-slate-300 rounded pl-9 pr-16 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 bg-emerald-800 text-white text-[11px] font-semibold rounded"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Flyout Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile In-drawer Search (if search wasn't opened in bar) */}
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setMobileMenuOpen(false);
                }}
                className="relative flex items-center sm:hidden"
              >
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded pl-9 pr-3 py-2 text-xs"
                />
              </form>

              {/* Navigation Links */}
              <nav className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded hover:bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded hover:bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  <span>About Us</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  to="/courses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded hover:bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  <span>Courses</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* Policy Expandable Section */}
                <div>
                  <button
                    type="button"
                    onClick={() => setMobilePolicyOpen(prev => !prev)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded hover:bg-slate-50 text-xs font-semibold text-slate-800"
                  >
                    <span>Policy</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobilePolicyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobilePolicyOpen && (
                    <div className="pl-6 pr-3 py-1 space-y-1 bg-slate-50 rounded mt-1 text-xs">
                      <Link
                        to="/privacy"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-slate-700 hover:text-emerald-900"
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        to="/terms"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-slate-700 hover:text-emerald-900 border-t border-slate-100"
                      >
                        Terms &amp; Conditions
                      </Link>
                      <Link
                        to="/refund-policy"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-slate-700 hover:text-emerald-900 border-t border-slate-100"
                      >
                        Refunds Policy
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded hover:bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  <span>Contact Us</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </nav>

              {/* Categories Section */}
              <div className="border-t border-slate-100 pt-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                  Top Categories
                </div>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  {categories.slice(0, 8).map(c => (
                    <Link
                      key={c.id}
                      to={`/category/${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 rounded text-xs text-slate-700 truncate"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Management & Role Switcher */}
              <div className="border-t border-slate-100 pt-4 pb-2">
                {isAuthenticated && currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded object-cover border border-slate-200"
                      />
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-3">
                      <Link
                        to={currentRole === 'admin' ? '/admin/dashboard' : currentRole === 'instructor' ? '/instructor/dashboard' : '/student/my-learning'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 text-center text-xs font-semibold bg-emerald-800 text-white rounded"
                      >
                        My Portal
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="py-2 text-center text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded"
                      >
                        Sign Out
                      </button>
                    </div>

                    <div className="px-3 pt-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Switch Workspace Mode
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {(['student', 'instructor', 'admin'] as const).map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              switchRole(role);
                              setMobileMenuOpen(false);
                              if (role === 'student') navigate('/student/my-learning');
                              else if (role === 'instructor') navigate('/instructor/dashboard');
                              else if (role === 'admin') navigate('/admin/dashboard');
                            }}
                            className={`py-1 text-[11px] rounded font-medium capitalize border transition-colors ${
                              currentRole === role
                                ? 'bg-emerald-800 text-white border-emerald-800'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-3">
                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full justify-center">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

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
                <li><Link to="/courses" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refunds</Link></li>
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
            <div className="flex items-center gap-4">
              <Link to="/brand" className="hover:text-slate-400 transition-colors">Brand Guide</Link>
              <span aria-hidden="true">·</span>
              <Link to="/teach" className="hover:text-slate-400 transition-colors">Teach on PrajnadharaEdu</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
