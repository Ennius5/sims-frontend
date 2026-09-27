# API Integration Map

Maps each frontend feature/page to the backend endpoint(s) it calls.

Note: "Role/Permission" describes what the **frontend UI** shows or restricts. Per the lab's
security boundary requirement, the backend (route middleware or policy) is the actual authority
in every case — the frontend never enforces authorization on its own. Where the two diverge
(Course Offerings), it's called out explicitly.

| Frontend Feature | Endpoint(s) | Method | Role/Permission |
|---|---|---|---|
| Login | `/auth/login` | POST | Public |
| Logout | `/auth/logout` | POST | Any authenticated |
| Session restore / current user | `/auth/me` | GET | Any authenticated |
| Dashboard summary cards | `/programs`, `/courses`, `/academic-terms`, `/students`, `/course-offerings`, `/enrollments` (`per_page=1`, reads `meta.total`) | GET | Varies by role — full counts for admin/registrar; scoped counts for instructor/student |
| Programs — list/search/filter/sort/paginate | `/programs` | GET | administrator, registrar |
| Programs — create | `/programs` | POST | administrator, registrar |
| Programs — edit | `/programs/{id}` | PUT/PATCH | administrator, registrar |
| Programs — delete | `/programs/{id}` | DELETE | administrator, registrar |
| Courses — list/search/filter/sort/paginate | `/courses` | GET | administrator, registrar |
| Courses — create/edit/delete | `/courses`, `/courses/{id}` | POST / PUT,PATCH / DELETE | administrator, registrar |
| Academic Terms — list/filter/sort/paginate | `/academic-terms` | GET | administrator, registrar |
| Academic Terms — create/edit/delete | `/academic-terms`, `/academic-terms/{id}` | POST / PUT,PATCH / DELETE | administrator, registrar |
| Students — list/search/filter/sort/paginate | `/students` | GET | administrator, registrar (a student sees only their own record, enforced by `StudentPolicy`) |
| Students — create | `/students` | POST | administrator, registrar |
| Students — edit (incl. linking a User account) | `/students/{id}` | PUT/PATCH | administrator, registrar |
| Students — delete | `/students/{id}` | DELETE | administrator only |
| Students — Program filter/dropdown | `/programs` (`per_page=100`) | GET | administrator, registrar |
| Students — linked-account dropdown | `/users` | GET | administrator, registrar |
| Course Offerings — list/filter/sort/paginate | `/course-offerings` | GET | Any authenticated (no backend restriction) |
| Course Offerings — create/edit/delete | `/course-offerings`, `/course-offerings/{id}` | POST / PUT,PATCH / DELETE | **UI-restricted** to administrator, registrar (backend permits any authenticated user) |
| Course Offerings — course/term dropdowns (form) | `/courses`, `/academic-terms` (`per_page=100`) | GET | administrator, registrar only — falls back to options derived from `/course-offerings` data for other roles |
| Course Offerings — instructor dropdown (form) | `/instructors` | GET | Any authenticated |
| Course Offerings — filter dropdowns (non-admin/registrar) | `/course-offerings` (options derived client-side) | GET | Any authenticated |
| Course Offerings — view enrolled students | `/course-offerings/{id}/students` | GET | Any authenticated |
| Enrollments — list/filter/paginate | `/enrollments` | GET | Scoped automatically by backend: admin/registrar see all, instructor sees offerings they teach, student sees their own |
| Enrollments — create | `/enrollments` | POST | administrator, registrar |
| Enrollments — status update | `/enrollments/{id}` | PATCH | administrator, registrar |
| Enrollments — delete | `/enrollments/{id}` | DELETE | administrator, registrar |
| Enrollments — student/offering dropdowns (form) | `/students`, `/course-offerings` (`per_page=100`) | GET | administrator, registrar |
| Grades — enter/edit (from Enrollments row) | `/grades`, `/grades/{id}` | POST / PATCH | administrator, registrar, or the instructor teaching that offering (`GradePolicy`) |
| Grades — view (nested per enrollment) | `/enrollments` (`grade` nested in each row) | GET | Same scoping as Enrollments |
| Academic Record — own (student role) | `/students/{id}/academic-record` (`id` from `/auth/me`'s `student_id`) | GET | student, own record only |
| Academic Record — any student (admin/registrar) | `/students` (picker) + `/students/{id}/academic-record` | GET | administrator, registrar |
| Profile / Account page | `/auth/me` (already cached in `AuthContext`) | — | Any authenticated |
