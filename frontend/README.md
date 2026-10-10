# Prajnadhara LMS - Frontend Architecture & Deployment Guide

> **Production-Grade Single Page Application (SPA)** built with React 19, TypeScript, Vite, Tailwind CSS, and Lucide Icons. Designed for enterprise scalability, high performance, and seamless payment integration.

---

## 1. Overview & Architecture

The frontend is a modern, modular React SPA providing distinct experiences for four user personas:
1. **Public Visitors & Prospective Students:** High-converting course discovery, category exploration, curriculum previews, instructor profiles, and responsive checkout.
2. **Enrolled Students:** Distraction-free course player, interactive quizzes, progress tracking, certificates, and tax invoice downloads.
3. **Instructors:** Full-featured course builder, curriculum organization, lecture video upload, student QA inbox, revenue analytics, and payout requests.
4. **Platform Administrators:** Comprehensive management suite for users, courses, categories, coupons, media assets, platform reports, ToucanPay gateway credentials, and SMTP settings.

### Technology Stack
- **Framework:** React 19 (`react`, `react-dom`)
- **Build Tool:** Vite 6+ (Fast HMR, optimized Rollup bundle)
- **Language:** TypeScript 5+ (Strict type safety)
- **Styling:** Tailwind CSS v4 + Custom Design Tokens
- **Icons:** Lucide React
- **HTTP Client:** Axios (Automated JWT access token injection and refresh retry interceptors)
- **Routing:** React Router v7 (`react-router-dom`)
- **Animations:** Motion (Framer Motion v12)

---

## 2. Directory Structure

```
frontend/
├── dist/                      # Production build output
├── public/                    # Static assets (favicons, manifest)
├── src/
│   ├── api/                   # Domain-driven REST API clients
│   │   ├── client.ts          # Axios instance + JWT interceptors
│   │   ├── authService.ts     # Login, register, profile, refresh
│   │   ├── courseService.ts   # Catalog, course detail, lectures, builder
│   │   ├── cartService.ts     # Cart management & coupon validation
│   │   ├── orderService.ts    # Checkout, ToucanPay init, order history, invoices
│   │   ├── learningService.ts # Enrollment progress, lecture completion, quizzes
│   │   ├── adminService.ts    # Admin CRUD, settings, payouts, user governance
│   │   └── cmsService.ts      # Visual page editor, announcements, FAQs
│   ├── components/            # Reusable UI component library
│   │   ├── common/            # Logo, MediaUploader, ScrollToTop
│   │   ├── courses/           # CourseBuilder, CourseManagementCard
│   │   ├── layout/            # AppLayout (Dashboard), PublicLayout (Navbar/Footer)
│   │   └── ui/                # Button, Modal, Card, Table, Drawer, Toast, Rating, etc.
│   ├── context/               # Global state providers
│   │   ├── AuthContext.tsx    # User session, JWT token state, RBAC role
│   │   ├── CartContext.tsx    # Shopping cart items, total calculation, discounts
│   │   ├── WishlistContext.tsx# Saved courses state
│   │   ├── CourseContext.tsx  # Catalog filters, active categories
│   │   ├── LearningContext.tsx# Student learning progress and active lecture
│   │   ├── AdminContext.tsx   # Admin dashboard metrics and state
│   │   └── NotificationContext.tsx # Toast alerts and system messages
│   ├── pages/                 # Route page components
│   │   ├── public/            # HomePage, Catalog, CourseDetail, Cart, Checkout, Auth
│   │   ├── student/           # MyLearning, CoursePlayer, QuizPlayer, PurchaseHistory, Certificates
│   │   ├── instructor/        # Dashboard, CreateCourse, Analytics, Reviews, Payouts, QA
│   │   └── admin/             # Dashboard, Courses, Users, Gateways, Payouts, SMTP, Settings
│   ├── types/                 # TypeScript interfaces and domain schemas
│   ├── index.css              # Global styles, fonts, and theme variables
│   ├── App.tsx                # Main router tree, route guards, layouts
│   └── main.tsx               # Application bootstrap
├── .env.example               # Template environment configuration
├── package.json               # NPM dependencies and build scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite server and plugin settings
```

---

## 3. Key Pages & Route Map

### Public Routes (`PublicLayout`)
| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage` | Hero section, featured courses, testimonials, stats, categories |
| `/courses` | `CoursesCatalogPage` | Filterable catalog with search, price range, levels, and sorting |
| `/courses/:slug` | `CourseDetailPage` | Syllabus, instructor bio, reviews, preview video, enrollment action |
| `/cart` | `CartPage` | Cart items, coupon application, total breakdown, proceed to checkout |
| `/checkout` | `CheckoutPage` | Order review, ToucanPay payment initialization |
| `/dashboard/shoppingcart` | `OrderConfirmationPage` | ToucanPay return URL; decodes payment response and confirms enrollment |
| `/order-confirmation` | `OrderConfirmationPage` | Order summary with tax invoice generator |
| `/signin`, `/signup` | `SignInPage`, `SignUpPage` | Authentication with email/password and role redirection |
| `/terms`, `/privacy`, `/refund-policy` | Legal Pages | Platform compliance and terms of service |

### Student Portal (`AppLayout`)
| Path | Component | Description |
| :--- | :--- | :--- |
| `/dashboard` | `MyLearningPage` | Enrolled courses, completion percentages, continue learning CTA |
| `/learn/:slug/lecture/:id` | `CoursePlayerPage` | Video player, lecture notes, downloadable resources, mark complete |
| `/learn/:slug/quiz/:id` | `QuizPlayerPage` | Timed assessments, instant grading, explanation review |
| `/dashboard/purchases` | `PurchaseHistoryPage` | All past orders, transaction IDs, status, modal tax invoice PDF view |
| `/dashboard/certificates` | `CertificatesPage` | Verifiable completion certificates with unique verification IDs |
| `/dashboard/account` | `StudentAccountPage` | Profile settings, password reset, notification preferences |

### Instructor Studio (`AppLayout`)
| Path | Component | Description |
| :--- | :--- | :--- |
| `/instructor/dashboard` | `InstructorDashboardPage`| Total students, gross revenue, average rating, recent enrollments |
| `/instructor/courses` | `InstructorCoursesPage` | Course inventory, publish status, draft management |
| `/instructor/courses/new` | `CreateCoursePage` | Multi-step course builder (Metadata -> Sections -> Lectures -> Pricing) |
| `/instructor/analytics` | `InstructorAnalyticsPage`| Revenue charts, student retention rates, drop-off analytics |
| `/instructor/payouts` | `InstructorPayoutsPage` | Earnings balance, bank/UPI account configuration, payout requests |
| `/instructor/qa` | `InstructorQAInboxPage` | Student questions, reply threads, resolved filter |

### Admin Console (`AppLayout`)
| Path | Component | Description |
| :--- | :--- | :--- |
| `/admin/dashboard` | `AdminDashboardPage` | Platform metrics: revenue, user growth, active courses, pending approvals |
| `/admin/courses` | `AdminCourseManagementPage` | Course administration, status overrides, instructor assignments |
| `/admin/review-queue` | `AdminCourseReviewQueuePage`| Curriculum auditing, approve/reject submissions with feedback |
| `/admin/users` | `AdminUsersPage` | User directory, role assignment (`student`, `instructor`, `admin`), ban/activate |
| `/admin/payment-gateway` | `AdminPaymentGatewayPage` | ToucanPay merchant ID, API keys, UAT vs Live mode toggle |
| `/admin/payouts` | `AdminPayoutsPage` | Review instructor withdrawal requests, approve/reject with reference ID |
| `/admin/smtp` | `AdminSMTPSettingsPage` | Host, port, credentials, test email dispatcher |
| `/admin/reports` | `AdminReportsPage` | Financial summaries, enrollment trends, CSV report exports |

---

## 4. Payment Gateway Integration (ToucanPay)

The checkout process uses **ToucanPay** hosted checkout:

1. **Initiation:**
   - User reviews order on `/checkout` and clicks **"Proceed to ToucanPay Secure Payment"**.
   - Frontend calls `POST /api/orders/checkout/` with `payment_method: 'toucanpay'`.
   - Backend creates `Order` (status: `pending`) and generates a cryptographically signed ToucanPay payment form with merchant ID, SHA-256 checksum, and callback parameters.
2. **Redirect to Gateway:**
   - The frontend automatically redirects the browser to the ToucanPay hosted payment page (`https://payuat.toucanpay.com/payment`).
3. **Return & Verification:**
   - On completion, ToucanPay redirects the user back to the configured Return URL (`/dashboard/shoppingcart?data=<base64_encoded_payload>`).
   - `OrderConfirmationPage.tsx` extracts and decodes the payload, verifying status `COMPLETED` and invoice number.
   - The user is immediately granted course access, cart is emptied, and tax invoice is made available for download.

---

## 5. Local Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x+ (or pnpm/yarn)

### Installation
```bash
# Navigate to frontend directory
cd e:\LMS\frontend

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Configure `.env`:
```env
# Point to your local or staging backend API
VITE_API_BASE_URL=http://localhost:8000/api
```

### Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Type Checking & Production Build
```bash
# Validate TypeScript with no emit
npm run lint

# Generate optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Production Deployment

### Building for Production
```bash
npm run build
```
This produces an optimized, minified bundle in `frontend/dist/`.

### Nginx Single Page Application (SPA) Configuration
To serve the SPA via Nginx with HTML5 pushState routing:

```nginx
server {
    listen 80;
    server_name prajnadharaedu.com www.prajnadharaedu.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name prajnadharaedu.com www.prajnadharaedu.com;

    ssl_certificate /etc/letsencrypt/live/prajnadharaedu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/prajnadharaedu.com/privkey.pem;

    root /var/www/prajnadhara/frontend/dist;
    index index.html;

    # Static Assets Caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Requests to Django Gunicorn Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Media Files
    location /media/ {
        alias /var/www/prajnadhara/backend/media/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

---

## 7. State Management & Authentication Flow

- **Session Persistence:** Access and refresh tokens are stored in `localStorage` under `prajnadhara_token` and `prajnadhara_refresh_token`.
- **Automatic Token Refresh:** When any API request returns `401 Unauthorized`, `api/client.ts` triggers a silent call to `/api/auth/token/refresh/`. Upon success, the failed request is re-executed with the new token.
- **Route Protection:** Protected routes check `AuthContext.isAuthenticated` and user `role`. Unauthorized access automatically redirects to `/signin` with return location preserved.
