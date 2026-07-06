import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { QuestionType } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/questions")({
  head: () => ({ meta: [{ title: "بنك الأسئلة — أكاديمية النور" }] }),
  component: QuestionBankPage,
});

const typeLabel: Record<QuestionType, string> = {
  mcq: "اختيار من متعدد", multi: "متعدد الإجابات", tf: "صح / خطأ",
  short: "إجابة قصيرة", paragraph: "إجابة مطولة", fill: "إكمال الفراغ",
};

function QuestionBankPage() {
  const assignments = useQuery({ queryKey: ["assignments"], queryFn: api.assignments.list });
  const all = (assignments.data ?? []).flatMap((a) => a.questions.map((q) => ({ q, a })));

  return (
    <AppLayout title="بنك الأسئلة">
      <p className="mb-4 text-sm text-muted-foreground">
        جميع الأسئلة المستخدمة في الواجبات والاختبارات ({all.length} سؤال). تُدار الأسئلة من داخل النشاط.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {all.map(({ q, a }) => (
          <Card key={a.id + q.id} className="card-hover">
            <CardHeader>
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge variant="outline">{typeLabel[q.type]}</Badge>
                <span className="text-xs text-muted-foreground">{a.title}</span>
              </div>
              <CardTitle className="flex items-start gap-2 text-base">
                <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                <span>{q.prompt}</span>
              </CardTitle>
            </CardHeader>
            {q.options && q.options.length > 0 && (
              <CardContent>
                <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                  {q.options.map((o, i) => (
                    <li key={i} className={
                      (Array.isArray(q.correct) ? q.correct.includes(i) : q.correct === i)
                        ? "font-semibold text-success" : ""
                    }>{o}</li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
