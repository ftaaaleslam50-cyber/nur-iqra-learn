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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { AssignmentKind, Question, QuestionType } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/assignments")({
  head: () => ({ meta: [{ title: "إدارة الواجبات — أكاديمية النور" }] }),
  component: AdminAssignmentsPage,
});

/**
 * Question line format (blank line separates questions):
 *   [mcq|multi|tf|short|paragraph|fill] السؤال؟
 *   * الخيار الصحيح
 *   الخيار
 * For tf:   correct=true  → "* صحيح" is the answer, otherwise "* خطأ"
 * For fill/short: put the correct answer on the next line prefixed with *
 * For paragraph: manual grading — no correct line needed.
 */
function parseQuestions(raw: string): Question[] {
  return raw.split(/\n\s*\n/).filter((b) => b.trim()).map((block, i) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const first = lines[0];
    const m = first.match(/^\[(mcq|multi|tf|short|paragraph|fill)\]\s*(.*)$/i);
    const type = (m?.[1]?.toLowerCase() ?? "mcq") as QuestionType;
    const prompt = m ? m[2] : first;
    const rest = lines.slice(1);
    const q: Question = { id: `q_${i}_${Math.random().toString(36).slice(2,6)}`, type, prompt, marks: 1 };
    if (type === "mcq") {
      const idx = rest.findIndex((o) => o.startsWith("*"));
      q.options = rest.map((o) => o.replace(/^\*\s*/, ""));
      q.correct = Math.max(0, idx);
    } else if (type === "multi") {
      const correct: number[] = [];
      q.options = rest.map((o, j) => {
        if (o.startsWith("*")) correct.push(j);
        return o.replace(/^\*\s*/, "");
      });
      q.correct = correct;
    } else if (type === "tf") {
      const correctLine = rest.find((l) => l.startsWith("*"))?.replace(/^\*\s*/, "") ?? "صحيح";
      q.correct = correctLine === "صحيح";
    } else if (type === "fill" || type === "short") {
      const correct = rest.find((l) => l.startsWith("*"))?.replace(/^\*\s*/, "") ?? "";
      q.correct = correct;
    }
    return q;
  });
}

const kindLabel = (k: AssignmentKind) =>
  k === "assignment" ? "واجب" : k === "quiz" ? "اختبار قصير" : "امتحان";

function AdminAssignmentsPage() {
  const qc = useQueryClient();
  const assignments = useQuery({ queryKey: ["assignments"], queryFn: api.assignments.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", instructions: "",
    courseId: "", kind: "assignment" as AssignmentKind,
    availableAt: "", dueAt: "", closesAt: "",
    totalMarks: 10, timeLimitMin: 0, visible: true,
    rawQuestions: "",
  });

  const create = useMutation({
    mutationFn: () => {
      const questions = parseQuestions(form.rawQuestions);
      const totalMarks = questions.reduce((s, q) => s + (q.marks || 1), 0) || Number(form.totalMarks);
      return api.assignments.create({
        title: form.title, description: form.description, instructions: form.instructions,
        courseId: form.courseId, kind: form.kind,
        availableAt: form.availableAt || undefined,
        dueAt: form.dueAt || undefined,
        closesAt: form.closesAt || undefined,
        totalMarks,
        timeLimitMin: Number(form.timeLimitMin) || undefined,
        visible: form.visible,
        attachments: [],
        questions,
      });
    },
    onSuccess: () => {
      toast.success("تم الحفظ");
      qc.invalidateQueries({ queryKey: ["assignments"] });
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "فشل"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.assignments.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });

  return (
    <AppLayout title="الواجبات والاختبارات">
      <div className="mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="me-1 h-4 w-4" /> نشاط جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>واجب / اختبار / امتحان جديد</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2"><Label>العنوان</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>النوع</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as AssignmentKind })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">واجب</SelectItem>
                    <SelectItem value="quiz">اختبار قصير</SelectItem>
                    <SelectItem value="exam">امتحان</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>الدورة</Label>
                <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    {(courses.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2"><Label>الوصف</Label>
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-1 sm:col-span-2"><Label>التعليمات</Label>
                <Textarea rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></div>
              <div className="space-y-1"><Label>تاريخ الإتاحة</Label>
                <Input type="date" value={form.availableAt} onChange={(e) => setForm({ ...form, availableAt: e.target.value })} /></div>
              <div className="space-y-1"><Label>الاستحقاق</Label>
                <Input type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></div>
              <div className="space-y-1"><Label>الإغلاق</Label>
                <Input type="date" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} /></div>
              <div className="space-y-1"><Label>مدة (دقيقة، اختياري)</Label>
                <Input type="number" value={form.timeLimitMin} onChange={(e) => setForm({ ...form, timeLimitMin: Number(e.target.value) })} /></div>
              <div className="space-y-1 sm:col-span-2">
                <Label>الأسئلة</Label>
                <Textarea
                  rows={10}
                  placeholder={"[mcq] كم عدد أركان الإسلام؟\n* خمسة\nأربعة\nستة\n\n[tf] الصلاة عمود الدين.\n* صحيح\n\n[fill] عاصمة دولة الإسلام الأولى ______\n* المدينة\n\n[paragraph] اذكر أثر الصلاة في حياة المسلم."}
                  value={form.rawQuestions}
                  onChange={(e) => setForm({ ...form, rawQuestions: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  الأنواع: [mcq] [multi] [tf] [short] [paragraph] [fill]. ضع * أمام الإجابة الصحيحة، وافصل بين الأسئلة بسطر فارغ.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={!form.title || !form.courseId}
                className="gradient-primary text-primary-foreground">حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(assignments.data ?? []).map((a) => {
          const course = (courses.data ?? []).find((c) => c.id === a.courseId);
          return (
            <Card key={a.id} className="card-hover">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline">{kindLabel(a.kind)}</Badge>
                    {!a.visible && <Badge className="bg-muted text-foreground">مخفي</Badge>}
                  </div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookMarked className="h-4 w-4 text-primary" /> {a.title}
                  </CardTitle>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {course?.title} · {a.questions.length} سؤال · {a.totalMarks} درجة
                    {a.dueAt && ` · حتى ${a.dueAt}`}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => confirm("حذف؟") && remove.mutate(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
                  {a.questions.slice(0, 3).map((qq) => <li key={qq.id} className="truncate">{qq.prompt}</li>)}
                  {a.questions.length > 3 && <li>…</li>}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
