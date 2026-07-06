import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, Clock, HelpCircle, PlayCircle, Trophy } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/quizzes")({
  head: () => ({ meta: [{ title: "الاختبارات — أكاديمية النور" }] }),
  component: QuizzesPage,
});

function QuizzesPage() {
  const { user } = useAuth();
  const quizzes = useQuery({ queryKey: ["quizzes"], queryFn: api.quizzes.list });
  const results = useQuery({
    queryKey: ["results", user?.id],
    queryFn: () => api.quizzes.resultsForStudent(user!.id),
    enabled: !!user,
  });

  const resultFor = (quizId: string) =>
    (results.data ?? []).filter((r) => r.quizId === quizId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];

  return (
    <AppLayout title="الاختبارات">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(quizzes.data ?? []).map((q) => {
          const r = resultFor(q.id);
          return (
            <Card key={q.id} className="card-hover flex flex-col">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
                  <BookMarked className="h-6 w-6" />
                </div>
                <CardTitle>{q.title}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {q.durationMinutes} دقيقة
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    {q.questions.length} سؤال
                  </span>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                {r && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 text-sm">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <Trophy className="h-4 w-4 text-warning" />
                      آخر نتيجة
                    </span>
                    <Badge
                      className={
                        r.score / r.total >= 0.6
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {r.score} / {r.total}
                    </Badge>
                  </div>
                )}
                <Button asChild className="w-full gradient-primary text-primary-foreground">
                  <Link to="/quizzes/$id" params={{ id: q.id }}>
                    <PlayCircle className="me-1 h-4 w-4" />
                    {r ? "إعادة الاختبار" : "بدء الاختبار"}
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
