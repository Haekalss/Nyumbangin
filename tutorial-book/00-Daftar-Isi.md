# 📚 DAFTAR ISI

## PANDUAN LENGKAP PLATFORM NYUMBANGIN

---

## 📖 BAGIAN PENGANTAR

- [**Cover & Informasi Buku**](00-Cover.md)
- [**Daftar Isi**](00-Daftar-Isi.md) *(Anda di sini)*
- [**Kata Pengantar**](00-Kata-Pengantar.md)
- [**Cara Menggunakan Buku Ini**](00-Cara-Pakai-Buku.md)

---

## 📘 BAB 1: PENGENALAN & SETUP

**File**: [`Bab-01-Pengenalan-Setup.md`](Bab-01-Pengenalan-Setup.md)

- 1.1 Tentang Platform Nyumbangin
  - Masalah yang Diselesaikan
  - Fitur Utama
  - User Roles (Creator, Supporter, Admin)
- 1.2 Prasyarat
  - Node.js & npm
  - MongoDB
  - Pengetahuan Dasar
- 1.3 Clone Repository & Install Dependencies
- 1.4 Setup Environment Variables
  - MongoDB URI
  - JWT Secrets
  - Midtrans Keys
  - SMTP Configuration
- 1.5 Menjalankan Development Server
- 1.6 Verifikasi Koneksi Database
- 1.7 Membuat Admin & Creator Pertama
- 1.8 Testing Donasi (Sandbox Mode)
- 1.9 Troubleshooting Setup
- 1.10 Latihan & Checklist

**Estimasi Waktu**: 1-2 jam

---

## 📗 BAB 2: ARSITEKTUR & STRUKTUR PROYEK

**File**: [`Bab-02-Arsitektur-Struktur.md`](Bab-02-Arsitektur-Struktur.md)

- 2.1 Overview Arsitektur
  - Diagram Alur Request
  - Tech Stack Detail
- 2.2 Struktur Folder Utama
  - `/pages` vs `/src/app`
  - Hybrid Router Strategy
- 2.3 Penjelasan Folder Penting
  - `pages/api/` - API Routes
  - `src/components/` - React Components
  - `src/lib/` - Utilities & Helpers
  - `src/models/` - Mongoose Schemas
  - `dev-tools/` - Developer Scripts
- 2.4 Routing & Navigation
  - Pages Router vs App Router
  - Dynamic Routes
  - API Route Patterns
- 2.5 Aliran Data End-to-End
  - Frontend → API → Database
  - Webhook Flow
  - Email Notification Flow
- 2.6 Konvensi Penamaan & Best Practices
- 2.7 Latihan: Tracing Request Flow

**Estimasi Waktu**: 1-1.5 jam

---

## 📙 BAB 3: MODEL DATA PENTING

**File**: [`Bab-03-Model-Data.md`](Bab-03-Model-Data.md)

- 3.1 Pengantar Database Schema
  - NoSQL vs SQL untuk Use Case Ini
  - Mongoose ODM Basics
- 3.2 Model Creator
  - Schema Fields
  - Validations & Indexes
  - Virtual Properties
- 3.3 Model Donation
  - Status Flow (PENDING → PAID)
  - Relasi dengan Creator
  - Payment Gateway Integration Fields
- 3.4 Model Payout
  - Status Flow (pending → approved → processed)
  - Relasi dengan Donations
  - Marking isPaidOut
- 3.5 Model Admin
  - Permissions & Roles
  - Authentication Fields
- 3.6 Model Notification
  - Jenis Notifikasi
  - Read Status
- 3.7 Relasi Antar Model
  - One-to-Many Relationships
  - References vs Embedded Documents
- 3.8 Queries & Aggregations Umum
  - Menghitung Total Saldo
  - Leaderboard Query
  - Recent Donations
- 3.9 Seeding Data untuk Development
- 3.10 Latihan: Membuat Query Sendiri

**Estimasi Waktu**: 2-3 jam

---

## 📕 BAB 4: AUTENTIKASI & OTORISASI

**File**: [`Bab-04-Autentikasi-Otorisasi.md`](Bab-04-Autentikasi-Otorisasi.md)

- 4.1 Strategi Authentication
  - JWT vs Session
  - Why JWT untuk Platform Ini
- 4.2 User Registration Flow
  - Creator Registration
  - Password Hashing (bcrypt)
  - Email Verification (Optional)
- 4.3 Login Flow
  - Credential Validation
  - JWT Generation
  - Token Expiry
- 4.4 JWT Implementation
  - Token Structure
  - Signing & Verification
  - Refresh Token Strategy
- 4.5 Role-Based Access Control
  - Creator vs Admin
  - Permission Checking
- 4.6 Middleware Protection
  - Protecting API Routes
  - Frontend Route Guards
  - Handling Unauthorized Access
- 4.7 OAuth Integration (Google)
  - NextAuth.js Setup
  - Linking OAuth to Creator Account
- 4.8 Security Best Practices
  - Token Storage
  - XSS & CSRF Protection
  - Rate Limiting
- 4.9 Logout & Session Management
- 4.10 Latihan: Implementasi Protected Route

**Estimasi Waktu**: 2-3 jam

---

## 📘 BAB 5: ALUR DONASI & PAYOUT (END-TO-END)

**File**: [`Bab-05-Donasi-Payout.md`](Bab-05-Donasi-Payout.md)

### PART A: ALUR DONASI

- 5.1 Overview Donation Flow
  - Step-by-Step Process
  - Status Lifecycle
- 5.2 Halaman Donasi (`/donate/[username]`)
  - Form Components
  - Validation Rules
  - UX Considerations
- 5.3 Create Donation API
  - Input Validation
  - Midtrans Transaction Creation
  - Saving to Database
- 5.4 Payment Gateway Integration
  - Midtrans Snap API
  - Payment Methods Available
  - Redirect vs Popup
- 5.5 Webhook Verification
  - Signature Validation
  - Idempotency Handling
  - Status Update Logic
- 5.6 Notification System
  - Real-time Updates (Polling)
  - Email Notification to Creator
  - Toast Notifications

### PART B: ALUR PAYOUT

- 5.7 Overview Payout Flow
  - Creator Request → Admin Approval → Processing
  - Status Lifecycle
- 5.8 Creator Request Payout
  - Minimum Amount Check
  - Calculating Available Balance
  - Bank Account Validation
- 5.9 Admin Payout Management
  - List Pending Payouts
  - Approval/Rejection Logic
  - Bulk Processing
- 5.10 Marking Donations as Paid Out
  - Updating isPaidOut Flag
  - Preventing Double Payout
  - Transaction Integrity
- 5.11 Email Notifications untuk Payout
  - Templates untuk Setiap Status
  - Dynamic Content
- 5.12 Reconciliation & Reporting
- 5.13 Latihan: Test Complete Flow

**Estimasi Waktu**: 3-4 jam

---

## 📗 BAB 6: DEPLOY, TESTING & TROUBLESHOOTING

**File**: [`Bab-06-Deploy-Test-Troubleshoot.md`](Bab-06-Deploy-Test-Troubleshoot.md)

### PART A: TESTING

- 6.1 Testing Strategy
  - Unit Tests
  - Integration Tests
  - E2E Tests (Optional)
- 6.2 Jest Setup
  - Configuration
  - Mocking MongoDB
  - Mocking External APIs
- 6.3 Testing Components
  - React Testing Library
  - Snapshot Tests
  - User Interaction Tests
- 6.4 Testing API Routes
  - Request/Response Testing
  - Error Handling Tests
- 6.5 Code Coverage
  - Running Coverage Report
  - Interpreting Results

### PART B: DEPLOYMENT

- 6.6 Pre-Deployment Checklist
  - Environment Variables
  - Database Indexes
  - Security Audit
- 6.7 Deploy ke Vercel
  - Project Setup
  - Environment Configuration
  - Domain Setup
- 6.8 MongoDB Atlas Production Setup
  - Security Settings
  - Backup Configuration
  - Performance Optimization
- 6.9 Midtrans Production Mode
  - Switching to Production Keys
  - Webhook URL Configuration
- 6.10 Email Production Setup
  - SMTP Provider (SendGrid/Mailgun)
  - SPF/DKIM Configuration

### PART C: MONITORING & MAINTENANCE

- 6.11 Logging & Monitoring
  - Error Tracking (Sentry)
  - Analytics (Vercel Analytics)
- 6.12 Performance Optimization
  - Image Optimization
  - API Response Caching
  - Database Query Optimization
- 6.13 Backup Strategy
  - Database Backups
  - Code Backups
- 6.14 CI/CD Pipeline
  - GitHub Actions Setup
  - Automated Testing
  - Automated Deployment

### PART D: TROUBLESHOOTING

- 6.15 Common Issues & Solutions
  - Database Connection Errors
  - Payment Webhook Not Firing
  - Email Not Sending
  - Token Expiry Issues
- 6.16 Debugging Techniques
  - Server Logs
  - Browser DevTools
  - API Testing Tools
- 6.17 Support & Maintenance Plan

**Estimasi Waktu**: 3-4 jam

---

## 📑 LAMPIRAN

### Lampiran A: Referensi API Lengkap
**File**: [`Lampiran-A-Referensi-API.md`](Lampiran-A-Referensi-API.md)

- Daftar Semua Endpoints
- Request/Response Examples
- Error Codes
- Rate Limits

### Lampiran B: Environment Variables
**File**: [`Lampiran-B-Environment-Variables.md`](Lampiran-B-Environment-Variables.md)

- Daftar Lengkap ENV Vars
- Development vs Production
- Security Considerations
- Generate Secrets Guide

### Lampiran C: Troubleshooting Guide
**File**: [`Lampiran-C-Troubleshooting.md`](Lampiran-C-Troubleshooting.md)

- FAQ
- Error Messages & Solutions
- Performance Issues
- Security Concerns

### Lampiran D: Cheat Sheets
**File**: [`Lampiran-D-Cheat-Sheets.md`](Lampiran-D-Cheat-Sheets.md)

- npm Commands
- MongoDB Queries
- Git Commands
- Midtrans Testing Cards

### Lampiran E: Glossary
**File**: [`Lampiran-E-Glossary.md`](Lampiran-E-Glossary.md)

- Istilah Teknis
- Akronim
- Definisi

---

## 🎯 LATIHAN & STUDI KASUS

**File**: [`Latihan-Studi-Kasus.md`](Latihan-Studi-Kasus.md)

- Latihan Per Bab
- Studi Kasus: Menambahkan Fitur Subscription
- Studi Kasus: Multi-Currency Support
- Studi Kasus: Live Streaming Overlay Integration

---

## 📚 REFERENSI EKSTERNAL

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Midtrans API Docs](https://docs.midtrans.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT.io](https://jwt.io/)

---

## 📊 ESTIMASI TOTAL WAKTU BELAJAR

| Level | Estimasi |
|-------|----------|
| **Pemula** | 20-25 jam |
| **Menengah** | 12-15 jam |
| **Lanjutan** | 8-10 jam |

---

<div align="center">

**Navigasi**

[⬅️ Cover](00-Cover.md) | [Kata Pengantar ➡️](00-Kata-Pengantar.md)

</div>
