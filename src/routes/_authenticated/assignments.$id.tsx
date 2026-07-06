import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/assignments/$id")({
  head: () => ({ meta: [{ title: "اختبار — أكاديمية النور" }] }),
  component: QuizPage,
});

function QuizPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const quiz = useQuery({ queryKey: ["quiz", id], queryFn: () => api.quizzes.get(id) });

  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<{ score: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (quiz.data && timeLeft === null) {
      setTimeLeft(quiz.data.durationMinutes * 60);
      setAnswers(new Array(quiz.data.questions.length).fill(-1));
    }
  }, [quiz.data, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      void submit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted]);

  const answered = answers.filter((a) => a >= 0).length;
  const progress = quiz.data ? (answered / quiz.data.questions.length) * 100 : 0;

  const timeStr = useMemo(() => {
    if (timeLeft === null) return "";
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const submit = async () => {
    if (!quiz.data || !user || submitted) return;
    setSubmitting(true);
    try {
      const r = await api.quizzes.submit({
        quizId: quiz.data.id,
        studentId: user.id,
        answers: answers.map((a) => (a < 0 ? -1 : a)),
      });
      setSubmitted({ score: r.score, total: r.total });
      toast.success("تم إرسال الاختبار");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz.data) {
    return (
      <AppLayout title="اختبار">
        <div className="grid place-items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (submitted) {
    const pct = Math.round((submitted.score / submitted.total) * 100);
    const pass = pct >= 60;
    return (
      <AppLayout title="نتيجة الاختبار">
        <Card className="mx-auto max-w-lg text-center">
          <CardContent className="p-8">
            <div
              className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full ${
                pass ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}
            >
              {pass ? <Check className="h-10 w-10" /> : <X className="h-10 w-10" />}
            </div>
            <h2 className="font-display text-3xl font-black">
              {submitted.score} / {submitted.total}
            </h2>
            <p className="mt-1 text-muted-foreground">النسبة: {pct}%</p>
            <p className="mt-4 text-sm">
              {pass ? "أحسنت! لقد اجتزت الاختبار." : "ننصحك بمراجعة الدرس وإعادة المحاولة."}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => navigate({ to: "/quizzes" })}>العودة للاختبارات</Button>
              <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
                لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={quiz.data.title}>
      <div className="sticky top-14 z-10 -mx-4 mb-4 border-b bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Clock className="h-4 w-4" />
            {timeStr}
          </div>
          <div className="text-sm text-muted-foreground">
            تمت الإجابة: {answered} / {quiz.data.questions.length}
          </div>
          <div className="ms-auto flex-1 sm:min-w-40 sm:flex-initial">
            <Progress value={progress} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {quiz.data.questions.map((q, qi) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base">
                <span className="me-2 text-primary">{qi + 1}.</span>
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)))
                    }
                    className={`flex items-center gap-3 rounded-lg border p-3 text-right transition ${
                      selected
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                        selected ? "border-primary bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      {String.fromCharCode(1571 + oi) /* ا ب ج د */}
                    </span>
                    <span className="min-w-0 flex-1">{opt}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 z-10 mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={submit}
          disabled={submitting}
          className="gradient-primary text-primary-foreground shadow-elegant"
        >
          {submitting ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : null}
          إنهاء وإرسال الإجابات
        </Button>
      </div>
    </AppLayout>
  );
}
