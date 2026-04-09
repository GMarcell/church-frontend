# Architecture

## Overview

This frontend is a Next.js App Router dashboard for church operations. The application is organized around feature modules such as branches, regions, families, members, attendance, users, and settings.

The app uses:

- Next.js for routing and layout composition
- React Query for server-state fetching and mutation
- Axios for API communication
- local storage and cookies for session persistence
- client and proxy-based RBAC checks for page access

## High-Level Request Flow

1. A user opens the app and is redirected to `/public/login` if not authenticated.
2. After login, the app stores the access token and user metadata locally.
3. Protected dashboard routes are checked in `proxy.ts` using cookies.
4. The dashboard shell renders the sidebar, navbar, and route content.
5. Feature pages call hooks from `services/*.ts`.
6. Service hooks use the shared Axios client and React Query cache.

## Main Layers

### App Router Layer

The `app/` directory defines route entry points and top-level layouts.

Important files:

- [app/layout.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/layout.tsx)
- [app/dashboard/layout.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/layout.tsx)
- [app/public/login/page.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/public/login/page.tsx)

Responsibilities:

- global providers
- metadata and global styles
- dashboard shell composition
- route-level page wiring

### Layout Layer

The dashboard shell is composed from:

- [components/layout/sidebar.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/layout/sidebar.tsx)
- [components/layout/navbar.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/layout/navbar.tsx)

Responsibilities:

- responsive navigation
- menu rendering by role
- user profile display
- logout trigger

Menu definitions come from [nav/const.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/nav/const.ts).

### Feature Layer

Each main dashboard area has a feature component under `components/<feature>/` and a route page under `app/dashboard/...`.

Examples:

- branches: [components/branches/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/branches/index.tsx)
- families: [components/families/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/families/index.tsx)
- members: [components/members/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/members/index.tsx)
- attendance: [components/attendance/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/attendance/index.tsx)

Responsibilities:

- page-specific UI
- table and form orchestration
- calls into the service layer
- role-sensitive rendering when needed

### Shared CRUD Layer

The repo includes a reusable CRUD UI abstraction in [components/dashboard/entity-manager.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/dashboard/entity-manager.tsx).

It centralizes:

- searchable entity lists
- create/edit dialogs
- delete actions
- pagination controls
- generic field and column configuration

Feature modules can plug their own fields, columns, mappers, and submit handlers into this shared component.

### Service Layer

The `services/` directory groups API access by resource.

Examples:

- [services/branch.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/branch.ts)
- [services/region.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/region.ts)
- [services/family.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/family.ts)
- [services/member.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/member.ts)
- [services/attendance.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/attendance.ts)
- [services/user.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/user.ts)

Common pattern:

- export query keys
- export raw request functions
- export React Query hooks
- invalidate list/detail/count caches after mutations

### Infrastructure Layer

Core shared infrastructure lives in `lib/`.

Important files:

- [lib/api.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/api.ts)
- [lib/axios.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/axios.ts)
- [lib/query-providers.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/query-providers.tsx)
- [lib/auth-session.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/auth-session.ts)
- [lib/rbac.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac.ts)
- [lib/rbac-config.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac-config.ts)

Responsibilities:

- API client setup
- auth token injection
- query client bootstrapping
- session persistence
- role access resolution
- stored access-config overrides

## Authentication Architecture

The login UI submits credentials through [services/auth.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/auth.ts).

After a successful login:

- token is read from `access_token` or `token`
- JWT payload is decoded when necessary
- normalized user data is persisted through [lib/auth-session.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/auth-session.ts)

Session state is kept in:

- local storage for client access
- cookies for proxy redirects and route protection

Axios then attaches `Authorization: Bearer <token>` automatically on future requests.

## Access Control Architecture

Access control is enforced in two places.

### Request-Time

[proxy.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/proxy.ts) checks:

- unauthenticated access to `/dashboard/*`
- authenticated access to `/public/login`
- route-to-role compatibility using the stored role access config cookie

### Client-Time

[components/auth/rbac-guard.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/auth/rbac-guard.tsx) protects rendered pages and shows an access-restricted state for invalid roles.

### Configurable Access

[components/settings/index.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/settings/index.tsx) allows admins to override route permissions in the browser.

Notes:

- settings is intentionally locked to `ADMIN`
- overrides are currently browser-local, not backend-persisted

## Data Fetching Pattern

Most feature modules follow the same pattern:

1. Define query keys
2. Define fetch/create/update/delete functions
3. Wrap them with React Query hooks
4. Invalidate relevant caches after mutation

This keeps data access predictable and consistent across modules.

## Backend Contract Style

The frontend expects many endpoints to return a shared response envelope similar to:

```ts
type StandardResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};
```

For list endpoints, some services normalize varying payload shapes into a shared paginated structure through helper utilities in `lib/helper.ts`.

## Notable Design Choices

- Session is client-managed instead of using server session rendering
- Route access is configurable from the UI
- Feature services own their own cache invalidation logic
- Shared CRUD UI reduces duplication across management screens
- Some backend responses are normalized defensively because payload shapes may vary

## Known Gaps

- No automated test suite yet
- Role access settings are not persisted server-side
- Some backend payload normalization is heuristic
- `npm run lint` currently reports an existing React Compiler warning in `components/datatable.tsx`

## Suggested Files To Read

If you want to understand the repo quickly, read in this order:

1. [app/layout.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/layout.tsx)
2. [app/dashboard/layout.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/app/dashboard/layout.tsx)
3. [proxy.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/proxy.ts)
4. [lib/rbac.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac.ts)
5. [lib/auth-session.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/auth-session.ts)
6. [services/auth.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/auth.ts)
7. [components/dashboard/entity-manager.tsx](/home/admin-ubuntu/grand/church-sytem/church-frontend/components/dashboard/entity-manager.tsx)
