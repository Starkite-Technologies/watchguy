# ATELIER TIMEPIECES — Premium Luxury Watch Marketplace

> An Apple-inspired cinematic shopping experience for high-horology collectors in Windhoek, Namibia. Combining Swiss luxury boutique elegance, editorial typography, full-stack database persistence, authenticated administration, and a multi-step third-party consignment approval workflow.

---

## 1. Project Overview & Architecture

- **Storefront Concept:** Apple × Swiss Luxury Watchmaking × Modern Editorial Design
- **Centralized Brand Identity:** `src/config/brand.ts` (`ATELIER TIMEPIECES`, Windhoek, Namibia, N$ / NAD currency).
- **Core Technology Stack:**
  - **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
  - **Styling & Motion:** Tailwind CSS v4, bespoke luxury CSS, GSAP ScrollTrigger, 120-frame WebP chronograph rotation sequence
  - **Database & ORM:** Prisma ORM 7.10.1 with SQLite for zero-config local development and native PostgreSQL schema for production
  - **Authentication:** Web Crypto PBKDF2 password hashing with salt, HMAC-SHA256 signed HTTP-only cookies, role-based authorization (`OWNER`, `EDITOR`, `REVIEWER`)
  - **Consignment Workflow:** Registration-free 4-step seller submission system with photo upload, size & magic bytes validation, rate limiting, and an admin approval/rejection pipeline.

---

## 2. Directory Structure

```
v2/
├── prisma/
│   ├── schema.prisma             # Active schema (SQLite local dev / tests)
│   ├── schema.postgresql.prisma  # Production PostgreSQL schema (Supabase / AWS RDS / Neon)
│   └── seed.ts                   # Database seeder (Admin, initial inventory, test submission)
├── public/
│   ├── sequence/                 # 120 WebP rotation frames for cinematic hero
│   ├── watches/                  # High-resolution luxury watch photography
│   └── uploads/                  # Secure local upload destination for submissions & watches
├── src/
│   ├── app/
│   │   ├── admin/                # Private Admin Studio & Login
│   │   ├── api/                  # REST API routes (Auth, Submissions, Enquiries, Admin CRUD)
│   │   ├── collection/           # Live watch catalogue with multi-facet filters
│   │   ├── watches/[slug]/       # Individual watch detail page with gallery & WhatsApp enquiry
│   │   ├── sell/                 # Multi-step third-party consignment submission
│   │   ├── about/                # Boutique heritage & Swiss watchmaking perspective
│   │   ├── contact/              # Windhoek boutique location & concierge
│   │   ├── privacy/              # Privacy & seller confidentiality terms
│   │   ├── terms/                # Terms of consignment & acquisition
│   │   ├── globals.css           # Luxury design system & color variables
│   │   ├── layout.tsx            # Global metadata & typography
│   │   └── page.tsx              # Cinematic 6-section homepage
│   ├── components/
│   │   ├── admin-dashboard.tsx   # Operational light-mode admin studio
│   │   ├── cinematic-hero.tsx    # 120-frame interactive scroll canvas
│   │   ├── collection-view.tsx   # Client-side filtering, sorting & search
│   │   ├── sell-multi-step-form.tsx # 4-step seller form with image previews
│   │   ├── site-chrome.tsx       # Header, Footer, Section badges
│   │   └── watch-card.tsx        # Luxury product card with NAD pricing
│   ├── config/
│   │   └── brand.ts              # Centralized client branding, contact, and currency helpers
│   └── lib/
│       ├── auth.ts               # Admin session management & RBAC
│       ├── crypto.ts             # PBKDF2 hashing & HMAC signing
│       ├── db.ts                 # Prisma Client singleton & driver adapter
│       ├── services.ts           # Uploads, rate limiting, and transactional email
│       └── validation.ts         # Zod schemas & file signature validation
└── tests/
    ├── marketplace.test.ts       # Unit tests (currency, schemas, crypto, file magic bytes)
    └── e2e-verification.ts       # End-to-end integration test of critical workflows
```

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js 22+ or 24 LTS
- npm (on Windows PowerShell, use `npm.cmd` or `npx.cmd`)

### Installation & Launch

```powershell
# 1. Navigate to the project directory
cd C:\Users\habisai\Documents\projects\watch\v2

# 2. Push database schema and seed default data
npx.cmd prisma db push
npx.cmd tsx prisma/seed.ts

# 3. Start development server
npm.cmd run dev
```

Visit the live site at **[http://localhost:3000](http://localhost:3000)**.

---

## 4. Default Administrator Credentials

To access the private Admin Studio:
- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email:** `admin@ateliertimepieces.com`
- **Password:** `AtelierAdmin2026!`
- **Role:** `OWNER` (Full inventory editing, consignment approval, pricing controls, audit logs)

*(Note: There is intentionally no public link to `/admin` on the customer storefront; administrators navigate directly or via the discreet Staff Portal link in the footer).*

---

## 5. Critical Workflows Implemented

### 1. Cinematic Storefront
- **Apple-Inspired Scroll Hero:** Smooth scroll-driven 120-frame WebP rotation on a sticky canvas, respecting `prefers-reduced-motion`.
- **Live Catalog:** Real-time data from database with search, brand pills, condition selector, price slider, and sorting.
- **WhatsApp Concierge:** Pre-formatted acquisition inquiries with watch title, reference, and Namibian Dollar (N$) pricing.
- **In-Page Inquiries:** Direct modal inquiry saving to the database with admin email dispatch.

### 2. Multi-Step Seller Consignment Workflow (`/sell`)
- **Step 1: Seller Contact:** Name, email, phone, preferred channel (WhatsApp, Email, Phone call).
- **Step 2: Watch Information:** Brand, model, reference number, year, condition grade, asking price in NAD, description, box & papers flags.
- **Step 3: Photographs:** Multi-image upload with client-side preview, magic-byte inspection (JPEG, PNG, WebP), and 8 MB per-file limits.
- **Step 4: Legal Consent:** Seller confirms lawful ownership and agrees to boutique consignment terms.
- **Guaranteed Privacy:** Third-party watches are saved as `PENDING_REVIEW` and are **never** published automatically.

### 3. Operational Admin Studio (`/admin`)
- **Overview:** Live inventory count, pending consignment review count, sold metrics, customer inquiries, and total inventory valuation in NAD.
- **Inventory Management:** Full CRUD to add watches, upload photos, edit descriptions, adjust prices, toggle homepage featured status, or mark as Reserved/Sold.
- **Review Queue:** Review seller contact details and uploaded photos. Actions:
  - **Approve:** Adjust/confirm public selling price, select photos, and publish to the live catalogue with one click. Automatically emails the seller.
  - **Reject:** Record rejection reason, update status to `REJECTED`, notify seller via email.
  - **Request More Info:** Record note and notify seller while keeping listing private.
- **Customer Enquiries:** Track inquiry status (`NEW`, `CONTACTED`, `CLOSED`).
- **Audit Activity Log:** Complete historic trail of all administrative actions.

---

## 6. Automated Testing

Run the automated test suites:

```powershell
# Unit & validation tests
npm.cmd test

# Type checking
npm.cmd run typecheck

# Full production build test
npm.cmd run build

# End-to-end integration test (while server is running)
npx.cmd tsx tests/e2e-verification.ts
```

---

## 7. PostgreSQL Production Deployment Guide

For cloud deployments (AWS, Supabase, Neon, Railway, Vercel):

1. **Set `DATABASE_URL` in `.env.production`:**
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
   ```
2. **Apply the PostgreSQL schema:**
   ```powershell
   npx.cmd prisma db push --schema=prisma/schema.postgresql.prisma
   ```
3. **Configure Environment Secrets:**
   - `ADMIN_SESSION_SECRET`: A 64-character random string for HMAC session cookies.
   - `RATE_LIMIT_SECRET`: A random string for client rate-limiting hashes.
   - `RESEND_API_KEY`: API key from [Resend](https://resend.com) for transactional emails.
   - `ADMIN_EMAIL`: Email address to receive notifications of new submissions and inquiries.
   - `APP_ORIGIN`: Your production domain (e.g. `https://ateliertimepieces.com`).
