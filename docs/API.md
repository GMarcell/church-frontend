# API Integration Guide

## Overview

This frontend talks to a backend API through a shared Axios client and feature-specific service modules.

Base URL is configured with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/
```

All requests are sent through [lib/axios.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/axios.ts) and [lib/api.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/api.ts).

## Shared Request Behavior

### Axios Client

[lib/axios.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/axios.ts) configures:

- `baseURL` from `NEXT_PUBLIC_API_URL`
- `withCredentials: true`
- `Content-Type: application/json`
- automatic bearer token injection from local storage
- automatic logout and redirect on `401`

### API Wrapper

[lib/api.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/api.ts) exposes small typed helpers:

- `api.get`
- `api.post`
- `api.put`
- `api.patch`
- `api.delete`

Feature services use these helpers instead of calling Axios directly.

## Response Pattern

Most service functions expect a standard envelope:

```ts
type StandardResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};
```

Typical service behavior:

- call the endpoint
- check `res.success`
- throw an error if false
- return `res.data`

## Authentication Endpoints

Defined in [services/auth.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/auth.ts).

### Login

- Method: `POST`
- Path: `/auth/login`

Expected payload:

```json
{
  "email": "admin@example.com",
  "password": "secret"
}
```

Expected response behavior:

- token may be returned as `access_token` or `token`
- user information may come from `response.data.user`
- missing profile fields may be inferred from the JWT payload

### Register

- Method: `POST`
- Path: `/auth/register`

Used by:

- [services/auth.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/auth.ts)

### Logout

- Method: `POST`
- Path: `/auth/logout`

On success, the frontend clears the local session regardless of returned payload shape.

## Resource Endpoints By Service

### Branches

Defined in [services/branch.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/branch.ts).

- `GET /v1/branches`
- `GET /v1/branches/count`
- `GET /v1/branches/:id`
- `POST /v1/branches`
- `PATCH /v1/branches/:id`
- `DELETE /v1/branches/:id`

### Regions

Defined in [services/region.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/region.ts).

- `GET /v1/regions`
- `GET /v1/regions/count`
- `GET /v1/regions/:id`
- `POST /v1/regions`
- `PATCH /v1/regions/:id`
- `PATCH /v1/regions/:id/coordinator`
- `DELETE /v1/regions/:id`

### Families

Defined in [services/family.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/family.ts).

- `GET /v1/families`
- `GET /v1/families/count`
- `GET /v1/families/:id`
- `POST /v1/families`
- `PATCH /v1/families/:id`
- `DELETE /v1/families/:id`

### Members

Defined in [services/member.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/member.ts).

- `GET /v1/member`
- `GET /v1/member/count`
- `GET /v1/member/:id`
- `GET /v1/member/pelkat/:pelkat`
- `GET /v1/member/count/pelkat`
- `GET /v1/member/count/pelkat/:pelkat`
- `POST /v1/member`
- `PATCH /v1/member/:id`
- `DELETE /v1/member/:id`

Notes:

- pelkat labels are normalized in the frontend
- pelkat count responses are handled defensively because backend shapes may vary

### Attendance

Defined in [services/attendance.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/attendance.ts).

- `GET /attendances`
- `GET /attendances/:id`
- `POST /attendances`
- `PATCH /attendances/:id`
- `DELETE /attendances/:id`

### Users

Defined in [services/user.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/services/user.ts).

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

## Pagination Expectations

Most list APIs are called with `PaginationParams` containing page and limit values.

Examples:

- branches
- regions
- families
- members
- attendance
- users

The frontend uses `toPaginatedResult` from `lib/helper.ts` to normalize list responses into a common shape. This means the backend can be somewhat inconsistent as long as the helper can still derive:

- current page
- page size
- total records
- total pages
- items array

## React Query Pattern

Each resource service usually exports:

- query key builders
- plain async request functions
- `useQuery` hooks
- `useMutation` hooks

Mutation hooks usually invalidate:

- list caches
- detail caches
- count caches where relevant

This pattern keeps feature components thin and centralizes cache behavior in the service layer.

## Error Handling Expectations

Most services follow this rule:

- if `success` is false, throw a descriptive `Error`

UI components are expected to catch and display these messages where appropriate.

Global auth-related error handling is separate:

- any `401` response triggers session clearing and redirect to `/public/login`

## Session-Related Cookies

The frontend writes cookies that support proxy-based redirects:

- `access_token`
- `user_role`
- `user_email`
- `user_name`
- `role_access_config`

These are managed in:

- [lib/auth-session.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/auth-session.ts)
- [lib/rbac-config.ts](/home/admin-ubuntu/grand/church-sytem/church-frontend/lib/rbac-config.ts)

## Adding A New API Resource

Recommended pattern:

1. Add or update the resource types in `type/`
2. Create a new `services/<resource>.ts`
3. Define query keys
4. Add raw request functions
5. Add React Query hooks
6. Invalidate the correct caches on mutations
7. Connect the service hooks to the feature component
8. Add route/menu/RBAC entries if the resource has a new page

## Notes

- The frontend currently expects client-side token storage
- Several services are tolerant of backend response-shape variation
- If backend contracts are standardized further, service normalization logic can be simplified
