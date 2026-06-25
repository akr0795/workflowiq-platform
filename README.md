# WorkflowIQ — Enterprise Workflow Platform

A full-stack-style enterprise workflow management web application built as a personal project. WorkflowIQ provides a unified interface for managing projects, tasks, approvals, team members, and analytics — with role-based access control for admins, managers, and developers.

> **Note:** This is a frontend-only application. Authentication and data are simulated with mock users and in-memory state for demonstration purposes.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Role-Based Access](#role-based-access)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Available Scripts](#available-scripts)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Routes](#routes)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

WorkflowIQ is designed to streamline enterprise operations by centralizing project tracking, task management, approval workflows, and team analytics into a single dashboard. The UI follows modern enterprise design patterns with a collapsible sidebar, responsive layouts, and data visualizations powered by Recharts.

The application uses React Router for navigation, React Context for authentication state, and TanStack Query for async data handling. All business data (projects, tasks, approvals, KPIs) is served from mock datasets in `src/data/mockData.ts`, making it easy to explore the full feature set without a backend.

---

## Features

### Dashboard
- Personalized greeting based on time of day
- KPI cards showing active projects, open tasks, completion rate, and team size
- Charts for project status distribution, task trends, and team productivity
- Recent activity feed

### Projects
- Browse and filter projects by status and priority
- Create and edit projects via modal forms
- Track progress, budgets, timelines, and assigned team members
- Project cards with visual status indicators

### Tasks
- Full task table with sorting and filtering
- Status workflow: Created → In Progress → Review → Done
- Priority levels (low, medium, high, critical)
- Assign tasks to team members with due dates and hour estimates

### Approvals *(Admin & Manager only)*
- Review pending approval requests (leave, expense, resource, project)
- Multi-level approval workflow with comments
- Approve or reject requests with audit trail

### Analytics *(Admin & Manager only)*
- KPI metrics with period-over-period change indicators
- Interactive charts for project and task analytics
- Productivity and performance insights

### Team *(Admin & Manager only)*
- View and manage team member directory
- Add or edit team members with role and department assignment
- Role-based member filtering

### Settings & Profile
- Application preferences and notification settings
- User profile management

### Authentication
- Login and signup UI with form validation
- Protected routes that redirect unauthenticated users to `/auth`
- Role-aware navigation (sidebar items hidden based on role)

---

## Role-Based Access

| Permission          | Admin | Manager | Developer |
|---------------------|:-----:|:-------:|:---------:|
| Dashboard           | ✅    | ✅      | ✅        |
| Projects            | ✅    | ✅      | ✅        |
| Tasks               | ✅    | ✅      | ✅        |
| Approvals           | ✅    | ✅      | ❌        |
| Analytics           | ✅    | ✅      | ❌        |
| Team Management     | ✅    | ✅      | ❌        |
| Settings / Profile  | ✅    | ✅      | ✅        |
| Manage Users        | ✅    | ❌      | ❌        |
| Export Reports      | ✅    | ✅      | ❌        |

---

## Tech Stack

| Category        | Technology                                      |
|-----------------|-------------------------------------------------|
| Build Tool      | [Vite](https://vitejs.dev/) 5.x                 |
| Framework       | [React](https://react.dev/) 18                  |
| Language        | [TypeScript](https://www.typescriptlang.org/)   |
| Styling         | [Tailwind CSS](https://tailwindcss.com/) 3.x    |
| UI Components   | [shadcn/ui](https://ui.shadcn.com/) + Radix UI  |
| Routing         | [React Router](https://reactrouter.com/) 6.x    |
| Data Fetching   | [TanStack Query](https://tanstack.com/query)    |
| Charts          | [Recharts](https://recharts.org/)               |
| Forms           | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons           | [Lucide React](https://lucide.dev/)             |
| Notifications   | [Sonner](https://sonner.emilkowal.ski/)         |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher — [Download](https://nodejs.org/)
- **npm** 9 or higher (bundled with Node.js)

Verify your installation:

```sh
node --version   # should be v18+
npm --version    # should be 9+
```

---

## Installation & Setup

### 1. Clone the repository

```sh
git clone https://github.com/akr0795/enterprise-workflow-platform.git
cd enterprise-workflow-platform
```

> If you downloaded the project as a ZIP, navigate into the inner `enterprise-workflow-platform` folder that contains `package.json`.

### 2. Install dependencies

```sh
npm install
```

This installs all required packages listed in `package.json`, including React, Vite, Tailwind CSS, and shadcn/ui components.

### 3. Start the development server

```sh
npm run dev
```

The app will be available at:

- **Local:** [http://localhost:8080](http://localhost:8080)
- **Network:** accessible on your LAN at the IP shown in the terminal

The dev server supports hot module replacement (HMR) — changes to source files reload instantly in the browser.

### 4. Log in with a demo account

Open [http://localhost:8080/auth](http://localhost:8080/auth) and sign in using one of the [demo accounts](#demo-accounts) below.

### 5. Build for production (optional)

```sh
npm run build
npm run preview
```

`npm run build` outputs optimized static files to the `dist/` folder. `npm run preview` serves the production build locally for testing.

---

## Available Scripts

| Command              | Description                                        |
|----------------------|----------------------------------------------------|
| `npm run dev`        | Start Vite dev server on port 8080                 |
| `npm run build`      | Type-check and build for production to `dist/`     |
| `npm run build:dev`  | Build in development mode                          |
| `npm run preview`    | Preview the production build locally               |
| `npm run lint`       | Run ESLint across the project                      |

---

## Demo Accounts

All demo accounts use the password **`password`**.

| Role      | Email               | Name           | Department            |
|-----------|---------------------|----------------|-----------------------|
| Admin     | `admin@tcs.com`     | Rajesh Kumar   | IT Operations         |
| Manager   | `manager@tcs.com`   | Priya Sharma   | Software Development  |
| Developer | `developer@tcs.com` | Amit Patel   | Software Development  |

Try logging in as different roles to see how navigation and page access change.

---

## Project Structure

```
enterprise-workflow-platform/
├── public/                  # Static assets (robots.txt, placeholder.svg)
├── src/
│   ├── components/
│   │   ├── common/          # Shared components (ProtectedRoute, etc.)
│   │   ├── dashboard/       # Dashboard widgets and charts
│   │   ├── layout/          # Sidebar, Header, MainLayout
│   │   ├── projects/        # Project cards and forms
│   │   ├── tasks/           # Task table, badges, forms
│   │   ├── team/            # Team member forms
│   │   └── ui/              # shadcn/ui primitives
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state and role permissions
│   ├── data/
│   │   └── mockData.ts      # Mock projects, tasks, KPIs, approvals
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn, etc.)
│   ├── pages/               # Route-level page components
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces and types
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles and CSS variables
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
├─────────────────────────────────────────────────────┤
│  React Router                                        │
│    ├── /auth          → Auth page (public)           │
│    └── ProtectedRoute → MainLayout                   │
│          ├── /          → Dashboard                  │
│          ├── /projects  → Projects                   │
│          ├── /tasks     → Tasks                      │
│          ├── /approvals → Approvals (role-gated)     │
│          ├── /analytics → Analytics (role-gated)     │
│          ├── /team      → Team (role-gated)          │
│          ├── /settings  → Settings                   │
│          └── /profile   → Profile                    │
├─────────────────────────────────────────────────────┤
│  AuthContext          → Mock auth + RBAC             │
│  TanStack Query       → Async state management       │
│  mockData.ts          → In-memory demo data          │
└─────────────────────────────────────────────────────┘
```

**Authentication flow:**
1. User submits credentials on `/auth`
2. `AuthContext` validates against `MOCK_USERS` (password: `password`)
3. On success, user state is stored in React Context
4. `ProtectedRoute` guards all app routes; unauthenticated users are redirected to `/auth`
5. Sidebar navigation filters items based on `hasRole()`

---

## Routes

| Path          | Page        | Access              |
|---------------|-------------|---------------------|
| `/auth`       | Login/Signup| Public              |
| `/`           | Dashboard   | Authenticated       |
| `/projects`   | Projects    | Authenticated       |
| `/tasks`      | Tasks       | Authenticated       |
| `/approvals`  | Approvals   | Admin, Manager      |
| `/analytics`  | Analytics   | Admin, Manager      |
| `/team`       | Team        | Admin, Manager      |
| `/settings`   | Settings    | Authenticated       |
| `/profile`    | Profile     | Authenticated       |

---

## Deployment

This is a static SPA. Build and deploy the `dist/` folder to any static host:

```sh
npm run build
```

Compatible platforms include **Vercel**, **Netlify**, **GitHub Pages**, **Cloudflare Pages**, or any web server (Nginx, Apache).

For client-side routing, configure your host to serve `index.html` for all routes (SPA fallback).

---

## License

Private — personal project. All rights reserved.
