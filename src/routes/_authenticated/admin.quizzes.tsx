import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BookMarked, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { QuizQuestion } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/quizzes")({
  head: () => ({ meta: [{ title: "إدارة الاختبارات — أكاديمية النور" }] }),
  component: AdminQuizzesPage,
});

/**
 * Question format (one per block, separated by empty line):
 * السؤال؟
 * * الإجابة الصحيحة (يبدأ ب *)
 * إجابة أخرى
 * إجابة أخرى
 */
function parseQuestions(raw: string): QuizQuestion[] {
  return raw.split(/\n\s*\n/).filter(Boolean).map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const [question, ...opts] = lines;
    const correctIndex = Math.max(0, opts.findIndex((o) => o.startsWith("*")));
    const options = opts.map((o) => o.replace(/^\*\s*/, ""));
    return { id: `q_${i}`, question, options, correctIndex };
  });
}

function AdminQuizzesPage() {
  const qc = useQueryClient();
  const quizzes = useQuery({ queryKey: ["quizzes"], queryFn: api.quizzes.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: "", durationMinutes: 10, rawQuestions: "" });

  const create = useMutation({
    mutationFn: () =>
      api.quizzes.create({
        title: form.title,
        courseId: form.courseId,
        durationMinutes: Number(form.durationMinutes) || 10,
        questions: parseQuestions(form.rawQuestions),
      }),
    onSuccess: () => {
      toast.success("تمت إضافة الاختبار");
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      setOpen(false);
      setForm({ title: "", courseId: "", durationMinutes: 10, rawQuestions: "" });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.quizzes.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });

  return (
    <AppLayout title="إدارة الاختبارات">
      <div className="mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="me-1 h-4 w-4" /> اختبار جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl">
            <DialogHeader><DialogTitle>اختبار جديد</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2"><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>الدورة</Label>
                <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر دورة" /></SelectTrigger>
                  <SelectContent>
                    {(courses.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>المدة (بالدقائق)</Label><Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></div>
              <div className="space-y-1 sm:col-span-2">
                <Label>الأسئلة</Label>
                <Textarea
                  rows={10}
                  placeholder={"ما هو أول ركن من أركان الصلاة؟\n* تكبيرة الإحرام\nقراءة الفاتحة\nالركوع\nالنية\n\nكم عدد ركعات صلاة الفجر؟\n* ركعتان\nثلاث\nأربع"}
                  value={form.rawQuestions}
                  onChange={(e) => setForm({ ...form, rawQuestions: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">اكتب السؤال ثم الخيارات — ضع * قبل الإجابة الصحيحة، وافصل بين الأسئلة بسطر فارغ.</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={!form.title || !form.courseId} className="gradient-primary text-primary-foreground">حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(quizzes.data ?? []).map((q) => {
          const course = (courses.data ?? []).find((c) => c.id === q.courseId);
          return (
            <Card key={q.id} className="card-hover">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookMarked className="h-4 w-4 text-primary" />
                    {q.title}
                  </CardTitle>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {course?.title} · {q.questions.length} سؤال · {q.durationMinutes} دقيقة
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => confirm("حذف؟") && remove.mutate(q.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
                  {q.questions.slice(0, 3).map((qq) => <li key={qq.id} className="truncate">{qq.question}</li>)}
                  {q.questions.length > 3 && <li>...</li>}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
