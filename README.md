# EventX – Smart Event Management Platform 🚀

[![Stack](https://img.shields.io/badge/Stack-MERN%20+%20Vite%20+%20Tailwind-5146E5.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-8B5CF6.svg)](https://opensource.org/licenses/MIT)

**EventX** is a modern, responsive, production-quality SaaS event management platform engineered for universities, student chapters, tech conferences, hackathons, and cultural fests.

---

## 🌟 Key Features

### 1. 🎓 Participant / Student Experience
- **Discovery Engine**: Real-time event search, category filters (`Technical`, `Hackathon`, `Workshop`, `Conference`, `Seminar`, `Cultural`), format toggles (`Online` vs `In-Person`), and price indicators (`Free` / `Paid`).
- **Smart Concurrency Registration**: Database-safe seat reservation with atomic capacity checks preventing overbooking.
- **Automated Waitlist Queue**: When capacity is reached, participants join an automated FIFO waitlist. If an attendee cancels, the next waitlisted user is **automatically promoted** and issued an active digital ticket!
- **Encrypted Digital Tickets**: Real-time dynamic QR code generation encoded with unique ticket tokens for fast offline venue admission.
- **Verified PDF Certificates**: Instant, tamper-resistant PDF Certificate of Participation issued and downloadable upon check-in verification.
- **Participation Analytics**: Visual breakdown of event categories and registration activity over time using Recharts.

### 2. 🎯 Event Organizer Operations
- **Event Lifecycle Management**: Complete CRUD supporting draft, pending approval, approved, rejected, and completed lifecycle states.
- **Cover Image Uploads**: Multi-source image handling (direct file upload via Multer or Unsplash/CDN photo links).
- **Roster & Participant Management**: Live attendee list with status filters, manual check-in overrides, and one-click CSV roster export.
- **Real-Time QR Scanner Terminal**: Dual-mode check-in station featuring a live camera scanner (`html5-qrcode`) and manual barcode token entry with instant visual verification feedback (Valid, Already Used, Invalid).
- **Event Announcements**: Real-time Socket.IO broadcasts with urgency flags (`urgent`, `normal`).
- **Telemetry Dashboards**: Registration velocity charts, capacity utilization percentages, and attendance conversion rates.

### 3. 👑 Platform Administrator Governance
- **Platform Health & KPIs**: Track total users, active organizers, student cohorts, event catalogs, and check-in ratios.
- **Approval Queue**: Dedicated moderation workflow to inspect event submissions and approve or reject with custom feedback.
- **User Governance**: Search users, toggle account active/deactivated state, and promote/demote roles (`student`, `organizer`, `admin`).
- **Master Catalog Audit**: Full administrative control across all platform events.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts, React Hot Toast, Canvas Confetti, QRCode.react, Html5-qrcode |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcryptjs, Multer, Socket.IO, PDFKit, QRCode |
| **Database** | MongoDB (with automatic local service connection and embedded fallback) |

---

## 🎨 UI/UX Design System

- **Design Philosophy**: Minimalist, clean SaaS aesthetic inspired by Linear, Stripe, and modern design systems.
- **Color Tokens**:
  - Primary Accent: Deep Indigo (`#5146E5`)
  - Secondary Accent: Violet (`#8B5CF6`)
  - Background: Very Light Grey (`#F8FAFC`)
  - Cards & Surfaces: Pure White (`#FFFFFF`) with subtle borders (`#E2E8F0`)
  - Text: Dark Navy (`#111827`) & Slate Muted (`#64748B`)
- **Typography**: Inter & Plus Jakarta Sans

---

## 🔑 Demo Accounts (Instant 1-Click Login)

The login screen includes **Instant 1-Click Demo Buttons** to effortlessly test all 3 roles:

| Role | Email | Password | Pre-seeded Activity |
|---|---|---|---|
| **Platform Admin** | `admin@eventx.com` | `Admin@123` | System stats, pending approval queue, user controls |
| **Event Organizer** | `organizer@eventx.com` | `Organizer@123` | 5 organized events, live attendees, QR check-in terminal |
| **Student** | `student@eventx.com` | `Student@123` | Confirmed tickets, waitlisted spots, and verified certificates |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Environment Variables

Create `backend/.env` (an example is provided at `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/eventx
JWT_SECRET=eventx_super_secret_jwt_key_2026_production_grade
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Data

Populate demo users, sample events, digital tickets, registrations, and certificates:

```bash
npm run seed --prefix backend
```

### 4. Running the Application

#### Option A: Run Both in Development Mode
In terminal 1 (Backend API & Socket.IO):
```bash
npm run dev --prefix backend
```
In terminal 2 (Frontend with Vite HMR):
```bash
npm run dev --prefix frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Option B: Full-Stack Production Mode
Build the frontend and serve directly via Express:
```bash
npm run build --prefix frontend
npm start --prefix backend
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create student or organizer account
- `POST /api/auth/login` - Sign in and receive JWT token
- `GET /api/auth/me` - Get current authenticated user profile
- `PUT /api/auth/profile` - Update profile details
- `PUT /api/auth/change-password` - Update account password

### Events (`/api/events`)
- `GET /api/events` - Explore approved events (with category, search, and sorting)
- `GET /api/events/:id` - Detailed event information and registration status
- `GET /api/events/my/organized` - Events organized by current host
- `POST /api/events` - Create new event (draft or pending)
- `PUT /api/events/:id` - Update existing event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/upload-image` - Upload cover image file
- `GET /api/events/:id/announcements` - List official event announcements
- `POST /api/events/:id/announcements` - Broadcast announcement

### Registrations & Waitlist (`/api/registrations`)
- `POST /api/registrations/:eventId` - Register for event or join waitlist
- `PUT /api/registrations/:registrationId/cancel` - Cancel seat with automatic next-in-line promotion
- `GET /api/registrations/my` - Get current user registrations
- `GET /api/registrations/event/:eventId` - List registered participants for an event

### Digital Tickets & QR Verification (`/api/tickets`)
- `GET /api/tickets/my` - Get active digital passes with QR data
- `GET /api/tickets/:id` - Inspect specific ticket
- `POST /api/tickets/checkin` - Cryptographic QR token check-in verification & certificate issuance

### Certificates (`/api/certificates`)
- `GET /api/certificates/my` - Get user's earned certificates
- `GET /api/certificates/:id` - View certificate metadata
- `GET /api/certificates/:id/download` - Stream verified PDF certificate

### Platform Admin (`/api/admin`)
- `GET /api/admin/stats` - Platform-wide statistics
- `GET /api/admin/users` - User directory with role filters & pagination
- `PUT /api/admin/users/:id/toggle-status` - Activate or deactivate account
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/events/pending` - Pending approval queue
- `PUT /api/admin/events/:id/approve` - Approve and publish event
- `PUT /api/admin/events/:id/reject` - Reject submission with reason
- `GET /api/admin/events` - Master catalog review

---

## 🔒 Security Architecture
- Passwords salted and hashed with **bcryptjs** (10 salt rounds).
- Protected API routes guarded by Bearer JWT verification middleware.
- Role-based authorization enforced server-side via `authorize('admin', 'organizer')`.
- Concurrency-safe registration logic preventing seat overbooking.
- Real-time ticket verification verifying that tickets belong to the specific event and rejecting duplicate check-in attempts.

