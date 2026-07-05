# Arabic Islamic Academy LMS — Build Plan

A private LMS in Arabic (RTL), green & white palette, with two roles (Student, Admin). Frontend-only for now, with a clean data-access layer designed to plug into Google Apps Script + Google Sheets later.

## Scope of this build

- Full Arabic RTL UI, responsive (desktop / tablet / mobile), dark mode toggle.
- Login page only (no public registration). Two demo accounts seeded in mock data:
  - Admin: `admin` / `admin123`
  - Student: `student` / `student123`
- Auth stored in `localStorage` (temporary — will be swapped for Apps Script auth later).
- All data comes from a single `src/lib/api.ts` layer with typed functions (`getStudents`, `getLessons`, `submitQuiz`, etc.) backed by mock JSON. Swapping to `fetch()` against Apps Script later = one-file change.

## Design

- Palette: emerald green primary, off-white background, soft neutrals. Dark mode = deep slate + emerald accents.
- Typography: Cairo (headings) + Tajawal (body) loaded via `<link>` in `__root.tsx`.
- Layout: fixed RTL sidebar (right side), top bar with user menu + dark mode toggle, content area with cards.
- shadcn components themed via tokens in `src/styles.css`. Smooth transitions, subtle hover lifts.

## Routes

```
/login                              → Login page (public)
/_authenticated/                    → Layout gate (role check)
  /dashboard                        → Student or Admin dashboard (role-based)
  /lessons                          → Student: lessons by course + YouTube embed + attachments
  /transcripts                      → Student: per-lesson transcripts + PDF/DOC download
  /schedule                         → Student: weekly schedule + exams + events
  /quizzes                          → Student: quiz list
  /quizzes/$id                      → Quiz taking (timer, MCQ, auto-grade)
  /announcements                    → Student: announcements feed
  /profile                          → Student: info + change password
  /admin/students                   → CRUD students
  /admin/courses                    → CRUD courses + lessons + attachments + transcripts
  /admin/schedule                   → CRUD schedule
  /admin/quizzes                    → CRUD quizzes
  /admin/attendance                 → Record attendance
  /admin/points                     → Award/remove points
  /admin/certificates               → Issue certificates
  /admin/announcements              → CRUD announcements
```

## Student dashboard cards

Name + photo, current course, attendance %, absences count, progress %, reward points, certificates earned, latest quiz results, latest announcements.

## Admin dashboard stats

Total students, overall attendance rate, total lessons, total quizzes, recent activity feed.

## Data layer (Google Sheets ready)

`src/lib/api.ts` exports async functions returning typed data. Internally reads/writes an in-memory store seeded from `src/lib/mock-data.ts` and persisted to `localStorage`. Every function matches a future Apps Script `doGet`/`doPost` action name, e.g.:

```
api.students.list()      → GET  ?action=students.list
api.students.create(x)   → POST { action: 'students.create', payload: x }
api.quizzes.submit(...)  → POST { action: 'quizzes.submit', payload: ... }
```

A single `API_BASE` constant + `USE_MOCK` flag will flip the whole app to the real backend later. A `README-BACKEND.md` will document the expected Apps Script endpoints and Sheet columns.

## Tech

- TanStack Start (already scaffolded) + TypeScript + Tailwind v4 + shadcn.
- TanStack Query for data fetching.
- `react-hook-form` + `zod` for forms.
- `recharts` for admin stats (already installed via shadcn chart).
- No backend enabled — pure frontend. Auth is client-side mock until Apps Script is wired.

## Out of scope (this pass)

- Real Apps Script integration (documented, not wired).
- Real file uploads (attachments use URLs).
- Email/SMS notifications.

---

Confirm and I'll build it. If you'd rather I wire Lovable Cloud (Supabase) for real auth + storage instead of preparing for Google Apps Script, say so and I'll switch — Cloud is much more robust than Sheets for an LMS.
