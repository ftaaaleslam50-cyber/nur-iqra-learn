import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  Percent,
  Star,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "لوحة التحكم — أكاديمية النور" }] }),
  component: DashboardRouter,
});

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "admin" ? <AdminDashboard /> : <StudentDashboard />;
}

// ---------------- Student Dashboard ----------------
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
  const results = useQuery({
    queryKey: ["results", studentId],
    queryFn: () => api.quizzes.resultsForStudent(studentId),
  });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: api.announcements.list });

  const currentCourse = courses.data?.find((c) => c.id === user!.courseId);
  const courseLessons = lessons.data?.filter((l) => l.courseId === user!.courseId) ?? [];
  const totalPoints = (points.data ?? []).reduce((s, p) => s + p.points, 0);
  const att = attendance.data ?? [];
  const attTotal = att.length || 1;
  const attPresent = att.filter((a) => a.status === "present").length;
  const attRate = Math.round((attPresent / attTotal) * 100);
  const absences = att.filter((a) => a.status === "absent").length;
  const progress = Math.min(100, Math.round((courseLessons.length ? attPresent / courseLessons.length : 0) * 100));

  return (
    <AppLayout title="لوحة التحكم">
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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Percent} label="نسبة الحضور" value={`${attRate}%`} accent="success" />
        <StatCard icon={XCircle} label="عدد الغيابات" value={String(absences)} accent="warning" />
        <StatCard icon={Star} label="نقاط المكافآت" value={String(totalPoints)} accent="primary" />
        <StatCard icon={Trophy} label="الشهادات" value={String((certs.data ?? []).length)} accent="primary" />
      </div>

      {/* Progress */}
      <Card className="mt-6 card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            التقدم في الدورة
          </CardTitle>
          <CardDescription>
            {currentCourse
              ? `${courseLessons.length} درس في ${currentCourse.title}`
              : "لا توجد دورة حالية"}
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

      {/* Two columns */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              آخر نتائج الاختبارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(results.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد نتائج بعد.</p>
            )}
            {(results.data ?? []).slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {r.score} / {r.total}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.submittedAt).toLocaleDateString("ar")}
                  </div>
                </div>
                <Badge
                  variant={r.score / r.total >= 0.6 ? "default" : "destructive"}
                  className={
                    r.score / r.total >= 0.6 ? "bg-success text-success-foreground" : ""
                  }
                >
                  {Math.round((r.score / r.total) * 100)}%
                </Badge>
              </div>
            ))}
            <Link to="/quizzes" className="block text-sm font-semibold text-primary hover:underline">
              عرض كل الاختبارات ←
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
                  {a.important && (
                    <Badge className="bg-warning text-warning-foreground">هام</Badge>
                  )}
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
              </div>
            ))}
            <Link
              to="/announcements"
              className="block text-sm font-semibold text-primary hover:underline"
            >
              كل الإعلانات ←
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// ---------------- Admin Dashboard ----------------
function AdminDashboard() {
  const students = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: api.lessons.list });
  const quizzes = useQuery({ queryKey: ["quizzes"], queryFn: api.quizzes.list });
  const attendance = useQuery({ queryKey: ["attendance-all"], queryFn: api.attendance.list });
  const announcements = useQuery({ queryKey: ["announcements"], queryFn: api.announcements.list });
  const points = useQuery({ queryKey: ["points-all"], queryFn: api.points.list });

  const att = attendance.data ?? [];
  const attRate = att.length
    ? Math.round((att.filter((a) => a.status === "present").length / att.length) * 100)
    : 0;

  const recentActivity = [
    ...(announcements.data ?? []).map((a) => ({
      when: a.createdAt,
      text: `إعلان جديد: ${a.title}`,
      icon: Megaphone,
    })),
    ...(points.data ?? []).map((p) => ({
      when: p.date,
      text: `منح ${p.points} نقطة (${p.reason})`,
      icon: Star,
    })),
  ]
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, 6);

  return (
    <AppLayout title="لوحة الإدارة">
      <div className="mb-6 rounded-2xl gradient-primary p-6 text-primary-foreground shadow-elegant">
        <h2 className="font-display text-2xl font-black">مرحباً بك في لوحة الإدارة</h2>
        <p className="mt-1 text-sm opacity-90">إدارة كاملة للطلاب، الدروس، الاختبارات، والحضور.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="إجمالي الطلاب"
          value={String((students.data ?? []).length)}
          accent="primary"
        />
        <StatCard icon={Percent} label="نسبة الحضور" value={`${attRate}%`} accent="success" />
        <StatCard
          icon={BookOpen}
          label="عدد الدروس"
          value={String((lessons.data ?? []).length)}
          accent="primary"
        />
        <StatCard
          icon={ClipboardCheck}
          label="عدد الاختبارات"
          value={String((quizzes.data ?? []).length)}
          accent="warning"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            آخر النشاطات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentActivity.length === 0 && (
            <p className="text-sm text-muted-foreground">لا يوجد نشاط بعد.</p>
          )}
          {recentActivity.map((a, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <a.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.text}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(a.when).toLocaleDateString("ar")}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "primary" | "success" | "warning";
}) {
  const bg =
    accent === "success"
      ? "bg-success/10 text-success"
      : accent === "warning"
        ? "bg-warning/15 text-warning"
        : "bg-primary/10 text-primary";
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = Award;
