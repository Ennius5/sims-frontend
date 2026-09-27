# AI Development Log

AI tool used throughout: **Claude**. This log summarizes engineering use of AI across the
project, per the lab's required format. Entries are grouped by feature area in build order.

> Note: this draft was generated from the actual development conversation. Fill in the
> **Evidence** column with your real commit hashes / screenshots / file paths before submission.

| # | Task | AI Tool | Prompt Summary | Result | Human Review | Evidence |
|---|---|---|---|---|---|---|
| 1 | Project scaffolding | Claude | Set up Vite + React + TS project with Tailwind, Axios, React Router | Install/config commands for Vite, Tailwind v4 plugin, folder structure | Ran commands myself, confirmed `pnpm run dev` served the default page before proceeding | `vite.config.ts`, initial commit |
| 2 | Linter choice | Claude | Asked which linter to pick at Vite scaffold prompt | Recommendation: ESLint over Oxlint, with reasoning | Selected ESLint based on explanation | — |
| 3 | API client & auth | Claude | Build a centralized Axios client with token attachment, envelope unwrapping, and 401 handling | `apiClient.ts`, `authService.ts` | Reviewed the 401 event-based redirect approach; verified `/auth/login` and `/auth/me` round-tripped against the real backend | `services/apiClient.ts`, `services/authService.ts` |
| 4 | Auth state & protected routing | Claude | React context for auth state, protected route wrapper | `AuthContext.tsx`, `useAuth.ts`, `ProtectedRoute.tsx` | Verified redirect-to-login and redirect-back-after-login behavior manually | `context/AuthContext.tsx`, `components/ProtectedRoute.tsx` |
| 5 | Login page | Claude | Login form with field-level 422 error mapping | `LoginPage.tsx` | Tested valid login, invalid credentials (confirmed backend returns error under `errors.email`, not a generic message) | `pages/LoginPage.tsx` |
| 6 | App shell & role-aware nav | Claude | Sidebar layout, logout button, nav items filtered by role | `AppLayout.tsx`, `config/navigation.ts` | Compared nav visibility across admin vs. student login; confirmed logout clears state | `components/AppLayout.tsx` |
| 7 | Programs module | Claude | Full CRUD + search/filter/sort/pagination for the simplest resource, to use as a template | `programService.ts`, `ProgramForm.tsx`, `ProgramsPage.tsx`, `Pagination.tsx` | Verified pagination shape against a real `GET /programs` response (`meta.links` differs from initial assumption); tested duplicate-`code` 422; confirmed non-admin/registrar gets a real 403 | `services/programService.ts` |
| 8 | Courses module | Claude | Same CRUD shape as Programs, with a `units` field | `courseService.ts`, `CourseForm.tsx`, `CoursesPage.tsx` | Tested `units` out-of-range (1–10) validation | `services/courseService.ts` |
| 9 | Academic Terms module | Claude | Same shape, with date fields and a cross-field validation rule | `academicTermService.ts`, `AcademicTermForm.tsx`, `AcademicTermsPage.tsx` | Tested `end_date` before `start_date` and duplicate year+semester 422s | `services/academicTermService.ts` |
| 10 | Course Offerings module | Claude | CRUD with course/term/instructor dropdowns | `courseOfferingService.ts`, `CourseOfferingForm.tsx`, `CourseOfferingsPage.tsx` | Corrected the type after seeing a real response (nested `course`/`academic_term`/`instructor`, not flat FKs) | `types/courseOffering.ts` |
| 11 | Instructor picker | Claude | Initially derived instructor list from existing offerings (no directory endpoint existed); later replaced with a real `/instructors` endpoint I added to the backend | Derived-list workaround, then a clean dropdown once the endpoint existed | Decided to add the backend endpoint rather than keep the workaround | `services/courseOfferingService.ts` (`listInstructors`) |
| 12 | Course Offerings role-gating bug | Claude | Diagnosed why students saw an empty course dropdown | Root cause: "New Offering" button was visible to all roles, and its form called admin/registrar-only endpoints, which 403'd silently for a student | Verified fix restored expected behavior for admin/registrar and hid the action entirely for other roles | `pages/CourseOfferingsPage.tsx` |
| 13 | Students module | Claude | List/CRUD + search/filter/pagination, plus linking a Student to a User account | `studentService.ts`, `StudentForm.tsx`, `StudentsPage.tsx`, `userService.ts` | Confirmed role-scoped 403 (student index is admin/registrar only) renders a dedicated access-denied panel rather than a blank page | `pages/StudentsPage.tsx` |
| 14 | Enrollments module | Claude | List (backend-scoped by role), create, status update, delete | `enrollmentService.ts`, `EnrollmentForm.tsx`, `EnrollmentsPage.tsx` | Verified list scoping differs correctly across admin/instructor/student logins | `pages/EnrollmentsPage.tsx` |
| 15 | Search-not-filtering bug (Programs/Courses/Students/Course Offerings) | Claude | Diagnosed why `?search=...` returned the full unfiltered list | Root cause: `spatie/laravel-query-builder` requires `filter[search]=...`, not a bare `search=` param; confirmed against the actual `ProgramController` code | `toSpatieParams` helper applied across five service files | Reviewed the controller's `allowedFilters()` call to confirm the diagnosis before changing any frontend code | `utils/queryParams.ts` |
| 16 | Enrollment status-update 422 | Claude | Diagnosed a 422 on `PATCH /enrollments/{id}` with only `{status}` | Root cause: `EnrollmentRequest` required all fields unconditionally, even on update | Chose to fix `EnrollmentRequest` (Laravel `sometimes` rule on update) rather than the frontend workaround | Backend: `app/Http/Requests/EnrollmentRequest.php` |
| 17 | SearchableSelect component | Claude | Built a reusable typeahead to replace large plain `<select>` dropdowns (100 students, 20 offerings, etc.) | `components/SearchableSelect.tsx`, applied across Enrollment/CourseOffering/Student forms and filter bars | Verified typing filters correctly and selection still drives the real backend request | `components/SearchableSelect.tsx` |
| 18 | Grades | Claude | Folded grade entry into the Enrollments page (no `GET /grades` list endpoint exists) | `gradeService.ts`, `GradeForm.tsx`, wired into `EnrollmentsPage.tsx` | Tested instructor grading their own offering vs. a 403 on one they don't teach | `services/gradeService.ts` |
| 19 | Academic Record page | Claude | Admin/registrar student-picker view; student's own record via `student_id` on `/auth/me` | `academicRecordService.ts`, `AcademicRecordPage.tsx` | Confirmed `/auth/me` returns `student_id` for student-role accounts | `pages/AcademicRecordPage.tsx` |
| 20 | Dashboard & Profile pages | Claude | Role-aware summary cards (derived from `meta.total` on `per_page=1` requests); static account info page | `DashboardPage.tsx`, `ProfilePage.tsx` | Verified card sets differ correctly by role | `pages/DashboardPage.tsx` |
| 21 | Automated tests | Claude | Vitest + Testing Library setup; auth-flow, list-integration, form-validation, and protected-route tests | Test config, `apiClient` mock, 4 test files | Ran `pnpm test` after each addition; diagnosed and fixed two real config issues (`vitest/config` import, `jest-dom/vitest` subpath) and one real accessibility bug (`ProgramForm` missing `htmlFor`/`id` pairs, caught by a failing test) | `src/**/__tests__/*.test.tsx` |
| 22 | Course Offering students empty-state page | Claude | Built the previously-missing `/course-offerings/:id/students` route | `CourseOfferingStudentsPage.tsx` | Confirmed the endpoint's distinct pagination shape (fields on `data` directly) against a real response before writing the type | `pages/CourseOfferingStudentsPage.tsx` |

## Summary

Every AI-generated suggestion in this log was tested against the real running backend before
being accepted — not just read and approved. Several genuine bugs were found this way rather
than assumed away: a role-gating gap that silently broke a dropdown for students, a
query-builder parameter mismatch that made search silently no-op, an overly strict validation
rule that blocked partial updates, and a missing label/input association that a failing test
caught directly. In each case, the root cause was traced to either the frontend or the backend
specifically (verified via the Network tab and, where relevant, the actual Laravel controller
code) before a fix was written, rather than guessing.
