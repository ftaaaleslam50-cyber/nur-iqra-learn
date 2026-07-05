export type UserRole = "admin" | "student";

export interface User {
  id: string;
  username: string;
  password: string; // mock only
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  courseId?: string;
  joinedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "pdf" | "doc" | "image" | "other";
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeId: string; // e.g. "dQw4w9WgXcQ"
  transcript: string;
  attachments: Attachment[];
  order: number;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: "lesson" | "exam" | "event";
  date: string; // ISO
  time: string; // "10:00"
  dayOfWeek?: number; // 0=Sun..6=Sat (for weekly)
  location?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  total: number;
  submittedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  important?: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date
  status: "present" | "absent" | "excused";
}

export interface Certificate {
  id: string;
  studentId: string;
  title: string;
  issuedAt: string;
}

export interface PointsEntry {
  id: string;
  studentId: string;
  points: number;
  reason: string;
  date: string;
}
