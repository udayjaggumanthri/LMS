# 🎓 Prajnadhara EDU — Enterprise Full-Stack Learning Management System

> **A modern, scalable, role-governed enterprise Learning Management System & Course Marketplace** built for high-performance online education, live curriculum delivery, and seamless payment processing.

[![Python Version](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![Django Version](https://img.shields.io/badge/Django-5.x-green.svg)](https://www.djangoproject.com/)
[![React Version](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Payment Gateway](https://img.shields.io/badge/ToucanPay-Official%20Gateway-emerald.svg)](https://toucanus.com)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

## 🏛️ High-Level System Architecture

Prajnadhara EDU operates as a decoupled, monolithic backend with a high-speed Single Page Application (SPA) frontend:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Client Browser (React 18 SPA)                     │
│  - Public Marketplace   - Student Workspace   - Instructor Studio      │
│  - Admin Governance     - Course Video Player - Interactive Quiz Engine│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON + JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Nginx Reverse Proxy & Static File Server               │
│  - SSL Termination      - Security Headers    - Static Media Routing   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ Reverse Proxy                  │ Static /dist
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  Django REST Framework API Cluster   │  │   Vite Production Bundle     │
│  - SimpleJWT Auth & Role Guard       │  │   HTML5 History Routing      │
│  - Course & Curriculum Engine        │  │   Lucide Icons, Tailwind v4  │
│  - Learning & Certificate Generation │  └──────────────────────────────┘
│  - Order Lifecycle & Tax Invoices    │
│  - ToucanPay Gateway Integration     │
└───────────────────┬──────────────────┘
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
┌───────────────┐        ┌──────────────────────────────────┐
│ PostgreSQL /  │        │   External Payment Gateways      │
│ SQLite Engine │        │   - Toucan Payments UAT / Prod   │
│               │        │   - ICICI / Lyra Acquiring Rails │
└───────────────┘        └──────────────────────────────────┘
```

---

## 📁 Repository Structure

```
LMS/
├── .gitignore                     # Monorepo root gitignore
├── README.md                      # Comprehensive Project Documentation (You are here)
│
├── backend/                       # Django 5 REST Framework Backend
│   ├── .env.example               # Backend environment template
│   ├── manage.py                  # Django CLI entrypoint
│   ├── requirements.txt           # Python dependencies
│   ├── config/                    # Django core project configuration
│   │   ├── asgi.py
│   │   ├── settings.py            # Automated PostgreSQL / SQLite fallback
│   │   ├── urls.py                # Global API routing table
│   │   └── wsgi.py
│   ├── apps/                      # Modular domain-driven Django apps
│   │   ├── users/                 # Custom User model, JWT auth, permissions
│   │   ├── courses/               # Courses, Categories, Lessons, Quizzes
│   │   ├── learning/              # Enrollments, Progress tracking, Certificates
│   │   ├── orders/                # Orders, Invoices, Coupons, ToucanPay Gateway
│   │   ├── cart/                  # Persistent learner shopping cart
│   │   ├── admin_governance/      # Dynamic payment gateway & SMTP settings
│   │   ├── cms/                   # Pages, Media Library, visual page banners
│   │   ├── interactions/          # Course reviews, ratings, student Q&A
│   │   └── core/                  # EmailService, TimeStampedModel base
│   └── README.md                  # Dedicated Backend Documentation & API Reference
│
└── frontend/                      # React 18 + TypeScript + Vite Frontend
    ├── .env.example               # Frontend environment template
    ├── index.html                 # App shell with Google Fonts & metadata
    ├── package.json               # Node dependencies & npm scripts
    ├── tsconfig.json              # TypeScript compilation rules
    ├── vite.config.ts             # Vite build & proxy configuration
    ├── src/
    │   ├── api/                   # Axios API clients & JWT interceptors
    │   ├── components/            # Reusable UI components & Layouts
    │   │   ├── common/            # Logo, ScrollToTop
    │   │   ├── layout/            # PublicLayout, AppLayout (authenticated)
    │   │   └── ui/                # Button, Modal, Table, Badge, Card, etc.
    │   ├── context/               # React Context state management
    │   │   ├── AuthContext.tsx    # JWT login, signup, session recovery
    │   │   ├── CourseContext.tsx  # Dynamic course catalog & categories
    │   │   ├── CartContext.tsx    # Shopping cart & coupon discounts
    │   │   ├── LearningContext.tsx# Active enrollments, player progress
    │   │   ├── AdminContext.tsx   # Platform analytics & admin actions
    │   │   └── NotificationContext.tsx # Toast alerts & notification tray
    │   ├── pages/
    │   │   ├── public/            # Home, Catalog, CourseDetail, Cart, Checkout
    │   │   ├── student/           # MyLearning, CoursePlayer, Orders, Account
    │   │   ├── instructor/        # Dashboard, CourseStudio, Students, Payouts
    │   │   └── admin/             # Overview, GatewaySettings, Users, SMTP
    │   ├── types/                 # Shared TypeScript interfaces & types
    │   └── index.css              # Custom Tailwind tokens & animations
    └── README.md                  # Dedicated Frontend Architecture Guide
```

---

## ⚡ Quick Start Guide (Local Development)

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 20+ LTS recommended)
- **Git**
- **PostgreSQL** (optional; SQLite is automatically used if PostgreSQL is not active)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/udayjaggumanthri/LMS.git
cd LMS
```

---

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
python manage.py migrate

# (Optional) Create superuser
python manage.py createsuperuser

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be running at `http://localhost:8000/api/v1/`.

---

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite development server
npm run dev
```
Frontend will be available at `http://localhost:3000/`.

---

## 🔐 Role-Based Access Control (RBAC)

The platform enforces strict role separation across routes, navigation items, and API endpoints:

| Role | Workspace Route | Capabilities |
|---|---|---|
| **Student** | `/student/my-learning` | Browse catalog, purchase courses, watch lectures, take quizzes, download certificates, review purchase history and official tax receipts. |
| **Instructor** | `/instructor/dashboard` | Build and edit curriculum modules, upload video lectures, manage student rosters, answer Q&A questions, review student ratings, request payouts. |
| **Administrator** | `/admin/dashboard` | Platform overview, approve instructor applications, review & publish submitted courses, manage users, configure ToucanPay credentials, adjust SMTP mail server, issue refunds. |

---

## 💳 Toucan Payments Gateway Architecture

Prajnadhara EDU features a dynamic, enterprise-grade integration with the **Toucan Payments (ToucanPay)** gateway cluster:

- **Dynamic Configuration & Field Encryption:** All gateway credentials (MID, TID, MAC Token, Portal Passwords) are managed dynamically through the Admin Console (`/admin/payment-gateway`) and encrypted at rest in the database using AES-128 (Fernet) authenticated encryption.
- **Enterprise Secret Masking:** API endpoints automatically mask sensitive tokens (`••••••••`) to prevent credential leakage.
- **Authentication:** RSA-256 JWT MAC Token signature dynamically injected from encrypted database settings.
- **Security Checksum:** SHA-512 Hex Hash of transaction amount (`ha`) conforming to ToucanPay specifications.
- **Collision-Free Invoices:** Unique timestamp + microsecond + randomized nonce guarantees that duplicate order attempts never collide on ToucanPay servers.
- **Duplicate Purchase Guard:** Backend prevents checkout if the learner already holds an active enrollment for any course in the cart.
- **Graceful Redirection & Reconciliation:** Automatically handles hosted checkout redirects, verifies transaction status with ToucanPay's `checkStatus` API, provisions student enrollments, and generates GST-compliant tax invoices.

---

## 🚀 Production Deployment Guide

### Recommended Stack
- **OS:** Ubuntu 22.04 LTS / 24.04 LTS
- **Web Server:** Nginx (Reverse Proxy + Static File Serving + SSL)
- **WSGI Server:** Gunicorn with `uvicorn.workers.UvicornWorker` or Gunicorn sync workers
- **Process Manager:** `systemd`
- **Database:** PostgreSQL 15+ / 16+
- **SSL Certificate:** Let's Encrypt (Certbot)

### Production Build:
```bash
# Frontend
cd frontend
npm run build
# Output bundle is generated in frontend/dist/
```

### Sample Nginx Configuration (`/etc/nginx/sites-available/prajnadharaedu.com`):
```nginx
server {
    listen 80;
    server_name prajnadharaedu.com www.prajnadharaedu.com api.prajnadharaedu.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name prajnadharaedu.com www.prajnadharaedu.com;

    ssl_certificate /etc/letsencrypt/live/prajnadharaedu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/prajnadharaedu.com/privkey.pem;

    root /var/www/lms/frontend/dist;
    index index.html;

    # Frontend Single Page App routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Assets Cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 443 ssl http2;
    server_name api.prajnadharaedu.com;

    ssl_certificate /etc/letsencrypt/live/prajnadharaedu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/prajnadharaedu.com/privkey.pem;

    # Django Static & Media
    location /static/ {
        alias /var/www/lms/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/lms/backend/media/;
    }

    # Django API Reverse Proxy
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📄 License & Attribution

Copyright © 2026 **Prajnadhara Infotech Private Limited**. All Rights Reserved.  
Proprietary software developed for Prajnadhara EDU educational platforms.
