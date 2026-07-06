import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Users } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/courses")({
  head: () => ({ meta: [{ title: "الدورات — أكاديمية النور" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: api.lessons.list });
  const students = useQuery({ queryKey: ["students"], queryFn: api.students.list });

  return (
    <AppLayout title="الدورات">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(courses.data ?? []).map((c) => {
          const lessonCount = (lessons.data ?? []).filter((l) => l.courseId === c.id).length;
          const studentCount = (students.data ?? []).filter((s) => s.courseId === c.id).length;
          const statusLabel =
            c.status === "upcoming" ? "قادمة" : c.status === "completed" ? "منتهية" : "جارية";
          const statusClass =
            c.status === "upcoming" ? "bg-warning text-warning-foreground" :
            c.status === "completed" ? "bg-muted text-foreground" :
            "bg-success text-success-foreground";
          return (
            <Link key={c.id} to="/courses/$id" params={{ id: c.id }}>
              <Card className="card-hover h-full overflow-hidden">
                <div className="relative aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5">
                  {c.coverImage ? (
                    <img src={c.coverImage} alt={c.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <BookOpen className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <Badge className={`absolute end-2 top-2 ${statusClass}`}>{statusLabel}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{c.title}</CardTitle>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {lessonCount} درس
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {studentCount} طالب
                  </span>
                  {(c.startDate || c.endDate) && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {c.startDate} → {c.endDate ?? "…"}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppLayout>
  );
}
