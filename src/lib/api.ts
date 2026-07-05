/**
 * API layer — Google Apps Script ready.
 *
 * Every function is async and matches an action name used by a future
 * Apps Script Web App backend. Swap the `USE_MOCK` branch for `fetch()`
 * against `API_BASE` and this file becomes the only change needed.
 *
 * See README-BACKEND.md for the expected server-side actions.
 */

import {
  initialAnnouncements,
  initialAttendance,
  initialCertificates,
  initialCourses,
  initialLessons,
  initialPoints,
  initialQuizResults,
  initialQuizzes,
  initialSchedule,
  initialUsers,
} from "./mock-data";
import type {
  Announcement,
  AttendanceRecord,
  Certificate,
  Course,
  Lesson,
  PointsEntry,
  Quiz,
  QuizResult,
  ScheduleEvent,
  User,
} from "./types";

export const API_BASE = ""; // TODO: paste the Apps Script Web App URL here
export const USE_MOCK = true;

// ---------- persistence ----------
const STORAGE_KEY = "lms:data:v1";

interface Store {
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  schedule: ScheduleEvent[];
  quizzes: Quiz[];
  quizResults: QuizResult[];
  announcements: Announcement[];
  attendance: AttendanceRecord[];
  certificates: Certificate[];
  points: PointsEntry[];
}

const seed = (): Store => ({
  users: initialUsers,
  courses: initialCourses,
  lessons: initialLessons,
  schedule: initialSchedule,
  quizzes: initialQuizzes,
  quizResults: initialQuizResults,
  announcements: initialAnnouncements,
  attendance: initialAttendance,
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

// Simulated network latency for realism
const delay = <T>(v: T): Promise<T> => new Promise((r) => setTimeout(() => r(v), 120));

// ---------- helpers ----------
const stripPassword = (u: User): Omit<User, "password"> => {
  const { password: _p, ...rest } = u;
  return rest;
};

// ---------- API surface ----------
export const api = {
  auth: {
    async login(username: string, password: string) {
      const s = loadStore();
      const found = s.users.find(
        (u) => u.username === username && u.password === password,
      );
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
        const u: User = {
          ...input,
          id: uid("u"),
          role: "student",
          joinedAt: new Date().toISOString().slice(0, 10),
        };
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
      return mutate((s) => {
        s.users = s.users.filter((u) => u.id !== id);
        return { ok: true };
      });
    },
  },
  courses: {
    async list() {
      return delay(loadStore().courses);
    },
    async create(input: Omit<Course, "id">) {
      return mutate((s) => {
        const c: Course = { ...input, id: uid("c") };
        s.courses.push(c);
        return c;
      });
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
    async list() {
      return delay(loadStore().lessons);
    },
    async listByCourse(courseId: string) {
      return delay(loadStore().lessons.filter((l) => l.courseId === courseId));
    },
    async create(input: Omit<Lesson, "id">) {
      return mutate((s) => {
        const l: Lesson = { ...input, id: uid("l") };
        s.lessons.push(l);
        return l;
      });
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
      return mutate((s) => {
        s.lessons = s.lessons.filter((l) => l.id !== id);
        return { ok: true };
      });
    },
  },
  schedule: {
    async list() {
      return delay(loadStore().schedule);
    },
    async create(input: Omit<ScheduleEvent, "id">) {
      return mutate((s) => {
        const e: ScheduleEvent = { ...input, id: uid("s") };
        s.schedule.push(e);
        return e;
      });
    },
    async remove(id: string) {
      return mutate((s) => {
        s.schedule = s.schedule.filter((e) => e.id !== id);
        return { ok: true };
      });
    },
  },
  quizzes: {
    async list() {
      return delay(loadStore().quizzes);
    },
    async get(id: string) {
      return delay(loadStore().quizzes.find((q) => q.id === id));
    },
    async create(input: Omit<Quiz, "id">) {
      return mutate((s) => {
        const q: Quiz = { ...input, id: uid("q") };
        s.quizzes.push(q);
        return q;
      });
    },
    async remove(id: string) {
      return mutate((s) => {
        s.quizzes = s.quizzes.filter((q) => q.id !== id);
        return { ok: true };
      });
    },
    async submit(input: { quizId: string; studentId: string; answers: number[] }) {
      return mutate((s) => {
        const quiz = s.quizzes.find((q) => q.id === input.quizId);
        if (!quiz) throw new Error("الاختبار غير موجود");
        const score = quiz.questions.reduce(
          (acc, q, i) => acc + (q.correctIndex === input.answers[i] ? 1 : 0),
          0,
        );
        const r: QuizResult = {
          id: uid("r"),
          quizId: input.quizId,
          studentId: input.studentId,
          score,
          total: quiz.questions.length,
          submittedAt: new Date().toISOString(),
        };
        s.quizResults.push(r);
        return r;
      });
    },
    async resultsForStudent(studentId: string) {
      return delay(loadStore().quizResults.filter((r) => r.studentId === studentId));
    },
  },
  announcements: {
    async list() {
      return delay(
        [...loadStore().announcements].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        ),
      );
    },
    async create(input: Omit<Announcement, "id" | "createdAt">) {
      return mutate((s) => {
        const a: Announcement = { ...input, id: uid("an"), createdAt: new Date().toISOString() };
        s.announcements.push(a);
        return a;
      });
    },
    async remove(id: string) {
      return mutate((s) => {
        s.announcements = s.announcements.filter((a) => a.id !== id);
        return { ok: true };
      });
    },
  },
  attendance: {
    async list() {
      return delay(loadStore().attendance);
    },
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
    async remove(id: string) {
      return mutate((s) => {
        s.attendance = s.attendance.filter((a) => a.id !== id);
        return { ok: true };
      });
    },
  },
  points: {
    async forStudent(studentId: string) {
      return delay(loadStore().points.filter((p) => p.studentId === studentId));
    },
    async list() {
      return delay(loadStore().points);
    },
    async add(input: Omit<PointsEntry, "id" | "date">) {
      return mutate((s) => {
        const p: PointsEntry = { ...input, id: uid("p"), date: new Date().toISOString().slice(0, 10) };
        s.points.push(p);
        return p;
      });
    },
    async remove(id: string) {
      return mutate((s) => {
        s.points = s.points.filter((p) => p.id !== id);
        return { ok: true };
      });
    },
  },
  certificates: {
    async list() {
      return delay(loadStore().certificates);
    },
    async forStudent(studentId: string) {
      return delay(loadStore().certificates.filter((c) => c.studentId === studentId));
    },
    async issue(input: Omit<Certificate, "id" | "issuedAt">) {
      return mutate((s) => {
        const c: Certificate = { ...input, id: uid("cert"), issuedAt: new Date().toISOString().slice(0, 10) };
        s.certificates.push(c);
        return c;
      });
    },
    async remove(id: string) {
      return mutate((s) => {
        s.certificates = s.certificates.filter((c) => c.id !== id);
        return { ok: true };
      });
    },
  },
};

export type Api = typeof api;
