# SIMS Frontend

Frontend client for the Student Information Management REST API (SIMS API), built for
**Laboratory Activity II: AI-Assisted Frontend Framework Integration** — a continuation of
Laboratory Activity I (the Laravel-based SIMS API).

This is a **frontend-only** application. It authenticates against and consumes the existing
SIMS API over HTTP; it does not replace the backend, connect to a database directly, or use
mock/hardcoded data for core screens.

## Tech Stack

- React 18 + TypeScript (Vite)
- React Router (routing, protected routes)
- Axios (API client)
- Tailwind CSS (styling)
- Vitest + React Testing Library (automated tests)

## Prerequisites

- Node.js 18+ and pnpm
- The SIMS API (Laboratory Activity I) running locally, migrated and seeded, at `http://localhost:8000`

## Installation

```bash
git clone <repo-url>
cd sims-frontend
pnpm install
```

## Environment Configuration

Copy `.env.example` to `.env` and set the backend base URL:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

No secrets, database credentials, or backend signing keys are stored in this project.

## Running the App

Start the backend first:

```bash
cd sims-api
php artisan serve
```

Then, in this project:

```bash
pnpm run dev
```

The app runs at `http://localhost:5173`.

## Running Tests

```bash
pnpm test
```

## Demo Accounts (seeded by the backend)

| Role | Email | Password |
|---|---|---|
| Administrator | admin@sims.test | password |
| Registrar | registrar@sims.test | password |
| Instructor | instructor1@sims.test | password |
| Instructor | instructor2@sims.test | password |
| Student | student1@sims.test | password |

## Project Structure

```
src/
├── components/    # Reusable UI: forms, tables, layout, nav, SearchableSelect
├── config/        # Role-based navigation config
├── context/       # AuthContext (current user, token, login/logout)
├── hooks/         # useAuth
├── pages/         # Route-level views
├── services/      # API client + one service module per backend resource
├── types/         # TypeScript interfaces for API request/response shapes
├── utils/         # errorState (401/403/404/network mapping), queryParams (spatie filter[] wrapping)
└── tests/         # Vitest setup
```

## Documentation

- [API Integration Map](./API_INTEGRATION_MAP.md) — frontend feature → endpoint → method → role
- [AI Development Log](./AI_DEVELOPMENT_LOG.md) — AI-assisted tasks and human verification
- [Architecture Note](./ARCHITECTURE.md) — routing, API client, auth state, data strategy

## Known Limitations / Backend Notes

- The `/instructors` and `/users` endpoints were added to the backend during this project,
  specifically to support frontend dropdowns (instructor assignment on Course Offerings;
  linking a Student record to a User account).
- `GET /users` and `GET /course-offerings/{id}/students` return pagination fields directly on
  `data` (a different shape than the rest of the API's `{data, meta}` convention) — the
  frontend has a separate `RawPaginatedResponse` type to account for this.
- There is no `GET /grades` list endpoint. Grade entry/editing is folded into the Enrollments
  screen rather than given a standalone page.
