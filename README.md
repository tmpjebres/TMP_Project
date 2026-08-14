# TMP Project

### Sistem Administrasi Taman Makam Pahlawan

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-000000?logo=next.js\&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-06B6D4?logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.110.8-3ECF8E?logo=supabase\&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-2ea44f)](#project-status)

> A web-based administrative system for managing Taman Makam Pahlawan, including cemetery records, visitors, activities, notifications, and reporting.

---

## Overview

**TMP Project** is a web-based administrative platform designed to simplify and centralize the management of **Taman Makam Pahlawan (TMP)**.

The system brings essential administrative and operational activities into a single application, providing a more organized way to manage cemetery information, visitor activities, scheduling, users, and reports.

The application supports role-based access for:

* **Master** — administrative and management operations
* **Operator** — day-to-day operational activities

---

## Features

<table>
<tr>
<td width="50%">

### 🪦 Cemetery Management

* Cemetery block management
* Grave records
* Capacity and occupancy tracking
* Search and organization

</td>
<td width="50%">

### 👥 Visitor Management

* Individual visitors
* Group / organizational visitors
* Visitor records
* Photo capture and upload

</td>
</tr>

<tr>
<td width="50%">

### 📅 Activity Scheduling

* Calendar-based scheduling
* Activity information
* Schedule conflict detection
* Attachments and external links
* Activity history

</td>
<td width="50%">

### 🔔 Notifications

* Upcoming activity notifications
* Same-day notifications
* Notification history
* Security alerts

</td>
</tr>

<tr>
<td width="50%">

### 👤 User Management

* User administration
* Role management
* Account activation
* User activity history

</td>
<td width="50%">

### 📊 Dashboard & Reporting

* Visitor statistics
* Cemetery occupancy
* Activity summaries
* Period-based reporting
* PDF reports

</td>
</tr>
</table>

---

## Technology Stack

| Technology       | Role                                  |
| ---------------- | ------------------------------------- |
| **Next.js**      | Application framework                 |
| **React**        | User interface                        |
| **TypeScript**   | Application development               |
| **Tailwind CSS** | Styling                               |
| **Supabase**     | Authentication, database, and storage |
| **PostgreSQL**   | Data persistence                      |
| **Recharts**     | Data visualization                    |
| **Lucide React** | Interface icons                       |
| **PDFKit**       | PDF report generation                 |

---

## Architecture

TMP uses a **feature-oriented architecture** built on the **Next.js App Router**.

```text
┌──────────────────────────────────────┐
│           Next.js Application        │
│      Routes · Pages · Layouts        │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│            Feature Modules           │
│                                      │
│ Auth · Dashboard · Visitors          │
│ Scheduling · Cemetery · Users        │
│ Notifications                        │
└──────────────────┬───────────────────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
┌──────────────────┐ ┌─────────────────┐
│ Shared Services  │ │ Server Handlers │
│ UI · Context     │ │ Reports · Users │
│ Utilities        │ │                 │
└────────┬─────────┘ └────────┬────────┘
         │                    │
         └─────────┬──────────┘
                   ▼
          ┌─────────────────┐
          │    Supabase     │
          │ Auth · Database │
          │ Storage · RLS   │
          └─────────────────┘
```

The application separates domain-specific features from shared infrastructure while using Supabase as the primary backend platform.

---

## Getting Started

### Prerequisites

Make sure the following are available:

* Node.js
* npm
* A Supabase project

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Important:** The Supabase service-role key is a server-side secret and must never be exposed to the client or committed to the repository.

### Database

The project includes its database schema and migrations under:

```text
supabase-schema.sql
supabase/migrations/
```

Apply the required database configuration to your Supabase project before running the application.

### Run Development Server

```bash
npm run dev
```

The application will start using the standard Next.js development server.

### Production Build

```bash
npm run build
npm run start
```

---

## Project Structure

The project follows a feature-oriented structure:

```text
.
├── app/                 # Application routes and pages
├── components/          # Shared UI components
├── features/            # Domain-specific modules
├── lib/                 # Shared infrastructure and utilities
├── types/               # Shared TypeScript types
├── supabase/            # Database migrations
├── data/                # Supporting project data
├── package.json
└── next.config.js
```

Each major application domain is organized as an independent feature module to keep related UI, logic, and data operations together.

---

## Security

TMP applies security controls across the application and database layers, including:

* Authentication and role-based authorization
* PostgreSQL Row Level Security
* Server-side handling of privileged operations
* Private file storage
* Signed file access
* Account activation controls
* Activity and security logging
* Input validation

Sensitive credentials are restricted to server-side environments.

---

## Development

Available commands:

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start development server     |
| `npm run build` | Build production application |
| `npm run start` | Start production server      |
| `npm run lint`  | Run linting                  |

TypeScript is configured with strict mode enabled.

---

## Project Status

**Active Development**

Core application functionality currently includes:

* Authentication
* Cemetery management
* Visitor management
* Activity scheduling
* Notifications
* User management
* Dashboard and reporting
* Activity and security logging

---

## License

This project is intended for project-specific use.

Redistribution or reuse should follow the terms defined by the project owner.

---

<p align="center">
  Built with Next.js, TypeScript, and Supabase.
</p>
