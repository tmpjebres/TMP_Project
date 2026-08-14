# TMP Project

**Sistem Administrasi Taman Makam Pahlawan**

TMP Project is a role-based web application for the administration and day-to-day management of a **Taman Makam Pahlawan (TMP)**. The application centralizes cemetery records, visitor management, scheduled activities, notifications, user administration, dashboard reporting, and activity auditing in a single web-based system.

Built with **Next.js 14 App Router** and **Supabase**, TMP combines a feature-oriented application architecture with PostgreSQL, Row Level Security (RLS), Supabase Authentication, and private file storage.

> **Documentation status:** This README is based on the repository implementation available at the time of analysis. The application source code, configuration, database definitions, migrations, and package scripts are treated as the primary sources of truth.

---

## Overview

TMP is designed around two application roles:

| Role         | Description                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Master**   | Administrative role with access to privileged management, user administration, dashboard reporting, and other master-only operations. |
| **Operator** | Operational role intended primarily for day-to-day application usage and visitor data entry.                                          |

The system covers the following core domains:

* Cemetery block and grave management
* Individual and group visitor management
* Visitor activity scheduling
* Application notifications
* User administration and role management
* Failed-login security alerts
* Activity and audit logging
* Dashboard statistics and reporting
* PDF report generation
* Visitor and schedule attachment storage

TMP is implemented as a **single Next.js application**. There is no separate backend service in the repository; Supabase provides authentication, PostgreSQL data storage, Row Level Security, and file storage, while Next.js provides the application UI, routing, and privileged server-side route handlers.

---

## Key Features

### Cemetery Management

Manage cemetery blocks and grave records, including:

* Block capacity
* Current occupancy
* Grave records
* Grave-to-block relationships
* Grave search and sorting
* Grave CRUD operations

Block occupancy is also maintained at the database level through PostgreSQL triggers when grave records are inserted, updated, or deleted.

### Visitor Management

TMP supports two visitor categories:

* **Individual / general visitors**
* **Group / organizational visitors**

Visitor management includes:

* Visitor registration
* Visitor identity and visit information
* Group information
* Visitor list and search
* Visitor editing and deletion
* Visitor photo capture/upload

### Visitor Activity Scheduling

The scheduling module provides calendar-based management of visitor activities and events.

Supported capabilities include:

* Activity name and type
* Institution
* Activity leader
* Group size
* Start and end date/time
* Month, week, and year calendar views
* Schedule conflict detection
* Conflict confirmation workflow
* Attachments
* External links
* Soft deletion
* Schedule audit history

Supported schedule attachment formats include:

* PDF
* JPEG
* PNG
* WebP
* External links

Attachments are stored in the private `jadwal-tamu-attachment` Supabase Storage bucket.

### Notifications

The notification system provides schedule-related notifications for:

* `H-1` / one day before an activity
* `H` / the current day
* Past scheduled activities within the notification history window

Notification read state is maintained per user.

The notification module also exposes security alerts related to repeated failed login attempts.

### Security Alerts

TMP tracks unsuccessful login attempts through the `login_attempts` table.

A database trigger can generate a security alert when the configured failed-login pattern is detected. The implemented detection logic evaluates the latest five login attempts for a username and can generate an alert when five consecutive attempts fail within a 30-minute window, subject to the existing alert-window logic.

Security alerts are restricted to Master users through the application's authorization model and database policies.

### User Management

Master users can:

* Create users
* Update usernames
* Update full names
* Change roles
* Activate or deactivate accounts
* Delete users
* View user activity
* Review login history

A user cannot deactivate or delete their own account through the implemented management operations.

### Dashboard & Reporting

The dashboard provides:

* Visitor statistics
* Period-based visitor views
* Cemetery block occupancy distribution
* Scheduled activity summaries
* Dashboard visualizations

Dashboard reports can be generated as PDF files through a server-side Next.js route handler using PDFKit.

Supported reporting periods include:

* Week
* Month
* Year

PDF export activity is recorded in the application activity log.

### Activity & Audit Logging

TMP maintains application-level activity records for administrative operations such as:

* Create
* Update
* Delete
* Activate
* Deactivate
* Export

The scheduling module additionally maintains a dedicated schedule audit log.

---

# Architecture

## Architecture Overview

TMP follows a **feature-oriented architecture** built on top of the Next.js App Router.

The repository is organized around three primary application concerns:

1. **Routing and application entry points** under `app/`
2. **Domain-specific feature modules** under `features/`
3. **Shared infrastructure and cross-cutting concerns** under `lib/`

The architecture is intentionally pragmatic rather than a strict controller/service/repository pattern. Feature-level `api.ts` modules perform direct Supabase data access, while privileged operations that require server-side credentials are implemented through Next.js Route Handlers.

```text
┌─────────────────────────────────────────────────────┐
│                  Next.js App Router                 │
│              Routes · Layouts · Pages               │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                   Feature Modules                   │
│                                                     │
│ auth · dashboard · tamu · jadwal-tamu               │
│ makam · blok · notifikasi · user                    │
└──────────────────────────┬──────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────────┐   ┌──────────────────────┐
│ Shared Infrastructure    │   │ Next.js Route        │
│                          │   │ Handlers              │
│ Contexts · UI · Reports  │   │                      │
│ Supabase · Utilities     │   │ Users · Reports      │
└────────────┬─────────────┘   └──────────┬───────────┘
             │                            │
             └──────────────┬─────────────┘
                            ▼
                 ┌──────────────────────┐
                 │       Supabase       │
                 │                      │
                 │ Auth · PostgreSQL    │
                 │ RLS · Storage        │
                 └──────────────────────┘
```

### Architectural Characteristics

| Concern                           | Implementation                                                |
| --------------------------------- | ------------------------------------------------------------- |
| Routing                           | Next.js App Router                                            |
| Domain organization               | Feature-oriented modules under `features/`                    |
| Feature data access               | Direct Supabase queries through `features/*/api.ts`           |
| Shared infrastructure             | `lib/`                                                        |
| Shared UI                         | `components/ui/`                                              |
| Server-side privileged operations | Next.js Route Handlers                                        |
| Authentication                    | Supabase Auth                                                 |
| Authorization                     | Application guards + server-side role checks + PostgreSQL RLS |
| Database                          | PostgreSQL through Supabase                                   |
| File storage                      | Supabase Storage                                              |

TMP does **not** implement a dedicated service layer, repository layer, or dependency-injection framework. Data access is colocated with the relevant feature domain.

---

## Application Layers

| Layer               | Location                           | Responsibility                                         |
| ------------------- | ---------------------------------- | ------------------------------------------------------ |
| Routing             | `app/`                             | Routes, layouts, pages, route handlers                 |
| Feature UI          | `features/*/components`            | Domain-specific presentation and interaction           |
| Feature logic       | `features/*`                       | Hooks, utilities, stateful behavior, domain logic      |
| Feature data access | `features/*/api.ts`                | Supabase queries and row-to-domain mapping             |
| Shared UI           | `components/ui/`                   | Reusable UI primitives                                 |
| Shared state        | `lib/context/`                     | Authentication, notifications, theme, sidebar          |
| Infrastructure      | `lib/`                             | Supabase clients, reports, activity logging, utilities |
| Domain types        | `types/`                           | Shared TypeScript domain types                         |
| Database            | `supabase/`, `supabase-schema.sql` | Schema, migrations, policies, triggers                 |

---

# Data Flow

## Standard Feature Data Flow

Most operational features follow this pattern:

```text
User Interaction
       ↓
Next.js Route Page
       ↓
Feature UI Component
       ↓
Feature API Module
       ↓
Supabase Client
       ↓
PostgreSQL / Storage
       ↓
Mapped Application Data
       ↓
React State / Hook
       ↓
Rendered UI
```

Feature API modules generally perform direct browser-side communication with Supabase using the public Supabase client. Database operations are constrained by PostgreSQL Row Level Security.

---

## Authentication Flow

```text
Login Form
    ↓
AuthContext.login()
    ↓
Supabase Auth signInWithPassword()
    ↓
Supabase Auth Session
    ↓
profiles lookup
    ↓
Role + Active Status Verification
    ↓
Authenticated Application State
```

The application presents a username-based login interface while internally deriving the Supabase Auth email from the username:

```text
<username>@makam.app
```

The synthetic email convention is an implementation detail and is not exposed as a normal user-facing email field.

---

## Privileged Server Flow

User management and dashboard PDF generation require server-side privileged operations.

```text
Browser
   ↓
Supabase Session Access Token
   ↓
Authorization: Bearer <access token>
   ↓
Next.js Route Handler
   ↓
Server Supabase Client
   ↓
Token Verification
   ↓
profiles Role Verification
   ↓
Master Authorization
   ↓
Privileged Operation
   ↓
Activity Log
   ↓
Response
```

The privileged route handlers independently verify the bearer token and confirm that the caller has the `master` role before performing administrative operations.

---

# Technology Stack

| Layer            | Technology                      | Role                                                                                               |
| ---------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Framework        | Next.js 14.2.5                  | Application framework, App Router, rendering, API route handlers                                   |
| Language         | TypeScript                      | Application language                                                                               |
| UI Runtime       | React 18                        | Component rendering                                                                                |
| Styling          | Tailwind CSS 3.4.1              | Utility-first styling                                                                              |
| CSS Processing   | PostCSS + Autoprefixer          | CSS build processing                                                                               |
| Backend Platform | Supabase                        | Authentication, PostgreSQL, Storage                                                                |
| Database         | PostgreSQL via Supabase         | Persistent application data                                                                        |
| Supabase SDK     | `@supabase/supabase-js` 2.110.8 | Client/server Supabase integration                                                                 |
| Charts           | Recharts                        | Dashboard visualization                                                                            |
| Icons            | Lucide React                    | UI iconography                                                                                     |
| Date Utilities   | date-fns                        | Date manipulation and formatting                                                                   |
| PDF Generation   | PDFKit                          | Server-side dashboard report generation                                                            |
| 3D               | Three.js                        | Repository dependency; concrete application usage should be verified against current feature usage |
| Runtime          | Node.js / Next.js runtime       | Application execution                                                                              |

---

# Repository Structure

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

The `data/` directory contains static CSV/XLSX source data present in the repository. These files are not identified as runtime application dependencies.

Generated or build-related artifacts are not considered application source.

---

# Getting Started

## Prerequisites

The repository requires:

* Node.js compatible with the Next.js 14 toolchain
* npm
* A configured Supabase project
* Required Supabase environment variables

The repository does not currently pin a specific Node.js version through `.nvmrc` or a package `engines` field.

---

## Installation

Install dependencies using the committed npm lockfile:

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root.

| Variable                        | Required                         | Purpose                                        |
| ------------------------------- | -------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes                              | Supabase project URL                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes                              | Public/browser Supabase key                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes for privileged server routes | Server-side administrative Supabase operations |

The service-role key must remain server-side and must never be exposed to browser code.

The repository does not contain a committed `.env.example` file.

---

## Database Configuration

The repository contains database definitions through:

```text
supabase-schema.sql
supabase/migrations/*.sql
```

The migration history covers functionality including:

* Visitor scheduling
* Activity types
* Schedule notifications
* Failed-login security alerts
* Activity logging

The base schema, generated database types, migrations, and application code should be reviewed together when initializing or synchronizing a Supabase environment.

---

## Running Locally

Start the development server:

```bash
npm run dev
```

The development server uses the standard Next.js development behavior.

---

## Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

# Application Structure

## Routing

TMP uses the Next.js App Router.

| Route                        | Type          | Access        | Purpose                            |
| ---------------------------- | ------------- | ------------- | ---------------------------------- |
| `/`                          | Page          | Authenticated | Dashboard overview                 |
| `/login`                     | Page          | Public        | Authentication                     |
| `/input-tamu`                | Page          | Authenticated | Visitor entry                      |
| `/input-tamu/tamu-umum`      | Page          | Authenticated | Individual visitor entry           |
| `/input-tamu/tamu-rombongan` | Page          | Authenticated | Group visitor entry                |
| `/daftar-tamu`               | Page          | Authenticated | Visitor records                    |
| `/jadwal-tamu`               | Page          | Authenticated | Visitor activity scheduling        |
| `/notifikasi`                | Page          | Authenticated | Notifications                      |
| `/daftar-blok`               | Page          | Authenticated | Cemetery block management          |
| `/daftar-makam`              | Page          | Authenticated | Grave records                      |
| `/user-management`           | Page          | Master        | User administration                |
| `/user-management/[id]`      | Dynamic Page  | Master        | User details and activity          |
| `/profile`                   | Page          | Authenticated | Current user profile               |
| `/help`                      | Page          | Public        | Help                               |
| `/service-paused`            | Page          | Public/System | Supabase/project unavailable state |
| `/api/users`                 | Route Handler | Master        | User creation/deletion             |
| `/api/reports/dashboard`     | Route Handler | Master        | Dashboard PDF export               |

The compatibility path:

```text
/input-makam
    ↓
/daftar-makam
```

is implemented as a redirect rather than a physical App Router page.

---

## Route Protection

Authenticated dashboard routes are protected through the dashboard layout and authentication context.

Master-only pages use `RequireMaster`.

The repository does not contain a `middleware.ts`, so authentication routing is not implemented through Next.js middleware. Authorization is instead enforced through a combination of:

* client-side application guards;
* server-side authorization checks for privileged route handlers;
* PostgreSQL Row Level Security for direct Supabase data access.

---

# Feature Modules

## `features/auth`

Responsible for:

* Authentication UI
* Login
* Authentication state
* Password updates
* Master-only UI guard
* Help/login-related presentation

Shared authentication state is implemented through:

```text
lib/context/auth-context.tsx
```

---

## `features/dashboard`

Responsible for:

* Dashboard statistics
* Visitor-period selection
* Block occupancy visualization
* Scheduled visitor summaries
* Dashboard reporting support

---

## `features/tamu`

Responsible for:

* Individual visitor records
* Group visitor records
* Visitor list
* Visitor editing
* Visitor deletion
* Visitor photo upload
* Visitor-specific hooks and utilities

---

## `features/jadwal-tamu`

Responsible for:

* Scheduled activities
* Calendar views
* Event creation and editing
* Schedule deletion through soft delete
* Activity types
* Schedule conflict checking
* Attachments
* Audit history

---

## `features/makam`

Responsible for:

* Grave records
* Grave search
* Sorting
* Validation
* Grave CRUD operations
* Block association

---

## `features/blok`

Responsible for:

* Cemetery block records
* Capacity
* Occupancy
* Block CRUD operations

Block occupancy is also maintained through a PostgreSQL database trigger.

---

## `features/notifikasi`

Responsible for:

* Schedule notifications
* Notification read state
* Security alerts

---

## `features/user`

Responsible for:

* User management
* Role management
* Account status
* User deletion
* User activity history

---

# State Management

TMP does not use a dedicated third-party global state-management library.

State is distributed across React Context, component state, feature hooks, URL state, and Supabase persistence.

| State Type                   | Mechanism                          |
| ---------------------------- | ---------------------------------- |
| Authentication/session       | `AuthContext`                      |
| Theme                        | `ThemeContext`                     |
| Sidebar                      | `SidebarContext`                   |
| Notifications                | `NotificationContext`              |
| Component state              | React `useState` and related hooks |
| Feature state                | Feature-specific hooks/components  |
| Navigation state             | Next.js App Router                 |
| Persistent application state | Supabase PostgreSQL                |
| Authentication persistence   | Supabase Auth session              |

No Redux, Zustand, Jotai, React Query, SWR, or equivalent dedicated state/data-fetching library was identified in the repository.

---

# API

TMP exposes two Next.js Route Handler groups for privileged server-side operations.

## `POST /api/users`

Creates a new application user.

### Authorization

Requires:

* Valid Supabase access token
* Caller with `master` role

### Request

```json
{
  "username": "<username>",
  "fullName": "<full name>",
  "password": "<password>",
  "role": "master | operator"
}
```

The implemented password validation requires a minimum length of eight characters.

---

## `DELETE /api/users`

Deletes an application user.

### Authorization

Requires:

* Valid Supabase access token
* Caller with `master` role
* Caller cannot delete their own account

### Request

```json
{
  "userId": "<uuid>"
}
```

---

## `GET /api/reports/dashboard`

Generates a dashboard PDF report.

### Authorization

Requires:

* Valid Supabase access token
* Caller with `master` role

### Query Parameters

```text
view
month
year
week
```

Supported `view` values:

```text
minggu
bulan
tahun
```

The response is:

```text
Content-Type: application/pdf
```

Report exports are recorded in the application activity log.

---

## Feature-Level Data Access

Most application data access does not pass through Next.js API routes.

Instead, feature modules communicate directly with Supabase through modules such as:

```text
features/tamu/api.ts
features/jadwal-tamu/api.ts
features/makam/api.ts
features/blok/api.ts
features/notifikasi/api.ts
features/user/api.ts
```

These browser-side requests use the public Supabase client and are subject to database-level Row Level Security.

---

# Authentication & Authorization

TMP uses the following authorization model:

```text
Supabase Auth
      +
profiles.role
      +
profiles.is_active
      +
PostgreSQL Row Level Security
      +
Server-side authorization checks
```

## Roles

| Role       | Purpose                                  |
| ---------- | ---------------------------------------- |
| `master`   | Administrative and privileged operations |
| `operator` | Operational application usage            |

---

## Session Management

The Supabase client is configured to persist authentication sessions and automatically refresh tokens.

The authentication context listens for authentication state changes and loads the corresponding `profiles` record.

---

## Account Status

User accounts contain an active/inactive state through:

```text
profiles.is_active
```

Disabled accounts are signed out by the authentication flow and cannot maintain an active application session.

---

## Database Authorization

Direct browser-to-Supabase operations are protected by PostgreSQL Row Level Security.

Policies use the authenticated user's identity through:

```text
auth.uid()
```

and the application role stored in `profiles`.

Examples of protected operations include:

* Master-only block management
* Master-only grave management
* Visitor insertion for authenticated users
* Master-only visitor updates/deletions
* User management
* Protected schedule and notification operations

---

## Privileged Server Operations

Server-side administrative operations use:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The service-role client is used only for privileged server-side operations and is not intended for browser execution.

Privileged route handlers verify the incoming access token and independently check the caller's role before executing administrative operations.

---

# Notifications & Security

## Schedule Notifications

Schedule notifications use notification types such as:

```text
h_minus_1
h
```

Notification status is maintained per user through:

```text
jadwal_tamu_notification_status
```

Users can mark individual notifications or all notifications as read.

---

## Failed Login Detection

Login attempts are stored in:

```text
login_attempts
```

The database contains trigger-based failed-login detection logic that can create security alerts in:

```text
login_alert
```

The implemented detection logic evaluates recent login attempts and identifies repeated failed authentication activity within the configured detection window.

Security alerts are restricted to Master users.

---

# File Storage

Schedule attachments use the private Supabase Storage bucket:

```text
jadwal-tamu-attachment
```

Supported MIME types include:

```text
application/pdf
image/jpeg
image/png
image/webp
```

The application enforces a maximum attachment size of:

```text
1 MB
```

Attachment access uses signed URLs with a limited validity period.

Visitor photo uploads are also supported through Supabase Storage.

---

# Database

## Core Tables

| Table                             | Responsibility                               |
| --------------------------------- | -------------------------------------------- |
| `profiles`                        | Application users, roles, and account status |
| `blok`                            | Cemetery blocks                              |
| `makam`                           | Grave records                                |
| `tamu_umum`                       | Individual visitor records                   |
| `tamu_rombongan`                  | Group visitor records                        |
| `jadwal_tamu`                     | Scheduled visitor activities                 |
| `jadwal_tamu_tipe_kegiatan`       | Schedule activity types                      |
| `jadwal_tamu_audit_log`           | Schedule audit history                       |
| `jadwal_tamu_notification_status` | Per-user notification state                  |
| `login_attempts`                  | Login attempt history                        |
| `login_alert`                     | Security alerts                              |
| `activity_log`                    | Application activity history                 |

---

## Important Database Behaviors

### Grave Occupancy

The `handle_makam_count()` database trigger maintains the `terisi` value on cemetery blocks.

It responds to changes including:

* Grave insertion
* Grave deletion
* Grave movement between blocks

---

### Automatic Timestamps

Database triggers are used to automatically maintain `updated_at` fields where configured.

---

### User Profile Creation

The database contains logic for automatically creating a corresponding `profiles` record when a Supabase Auth user is created through:

```text
handle_new_user()
```

---

### Schedule Soft Delete

Scheduled activities use soft deletion through fields including:

```text
deleted_at
deleted_by
deleted_by_username
```

Active schedule queries exclude records where `deleted_at` is not null.

---

# Development

## Available Commands

The following scripts are defined in `package.json`:

| Command         | Purpose                                 |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start the Next.js development server    |
| `npm run build` | Build the production application        |
| `npm run start` | Start the production application        |
| `npm run lint`  | Run the configured Next.js lint command |

No `test`, `type-check`, or `format` npm script is currently defined.

---

## TypeScript

TypeScript is configured with strict type checking:

```text
strict: true
```

The project uses the path alias:

```text
@/*
```

which maps to the repository root.

Example:

```typescript
import { supabaseClient } from '@/lib/supabase/client';
```

---

## Code Organization

Domain-specific code should remain within the appropriate:

```text
features/<feature>/
```

module.

Shared infrastructure and cross-cutting concerns belong primarily under:

```text
lib/
```

Reusable UI primitives are located under:

```text
components/ui/
```

The repository uses explicit row-to-domain mapping functions in several feature APIs to convert Supabase `snake_case` records into application-level TypeScript representations.

---

# Testing

No automated testing framework or test suite was identified in the supplied repository.

The repository currently does not expose an npm test command.

Therefore, automated:

* unit-test coverage;
* integration-test coverage;
* end-to-end coverage;

cannot be established from the repository.

The available quality checks are currently:

```bash
npm run lint
npm run build
```

---

# Security Considerations

TMP implements several concrete security controls:

* Supabase Authentication
* Role-based authorization
* PostgreSQL Row Level Security
* Server-side bearer-token verification for privileged APIs
* Server-only service-role credentials
* Private Supabase Storage
* Signed attachment URLs
* Active-account validation
* Failed-login tracking
* Security alerts
* Application activity logging
* Schedule audit logging
* Application-level input validation
* Database constraints and triggers

## Client / Server Credential Boundary

Browser-side operations use:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Server-side administrative operations use:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key bypasses normal RLS enforcement and must therefore remain strictly server-side.

## Security Scope

The security information in this README is an implementation overview based on repository inspection.

It is **not** a penetration test, formal vulnerability assessment, or independent security audit.

No claim is made that the application is completely secure.

---

# Performance Considerations

The repository contains several implementation choices relevant to application performance:

* Paginated grave retrieval
* Date-range filtering for scheduled activities
* Indexed schedule dates
* Indexed activity-log timestamps
* Indexed login-attempt username/time fields
* Indexed notification status
* Selective Supabase query projections
* Server-side PDF generation
* Next.js application-level optimization

The dashboard PDF route explicitly uses a dynamic Node.js runtime because report generation is performed server-side.

No formal load-testing configuration or production performance benchmark was identified in the repository.

---

# Build & Deployment

## Production Build

The production application is built with:

```bash
npm run build
```

and started with:

```bash
npm run start
```

The Next.js configuration includes server-side handling for PDFKit-related packages required by the dashboard report route.

## Deployment

The repository does not contain a verified deployment target or infrastructure configuration.

No configuration was identified for:

* Docker
* Kubernetes
* Vercel
* AWS
* Azure
* Google Cloud
* GitHub Actions
* GitLab CI

Deployment should therefore be configured according to the target hosting environment rather than inferred from the repository.

---

# Troubleshooting

## Supabase Environment Configuration

If the application reports missing Supabase configuration, verify:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

For privileged server operations, also verify:

```text
SUPABASE_SERVICE_ROLE_KEY
```

---

## Application Redirects to `/service-paused`

TMP contains handling for Supabase project availability conditions.

When a recognized Supabase paused-project condition occurs, the application can redirect users to:

```text
/service-paused
```

Verify the Supabase project status and connectivity.

---

## User Cannot Access Master Features

Verify that:

1. The user is authenticated.
2. `profiles.role` is `master`.
3. `profiles.is_active` is enabled.
4. Required database RLS policies are present.
5. The deployed database schema matches the application's expected schema.

---

## User Account Was Disabled

The authentication context checks:

```text
profiles.is_active
```

A disabled account is signed out and cannot maintain an active application session.

---

## Schedule Attachment Upload Fails

Verify:

* File size does not exceed 1 MB.
* File MIME type is supported.
* The user has the required authorization.
* The `jadwal-tamu-attachment` bucket exists.
* Required Supabase Storage policies are configured.

---

## Database Schema Errors

If the application reports missing tables or columns, compare the deployed Supabase database against:

```text
supabase-schema.sql
supabase/migrations/
lib/supabase/database.types.ts
```

These artifacts represent different parts of the database lifecycle and should be evaluated together when diagnosing schema synchronization issues.

---

# Project Status

The repository represents an implemented administrative application containing working modules for:

* Authentication
* Visitor management
* Cemetery block management
* Grave management
* Visitor scheduling
* Notifications
* User management
* Dashboard reporting
* Activity logging
* Security alerts

The repository currently provides development, build, and lint workflows.

Automated testing, CI/CD, and deployment infrastructure are not currently included in the repository.

The project version declared in `package.json` is:

```text
0.1.0
```

---

# Known Limitations

The following limitations are relevant to the current repository state.

### Automated Testing

No automated unit, integration, or end-to-end testing suite is currently included.

### CI/CD

No CI/CD workflow configuration was identified.

### Deployment Configuration

No deployment-specific infrastructure configuration was identified.

### Route Protection

Authenticated application routes rely primarily on client-side application guards rather than Next.js middleware.

Database RLS and server-side authorization checks provide additional enforcement boundaries.

### Authorization Duplication

The two privileged API route handlers independently implement bearer-token and Master-role verification rather than using a centralized authorization wrapper.

### Remote Data Fetching

The application does not use a dedicated server-state/data-fetching library such as React Query or SWR. Remote data is primarily retrieved imperatively and stored in feature-level component or hook state.

### Database Definition Synchronization

The repository contains database schema definitions, migrations, generated types, and application code that should be treated as a combined source when determining the expected deployed database state.

The supplied artifacts are not completely synchronized in every detail, so the live Supabase database should be treated as the authoritative deployed state when investigating schema discrepancies.

### Environment Example

No `.env.example` file is included in the repository.

### License

No `LICENSE` file or explicit package license declaration was identified.

---

# Contributing

No formal contribution workflow, branch policy, pull-request template, or contribution guide is currently included in the repository.

When modifying the project:

1. Preserve existing feature boundaries.
2. Keep shared infrastructure under `lib/`.
3. Keep reusable UI primitives under `components/ui/`.
4. Keep domain-specific logic inside the appropriate `features/<feature>/` module.
5. Run linting before submitting changes.
6. Verify that the production build succeeds.

Recommended verification commands:

```bash
npm run lint
npm run build
```

---

# License

No license file or explicit repository license declaration was identified in the supplied repository.

Licensing terms therefore cannot be determined from the available source and should not be assumed.

---

# Source of Truth

For implementation behavior, repository artifacts should generally be evaluated in the following order:

1. **Application source code**
2. **Next.js and package configuration**
3. **Database migrations**
4. **Database schema and generated types**
5. **Supporting documentation**

Where this README conflicts with the implementation, the implementation should be treated as the source of truth and the documentation should be updated accordingly.

---

## TMP at a Glance

```text
TMP Project
│
├── Next.js 14 App Router
│
├── Feature-Oriented Architecture
│   ├── Auth
│   ├── Dashboard
│   ├── Visitor Management
│   ├── Visit Scheduling
│   ├── Grave Management
│   ├── Cemetery Block Management
│   ├── Notifications
│   └── User Management
│
├── Shared Infrastructure
│   ├── Authentication Context
│   ├── Notification Context
│   ├── Theme Context
│   ├── Sidebar Context
│   ├── Activity Logging
│   └── PDF Reporting
│
└── Supabase
    ├── Authentication
    ├── PostgreSQL
    ├── Row Level Security
    └── Storage
```

**TMP brings cemetery administration, visitor management, scheduling, reporting, and operational security into a single integrated web application.**
