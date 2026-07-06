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

export type CourseStatus = "active" | "upcoming" | "completed";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  status?: CourseStatus;
}

export type AttachmentType = "pdf" | "doc" | "ppt" | "image" | "audio" | "zip" | "other";

export interface Attachment {
  id: string;
  name: string;
  url: string; // link OR data-url for uploaded files (mock)
  type: AttachmentType;
  size?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeId: string;
  transcript: string;
  notes?: string;
  attachments: Attachment[];
  homework?: Attachment[];
  resources?: Attachment[];
  audioUrl?: string;
  order: number;
  scheduledAt?: string; // ISO datetime
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: "lesson" | "exam" | "event";
  date: string;
  time: string;
  dayOfWeek?: number;
  location?: string;
}

// ---------- Assignments / Exams ----------
export type QuestionType = "mcq" | "multi" | "tf" | "short" | "paragraph" | "fill";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];        // mcq, multi
  correct?: number | number[] | boolean | string; // depends on type
  marks: number;
}

export type AssignmentKind = "assignment" | "quiz" | "exam";

export interface Assignment {
  id: string;
  courseId: string;
  kind: AssignmentKind;
  title: string;
  description: string;
  instructions?: string;
  availableAt?: string; // ISO
  dueAt?: string;
  closesAt?: string;
  totalMarks: number;
  timeLimitMin?: number;
  attachments: Attachment[];
  visible: boolean;
  questions: Question[];
}

export type AnswerValue = number | number[] | boolean | string;

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: Record<string, AnswerValue>; // questionId -> value
  autoScore: number;
  manualScore?: number;
  finalScore?: number;
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
}

// ---------- Back-compat aliases (legacy quiz code) ----------
export type Quiz = Assignment;
export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  total: number;
  submittedAt: string;
}
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// ---------- Books ----------
export interface Book {
  id: string;
  title: string;
  author?: string;
  category: string;
  coverUrl?: string;
  fileUrl: string; // link or data-url
  description?: string;
  createdAt: string;
}

// ---------- Announcements / etc ----------
export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  important?: boolean;
}

export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  lessonId?: string;
}

export interface AttendanceSession {
  id: string;
  lessonId: string;
  code: string;      // scanned by student
  startedAt: string;
  expiresAt: string; // 60s window
  open: boolean;
  lateAfter?: string; // ISO after which check-in counts as "late"
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
