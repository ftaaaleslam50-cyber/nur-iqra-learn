import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/courses/$id")({
  head: () => ({ meta: [{ title: "دورة — أكاديمية النور" }] }),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { id } = Route.useParams();
  const course = useQuery({ queryKey: ["course", id], queryFn: () => api.courses.get(id) });
  const lessons = useQuery({
    queryKey: ["lessons-by-course", id],
    queryFn: () => api.lessons.listByCourse(id),
  });

  const c = course.data;

  return (
    <AppLayout title={c?.title ?? "دورة"}>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/courses"><ChevronLeft className="me-1 h-4 w-4" /> كل الدورات</Link>
      </Button>

      {c && (
        <div className="mb-6 overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground shadow-elegant">
          <div className="text-sm opacity-90">{c.instructor}</div>
          <h2 className="mt-1 font-display text-2xl font-black">{c.title}</h2>
          <p className="mt-2 text-sm opacity-90">{c.description}</p>
        </div>
      )}

      <div className="space-y-3">
        {(lessons.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد دروس في هذه الدورة بعد.</p>
        )}
        {(lessons.data ?? []).map((l) => (
          <Link key={l.id} to="/lessons/$id" params={{ id: l.id }}>
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {l.order}
                      </span>
                      <span className="min-w-0 truncate">{l.title}</span>
                    </CardTitle>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
                  </div>
                  <PlayCircle className="h-6 w-6 shrink-0 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> {(l.attachments?.length ?? 0)} مرفق
                </span>
                {l.scheduledAt && <span>{new Date(l.scheduledAt).toLocaleString("ar")}</span>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
