# Church Frontend

Frontend dashboard for the church management system. This app is built with Next.js and provides authenticated, role-based access to operational modules such as branches, regions, families, members, attendance, users, and access settings.

Additional docs:

- [docs/ARCHITECTURE.md](/home/admin-ubuntu/grand/church-sytem/church-frontend/docs/ARCHITECTURE.md)
- [docs/API.md](/home/admin-ubuntu/grand/church-sytem/church-frontend/docs/API.md)

## What This Repo Does

The application is designed for church administration and member data workflows. It includes:

- Authentication with email and password
- Dashboard pages grouped by ministry operations
- Role-based route protection for `ADMIN`, `STAFF`, `COORDINATOR`, and `MEMBER`
- CRUD-style management flows backed by an external API
- Configurable page access rules from the Settings screen
- Responsive dashboard navigation for desktop and mobile

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Radix UI primitives with local UI components

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/
```

`NEXT_PUBLIC_API_URL` should point to the backend API base URL used by this frontend.

### 3. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

The root route `/` redirects to `/public/login`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Authentication Flow

- The login page lives at `/public/login`
- Users sign in with email and password
- On successful login, the frontend stores:
  - `access_token` in local storage and a cookie
  - serialized user data in local storage
  - role and profile summary cookies used by route protection
- Axios attaches the bearer token automatically on requests
- A `401` response clears the session and redirects the browser back to `/public/login`

Relevant files:

- [components/login/form.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/login/form.tsx)
- [services/auth.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/auth.ts)
- [lib/auth-session.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/auth-session.ts)
- [lib/axios.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/axios.ts)

## Roles And Access Control

Supported roles:

- `ADMIN`
- `STAFF`
- `COORDINATOR`
- `MEMBER`

Access control is enforced in two layers:

1. Edge-style request protection in [proxy.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/proxy.ts)
2. Client-side route guarding in [components/auth/rbac-guard.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/auth/rbac-guard.tsx)

Default route permissions are defined in [lib/rbac.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac.ts).

The Settings page allows admins to change which roles can access each dashboard page. Those overrides are stored in local storage and mirrored to cookies so redirects and client UI stay in sync.

Relevant files:

- [lib/rbac.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac.ts)
- [lib/rbac-config.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac-config.ts)
- [components/settings/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/settings/index.tsx)

## Routes

Public routes:

- `/`
- `/public`
- `/public/login`

Dashboard routes:

- `/dashboard`
- `/dashboard/branches`
- `/dashboard/regions`
- `/dashboard/families`
- `/dashboard/members`
- `/dashboard/pelkat-members`
- `/dashboard/attendance`
- `/dashboard/users`
- `/dashboard/settings`

Special route:

- `/dashboard/evets` redirects to `/dashboard/attendance`

## Main Modules

### Dashboard

Summary cards and statistics for operational visibility.

Files:

- [app/dashboard/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/page.tsx)
- [components/dashboard/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/dashboard/index.tsx)

### Branches

Branch listing and branch management flows.

Files:

- [app/dashboard/branches/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/branches/page.tsx)
- [components/branches/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/branches/index.tsx)
- [services/branch.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/branch.ts)

### Regions

Region management and coordinator-related workflows.

Files:

- [app/dashboard/regions/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/regions/page.tsx)
- [components/regions/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/regions/index.tsx)
- [services/region.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/region.ts)

### Families

Family records and household-oriented editing flows.

Files:

- [app/dashboard/families/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/families/page.tsx)
- [components/families/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/families/index.tsx)
- [services/family.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/family.ts)

### Members

Member data management plus member-facing self-service functionality.

Files:

- [app/dashboard/members/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/members/page.tsx)
- [components/members/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/members/index.tsx)
- [components/members/self-service.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/members/self-service.tsx)
- [services/member.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/member.ts)

### Pelkat Members

Pelkat-oriented member browsing screen.

Files:

- [app/dashboard/pelkat-members/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/pelkat-members/page.tsx)
- [components/members/pelkat-menu.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/members/pelkat-menu.tsx)

### Attendance

Attendance records and summary views.

Files:

- [app/dashboard/attendance/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/attendance/page.tsx)
- [components/attendance/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/attendance/index.tsx)
- [services/attendance.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/attendance.ts)

### Users

Admin-facing user management.

Files:

- [app/dashboard/users/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/users/page.tsx)
- [components/users/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/users/index.tsx)
- [services/user.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/user.ts)

### Settings

Role access configuration for dashboard pages.

Files:

- [app/dashboard/settings/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/settings/page.tsx)
- [components/settings/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/settings/index.tsx)

## App Structure

```text
app/
  dashboard/           Protected dashboard routes
  public/login/        Public login page
components/
  attendance/          Attendance feature UI
  auth/                Client-side RBAC guard
  branches/            Branch feature UI
  dashboard/           Dashboard stats and shared CRUD helpers
  families/            Family feature UI
  layout/              Navbar and sidebar
  login/               Login form
  members/             Member feature UI and self-service
  regions/             Region feature UI
  settings/            Role access management screen
  ui/                  Shared UI building blocks
  users/               User management UI
lib/
  api.ts               Small typed wrapper around Axios methods
  auth-session.ts      Session persistence and user store hooks
  axios.ts             Axios instance and auth interceptors
  query-providers.tsx  React Query provider
  rbac.ts              Roles, route permissions, access helpers
  rbac-config.ts       Stored page-access overrides
nav/
  const.ts             Sidebar menu definition
schemas/
  auth.schema.ts       Login validation schema
services/
  *.ts                 API calls grouped by resource
type/
  *.ts                 Shared feature types
proxy.ts               Route protection and redirect logic
```

## Data Layer

The app uses a simple service pattern:

- `services/*.ts` defines API calls by resource
- `lib/api.ts` wraps the shared Axios client with typed helpers
- `lib/axios.ts` configures base URL, credentials, auth header injection, and `401` handling

This keeps feature components focused on UI while service files handle HTTP details.

## Navigation And Layout

The dashboard shell is composed from:

- [app/dashboard/layout.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/layout.tsx)
- [components/layout/navbar.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/layout/navbar.tsx)
- [components/layout/sidebar.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/layout/sidebar.tsx)

The sidebar menu items come from [nav/const.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/nav/const.ts) and are filtered by role before rendering.

## Backend Expectations

This frontend expects a backend that provides authentication and resource endpoints. Current service files indicate integration points for:

- `/auth/login`
- branch endpoints
- region endpoints
- family endpoints
- member endpoints
- attendance endpoints
- user endpoints

The exact path shapes are defined inside the files under [services](/home/admin-ubuntu/grand/church-sytem/church-frontend/services).

## Notes For Development

- The repo currently has no automated test suite configured
- `npm run lint` succeeds with one existing warning in [components/datatable.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/datatable.tsx#L48)
- Session and access control behavior depend on both local storage and cookies
- Role access changes made in Settings are local to the current browser unless the backend later persists them

## Suggested Onboarding Path

If you are new to the codebase, read these files first:

1. [app/layout.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/layout.tsx)
2. [app/dashboard/layout.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/layout.tsx)
3. [nav/const.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/nav/const.ts)
4. [lib/rbac.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac.ts)
5. [lib/auth-session.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/auth-session.ts)
6. [services/auth.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/auth.ts)
7. One feature module such as [components/members/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/members/index.tsx)

## License

Private internal project.
