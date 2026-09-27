# Architecture Note

## Routing

`react-router-dom`, with routes nested in two layers:

```
/login                          (public)
ProtectedRoute                  (redirects to /login if unauthenticated)
  └── AppLayout                 (sidebar nav + logout, role-filtered)
        ├── /                   Dashboard
        ├── /students
        ├── /programs
        ├── /courses
        ├── /academic-terms
        ├── /course-offerings
        ├── /course-offerings/:id/students
        ├── /enrollments
        ├── /academic-record
        └── /profile
```

`ProtectedRoute` waits for the initial `/auth/me` check (`isLoading`) before deciding whether to
redirect, so a page refresh with a valid stored token doesn't briefly flash the login page.
`AppLayout` filters the sidebar's items through `config/navigation.ts`, which maps each nav
entry to the roles allowed to see it — this is presentation only, never enforcement (see
Security Boundary below).

## API Client / Service Layer

A single Axios instance (`services/apiClient.ts`) centralizes:
- Base URL from `VITE_API_BASE_URL`
- Bearer token attachment via a request interceptor (reads from `localStorage`)
- Response envelope unwrapping: the backend's `{success, message, data}` shape is unwrapped to
  just `data` for every 2xx response, so call sites work with the actual resource directly
- A global 401 handler: dispatches a `sims:unauthorized` custom event, caught by `AuthContext`
  to clear auth state without every component needing its own 401 logic

Each backend resource has its own `services/<resource>Service.ts` module (thin functions
wrapping `apiClient` calls) and a matching `types/<resource>.ts` file. Two pagination shapes
exist because the backend itself uses two conventions: `PaginatedResponse<T>` (`{data, meta}`,
most endpoints) and `RawPaginatedResponse<T>` (pagination fields directly on `data`, used by
`/users` and `/course-offerings/{id}/students`).

List-filtering params are routed through `utils/queryParams.ts`'s `toSpatieParams()`, which
wraps filterable fields as `filter[key]=value` to match `spatie/laravel-query-builder`'s
convention — `sort`/`page`/`per_page` stay as bare params, matching that package's own rules.

## Authentication State

`AuthContext` + `useAuth()` hold `user` and `isLoading` in React state (not Redux/Zustand —
unnecessary at this scale). Only the token persists in `localStorage`; `user` is always
re-fetched from `/auth/me` on load rather than cached, so a stale/tampered client-side user
object can never be trusted as source of truth. `login()`/`logout()` both go through
`authService`, so the real backend endpoints are always the actual authority on session state.

## Security Boundary

Every role-based UI decision (hidden nav items, hidden buttons, a derived-options fallback for
roles that can't hit an admin-only list endpoint) is a **presentation** choice, not a security
control. The backend's route middleware and Policies (`StudentPolicy`, `EnrollmentPolicy`,
`GradePolicy`) are the only real authorization boundary — confirmed throughout development by
testing that non-permitted roles get a real `403` from the API itself, not just a hidden
button. Course Offerings is the one place this gap is visible in the backend itself (no
route/policy restriction currently applied) — documented in the README and Integration Map
rather than papered over by the frontend.

## Components & Forms

Every resource's create/edit form follows the same shape: local `useState` for the form fields,
`fieldErrors` (mapped from a 422's `errors` object) and `generalError` (network/403/generic
fallback) as separate state, and an `isSubmitting` flag disabling the submit button mid-request.
This consistency is deliberate — it's what let later modules (Courses, Academic Terms,
Enrollments, Grades) reuse the same pattern with minimal changes once Programs established it.

`SearchableSelect` is the one shared, non-trivial UI component — a small typeahead built
in-house (rather than a dependency) once plain `<select>`s became unusable for lists like 100
students or 20 course offerings.

## State & Data Management

No global state library. Each list page owns its own `useState`/`useCallback` for filters, sort,
page, and fetched data; a `useEffect` re-fetches whenever those change. Mutations
(create/update/delete) re-trigger the same fetch function afterward rather than optimistically
patching local state, keeping the displayed list guaranteed consistent with the backend after
every write. `getErrorState()` (`utils/errorState.ts`) gives a single, consistent mapping from
an Axios error to `forbidden` / `notfound` / `network` / `generic`, used identically across
every list page's error handling.

## Testing

Vitest + React Testing Library, with `apiClient` mocked via Vitest's `__mocks__` convention so
tests never touch the real backend. Four required categories are covered: an auth-flow test
(login success/failure through the real `AuthContext`), an API-integrated list test (Programs,
covering loading/empty/search-param states), a form-validation test (422 field-mapping, tested
at the form-component boundary rather than through a full page), and a protected-route test
(loading/redirect/authenticated states, with `useAuth` itself mocked).
