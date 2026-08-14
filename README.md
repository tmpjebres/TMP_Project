# TMP Project

**Sistem Administrasi Taman Makam Pahlawan**

TMP Project is a web-based administrative system designed to support the management of **Taman Makam Pahlawan (TMP)**. The application brings cemetery records, visitor management, activity scheduling, notifications, user administration, and reporting into a single platform.

Built with **Next.js 14** and **Supabase**, TMP combines a feature-oriented application structure with PostgreSQL, Row Level Security, Supabase Authentication, and private file storage.

---

## Overview

TMP provides role-based access for two types of users:

| Role         | Description                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------- |
| **Master**   | Manages administrative data, users, schedules, reports, and other privileged operations.      |
| **Operator** | Handles operational activities such as visitor registration and day-to-day application usage. |

The application is organized around several core domains:

* Cemetery block management
* Grave management
* Visitor management
* Visitor activity scheduling
* Notifications
* User administration
* Dashboard & reporting
* Activity logging
* Security alerts

---

## Features

### Cemetery Management

Manage cemetery blocks and grave records with support for:

* Block capacity and occupancy
* Grave records
* Grave-to-block relationships
* Search and sorting
* CRUD operations
* Automatic occupancy updates

Block occupancy is maintained at the database level through PostgreSQL triggers when grave records are added, removed, or moved between blocks.

### Visitor Management

TMP supports two visitor categories:

* **Individual / General Visitors**
* **Group / Organizational Visitors**

Visitor management includes:

* Visitor registration
* Visit information
* Group information
* Visitor list
* Editing and deletion
* Visitor photo capture and upload

### Visitor Activity Scheduling

The scheduling module provides calendar-based management for visitor activities and events.

Features include:

* Activity information and type
* Institution and activity leader
* Group size
* Start and end date/time
* Month, week, and year calendar views
* Schedule conflict detection
* Conflict confirmation
* Attachments and external links
* Soft deletion
* Schedule audit history

Supported attachments include PDF, JPEG, PNG, and WebP files. Attachments are stored in the private `jadwal-tamu-attachment` Supabase Storage bucket.

### Notifications

TMP provides schedule-related notifications for:

* **H-1** — one day before an activity
* **H** — activity scheduled for the current day
* Past scheduled activities within the notification history

Notification read status is maintained individually for each user.

The notification system also surfaces security alerts generated from repeated failed login attempts.

### User Management

Master users can manage application accounts, including:

* Create users
* Update usernames and names
* Change roles
* Activate or deactivate accounts
* Delete users
* View user activity
* Review login history

Users cannot deactivate or delete their own account through the management interface.

### Dashboard & Reporting

The dashboard provides an overview of:

* Visitor statistics
* Period-based visitor data
* Cemetery block occupancy
* Scheduled activities
* Application summaries

Dashboard data can be exported as PDF reports through a server-side Next.js API route.

Supported report periods:

* Week
* Month
* Year

Export operations are recorded in the activity log.

### Activity & Security Logging

TMP maintains activity records for administrative operations such as:

* Create
* Update
* Delete
* Activate
* Deactivate
* Export

The scheduling module also maintains its own audit history.

Failed login attempts are tracked and can generate security alerts when repeated unsuccessful authentication activity is detected.

---

# Architecture

TMP follows a **feature-oriented architecture** built on the Next.js App Router.

```text
┌──────────────────────────────────────────────┐
│              Next.js App Router              │
│         Routes · Pages · Layouts             │
└───────────────────────┬──────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────┐
│                Feature Modules               │
│                                              │
│ auth · dashboard · tamu · jadwal-tamu        │
│ makam · blok · notifikasi · user             │
└───────────────────────┬──────────────────────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
┌────────────────────────┐ ┌───────────────────┐
│ Shared Infrastructure  │ │ Server API Routes │
│                        │ │                   │
│ Context · UI · Reports │ │ Users · Reports   │
│ Supabase · Utilities   │ │                   │
└────────────┬───────────┘ └─────────┬─────────┘
             │                       │
             └───────────┬───────────┘
                         ▼
              ┌─────────────────────┐
              │      Supabase       │
              │                     │
              │ Auth · PostgreSQL   │
              │ RLS · Storage       │
              └─────────────────────┘
```

### Architectural Layers

| Layer          | Location                | Responsibility                                          |
| -------------- | ----------------------- | ------------------------------------------------------- |
| Routing        | `app/`                  | Routes, pages, layouts, and API route handlers          |
| Feature UI     | `features/*/components` | Domain-specific interfaces                              |
| Feature Logic  | `features/*`            | Hooks, utilities, and domain behavior                   |
| Data Access    | `features/*/api.ts`     | Supabase queries and data mapping                       |
| Shared UI      | `components/ui/`        | Reusable UI components                                  |
| Shared State   | `lib/context/`          | Authentication, notifications, theme, and sidebar state |
| Infrastructure | `lib/`                  | Supabase clients, reports, activity logging, utilities  |
| Domain Types   | `types/`                | Shared TypeScript types                                 |
| Database       | `supabase/`             | Schema, migrations, policies, and triggers              |

Feature modules communicate directly with Supabase through their respective `api.ts` modules. Privileged operations that require server-side credentials are handled through Next.js Route Handlers.

---

## Data Flow

### Standard Feature Flow

```text
User
 ↓
Feature UI
 ↓
Feature API
 ↓
Supabase Client
 ↓
PostgreSQL / Storage
 ↓
Application Data
 ↓
React State
 ↓
UI
```

Most application data access uses the browser-side Supabase client and is protected by PostgreSQL Row Level Security.

### Privileged Operations

User management and dashboard PDF generation use server-side Next.js Route Handlers.

```text
Browser
 ↓
Supabase Access Token
 ↓
Authorization: Bearer <token>
 ↓
Next.js Route Handler
 ↓
Token Verification
 ↓
Master Role Verification
 ↓
Privileged Operation
 ↓
Response
```

---

# Technology Stack

| Technology                 | Purpose                               |
| -------------------------- | ------------------------------------- |
| **Next.js 14.2.5**         | Application framework and App Router  |
| **React 18**               | UI rendering                          |
| **TypeScript**             | Application language                  |
| **Tailwind CSS 3.4.1**     | Styling                               |
| **Supabase**               | Authentication, database, and storage |
| **PostgreSQL**             | Application database                  |
| **Recharts**               | Dashboard charts                      |
| **Lucide React**           | UI icons                              |
| **date-fns**               | Date manipulation                     |
| **PDFKit**                 | PDF report generation                 |
| **Three.js**               | 3D/UI dependency                      |
| **PostCSS + Autoprefixer** | CSS processing                        |

---

# Project Structure

```text
.
├── app/
│   ├── (dashboard)/
│   │   ├── daftar-blok/
│   │   ├── daftar-makam/
│   │   ├── daftar-tamu/
│   │   ├── input-tamu/
│   │   ├── jadwal-tamu/
│   │   ├── notifikasi/
│   │   ├── profile/
│   │   ├── user-management/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── api/
│   │   ├── reports/dashboard/
│   │   └── users/
│   │
│   ├── help/
│   ├── login/
│   ├── service-paused/
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   └── ui/
│
├── data/
│   ├── DAFTAR NAMA PAHLAWAN DI TMP 2024 TOFIK.xlsx
│   └── data_makam_cleaned.csv
│
├── features/
│   ├── auth/
│   ├── blok/
│   ├── dashboard/
│   ├── jadwal-tamu/
│   ├── makam/
│   ├── notifikasi/
│   ├── tamu/
│   └── user/
│
├── lib/
│   ├── context/
│   ├── reports/
│   ├── supabase/
│   ├── utils/
│   ├── activity-log.ts
│   └── routes.ts
│
├── supabase/
│   └── migrations/
│
├── types/
│   └── index.ts
│
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── supabase-schema.sql
├── tailwind.config.js
└── tsconfig.json
```

---

# Getting Started

## Prerequisites

Before running TMP locally, make sure you have:

* Node.js
* npm
* A Supabase project
* Required Supabase environment variables

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Environment Variables

The service-role key is used only for server-side administrative operations and must never be exposed to client-side code.

## Database

The database structure is maintained through supabase

---

# Application Modules

| Module        | Responsibility                             |
| ------------- | ------------------------------------------ |
| `auth`        | Authentication, login, access guards       |
| `dashboard`   | Dashboard statistics and reporting         |
| `tamu`        | Individual and group visitor management    |
| `jadwal-tamu` | Visitor activity scheduling                |
| `makam`       | Grave management                           |
| `blok`        | Cemetery block management                  |
| `notifikasi`  | Schedule notifications and security alerts |
| `user`        | User administration                        |

---

# Routing

TMP uses the Next.js App Router.

| Route                        | Access        | Purpose                    |
| ---------------------------- | ------------- | -------------------------- |
| `/`                          | Authenticated | Dashboard                  |
| `/login`                     | Public        | Login                      |
| `/input-tamu`                | Authenticated | Visitor entry              |
| `/input-tamu/tamu-umum`      | Authenticated | Individual visitor entry   |
| `/input-tamu/tamu-rombongan` | Authenticated | Group visitor entry        |
| `/daftar-tamu`               | Authenticated | Visitor records            |
| `/jadwal-tamu`               | Authenticated | Activity scheduling        |
| `/notifikasi`                | Authenticated | Notifications              |
| `/daftar-blok`               | Authenticated | Cemetery blocks            |
| `/daftar-makam`              | Authenticated | Grave records              |
| `/user-management`           | Master        | User administration        |
| `/user-management/[id]`      | Master        | User details               |
| `/profile`                   | Authenticated | User profile               |
| `/help`                      | Public        | Help                       |
| `/service-paused`            | Public        | Service availability state |

The legacy `/input-makam` path redirects to `/daftar-makam`.

---

# State Management

TMP uses React state and Context rather than a dedicated global state-management library.

| State           | Implementation                |
| --------------- | ----------------------------- |
| Authentication  | `AuthContext`                 |
| Theme           | `ThemeContext`                |
| Sidebar         | `SidebarContext`              |
| Notifications   | `NotificationContext`         |
| Feature state   | React state and feature hooks |
| Navigation      | Next.js App Router            |
| Persistent data | Supabase PostgreSQL           |

---

# API

TMP uses Next.js Route Handlers for privileged server-side operations.

---

# Authentication & Authorization

TMP uses **Supabase Auth** together with application roles and PostgreSQL Row Level Security.

### Roles

* `master` — administrative access
* `operator` — operational access

### Username Authentication

The login interface uses usernames. Internally, usernames are mapped to a Supabase Auth email using:

```text
<username>@makam.app
```

### Account Status

Account activation is controlled through:

```text
profiles.is_active
```

Inactive accounts are signed out by the authentication flow.

### Authorization

Authorization is enforced through:

* Application-level route guards
* Server-side authorization in privileged API routes
* PostgreSQL Row Level Security

---

# Database

## Core Tables

| Table                             | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `profiles`                        | User profiles, roles, and account status |
| `blok`                            | Cemetery blocks                          |
| `makam`                           | Grave records                            |
| `tamu_umum`                       | Individual visitors                      |
| `tamu_rombongan`                  | Group visitors                           |
| `jadwal_tamu`                     | Scheduled activities                     |
| `jadwal_tamu_tipe_kegiatan`       | Activity types                           |
| `jadwal_tamu_audit_log`           | Schedule audit history                   |
| `jadwal_tamu_notification_status` | Notification state                       |
| `login_attempts`                  | Login attempt history                    |
| `login_alert`                     | Security alerts                          |
| `activity_log`                    | Application activity log                 |

### Database Triggers

TMP uses database triggers for several application behaviors, including:

* Maintaining cemetery block occupancy
* Updating timestamp fields
* Creating user profiles
* Detecting repeated failed login attempts

---

# File Storage

TMP uses Supabase Storage for application files.

The scheduling module stores attachments in:

```text
jadwal-tamu-attachment
```

Supported file types:

```text
PDF
JPEG
PNG
WebP
```

Maximum attachment size:

```text
1 MB
```

Schedule attachments are stored in a private bucket and accessed through signed URLs.

---

# Development

## Available Commands

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start development server     |
| `npm run build` | Build production application |
| `npm run start` | Start production server      |
| `npm run lint`  | Run linting                  |

TypeScript is configured with strict mode enabled, and the project uses the `@/*` path alias for root-level imports.

Example:

```typescript
import { supabaseClient } from '@/lib/supabase/client';
```

---

# Security

TMP includes several application and database-level security mechanisms:

* Supabase Authentication
* Role-based authorization
* PostgreSQL Row Level Security
* Server-side token verification
* Server-only service-role credentials
* Private Supabase Storage
* Signed file URLs
* Account activation controls
* Failed-login tracking
* Security alerts
* Activity logging
* Schedule audit logging
* Application-level input validation

The `SUPABASE_SERVICE_ROLE_KEY` is restricted to server-side operations and must never be exposed to the browser.

---

# Project Status

TMP is currently under active development with core modules for:

* Authentication
* Visitor management
* Cemetery management
* Activity scheduling
* Notifications
* User administration
* Dashboard reporting
* Activity and security logging

The application can be developed and built using the standard Next.js workflow provided in the repository.

---

# License

This project is currently intended for its project-specific use. Redistribution or reuse should follow the terms defined by the project owner.
