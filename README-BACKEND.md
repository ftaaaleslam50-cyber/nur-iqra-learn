# Backend integration — Google Apps Script + Google Sheets

The frontend talks to a single API surface in `src/lib/api.ts`. All data is
seeded from `src/lib/mock-data.ts` and persisted to `localStorage` while
`USE_MOCK = true`.

To connect the real backend:

1. Deploy an Apps Script Web App that:
   - Reads/writes a Google Sheet with one tab per collection: `users`,
     `courses`, `lessons`, `schedule`, `quizzes`, `quiz_results`,
     `announcements`, `attendance`, `certificates`, `points`.
   - Accepts `POST` requests with `{ action: string, payload: any }` and
     returns `{ ok: true, data }` or `{ ok: false, error }`.
2. Paste the deployed Web App URL into `API_BASE` in `src/lib/api.ts` and
   set `USE_MOCK = false`.
3. Replace each method body with a `fetch(API_BASE, { method: "POST",
   body: JSON.stringify({ action: "students.list" }) })` call. Every
   method already matches a stable `namespace.method` action name.

## Actions the backend must implement

```
auth.login                { username, password }
auth.changePassword       { userId, current, next }
students.list             {}
students.create           { fullName, username, password, email, phone?, courseId?, avatarUrl? }
students.update           { id, patch }
students.remove           { id }
courses.list              {}
courses.create/update/remove
lessons.list / listByCourse / create / update / remove
schedule.list / create / remove
quizzes.list / get / create / remove / submit / resultsForStudent
announcements.list / create / remove
attendance.list / forStudent / record / remove
points.list / forStudent / add / remove
certificates.list / forStudent / issue / remove
```

## Sheet columns (suggested)

- **users**: id, username, password, role, fullName, email, phone, avatarUrl, courseId, joinedAt
- **courses**: id, title, description, instructor
- **lessons**: id, courseId, title, description, youtubeId, transcript, attachments (JSON), order
- **schedule**: id, title, type, date, time, dayOfWeek, location
- **quizzes**: id, title, courseId, durationMinutes, questions (JSON)
- **quiz_results**: id, quizId, studentId, score, total, submittedAt
- **announcements**: id, title, body, createdAt, important
- **attendance**: id, studentId, date, status
- **certificates**: id, studentId, title, issuedAt
- **points**: id, studentId, points, reason, date

Because passwords live in a Google Sheet on the developer's account, this is
only suitable for a small private academy. For a stronger setup, migrate to
Lovable Cloud (Supabase) which provides real auth, RLS, and storage.
