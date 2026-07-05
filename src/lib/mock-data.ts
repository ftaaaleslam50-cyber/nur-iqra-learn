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

export const initialUsers: User[] = [
  {
    id: "u_admin",
    username: "admin",
    password: "admin123",
    role: "admin",
    fullName: "الأستاذ عبد الرحمن",
    email: "admin@academy.local",
    avatarUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    id: "u_student",
    username: "student",
    password: "student123",
    role: "student",
    fullName: "محمد الأمين",
    email: "student@academy.local",
    phone: "+212600000000",
    avatarUrl: "",
    courseId: "c_quran",
    joinedAt: "2024-09-01",
  },
  {
    id: "u_s2",
    username: "sara",
    password: "sara123",
    role: "student",
    fullName: "سارة بن علي",
    email: "sara@academy.local",
    courseId: "c_fiqh",
    joinedAt: "2024-09-10",
  },
];

export const initialCourses: Course[] = [
  {
    id: "c_quran",
    title: "تحفيظ القرآن الكريم",
    description: "دورة متكاملة في تحفيظ وتجويد القرآن الكريم.",
    instructor: "الشيخ أحمد",
  },
  {
    id: "c_fiqh",
    title: "الفقه الإسلامي",
    description: "أساسيات الفقه في العبادات والمعاملات.",
    instructor: "الشيخ يوسف",
  },
  {
    id: "c_seerah",
    title: "السيرة النبوية",
    description: "دراسة سيرة النبي محمد ﷺ.",
    instructor: "الأستاذ إبراهيم",
  },
];

export const initialLessons: Lesson[] = [
  {
    id: "l1",
    courseId: "c_quran",
    title: "أحكام النون الساكنة والتنوين",
    description: "شرح مفصل لأحكام النون الساكنة والتنوين مع أمثلة تطبيقية.",
    youtubeId: "9bZkp7q19f0",
    transcript:
      "في هذا الدرس نتعرف على أحكام النون الساكنة والتنوين وهي: الإظهار، الإدغام، الإقلاب، والإخفاء...",
    attachments: [
      { id: "a1", name: "ملخص الدرس.pdf", url: "#", type: "pdf" },
      { id: "a2", name: "تمارين تطبيقية.doc", url: "#", type: "doc" },
    ],
    order: 1,
  },
  {
    id: "l2",
    courseId: "c_quran",
    title: "أحكام المدود",
    description: "أنواع المدود وأحكامها في تلاوة القرآن الكريم.",
    youtubeId: "M7lc1UVf-VE",
    transcript: "المد هو إطالة الصوت بحرف من حروف المد الثلاثة (الألف، الواو، الياء)...",
    attachments: [{ id: "a3", name: "أمثلة على المدود.pdf", url: "#", type: "pdf" }],
    order: 2,
  },
  {
    id: "l3",
    courseId: "c_fiqh",
    title: "أركان الصلاة",
    description: "التعرف على أركان الصلاة وشروطها.",
    youtubeId: "hY7m5jjJ9mM",
    transcript: "أركان الصلاة أربعة عشر ركناً وهي...",
    attachments: [],
    order: 1,
  },
  {
    id: "l4",
    courseId: "c_seerah",
    title: "المولد النبوي الشريف",
    description: "أحداث ولادة النبي محمد ﷺ ونشأته.",
    youtubeId: "aqz-KE-bpKQ",
    transcript: "ولد النبي محمد ﷺ في مكة المكرمة يوم الاثنين...",
    attachments: [],
    order: 1,
  },
];

export const initialSchedule: ScheduleEvent[] = [
  { id: "s1", title: "درس التحفيظ", type: "lesson", date: "", time: "17:00", dayOfWeek: 1 },
  { id: "s2", title: "درس الفقه", type: "lesson", date: "", time: "18:30", dayOfWeek: 3 },
  { id: "s3", title: "درس السيرة", type: "lesson", date: "", time: "17:00", dayOfWeek: 5 },
  { id: "s4", title: "امتحان التجويد", type: "exam", date: "2026-07-20", time: "10:00" },
  { id: "s5", title: "احتفال ختم القرآن", type: "event", date: "2026-08-01", time: "19:00", location: "قاعة الأكاديمية" },
];

export const initialQuizzes: Quiz[] = [
  {
    id: "q1",
    title: "اختبار أحكام التجويد",
    courseId: "c_quran",
    durationMinutes: 10,
    questions: [
      {
        id: "q1a",
        question: "كم عدد أحكام النون الساكنة والتنوين؟",
        options: ["ثلاثة", "أربعة", "خمسة", "ستة"],
        correctIndex: 1,
      },
      {
        id: "q1b",
        question: "ما هو حكم النون الساكنة إذا جاء بعدها حرف الباء؟",
        options: ["الإظهار", "الإدغام", "الإقلاب", "الإخفاء"],
        correctIndex: 2,
      },
      {
        id: "q1c",
        question: "كم عدد حروف المد؟",
        options: ["حرفان", "ثلاثة", "أربعة", "خمسة"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "q2",
    title: "اختبار في الصلاة",
    courseId: "c_fiqh",
    durationMinutes: 8,
    questions: [
      {
        id: "q2a",
        question: "كم عدد أركان الصلاة؟",
        options: ["اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر"],
        correctIndex: 2,
      },
      {
        id: "q2b",
        question: "ما هو أول ركن من أركان الصلاة؟",
        options: ["تكبيرة الإحرام", "قراءة الفاتحة", "الركوع", "النية"],
        correctIndex: 0,
      },
    ],
  },
];

export const initialAnnouncements: Announcement[] = [
  {
    id: "an1",
    title: "بدء الفصل الدراسي الجديد",
    body: "نعلن عن بدء الفصل الدراسي الجديد يوم الاثنين القادم إن شاء الله.",
    createdAt: "2026-07-01T09:00:00Z",
    important: true,
  },
  {
    id: "an2",
    title: "مسابقة حفظ القرآن الكريم",
    body: "ستقام مسابقة سنوية لحفظ القرآن الكريم مع جوائز قيمة للفائزين.",
    createdAt: "2026-06-25T10:00:00Z",
  },
  {
    id: "an3",
    title: "دورة صيفية في السيرة النبوية",
    body: "نفتح باب التسجيل في الدورة الصيفية المكثفة في السيرة النبوية.",
    createdAt: "2026-06-15T08:00:00Z",
  },
];

export const initialAttendance: AttendanceRecord[] = [
  { id: "at1", studentId: "u_student", date: "2026-07-01", status: "present" },
  { id: "at2", studentId: "u_student", date: "2026-07-02", status: "present" },
  { id: "at3", studentId: "u_student", date: "2026-07-03", status: "absent" },
  { id: "at4", studentId: "u_student", date: "2026-07-04", status: "present" },
];

export const initialCertificates: Certificate[] = [
  { id: "cert1", studentId: "u_student", title: "شهادة إتمام حفظ جزء عم", issuedAt: "2026-05-20" },
];

export const initialPoints: PointsEntry[] = [
  { id: "p1", studentId: "u_student", points: 50, reason: "التميز في التلاوة", date: "2026-06-01" },
  { id: "p2", studentId: "u_student", points: 30, reason: "الحضور المنتظم", date: "2026-06-15" },
];

export const initialQuizResults: QuizResult[] = [
  { id: "r1", quizId: "q1", studentId: "u_student", score: 2, total: 3, submittedAt: "2026-06-20" },
];
