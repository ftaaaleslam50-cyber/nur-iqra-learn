import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, Clock, HelpCircle, PlayCircle, Trophy } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AssignmentKind } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/assignments")({
  head: () => ({ meta: [{ title: "الواجبات والاختبارات — أكاديمية النور" }] }),
  component: AssignmentsPage,
});

const kindLabel = (k: AssignmentKind) =>
  k === "assignment" ? "واجب" : k === "quiz" ? "اختبار قصير" : "امتحان";
const kindClass = (k: AssignmentKind) =>
  k === "assignment" ? "bg-primary/10 text-primary" :
  k === "quiz" ? "bg-warning/15 text-warning" :
  "bg-destructive/10 text-destructive";

function AssignmentsPage() {
  const { user } = useAuth();
  const assignments = useQuery({ queryKey: ["assignments"], queryFn: api.assignments.list });
  const subs = useQuery({
    queryKey: ["submissions", user?.id],
    queryFn: () => api.submissions.forStudent(user!.id),
    enabled: !!user,
  });

  const subFor = (aid: string) =>
    (subs.data ?? []).filter((s) => s.assignmentId === aid)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];

  const visible = (assignments.data ?? []).filter((a) => a.visible);

  return (
    <AppLayout title="الواجبات والاختبارات">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => {
          const sub = subFor(a.id);
          return (
            <Card key={a.id} className="card-hover flex flex-col">
              <CardHeader>
                <div className="mb-3 flex items-center justify-between">
                  <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
                    <BookMarked className="h-6 w-6" />
                  </div>
                  <Badge className={kindClass(a.kind)}>{kindLabel(a.kind)}</Badge>
                </div>
                <CardTitle>{a.title}</CardTitle>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {a.timeLimitMin && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {a.timeLimitMin} دقيقة
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> {a.questions.length} سؤال
                  </span>
                  <span>الدرجة: {a.totalMarks}</span>
                  {a.dueAt && <span>الاستحقاق: {new Date(a.dueAt).toLocaleDateString("ar")}</span>}
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                {sub && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <Trophy className="h-4 w-4 text-warning" />
                      {sub.finalScore == null ? "بانتظار التصحيح" : "آخر نتيجة"}
                    </span>
                    <Badge className={
                      sub.finalScore == null ? "bg-muted text-foreground" :
                      sub.finalScore / a.totalMarks >= 0.6 ? "bg-success text-success-foreground" :
                      "bg-destructive text-destructive-foreground"
                    }>
                      {(sub.finalScore ?? sub.autoScore)} / {a.totalMarks}
                    </Badge>
                  </div>
                )}
                <Button asChild className="w-full gradient-primary text-primary-foreground">
                  <Link to="/assignments/$id" params={{ id: a.id }}>
                    <PlayCircle className="me-1 h-4 w-4" />
                    {sub ? "فتح" : "بدء"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
