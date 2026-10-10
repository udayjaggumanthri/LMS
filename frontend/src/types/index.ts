export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  title?: string;
  bio?: string;
  enrolledCourseIds: string[];
  wishlistCourseIds: string[];
  rating?: number;
  reviewsCount?: number;
  studentsCount?: number;
  totalEarnings?: number;
  payoutMethod?: {
    type: 'bank' | 'upi';
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
  joinedAt: string;
  isApprovedInstructor?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  semester?: string;
  subcategories: string[];
  courseCount: number;
  iconName: string;
  order?: number;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Expert' | 'Advanced' | 'Executive' | 'All Levels';
export type CourseStatus = 'draft' | 'in_review' | 'published' | 'changes_requested';
export type CourseBadge = 'Bestseller' | 'New' | 'Highest rated' | 'Featured' | 'Fellowship';

export interface LectureResource {
  id: string;
  name: string;
  size: string;
  url: string;
}

export interface Lecture {
  id: string;
  title: string;
  durationMinutes: number;
  type: 'video' | 'article' | 'quiz' | 'resource';
  previewFree?: boolean;
  videoUrl?: string;
  content?: string;
  quizId?: string;
  resources?: LectureResource[];
}

export interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  passingScorePercent: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  categoryId: string;
  subcategory: string;
  instructorId: string;
  price: number; // in INR
  originalPrice: number; // in INR
  isFree?: boolean;
  rating: number;
  reviewsCount: number;
  studentCount: number;
  durationHours: number;
  durationWeeks?: number;
  lectureCount: number;
  level: CourseLevel;
  language: string;
  lastUpdated: string;
  badges: CourseBadge[];
  thumbnail: string;
  previewVideoUrl?: string;
  whatYouWillLearn: string[];
  requirements: string[];
  targetAudience?: string[];
  description?: string;
  curriculum: Section[];
  status: CourseStatus;
  reviewFeedback?: string;
  featured?: boolean;
  tags?: string[];
  settings?: Record<string, any>;
  instructor?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
  instructorReply?: {
    date: string;
    comment: string;
  };
}

export interface QAAnswer {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  isInstructor?: boolean;
  content: string;
  createdAt: string;
}

export interface QAQuestion {
  id: string;
  courseId: string;
  lectureId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  createdAt: string;
  answers: QAAnswer[];
}

export interface OrderItem {
  courseId: string;
  courseTitle: string;
  thumbnail: string;
  price: number;
  instructorName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  status: 'completed' | 'refunded';
  createdAt: string;
  invoiceNumber: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
}

export interface PayoutRequest {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  courseId?: string; // empty means platform-wide
  instructorId?: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface InstructorApplication {
  id: string;
  userId: string;
  applicantName: string;
  email: string;
  expertise: string;
  experienceBio: string;
  sampleTopic: string;
  linkedinOrPortfolio?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  adminFeedback?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  instructorName: string;
  issueDate: string;
  grade: string;
  totalHours: number;
  verifyUrl: string;
}

export interface UserNote {
  id: string;
  userId: string;
  courseId: string;
  lectureId: string;
  lectureTitle: string;
  timestampSeconds: number;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'course' | 'order' | 'system' | 'payout' | 'qa';
  link?: string;
}

export interface CartItem {
  courseId: string;
}

export interface UserCourseProgress {
  courseId: string;
  completedLectureIds: string[];
  lastAccessedLectureId?: string;
  archived?: boolean;
  completedAt?: string;
}
