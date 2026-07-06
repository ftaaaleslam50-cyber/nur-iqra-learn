import type {
  Announcement,
  Assignment,
  AttendanceRecord,
  AttendanceSession,
  Book,
  Certificate,
  Course,
  Lesson,
  PointsEntry,
  ScheduleEvent,
  Submission,
  User,
} from "./types";

export const initialUsers: User[] = [
  { id: "u_admin", username: "admin", password: "admin123", role: "admin",
    fullName: "الأستاذ عبد الرحمن", email: "admin@academy.local", joinedAt: "2024-01-01" },
  { id: "u_student", username: "student", password: "student123", role: "student",
    fullName: "محمد الأمين", email: "student@academy.local", phone: "+212600000000",
    courseId: "c_quran", joinedAt: "2024-09-01" },
  { id: "u_s2", username: "sara", password: "sara123", role: "student",
    fullName: "سارة بن علي", email: "sara@academy.local",
    courseId: "c_fiqh", joinedAt: "2024-09-10" },
];

export const initialCourses: Course[] = [
  { id: "c_quran", title: "تحفيظ القرآن الكريم",
    description: "دورة متكاملة في تحفيظ وتجويد القرآن الكريم.",
    instructor: "الشيخ أحمد", startDate: "2026-01-01", endDate: "2026-12-31",
    status: "active" },
  { id: "c_fiqh", title: "الفقه الإسلامي",
    description: "أساسيات الفقه في العبادات والمعاملات.",
    instructor: "الشيخ يوسف", startDate: "2026-02-01", endDate: "2026-08-31",
    status: "active" },
  { id: "c_seerah", title: "السيرة النبوية",
    description: "دراسة سيرة النبي محمد ﷺ.",
    instructor: "الأستاذ إبراهيم", startDate: "2026-09-01", endDate: "2027-01-31",
    status: "upcoming" },
];

export const initialLessons: Lesson[] = [
  {
    id: "l1", courseId: "c_quran", order: 1,
    title: "أحكام النون الساكنة والتنوين",
    description: "شرح مفصل لأحكام النون الساكنة والتنوين مع أمثلة تطبيقية.",
    youtubeId: "9bZkp7q19f0",
    transcript: "في هذا الدرس نتعرف على أحكام النون الساكنة والتنوين وهي: الإظهار، الإدغام، الإقلاب، والإخفاء...",
    notes: "راجع الأمثلة في المصحف من سورة البقرة.",
    attachments: [
      { id: "a1", name: "ملخص الدرس.pdf", url: "#", type: "pdf" },
      { id: "a2", name: "تمارين تطبيقية.doc", url: "#", type: "doc" },
    ],
    homework: [{ id: "h1", name: "واجب الدرس.pdf", url: "#", type: "pdf" }],
    resources: [{ id: "r1", name: "مرجع إضافي.pdf", url: "#", type: "pdf" }],
    scheduledAt: "2026-07-01T17:00:00",
  },
  {
    id: "l2", courseId: "c_quran", order: 2,
    title: "أحكام المدود",
    description: "أنواع المدود وأحكامها في تلاوة القرآن الكريم.",
    youtubeId: "M7lc1UVf-VE",
    transcript: "المد هو إطالة الصوت بحرف من حروف المد الثلاثة (الألف، الواو، الياء)...",
    attachments: [{ id: "a3", name: "أمثلة على المدود.pdf", url: "#", type: "pdf" }],
    homework: [], resources: [],
    scheduledAt: "2026-07-08T17:00:00",
  },
  {
    id: "l3", courseId: "c_fiqh", order: 1,
    title: "أركان الصلاة",
    description: "التعرف على أركان الصلاة وشروطها.",
    youtubeId: "hY7m5jjJ9mM",
    transcript: "أركان الصلاة أربعة عشر ركناً وهي...",
    attachments: [], homework: [], resources: [],
    scheduledAt: "2026-07-03T18:30:00",
  },
  {
    id: "l4", courseId: "c_seerah", order: 1,
    title: "المولد النبوي الشريف",
    description: "أحداث ولادة النبي محمد ﷺ ونشأته.",
    youtubeId: "aqz-KE-bpKQ",
    transcript: "ولد النبي محمد ﷺ في مكة المكرمة يوم الاثنين...",
    attachments: [], homework: [], resources: [],
    scheduledAt: "2026-09-05T17:00:00",
  },
];

export const initialSchedule: ScheduleEvent[] = [
  { id: "s1", title: "درس التحفيظ", type: "lesson", date: "", time: "17:00", dayOfWeek: 1 },
  { id: "s2", title: "درس الفقه", type: "lesson", date: "", time: "18:30", dayOfWeek: 3 },
  { id: "s3", title: "درس السيرة", type: "lesson", date: "", time: "17:00", dayOfWeek: 5 },
  { id: "s4", title: "امتحان التجويد", type: "exam", date: "2026-07-20", time: "10:00" },
  { id: "s5", title: "احتفال ختم القرآن", type: "event", date: "2026-08-01", time: "19:00", location: "قاعة الأكاديمية" },
];

export const initialAssignments: Assignment[] = [
  {
    id: "as1", courseId: "c_quran", kind: "quiz",
    title: "اختبار أحكام التجويد",
    description: "اختبار قصير لقياس فهم أحكام التجويد.",
    instructions: "أجب عن جميع الأسئلة. لا يمكن العودة بعد الإرسال.",
    totalMarks: 3, timeLimitMin: 10, visible: true, attachments: [],
    availableAt: "2026-06-01", dueAt: "2026-08-01",
    questions: [
      { id: "q1a", type: "mcq", marks: 1,
        prompt: "كم عدد أحكام النون الساكنة والتنوين؟",
        options: ["ثلاثة", "أربعة", "خمسة", "ستة"], correct: 1 },
      { id: "q1b", type: "mcq", marks: 1,
        prompt: "ما هو حكم النون الساكنة إذا جاء بعدها حرف الباء؟",
        options: ["الإظهار", "الإدغام", "الإقلاب", "الإخفاء"], correct: 2 },
      { id: "q1c", type: "tf", marks: 1,
        prompt: "حروف المد ثلاثة: الألف والواو والياء.", correct: true },
    ],
  },
  {
    id: "as2", courseId: "c_fiqh", kind: "assignment",
    title: "واجب أركان الصلاة",
    description: "اكتب فقرة عن أهمية الخشوع في الصلاة.",
    instructions: "لا تقل عن ٥ أسطر.",
    totalMarks: 10, visible: true, attachments: [],
    dueAt: "2026-08-15",
    questions: [
      { id: "q2a", type: "paragraph", marks: 10,
        prompt: "اكتب فقرة عن الخشوع في الصلاة." },
    ],
  },
];

export const initialSubmissions: Submission[] = [
  {
    id: "sub1", assignmentId: "as1", studentId: "u_student",
    answers: { q1a: 1, q1b: 2, q1c: true },
    autoScore: 3, finalScore: 3,
    submittedAt: "2026-06-20T10:00:00Z", gradedAt: "2026-06-20T10:00:00Z",
  },
];

export const initialBooks: Book[] = [
  { id: "b1", title: "رياض الصالحين", author: "الإمام النووي",
    category: "الحديث", fileUrl: "#", createdAt: "2026-01-01",
    description: "مختارات من الأحاديث النبوية." },
  { id: "b2", title: "تفسير ابن كثير (المختصر)", author: "ابن كثير",
    category: "التفسير", fileUrl: "#", createdAt: "2026-01-10" },
  { id: "b3", title: "متن الآجرومية", author: "ابن آجروم",
    category: "اللغة العربية", fileUrl: "#", createdAt: "2026-02-01" },
];

export const initialAnnouncements: Announcement[] = [
  { id: "an1", title: "بدء الفصل الدراسي الجديد",
    body: "نعلن عن بدء الفصل الدراسي الجديد يوم الاثنين القادم إن شاء الله.",
    createdAt: "2026-07-01T09:00:00Z", important: true },
  { id: "an2", title: "مسابقة حفظ القرآن الكريم",
    body: "ستقام مسابقة سنوية لحفظ القرآن الكريم مع جوائز قيمة للفائزين.",
    createdAt: "2026-06-25T10:00:00Z" },
  { id: "an3", title: "دورة صيفية في السيرة النبوية",
    body: "نفتح باب التسجيل في الدورة الصيفية المكثفة في السيرة النبوية.",
    createdAt: "2026-06-15T08:00:00Z" },
];

export const initialAttendance: AttendanceRecord[] = [
  { id: "at1", studentId: "u_student", date: "2026-07-01", status: "present", lessonId: "l1" },
  { id: "at2", studentId: "u_student", date: "2026-07-08", status: "late", lessonId: "l2" },
  { id: "at3", studentId: "u_student", date: "2026-07-03", status: "absent", lessonId: "l3" },
  { id: "at4", studentId: "u_student", date: "2026-07-15", status: "present", lessonId: "l1" },
];

export const initialAttendanceSessions: AttendanceSession[] = [];

export const initialCertificates: Certificate[] = [
  { id: "cert1", studentId: "u_student",
    title: "شهادة إتمام حفظ جزء عم", issuedAt: "2026-05-20" },
];

export const initialPoints: PointsEntry[] = [
  { id: "p1", studentId: "u_student", points: 50, reason: "التميز في التلاوة", date: "2026-06-01" },
  { id: "p2", studentId: "u_student", points: 30, reason: "الحضور المنتظم", date: "2026-06-15" },
];
