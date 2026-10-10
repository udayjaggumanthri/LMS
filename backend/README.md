# ⚙️ PrajnadharaEdu — Backend Architecture & API Specification

> **Django 5 + Django REST Framework enterprise backend powering PrajnadharaEdu.** Features clean domain-driven architecture, SimpleJWT authentication, Toucan Payments gateway orchestration, automated course provisioning, dynamic admin governance, and dual database support (PostgreSQL / SQLite).

---

## 🏗️ Architecture & Django Apps Overview

The backend is organized into 10 decoupled, domain-specific applications under `apps/`:

```
backend/apps/
├── users/             # Custom User model, JWT authentication, roles & profiles
├── courses/           # Courses, Categories, Sections, Lessons, Quizzes, Attachments
├── learning/          # Student Enrollments, Lecture Progress, Certificates
├── orders/            # Orders, OrderItems, Coupons, ToucanPay Gateway Integration
├── cart/              # Persistent shopping cart management & enrollment validation
├── admin_governance/  # Runtime Payment Gateway & SMTP Mail configuration
├── interactions/      # Student course reviews, ratings, and lecture Q&A
├── cms/               # Static pages, visual banners, and Media Library assets
├── payments/          # Payment gateway factory abstractions & providers
└── core/              # Abstract TimeStampedModel, HTML email service, utilities
```

---

## 📊 Complete Database Models & Schema

### 1. `apps.users`
* **`User` (extends `AbstractUser`)**:
  * `email` (EmailField, unique=True, indexed)
  * `role` (CharField: `'student'` | `'instructor'` | `'admin'`)
  * `avatar` (CharField / URL)
  * `bio` (TextField, optional)
  * `headline` (CharField: e.g. "Lead Cloud Solutions Architect")
  * `website`, `github`, `linkedin`, `twitter` (URL fields)
  * `is_email_verified` (BooleanField, default=False)
* **`InstructorApplication`**:
  * `user` (ForeignKey -> User)
  * `headline`, `bio`, `expertise`, `experience_years`
  * `sample_video_url`, `status` (`'pending'` | `'approved'` | `'rejected'`)
  * `reviewed_by` (ForeignKey -> User), `reviewed_at`

---

### 2. `apps.courses`
* **`Category`**:
  * `name`, `slug` (unique), `description`, `icon`, `semester`
* **`Course`**:
  * `title`, `slug` (unique), `subtitle`, `description`
  * `instructor` (ForeignKey -> User)
  * `category` (ForeignKey -> Category)
  * `price` (DecimalField, max_digits=10, decimal_places=2)
  * `discount_price` (DecimalField, optional)
  * `level` (`'beginner'` | `'intermediate'` | `'advanced'`)
  * `status` (`'draft'` | `'review_pending'` | `'published'` | `'archived'`)
  * `thumbnail`, `trailer_video_url`
  * `student_count` (PositiveIntegerField, synchronized with enrollments)
  * `rating_average`, `rating_count`, `duration_weeks`
* **`Section`**:
  * `course` (ForeignKey -> Course, related_name='sections')
  * `title`, `order` (PositiveIntegerField)
* **`Lesson`**:
  * `section` (ForeignKey -> Section, related_name='lessons')
  * `title`, `order`, `video_url`, `duration_seconds`
  * `content` (Rich text/Markdown lesson notes)
  * `is_preview` (BooleanField: allows free trial before enrollment)
* **`Quiz`**:
  * `section` (OneToOneField -> Section)
  * `title`, `passing_score` (IntegerField, e.g. 70%)
* **`Question` & `Choice`**:
  * Questions belonging to a Quiz, with multiple Choice options and `is_correct` markers.
* **`Attachment`**:
  * Resource files and downloadable code repositories attached to a Lesson.

---

### 3. `apps.learning`
* **`Enrollment`**:
  * `user` (ForeignKey -> User)
  * `course` (ForeignKey -> Course)
  * `enrolled_at` (DateTimeField)
  * `is_active` (BooleanField, default=True)
  * *Unique constraint on `(user, course)` prevents duplicate registrations.*
* **`LessonProgress`**:
  * `enrollment` (ForeignKey -> Enrollment)
  * `lesson` (ForeignKey -> Lesson)
  * `is_completed` (BooleanField)
  * `last_watched_second` (PositiveIntegerField)
  * `completed_at` (DateTimeField)
* **`QuizAttempt`**:
  * Records score, student answers, passing status, and attempt timestamp.
* **`Certificate`**:
  * `certificate_number` (unique, e.g. `CERT-2026-XXXXX`)
  * `enrollment` (OneToOneField -> Enrollment)
  * `issued_at`, `pdf_url`

---

### 4. `apps.orders`
* **`Order`**:
  * `order_number` (unique, e.g. `ORD-2026-XXXXXX`)
  * `user` (ForeignKey -> User)
  * `subtotal`, `discount`, `total` (DecimalField)
  * `coupon_code` (CharField, optional)
  * `status` (`'pending'` | `'completed'` | `'failed'` | `'refunded'`)
  * `payment_method` (CharField: e.g. `'ToucanPay Official Gateway'`)
  * `payment_id` (CharField: tracks gateway transaction/invoice reference)
  * `invoice_number` (unique tax receipt reference)
* **`OrderItem`**:
  * `order` (ForeignKey -> Order, related_name='items')
  * `course` (ForeignKey -> Course)
  * `price_at_purchase` (DecimalField)
  * `course_title`, `thumbnail`, `instructor_name`
* **`Coupon`**:
  * `code` (unique, uppercase)
  * `discount_percent` (1-100)
  * `max_uses`, `used_count`, `active`, `expires_at`
* **`PaymentTransaction`**:
  * `order` (ForeignKey -> Order)
  * `invoice_number` (unique 25-29 digit ToucanPay reference)
  * `terminal_id` (Configured Merchant Terminal ID)
  * `amount`, `currency` (`'INR'`)
  * `status` (`'initiated'` | `'pending'` | `'success'` | `'failed'`)
  * `approval_code`, `rrn`, `payer_vpa`, `action_code`
  * `raw_response` (JSONField: audit log of all gateway payloads)

---

### 5. `apps.admin_governance`
* **`PaymentGatewaySettings` (Singleton Key: `'toucanpay'`)**:
  * `mid` (Configured Merchant Identifier)
  * `tid` (Configured Terminal Identifier)
  * `login_id` (Merchant Portal Login)
  * `password` (Encrypted at rest using AES-128 Fernet)
  * `mac_token` (Encrypted at rest using AES-128 Fernet; masked in API representations)
  * `environment` (`'uat'` | `'production'`)
  * `api_endpoint_uat`, `api_endpoint_prod`
  * `status_check_endpoint_uat`, `status_check_endpoint_prod`
  * `success_url`, `failure_url`, `callback_url`, `whitelisted_ip`
* **`SMTPSettings`**:
  * Host, port, username, encrypted password, and sender configuration for transactional emails.

---

## 🌐 REST API Endpoints Reference

All endpoints are versioned under `/api/` or `/api/v1/`:

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/v1/auth/token/` | Obtain JWT access + refresh pair | No |
| **POST** | `/api/v1/auth/token/refresh/` | Refresh expired access token | No |
| **POST** | `/api/v1/auth/register/` | Register new student or instructor | No |
| **GET** | `/api/v1/auth/me/` | Retrieve authenticated user profile | Bearer JWT |
| **PUT** | `/api/v1/auth/profile/` | Update bio, headline, and avatar | Bearer JWT |
| **GET** | `/api/v1/courses/` | List all published courses with filters | No |
| **GET** | `/api/v1/courses/{slug}/` | Retrieve course details & syllabus | No |
| **POST** | `/api/v1/courses/` | Create course (draft state) | Instructor / Admin |
| **PUT** | `/api/v1/courses/{id}/` | Update course syllabus, pricing | Instructor / Admin |
| **GET** | `/api/v1/cart/` | Retrieve authenticated user's cart | Bearer JWT |
| **POST** | `/api/v1/cart/` | Add course to cart (enforces enrollment check) | Bearer JWT |
| **DELETE** | `/api/v1/cart/{course_id}/` | Remove course from cart | Bearer JWT |
| **POST** | `/api/v1/orders/checkout/` | Direct order placement | Bearer JWT |
| **GET** | `/api/v1/orders/my-orders/` | List user purchase history | Bearer JWT |
| **POST** | `/api/payments/toucan/initiate/` | Initiate live ToucanPay checkout session | Bearer JWT |
| **POST** | `/api/payments/toucan/verify/` | Verify transaction status with ToucanPay | Bearer JWT |
| **POST** | `/api/payments/toucan/callback/` | Asynchronous ToucanPay webhook handler | AllowAny (Signed) |
| **GET** | `/api/v1/learning/my-courses/` | List student enrolled courses & progress | Bearer JWT |
| **POST** | `/api/v1/learning/progress/` | Update lecture playback timestamp | Bearer JWT |
| **GET** | `/api/admin/gateway-settings/` | Get current ToucanPay configuration | Admin Only |
| **PUT** | `/api/admin/gateway-settings/` | Save modified gateway coordinates | Admin Only |

---

## 🔒 ToucanPay Gateway Service Specification

Implemented in [`apps/orders/toucanpay_service.py`](file:///e:/LMS/backend/apps/orders/toucanpay_service.py):

1. **`generate_invoice_number(tid)`**:
   Format: `tid + ddMMyyyyHHmmss + microsecond[:3] + random 4 digits` (29 digits total).
   Guarantees zero collision across retries or rapid transactions.
2. **`compute_hash_amount(amount)`**:
   Computes SHA-512 hex digest of the normalized amount string in compliance with ToucanPay API specifications.
3. **`initiate_payment(order, name, phone, email)`**:
   Packages payload, sends `application/x-www-form-urlencoded` POST to ToucanPay's `getpaymentsession`, captures the authentic `Location` redirect URL using `NoRedirectHandler`, and persists transaction record.
4. **`check_payment_status(invoice_number)`**:
   Executes POST request against `/api/pay/v1/checkStatus` with Bearer token authentication and verifies `actionCode == '00'`.
5. **`mark_transaction_successful(transaction, gateway_metadata)`**:
   Marks transaction as successful, completes Order, activates active `Enrollment` for all purchased courses, increments student count, and dispatches automated HTML tax receipt email.
6. **`process_callback(payload)`**:
   Handles incoming server-to-server webhook notifications from ToucanPay.

---

## 🧪 Testing & Verification

Run the test suite:
```bash
# Test all core and commerce apps
python manage.py test apps.orders apps.courses apps.learning apps.core --no-input

# Run Django system sanity check
python manage.py check
```

---

## 🚢 Production Deployment (Systemd + Gunicorn)

### 1. Create Systemd Service (`/etc/systemd/system/prajnadhara-backend.service`):
```ini
[Unit]
Description=PrajnadharaEdu Django Gunicorn Daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/lms/backend
ExecStart=/var/www/lms/backend/venv/bin/gunicorn \
          --workers 4 \
          --bind 127.0.0.1:8000 \
          --timeout 60 \
          config.wsgi:application

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 2. Start & Enable Service:
```bash
sudo systemctl daemon-reload
sudo systemctl start prajnadhara-backend
sudo systemctl enable prajnadhara-backend
sudo systemctl status prajnadhara-backend
```
