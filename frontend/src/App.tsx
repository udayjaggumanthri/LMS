import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LearningProvider } from './context/LearningContext';
import { AdminProvider } from './context/AdminContext';
import { NotificationProvider } from './context/NotificationContext';
import { BrandingProvider } from './context/BrandingContext';

// Layouts & Utility
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CoursesCatalogPage } from './pages/public/CoursesCatalogPage';
import { CategoryPage } from './pages/public/CategoryPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { InstructorProfilePage } from './pages/public/InstructorProfilePage';
import { TeachLandingPage } from './pages/public/TeachLandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { CartPage } from './pages/public/CartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { OrderConfirmationPage } from './pages/public/OrderConfirmationPage';
import { WishlistPage } from './pages/public/WishlistPage';
import { SignInPage } from './pages/public/SignInPage';
import { SignUpPage } from './pages/public/SignUpPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { BrandGuidePage } from './pages/public/BrandGuidePage';
import { TermsPage } from './pages/public/TermsPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { RefundPolicyPage } from './pages/public/RefundPolicyPage';
import { InstructorTermsPage } from './pages/public/InstructorTermsPage';
import { BlogListPage } from './pages/public/BlogListPage';
import { BlogDetailPage } from './pages/public/BlogDetailPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Student Pages
import { MyLearningPage } from './pages/student/MyLearningPage';
import { CoursePlayerPage } from './pages/student/CoursePlayerPage';
import { QuizPlayerPage } from './pages/student/QuizPlayerPage';
import { CertificatesPage } from './pages/student/CertificatesPage';
import { PurchaseHistoryPage } from './pages/student/PurchaseHistoryPage';
import { StudentAccountPage } from './pages/student/StudentAccountPage';

// Instructor Pages
import { InstructorDashboardPage } from './pages/instructor/InstructorDashboardPage';
import { InstructorCoursesPage } from './pages/instructor/InstructorCoursesPage';
import { CreateCoursePage } from './pages/instructor/CreateCoursePage';
import { InstructorQAInboxPage } from './pages/instructor/InstructorQAInboxPage';
import { InstructorReviewsPage } from './pages/instructor/InstructorReviewsPage';
import { InstructorStudentsPage } from './pages/instructor/InstructorStudentsPage';
import { InstructorAnalyticsPage } from './pages/instructor/InstructorAnalyticsPage';
import { InstructorPayoutsPage } from './pages/instructor/InstructorPayoutsPage';
import { InstructorProfileEditorPage } from './pages/instructor/InstructorProfileEditorPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminInstructorApplicationsPage } from './pages/admin/AdminInstructorApplicationsPage';
import { AdminCourseReviewQueuePage } from './pages/admin/AdminCourseReviewQueuePage';
import { AdminCourseManagementPage } from './pages/admin/AdminCourseManagementPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersRefundsPage } from './pages/admin/AdminOrdersRefundsPage';
import { AdminPayoutsPage } from './pages/admin/AdminPayoutsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminVisualPageEditorPage } from './pages/admin/AdminVisualPageEditorPage';
import { AdminBlogManagementPage } from './pages/admin/AdminBlogManagementPage';
import { AdminMediaLibraryPage } from './pages/admin/AdminMediaLibraryPage';
import { AdminSMTPSettingsPage } from './pages/admin/AdminSMTPSettingsPage';
import { AdminPaymentGatewayPage } from './pages/admin/AdminPaymentGatewayPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CourseProvider>
          <CartProvider>
            <WishlistProvider>
              <LearningProvider>
                <AdminProvider>
                  <NotificationProvider>
                    <BrandingProvider>
                      <Routes>
                      {/* Public Marketplace Route Tree */}
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses" element={<CoursesCatalogPage />} />
                        <Route path="/courses/:slug" element={<CourseDetailPage />} />
                        <Route path="/category/:slug" element={<CategoryPage />} />
                        <Route path="/course/:slug" element={<CourseDetailPage />} />
                        <Route path="/instructor/:id" element={<InstructorProfilePage />} />
                        <Route path="/teach" element={<TeachLandingPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                        <Route path="/dashboard/shoppingcart" element={<OrderConfirmationPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/brand" element={<BrandGuidePage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/refund-policy" element={<RefundPolicyPage />} />
                        <Route path="/instructor-terms" element={<InstructorTermsPage />} />
                        <Route path="/blog" element={<BlogListPage />} />
                        <Route path="/blogs" element={<BlogListPage />} />
                        <Route path="/blog/:slug" element={<BlogDetailPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>

                      {/* Standalone Player Environments */}
                      <Route path="/student/course/:id" element={<CoursePlayerPage />} />
                      <Route path="/student/quiz/:quizId" element={<QuizPlayerPage />} />

                      {/* Role-Gated Authenticated Workspaces */}
                      <Route element={<AppLayout />}>
                        {/* Student Portal */}
                        <Route path="/student/my-learning" element={<MyLearningPage />} />
                        <Route path="/student/learning" element={<MyLearningPage />} />
                        <Route path="/student/certificates" element={<CertificatesPage />} />
                        <Route path="/student/orders" element={<PurchaseHistoryPage />} />
                        <Route path="/student/purchases" element={<PurchaseHistoryPage />} />
                        <Route path="/student/account" element={<StudentAccountPage />} />

                        {/* Instructor Studio */}
                        <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
                        <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
                        <Route path="/instructor/courses/new" element={<CreateCoursePage />} />
                        <Route path="/instructor/courses/:id/edit" element={<CreateCoursePage />} />
                        <Route path="/instructor/qa" element={<InstructorQAInboxPage />} />
                        <Route path="/instructor/reviews" element={<InstructorReviewsPage />} />
                        <Route path="/instructor/students" element={<InstructorStudentsPage />} />
                        <Route path="/instructor/analytics" element={<InstructorAnalyticsPage />} />
                        <Route path="/instructor/payouts" element={<InstructorPayoutsPage />} />
                        <Route path="/instructor/profile" element={<InstructorProfileEditorPage />} />

                        {/* Admin Center */}
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/page-editor" element={<AdminVisualPageEditorPage />} />
                        <Route path="/admin/blogs" element={<AdminBlogManagementPage />} />
                        <Route path="/admin/media-library" element={<AdminMediaLibraryPage />} />
                        <Route path="/admin/smtp" element={<AdminSMTPSettingsPage />} />
                        <Route path="/admin/course-reviews" element={<AdminCourseReviewQueuePage />} />
                        <Route path="/admin/courses" element={<AdminCourseManagementPage />} />
                        <Route path="/admin/courses/new" element={<CreateCoursePage />} />
                        <Route path="/admin/courses/:id/edit" element={<CreateCoursePage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/instructor-applications" element={<AdminInstructorApplicationsPage />} />
                        <Route path="/admin/orders-refunds" element={<AdminOrdersRefundsPage />} />
                        <Route path="/admin/payouts" element={<AdminPayoutsPage />} />
                        <Route path="/admin/coupons" element={<AdminCouponsPage />} />
                        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                        <Route path="/admin/payment-gateway" element={<AdminPaymentGatewayPage />} />
                        <Route path="/admin/reports" element={<AdminReportsPage />} />
                        <Route path="/admin/settings" element={<AdminSettingsPage />} />
                      </Route>
                    </Routes>
                  </BrandingProvider>
                </NotificationProvider>
                </AdminProvider>
              </LearningProvider>
            </WishlistProvider>
          </CartProvider>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
