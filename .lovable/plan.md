# LMS Restructuring Plan

Keep all existing styling, colors, RTL layout, sidebar, and auth. This is a **functionality + information architecture** refactor only. Still mock-backed via `src/lib/api.ts` + localStorage (no Cloud yet — the mock layer already mirrors future backend action names).

---

## 1. Navigation & page renames

Sidebar labels change; routes get renamed/added. No visual redesign.

| Old | New | Route |
|---|---|---|
| لوحة التحكم (dashboard) | التقدم والإنجازات (Progress & Achievements) | `/dashboard` (kept as URL, title changes) |
| الدروس (Lessons flat list) | الدورات (Courses → Lessons drilldown) | `/courses`, `/courses/$id` |
| المفكرات (Transcripts) | **removed** — merged into Lesson page | — |
| الاختبارات (Quizzes) | الواجبات والاختبارات (Assignments & Exams) | `/assignments` |
| — new — | الكتب (Books) | `/books` |
| — new — | مسح الحضور (Scan Attendance) | `/attendance/scan` |

Admin panel gains: Books, Question Bank, Lesson Resources (inline inside Lesson edit), Assignments (replaces Quizzes admin).

---

## 2. Data model changes (`src/lib/types.ts` + `mock-data.ts`)

New/updated types:

- **Course** gains: `coverImage`, `startDate`, `endDate`, `status: 'active' | 'upcoming' | 'completed'`.
- **Lesson** gains: `audioUrl?`, `notes`, `homework: Attachment[]`, `resources: Attachment[]`, `scheduledAt?` (for upcoming/recent).
  Attachments already exist; extend `Attachment.type` to include `ppt | audio | zip`.
- **Book** *(new)*: `id, title, author, category, coverUrl?, fileUrl, description`.
- **AttendanceRecord** gains: `lessonId`, adds status `late`.
- **AttendanceSession** *(new)*: `id, lessonId, code, expiresAt, open`.
- **Assignment** *(new, replaces Quiz)*: `id, courseId, kind: 'assignment' | 'quiz' | 'exam', title, description, instructions, availableAt, dueAt, closesAt, totalMarks, timeLimitMin?, attachments, visible, questions: Question[]`.
- **Question** *(new)*: `id, type: 'mcq' | 'multi' | 'tf' | 'short' | 'paragraph' | 'fill', prompt, options?, correct?, marks`.
- **Submission** *(new)*: `id, assignmentId, studentId, answers, autoScore, manualScore?, finalScore?, gradedAt?, submittedAt`.

`api.ts` gets matching namespaces: `api.books`, `api.attendanceSessions`, `api.assignments`, `api.submissions`. Existing `api.quizzes` is kept as thin alias for now to avoid breaking old code, then removed.

File "uploads": since we're mock-only, uploaded files are stored as base64 data URLs in localStorage (small files only) — UI presents a proper upload widget so swapping to real storage later is a one-liner. A note is added to `README-BACKEND.md`.

---

## 3. Page-by-page work

### `/dashboard` — Progress & Achievements
Rewrite the page to show all the requested widgets in the existing card grid style:
profile header, active courses list, overall progress bar, per-course progress, attendance donut (present/late/absent + %), attendance history table, quiz/assignment grades table, certificates, points, latest announcements, recent + upcoming lessons, upcoming exams, quick-action buttons (Scan attendance, Open assignments, Open courses).

### `/courses` + `/courses/$id`
- `/courses`: grid of course cards (cover, dates, status badge, lesson & student count).
- `/courses/$id`: header + list of lessons in order → each links to `/lessons/$id`.
- Delete flat `/lessons` route; keep `/lessons/$id` for the lesson detail page.

### `/lessons/$id` — Lesson page
Sections: YouTube embed, description, transcript, notes, attachments, audio recording, homework, additional resources. Each file list uses the same list component. Preview modal for PDF/image/audio; download button for the rest. No separate transcripts page.

### `/books`
Grid grouped by category with search. Card = cover + title + author + preview/download.

### `/assignments`
List assignments/quizzes/exams with type badge, due date, status (not started / in progress / submitted / graded). Detail page `/assignments/$id` renders the appropriate question inputs, handles time limit, auto-saves answers, submits → auto-grade objective parts, queue subjective for admin.

### Attendance (per lesson)
- Admin: on lesson page → "بدء جلسة حضور" opens a modal showing a QR (encodes `session:<id>`, 60s countdown, regenerate & close buttons).
- Student: `/attendance/scan` uses camera via `html5-qrcode`; on scan → `api.attendanceSessions.checkIn(code)` → returns Present/Late based on how long the session has been open.
- Admin CRUD in `/admin/attendance` for manual edits (kept, extended with lesson & late status).

---

## 4. Admin panel updates

- **Students, Courses, Certificates, Announcements** — kept, minor field additions (Course gains cover/dates/status form).
- **Lessons** — new admin page `/admin/lessons` (or accessible via course edit) to manage lessons + all their file lists (upload, rename, replace, delete, reorder via up/down buttons).
- **Books** — new `/admin/books` CRUD.
- **Assignments** — replaces `/admin/quizzes`; add question builder (all 6 types) + question bank at `/admin/questions`.
- **Attendance** — extended with per-lesson filter + late status.

---

## 5. Technical notes

- Dependencies to add: `qrcode.react` (render QR), `html5-qrcode` (scan QR).
- File storage in mock: base64 data-URL in localStorage. Warn user in `README-BACKEND.md` that real uploads require Cloud/Storage — offered as follow-up.
- Route renames update `routeTree.gen.ts` automatically via the plugin; delete removed route files.
- Sidebar (`app-sidebar.tsx`) gets the new labels/order. No color, font, or layout change.
- All new pages reuse existing `AppLayout`, `Card`, `Tabs`, `Button`, badges — no new design tokens.

---

## Out of scope (ask later)

- Real file storage / real backend (Google Apps Script or Lovable Cloud).
- Email/SMS notifications, camera permission fallbacks beyond a manual code input.
- Rich text editor for lesson notes (plain textarea for now).
- Anti-cheat / IP-locked exams.

Confirm and I'll build it. If you'd like real file uploads (Books PDFs, lesson attachments, audio) working properly instead of stored as base64 in the browser, say the word and I'll enable **Lovable Cloud** first so storage + auth + DB are ready.
