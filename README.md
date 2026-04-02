# Church Frontend

A church management dashboard built with Next.js for handling branches, regions, families, members, attendance, and user access.

This frontend connects to a backend API under the `/api` prefix and provides role-based access for `ADMIN`, `STAFF`, `COORDINATOR`, and `MEMBER` users.

## Overview

The application is designed to support church administration workflows such as:

- Managing branches and regions
- Registering families and household members
- Editing family members directly from the families menu
- Assigning region coordinators
- Viewing member statistics and pelkat summaries
- Recording attendance
- Managing dashboard users and roles
- Allowing members to update their own profile data

## Main Modules

- `Dashboard`: overview cards for branches, regions, and members
- `Branches`: create, update, list, and delete branches
- `Regions`: manage regions and assign coordinators
- `Families`: manage families and edit family members from the family screen
- `Members`: manage member records and member self-service
- `Pelkat Members`: browse members by pelkat
- `Attendance`: track service attendance totals
- `Users`: manage admin, staff, and coordinator accounts
- `Settings`: role-access configuration area for admin users

## Roles

- `ADMIN`: full dashboard access
- `STAFF`: operational access to most management screens
- `COORDINATOR`: scoped access to their assigned region data
- `MEMBER`: self-service access to personal and family member data

Route access is enforced in the frontend through the RBAC utilities in `lib/rbac.ts` and the guard in `components/auth/rbac-guard.tsx`.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Axios
- React Hook Form
- Zod
- Radix UI / shadcn-style UI components

## Project Structure

```text
app/
  dashboard/           Dashboard routes
  public/login/        Login screen
components/
  attendance/          Attendance UI
  branches/            Branch management UI
  dashboard/           Stats and reusable entity manager
  families/            Family management UI
  login/               Authentication form
  members/             Member management and self-service
  regions/             Region management UI
  users/               User management UI
  ui/                  Shared UI primitives
services/              API client modules by resource
type/                  Shared TypeScript types
lib/                   Axios setup, auth session, RBAC, helpers
nav/                   Sidebar menu definitions
schemas/               Validation schemas
```

## API Integration

The frontend expects a backend base URL through:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/
```

Example backend routes used by this project:

- `/auth/login`
- `/auth/member-login`
- `/v1/branches`
- `/v1/regions`
- `/v1/families`
- `/v1/member`
- `/attendances`
- `/users`

Authentication is token-based. The app stores the access token in local storage and attaches it automatically through the Axios interceptor in `lib/axios.ts`.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create or update `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/
```

If you want to use a deployed backend instead of local development, point this value to that API base URL.

### 3. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

The app redirects `/` to `/public/login`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Authentication Notes

- Admin and staff-style login uses email and password
- Member login uses full name and birth date format as provided by the backend flow
- User session data is persisted in the browser via `lib/auth-session.ts`

## Development Notes

- Data fetching is organized per resource inside `services/`
- Generic CRUD screens reuse `components/dashboard/entity-manager.tsx`
- API responses are normalized with helper utilities in `lib/helper.ts`
- Some screens intentionally filter data client-side based on the logged-in role

## Current Highlights

- Family member editing is available directly from the Families menu
- Member self-service includes household editing for family heads
- Dashboard statistics summarize branches, regions, members, and pelkat groups

## Known Notes

- `npm run lint` currently reports an existing warning in `components/datatable.tsx` related to `useReactTable()` and the React Compiler

## Future Improvements

- Add automated tests
- Add giving module screens
- Improve response normalization for more backend payload variations
- Add richer empty states and loading states

## License

This project is currently private and intended for internal church system use.
