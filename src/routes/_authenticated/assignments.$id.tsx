import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AnswerValue, Question } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/assignments/$id")({
  head: () => ({ meta: [{ title: "نشاط — أكاديمية النور" }] }),
  component: AssignmentPage,
});

function AssignmentPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const assignment = useQuery({ queryKey: ["assignment", id], queryFn: () => api.assignments.get(id) });

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<{ score: number; total: number; pending: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const a = assignment.data;

  useEffect(() => {
    if (a && a.timeLimitMin && timeLeft === null) setTimeLeft(a.timeLimitMin * 60);
  }, [a, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { void submit(); return; }
    const t = setTimeout(() => setTimeLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted]);

  const answeredCount = useMemo(() => {
    if (!a) return 0;
    return a.questions.filter((q) => {
      const v = answers[q.id];
      if (v === undefined || v === null) return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return true;
    }).length;
  }, [answers, a]);

  const progress = a ? (answeredCount / Math.max(1, a.questions.length)) * 100 : 0;

  const timeStr = useMemo(() => {
    if (timeLeft === null) return "";
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const submit = async () => {
    if (!a || !user || submitted) return;
    setSubmitting(true);
    try {
      const r = await api.assignments.submit({ assignmentId: a.id, studentId: user.id, answers });
      const pending = r.finalScore == null;
      setSubmitted({ score: r.finalScore ?? r.autoScore, total: a.totalMarks, pending });
      toast.success("تم الإرسال");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  if (!a) {
    return (
      <AppLayout title="نشاط">
        <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AppLayout>
    );
  }

  if (submitted) {
    const pct = submitted.total ? Math.round((submitted.score / submitted.total) * 100) : 0;
    const pass = pct >= 60;
    return (
      <AppLayout title="نتيجة">
        <Card className="mx-auto max-w-lg text-center">
          <CardContent className="p-8">
            <div className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full ${
              submitted.pending ? "bg-muted text-muted-foreground" :
              pass ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
            }`}>
              {submitted.pending ? <Clock className="h-10 w-10" /> :
               pass ? <Check className="h-10 w-10" /> : <X className="h-10 w-10" />}
            </div>
            <h2 className="font-display text-3xl font-black">{submitted.score} / {submitted.total}</h2>
            <p className="mt-1 text-muted-foreground">{submitted.pending ? "بانتظار التصحيح اليدوي لبعض الأسئلة" : `النسبة: ${pct}%`}</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => navigate({ to: "/assignments" })}>العودة</Button>
              <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>الصفحة الرئيسية</Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={a.title}>
      <div className="sticky top-14 z-10 -mx-4 mb-4 border-b bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          {timeStr && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <Clock className="h-4 w-4" /> {timeStr}
            </div>
          )}
          <div className="text-sm text-muted-foreground">تمت الإجابة: {answeredCount} / {a.questions.length}</div>
          <div className="ms-auto flex-1 sm:min-w-40 sm:flex-initial"><Progress value={progress} /></div>
        </div>
      </div>

      {a.instructions && (
        <Card className="mb-4"><CardContent className="p-4 text-sm">{a.instructions}</CardContent></Card>
      )}

      <div className="space-y-4">
        {a.questions.map((q, qi) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={qi}
            value={answers[q.id]}
            onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
          />
        ))}
      </div>

      <div className="sticky bottom-4 z-10 mt-6 flex justify-center">
        <Button size="lg" onClick={submit} disabled={submitting}
          className="gradient-primary text-primary-foreground shadow-elegant">
          {submitting && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
          إنهاء وإرسال
        </Button>
      </div>
    </AppLayout>
  );
}

function QuestionCard({
  q, index, value, onChange,
}: { q: Question; index: number; value: AnswerValue | undefined; onChange: (v: AnswerValue) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <span className="me-2 text-primary">{index + 1}.</span>
          {q.prompt}
          <span className="ms-2 text-xs font-normal text-muted-foreground">({q.marks} درجة)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {q.type === "mcq" && (q.options ?? []).map((opt, oi) => {
          const selected = value === oi;
          return (
            <button key={oi} type="button" onClick={() => onChange(oi)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-right transition ${
                selected ? "border-primary bg-primary/10 font-semibold text-primary" : "hover:bg-muted/50"
              }`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${
                selected ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                {String.fromCharCode(1571 + oi)}
              </span>
              <span className="min-w-0 flex-1">{opt}</span>
            </button>
          );
        })}

        {q.type === "multi" && (q.options ?? []).map((opt, oi) => {
          const arr = Array.isArray(value) ? (value as number[]) : [];
          const selected = arr.includes(oi);
          return (
            <button key={oi} type="button"
              onClick={() => onChange(selected ? arr.filter((v) => v !== oi) : [...arr, oi])}
              className={`flex items-center gap-3 rounded-lg border p-3 text-right transition ${
                selected ? "border-primary bg-primary/10 font-semibold text-primary" : "hover:bg-muted/50"
              }`}>
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded border text-xs ${
                selected ? "border-primary bg-primary text-primary-foreground" : ""}`}>
                {selected ? "✓" : ""}
              </span>
              <span className="min-w-0 flex-1">{opt}</span>
            </button>
          );
        })}

        {q.type === "tf" && ["صحيح", "خطأ"].map((label, i) => {
          const boolVal = i === 0;
          const selected = value === boolVal;
          return (
            <button key={i} type="button" onClick={() => onChange(boolVal)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-right transition ${
                selected ? "border-primary bg-primary/10 font-semibold text-primary" : "hover:bg-muted/50"
              }`}>
              <span className="min-w-0 flex-1">{label}</span>
            </button>
          );
        })}

        {q.type === "short" && (
          <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
            placeholder="اكتب إجابتك…" />
        )}
        {q.type === "fill" && (
          <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
            placeholder="أكمل الفراغ…" />
        )}
        {q.type === "paragraph" && (
          <Textarea rows={5} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
            placeholder="اكتب إجابتك التفصيلية…" />
        )}
      </CardContent>
    </Card>
  );
}
