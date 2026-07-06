import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Library,
  Megaphone,
  Percent,
  QrCode,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "التقدم والإنجازات — أكاديمية النور" }] }),
  component: DashboardRouter,
});

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "admin" ? <AdminDashboard /> : <StudentDashboard />;
}

// ---------------- Student: Progress & Achievements ----------------
function StudentDashboard() {
  const { user } = useAuth();
  const studentId = user!.id;

  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: api.lessons.list });
  const attendance = useQuery({
    queryKey: ["attendance", studentId],
    queryFn: () => api.attendance.forStudent(studentId),
  });
  const points = useQuery({
    queryKey: ["points", studentId],
    queryFn: () => api.points.forStudent(studentId),
  });
  const certs = useQuery({
    queryKey: ["certs", studentId],
    queryFn: () => api.certificates.forStudent(studentId),
  });
  const assignments = useQuery({ queryKey: ["assignments"], queryFn: api.assignments.list });
  const submissions = useQuery({
    queryKey: ["submissions", studentId],
    queryFn: () => api.submissions.forStudent(studentId),
  });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: api.announcements.list });

  const currentCourse = courses.data?.find((c) => c.id === user!.courseId);
  const courseLessons = (lessons.data ?? [])
    .filter((l) => l.courseId === user!.courseId)
    .sort((a, b) => a.order - b.order);

  const totalPoints = (points.data ?? []).reduce((s, p) => s + p.points, 0);
  const att = attendance.data ?? [];
  const attTotal = att.length || 1;
  const present = att.filter((a) => a.status === "present").length;
  const late = att.filter((a) => a.status === "late").length;
  const absent = att.filter((a) => a.status === "absent").length;
  const attRate = Math.round(((present + late) / attTotal) * 100);

  const progress = courseLessons.length
    ? Math.min(100, Math.round(((present + late) / courseLessons.length) * 100))
    : 0;

  const now = new Date();
  const upcomingLessons = courseLessons
    .filter((l) => l.scheduledAt && new Date(l.scheduledAt) > now)
    .slice(0, 3);
  const recentLessons = courseLessons
    .filter((l) => l.scheduledAt && new Date(l.scheduledAt) <= now)
    .slice(-3)
    .reverse();

  const upcomingExams = (assignments.data ?? [])
    .filter((a) => a.kind === "exam" && (!a.dueAt || new Date(a.dueAt) > now))
    .slice(0, 3);

  const perCourse = (courses.data ?? []).map((c) => {
    const ls = (lessons.data ?? []).filter((l) => l.courseId === c.id);
    const attForC = att.filter((a) => a.lessonId && ls.some((l) => l.id === a.lessonId));
    const done = attForC.filter((a) => a.status === "present" || a.status === "late").length;
    return { course: c, pct: ls.length ? Math.round((done / ls.length) * 100) : 0, lessons: ls.length };
  });

  const subs = submissions.data ?? [];
  const gradeRows = subs.map((s) => {
    const a = assignments.data?.find((x) => x.id === s.assignmentId);
    return { s, a };
  });

  return (
    <AppLayout title="التقدم والإنجازات">
      {/* Hero card */}
      <div className="mb-6 overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground shadow-elegant">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm">
            {user!.fullName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm opacity-90">السلام عليكم ورحمة الله</div>
            <h2 className="truncate font-display text-2xl font-black">{user!.fullName}</h2>
            <div className="mt-1 text-sm opacity-90">
              {currentCourse ? `الدورة الحالية: ${currentCourse.title}` : "لم يتم تسجيلك في دورة بعد"}
            </div>
          </div>
          <div className="hidden sm:block">
            <GraduationCap className="h-16 w-16 opacity-30" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button asChild size="sm" className="gradient-primary text-primary-foreground">
          <Link to="/attendance/scan"><QrCode className="me-1 h-4 w-4" /> مسح الحضور</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/courses"><BookOpen className="me-1 h-4 w-4" /> الدورات</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/assignments"><BookMarked className="me-1 h-4 w-4" /> الواجبات والاختبارات</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/books"><Library className="me-1 h-4 w-4" /> الكتب</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Percent} label="نسبة الحضور" value={`${attRate}%`} accent="success" />
        <StatCard icon={ClipboardCheck} label="حاضر" value={String(present)} accent="success" />
        <StatCard icon={ClipboardCheck} label="متأخر" value={String(late)} accent="warning" />
        <StatCard icon={ClipboardCheck} label="غائب" value={String(absent)} accent="destructive" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Star} label="نقاط المكافآت" value={String(totalPoints)} accent="primary" />
        <StatCard icon={Trophy} label="الشهادات" value={String((certs.data ?? []).length)} accent="primary" />
        <StatCard icon={BookMarked} label="واجبات مقدمة" value={String(subs.length)} accent="primary" />
        <StatCard icon={Award} label="نتائج معتمدة" value={String(subs.filter(s=>s.finalScore!=null).length)} accent="primary" />
      </div>

      {/* Overall Progress */}
      <Card className="mt-6 card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            التقدم العام
          </CardTitle>
          <CardDescription>
            {currentCourse ? `${courseLessons.length} درس في ${currentCourse.title}` : "لا توجد دورة حالية"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold">{progress}%</span>
            <span className="text-muted-foreground">اكتمال</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Per-course progress */}
      {perCourse.length > 0 && (
        <Card className="mt-6 card-hover">
          <CardHeader>
            <CardTitle>التقدم لكل دورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {perCourse.map(({ course, pct, lessons }) => (
              <div key={course.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold">{course.title}</span>
                  <span className="text-muted-foreground">{pct}% · {lessons} دروس</span>
                </div>
                <Progress value={pct} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Two-col: grades + announcements */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              نتائج الواجبات والاختبارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gradeRows.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد نتائج بعد.</p>
            )}
            {gradeRows.slice(0, 5).map(({ s, a }) => {
              const total = a?.totalMarks ?? 0;
              const score = s.finalScore ?? s.autoScore;
              const pct = total ? Math.round((score / total) * 100) : 0;
              const pending = s.finalScore == null;
              return (
                <div key={s.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a?.title ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.submittedAt).toLocaleDateString("ar")}
                      {pending && " · بانتظار التصحيح"}
                    </div>
                  </div>
                  <Badge className={pending ? "bg-muted text-foreground" : pct >= 60 ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                    {score} / {total || "?"}
                  </Badge>
                </div>
              );
            })}
            <Link to="/assignments" className="block text-sm font-semibold text-primary hover:underline">
              كل الواجبات والاختبارات ←
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              آخر الإعلانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(announcements.data ?? []).slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <div className="text-sm font-bold">{a.title}</div>
                  {a.important && <Badge className="bg-warning text-warning-foreground">هام</Badge>}
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
              </div>
            ))}
            <Link to="/announcements" className="block text-sm font-semibold text-primary hover:underline">
              كل الإعلانات ←
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Lessons + exams row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="card-hover">
          <CardHeader><CardTitle>دروس قادمة</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcomingLessons.length === 0 && <p className="text-sm text-muted-foreground">لا توجد دروس قادمة.</p>}
            {upcomingLessons.map((l) => (
              <Link key={l.id} to="/lessons/$id" params={{ id: l.id }} className="block rounded-lg border bg-muted/30 p-3 hover:bg-muted">
                <div className="truncate text-sm font-semibold">{l.title}</div>
                <div className="text-xs text-muted-foreground">
                  {l.scheduledAt && new Date(l.scheduledAt).toLocaleString("ar")}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader><CardTitle>دروس حديثة</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentLessons.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد شيء بعد.</p>}
            {recentLessons.map((l) => (
              <Link key={l.id} to="/lessons/$id" params={{ id: l.id }} className="block rounded-lg border bg-muted/30 p-3 hover:bg-muted">
                <div className="truncate text-sm font-semibold">{l.title}</div>
                <div className="text-xs text-muted-foreground">
                  {l.scheduledAt && new Date(l.scheduledAt).toLocaleDateString("ar")}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader><CardTitle>امتحانات قادمة</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {upcomingExams.length === 0 && <p className="text-sm text-muted-foreground">لا توجد امتحانات قادمة.</p>}
            {upcomingExams.map((a) => (
              <Link key={a.id} to="/assignments/$id" params={{ id: a.id }} className="block rounded-lg border bg-muted/30 p-3 hover:bg-muted">
                <div className="truncate text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">
                  {a.dueAt && `الاستحقاق: ${new Date(a.dueAt).toLocaleDateString("ar")}`}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Attendance history */}
      <Card className="mt-6 card-hover">
        <CardHeader><CardTitle>سجل الحضور</CardTitle></CardHeader>
        <CardContent>
          {att.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا يوجد سجل بعد.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {[...att].reverse().slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                  <span>{a.date}</span>
                  <Badge className={
                    a.status === "present" ? "bg-success text-success-foreground" :
                    a.status === "late" ? "bg-warning text-warning-foreground" :
                    a.status === "excused" ? "bg-muted text-foreground" :
                    "bg-destructive text-destructive-foreground"
                  }>
                    {a.status === "present" ? "حاضر" : a.status === "late" ? "متأخر" : a.status === "excused" ? "بعذر" : "غائب"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      {(certs.data ?? []).length > 0 && (
        <Card className="mt-6 card-hover">
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> الشهادات</CardTitle></CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {(certs.data ?? []).map((c) => (
              <div key={c.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="text-sm font-semibold">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.issuedAt}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}

// ---------------- Admin ----------------
function AdminDashboard() {
  const students = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: api.lessons.list });
  const assignments = useQuery({ queryKey: ["assignments"], queryFn: api.assignments.list });
  const attendance = useQuery({ queryKey: ["attendance-all"], queryFn: api.attendance.list });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: api.announcements.list });
  const points = useQuery({ queryKey: ["points-all"], queryFn: api.points.list });

  const att = attendance.data ?? [];
  const attRate = att.length
    ? Math.round((att.filter((a) => a.status === "present" || a.status === "late").length / att.length) * 100)
    : 0;

  const recentActivity = [
    ...(announcements.data ?? []).map((a) => ({ when: a.createdAt, text: `إعلان جديد: ${a.title}`, icon: Megaphone })),
    ...(points.data ?? []).map((p) => ({ when: p.date, text: `منح ${p.points} نقطة (${p.reason})`, icon: Star })),
  ].sort((a, b) => b.when.localeCompare(a.when)).slice(0, 6);

  return (
    <AppLayout title="لوحة الإدارة">
      <div className="mb-6 rounded-2xl gradient-primary p-6 text-primary-foreground shadow-elegant">
        <h2 className="font-display text-2xl font-black">مرحباً بك في لوحة الإدارة</h2>
        <p className="mt-1 text-sm opacity-90">إدارة كاملة للطلاب، الدورات، الواجبات، والحضور.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="إجمالي الطلاب" value={String((students.data ?? []).length)} accent="primary" />
        <StatCard icon={Percent} label="نسبة الحضور" value={`${attRate}%`} accent="success" />
        <StatCard icon={BookOpen} label="عدد الدروس" value={String((lessons.data ?? []).length)} accent="primary" />
        <StatCard icon={BookMarked} label="واجبات واختبارات" value={String((assignments.data ?? []).length)} accent="warning" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            آخر النشاطات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد نشاط بعد.</p>}
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <a.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.text}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.when).toLocaleDateString("ar")}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function StatCard({
  icon: Icon, label, value, accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string;
  accent: "primary" | "success" | "warning" | "destructive";
}) {
  const bg =
    accent === "success" ? "bg-success/10 text-success" :
    accent === "warning" ? "bg-warning/15 text-warning" :
    accent === "destructive" ? "bg-destructive/10 text-destructive" :
    "bg-primary/10 text-primary";
  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${bg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="font-display text-2xl font-black">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
