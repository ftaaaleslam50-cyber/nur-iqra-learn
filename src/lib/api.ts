/**
 * API layer — mock backed by localStorage, ready to be swapped for a real
 * backend (Google Apps Script or Lovable Cloud). Every function is async
 * and named to match a future server action.
 */

import {
  initialAnnouncements,
  initialAssignments,
  initialAttendance,
  initialAttendanceSessions,
  initialBooks,
  initialCertificates,
  initialCourses,
  initialLessons,
  initialPoints,
  initialSchedule,
  initialSubmissions,
  initialUsers,
} from "./mock-data";
import type {
  Announcement,
  AnswerValue,
  Assignment,
  AttendanceRecord,
  AttendanceSession,
  Book,
  Certificate,
  Course,
  Lesson,
  PointsEntry,
  Question,
  ScheduleEvent,
  Submission,
  User,
} from "./types";

export const API_BASE = "";
export const USE_MOCK = true;

const STORAGE_KEY = "lms:data:v2";

interface Store {
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  schedule: ScheduleEvent[];
  assignments: Assignment[];
  submissions: Submission[];
  books: Book[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
  attendanceSessions: AttendanceSession[];
  certificates: Certificate[];
  points: PointsEntry[];
}

const seed = (): Store => ({
  users: initialUsers,
  courses: initialCourses,
  lessons: initialLessons,
  schedule: initialSchedule,
  assignments: initialAssignments,
  submissions: initialSubmissions,
  books: initialBooks,
  announcements: initialAnnouncements,
  attendance: initialAttendance,
  attendanceSessions: initialAttendanceSessions,
  certificates: initialCertificates,
  points: initialPoints,
});

const isBrowser = typeof window !== "undefined";

const loadStore = (): Store => {
  if (!isBrowser) return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Store;
  } catch {
    return seed();
  }
};

const saveStore = (s: Store) => {
  if (isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

const mutate = <T>(fn: (s: Store) => T): T => {
  const s = loadStore();
  const result = fn(s);
  saveStore(s);
  return result;
};

const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
const delay = <T>(v: T): Promise<T> => new Promise((r) => setTimeout(() => r(v), 100));

const stripPassword = (u: User): Omit<User, "password"> => {
  const { password: _p, ...rest } = u;
  return rest;
};

// ---------- auto grading ----------
function gradeQuestion(q: Question, answer: AnswerValue | undefined): number {
  if (answer === undefined || answer === null) return 0;
  switch (q.type) {
    case "mcq":
      return answer === q.correct ? q.marks : 0;
    case "tf":
      return answer === q.correct ? q.marks : 0;
    case "multi": {
      const correct = Array.isArray(q.correct) ? [...q.correct].sort() : [];
      const given = Array.isArray(answer) ? [...answer].sort() : [];
      const same =
        correct.length === given.length &&
        correct.every((v, i) => v === given[i]);
      return same ? q.marks : 0;
    }
    case "fill": {
      const c = typeof q.correct === "string" ? q.correct.trim().toLowerCase() : "";
      const a = typeof answer === "string" ? answer.trim().toLowerCase() : "";
      return c && c === a ? q.marks : 0;
    }
    default:
      return 0; // short/paragraph require manual grading
  }
}

const isAutoGradable = (t: Question["type"]) =>
  t === "mcq" || t === "multi" || t === "tf" || t === "fill";

// ---------- API ----------
export const api = {
  auth: {
    async login(username: string, password: string) {
      const s = loadStore();
      const found = s.users.find((u) => u.username === username && u.password === password);
      if (!found) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
      return delay(stripPassword(found));
    },
    async changePassword(userId: string, current: string, next: string) {
      return mutate((s) => {
        const u = s.users.find((x) => x.id === userId);
        if (!u) throw new Error("المستخدم غير موجود");
        if (u.password !== current) throw new Error("كلمة المرور الحالية غير صحيحة");
        u.password = next;
        return { ok: true };
      });
    },
  },
  students: {
    async list() {
      return delay(loadStore().users.filter((u) => u.role === "student").map(stripPassword));
    },
    async create(input: Omit<User, "id" | "role" | "joinedAt">) {
      return mutate((s) => {
        const u: User = { ...input, id: uid("u"), role: "student",
          joinedAt: new Date().toISOString().slice(0, 10) };
        s.users.push(u);
        return stripPassword(u);
      });
    },
    async update(id: string, patch: Partial<Omit<User, "id" | "role">>) {
      return mutate((s) => {
        const i = s.users.findIndex((x) => x.id === id);
        if (i === -1) throw new Error("الطالب غير موجود");
        s.users[i] = { ...s.users[i], ...patch };
        return stripPassword(s.users[i]);
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.users = s.users.filter((u) => u.id !== id); return { ok: true }; });
    },
  },
  courses: {
    async list() { return delay(loadStore().courses); },
    async get(id: string) { return delay(loadStore().courses.find((c) => c.id === id)); },
    async create(input: Omit<Course, "id">) {
      return mutate((s) => { const c = { ...input, id: uid("c") }; s.courses.push(c); return c; });
    },
    async update(id: string, patch: Partial<Course>) {
      return mutate((s) => {
        const i = s.courses.findIndex((x) => x.id === id);
        if (i === -1) throw new Error("الدورة غير موجودة");
        s.courses[i] = { ...s.courses[i], ...patch };
        return s.courses[i];
      });
    },
    async remove(id: string) {
      return mutate((s) => {
        s.courses = s.courses.filter((c) => c.id !== id);
        s.lessons = s.lessons.filter((l) => l.courseId !== id);
        return { ok: true };
      });
    },
  },
  lessons: {
    async list() { return delay(loadStore().lessons); },
    async get(id: string) { return delay(loadStore().lessons.find((l) => l.id === id)); },
    async listByCourse(courseId: string) {
      return delay(loadStore().lessons.filter((l) => l.courseId === courseId)
        .sort((a, b) => a.order - b.order));
    },
    async create(input: Omit<Lesson, "id">) {
      return mutate((s) => { const l = { ...input, id: uid("l") }; s.lessons.push(l); return l; });
    },
    async update(id: string, patch: Partial<Lesson>) {
      return mutate((s) => {
        const i = s.lessons.findIndex((x) => x.id === id);
        if (i === -1) throw new Error("الدرس غير موجود");
        s.lessons[i] = { ...s.lessons[i], ...patch };
        return s.lessons[i];
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.lessons = s.lessons.filter((l) => l.id !== id); return { ok: true }; });
    },
  },
  schedule: {
    async list() { return delay(loadStore().schedule); },
    async create(input: Omit<ScheduleEvent, "id">) {
      return mutate((s) => { const e = { ...input, id: uid("s") }; s.schedule.push(e); return e; });
    },
    async remove(id: string) {
      return mutate((s) => { s.schedule = s.schedule.filter((e) => e.id !== id); return { ok: true }; });
    },
  },
  books: {
    async list() { return delay(loadStore().books); },
    async create(input: Omit<Book, "id" | "createdAt">) {
      return mutate((s) => {
        const b: Book = { ...input, id: uid("b"), createdAt: new Date().toISOString() };
        s.books.push(b); return b;
      });
    },
    async update(id: string, patch: Partial<Book>) {
      return mutate((s) => {
        const i = s.books.findIndex((x) => x.id === id);
        if (i === -1) throw new Error("الكتاب غير موجود");
        s.books[i] = { ...s.books[i], ...patch };
        return s.books[i];
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.books = s.books.filter((b) => b.id !== id); return { ok: true }; });
    },
  },
  assignments: {
    async list() { return delay(loadStore().assignments); },
    async get(id: string) { return delay(loadStore().assignments.find((a) => a.id === id)); },
    async create(input: Omit<Assignment, "id">) {
      return mutate((s) => {
        const a: Assignment = { ...input, id: uid("as") };
        s.assignments.push(a); return a;
      });
    },
    async update(id: string, patch: Partial<Assignment>) {
      return mutate((s) => {
        const i = s.assignments.findIndex((x) => x.id === id);
        if (i === -1) throw new Error("النشاط غير موجود");
        s.assignments[i] = { ...s.assignments[i], ...patch };
        return s.assignments[i];
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.assignments = s.assignments.filter((a) => a.id !== id); return { ok: true }; });
    },
    async submit(input: { assignmentId: string; studentId: string; answers: Record<string, AnswerValue> }) {
      return mutate((s) => {
        const a = s.assignments.find((x) => x.id === input.assignmentId);
        if (!a) throw new Error("النشاط غير موجود");
        let autoScore = 0;
        let needsManual = false;
        for (const q of a.questions) {
          if (isAutoGradable(q.type)) {
            autoScore += gradeQuestion(q, input.answers[q.id]);
          } else {
            needsManual = true;
          }
        }
        const sub: Submission = {
          id: uid("sub"),
          assignmentId: input.assignmentId,
          studentId: input.studentId,
          answers: input.answers,
          autoScore,
          finalScore: needsManual ? undefined : autoScore,
          submittedAt: new Date().toISOString(),
          gradedAt: needsManual ? undefined : new Date().toISOString(),
        };
        s.submissions.push(sub);
        return sub;
      });
    },
    async grade(submissionId: string, manualScore: number, feedback?: string) {
      return mutate((s) => {
        const i = s.submissions.findIndex((x) => x.id === submissionId);
        if (i === -1) throw new Error("لم يتم العثور على الإجابة");
        const sub = s.submissions[i];
        sub.manualScore = manualScore;
        sub.finalScore = (sub.autoScore ?? 0) + manualScore;
        sub.feedback = feedback;
        sub.gradedAt = new Date().toISOString();
        return sub;
      });
    },
  },
  submissions: {
    async list() { return delay(loadStore().submissions); },
    async forStudent(studentId: string) {
      return delay(loadStore().submissions.filter((s) => s.studentId === studentId));
    },
    async forAssignment(assignmentId: string) {
      return delay(loadStore().submissions.filter((s) => s.assignmentId === assignmentId));
    },
  },
  announcements: {
    async list() {
      return delay([...loadStore().announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    },
    async create(input: Omit<Announcement, "id" | "createdAt">) {
      return mutate((s) => {
        const a: Announcement = { ...input, id: uid("an"), createdAt: new Date().toISOString() };
        s.announcements.push(a); return a;
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.announcements = s.announcements.filter((a) => a.id !== id); return { ok: true }; });
    },
  },
  attendance: {
    async list() { return delay(loadStore().attendance); },
    async forStudent(studentId: string) {
      return delay(loadStore().attendance.filter((a) => a.studentId === studentId));
    },
    async record(input: Omit<AttendanceRecord, "id">) {
      return mutate((s) => {
        const a: AttendanceRecord = { ...input, id: uid("at") };
        s.attendance.push(a);
        return a;
      });
    },
    async update(id: string, patch: Partial<AttendanceRecord>) {
      return mutate((s) => {
        const i = s.attendance.findIndex((x) => x.id === id);
        if (i === -1) throw new Error("السجل غير موجود");
        s.attendance[i] = { ...s.attendance[i], ...patch };
        return s.attendance[i];
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.attendance = s.attendance.filter((a) => a.id !== id); return { ok: true }; });
    },
  },
  attendanceSessions: {
    async open(lessonId: string) {
      return mutate((s) => {
        // close any prior open session for this lesson
        for (const sess of s.attendanceSessions) if (sess.lessonId === lessonId) sess.open = false;
        const now = Date.now();
        const sess: AttendanceSession = {
          id: uid("sess"),
          lessonId,
          code: Math.random().toString(36).slice(2, 10).toUpperCase(),
          startedAt: new Date(now).toISOString(),
          expiresAt: new Date(now + 60_000).toISOString(),
          lateAfter: new Date(now + 15 * 60_000).toISOString(),
          open: true,
        };
        s.attendanceSessions.push(sess);
        return sess;
      });
    },
    async regenerate(sessionId: string) {
      return mutate((s) => {
        const sess = s.attendanceSessions.find((x) => x.id === sessionId);
        if (!sess) throw new Error("الجلسة غير موجودة");
        const now = Date.now();
        sess.code = Math.random().toString(36).slice(2, 10).toUpperCase();
        sess.expiresAt = new Date(now + 60_000).toISOString();
        sess.open = true;
        return sess;
      });
    },
    async close(sessionId: string) {
      return mutate((s) => {
        const sess = s.attendanceSessions.find((x) => x.id === sessionId);
        if (!sess) throw new Error("الجلسة غير موجودة");
        sess.open = false;
        return sess;
      });
    },
    async checkIn(code: string, studentId: string) {
      return mutate((s) => {
        const now = Date.now();
        const sess = [...s.attendanceSessions].reverse().find((x) => x.code === code.toUpperCase() && x.open);
        if (!sess) throw new Error("الرمز غير صحيح أو منتهي");
        if (new Date(sess.expiresAt).getTime() < now) throw new Error("انتهت صلاحية الرمز");
        // prevent duplicate for same lesson/student
        const dupe = s.attendance.find(
          (a) => a.studentId === studentId && a.lessonId === sess.lessonId,
        );
        if (dupe) return { record: dupe, sess };
        const late = sess.lateAfter && new Date(sess.lateAfter).getTime() < now;
        const rec: AttendanceRecord = {
          id: uid("at"),
          studentId,
          date: new Date().toISOString().slice(0, 10),
          status: late ? "late" : "present",
          lessonId: sess.lessonId,
        };
        s.attendance.push(rec);
        return { record: rec, sess };
      });
    },
    async forLesson(lessonId: string) {
      return delay(loadStore().attendanceSessions.filter((x) => x.lessonId === lessonId));
    },
  },
  points: {
    async forStudent(studentId: string) {
      return delay(loadStore().points.filter((p) => p.studentId === studentId));
    },
    async list() { return delay(loadStore().points); },
    async add(input: Omit<PointsEntry, "id" | "date">) {
      return mutate((s) => {
        const p: PointsEntry = { ...input, id: uid("p"),
          date: new Date().toISOString().slice(0, 10) };
        s.points.push(p); return p;
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.points = s.points.filter((p) => p.id !== id); return { ok: true }; });
    },
  },
  certificates: {
    async list() { return delay(loadStore().certificates); },
    async forStudent(studentId: string) {
      return delay(loadStore().certificates.filter((c) => c.studentId === studentId));
    },
    async issue(input: Omit<Certificate, "id" | "issuedAt">) {
      return mutate((s) => {
        const c: Certificate = { ...input, id: uid("cert"),
          issuedAt: new Date().toISOString().slice(0, 10) };
        s.certificates.push(c); return c;
      });
    },
    async remove(id: string) {
      return mutate((s) => { s.certificates = s.certificates.filter((c) => c.id !== id); return { ok: true }; });
    },
  },
};

export type Api = typeof api;
