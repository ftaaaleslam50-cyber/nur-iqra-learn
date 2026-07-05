import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, Trash2, Video } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  head: () => ({ meta: [{ title: "إدارة الدورات — أكاديمية النور" }] }),
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const qc = useQueryClient();
  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: api.lessons.list });

  const [courseOpen, setCourseOpen] = useState(false);
  const [course, setCourse] = useState({ title: "", description: "", instructor: "" });

  const [lessonOpen, setLessonOpen] = useState(false);
  const [lesson, setLesson] = useState({
    courseId: "", title: "", description: "", youtubeId: "", transcript: "",
    attachmentsRaw: "", order: 1,
  });

  const createCourse = useMutation({
    mutationFn: () => api.courses.create(course),
    onSuccess: () => {
      toast.success("تمت إضافة الدورة");
      qc.invalidateQueries({ queryKey: ["courses"] });
      setCourseOpen(false);
      setCourse({ title: "", description: "", instructor: "" });
    },
  });
  const removeCourse = useMutation({
    mutationFn: (id: string) => api.courses.remove(id),
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["lessons"] });
    },
  });

  const createLesson = useMutation({
    mutationFn: () =>
      api.lessons.create({
        courseId: lesson.courseId,
        title: lesson.title,
        description: lesson.description,
        youtubeId: extractYouTubeId(lesson.youtubeId),
        transcript: lesson.transcript,
        attachments: parseAttachments(lesson.attachmentsRaw),
        order: Number(lesson.order) || 1,
      }),
    onSuccess: () => {
      toast.success("تمت إضافة الدرس");
      qc.invalidateQueries({ queryKey: ["lessons"] });
      setLessonOpen(false);
      setLesson({ courseId: "", title: "", description: "", youtubeId: "", transcript: "", attachmentsRaw: "", order: 1 });
    },
  });
  const removeLesson = useMutation({
    mutationFn: (id: string) => api.lessons.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
  });

  return (
    <AppLayout title="إدارة الدورات والدروس">
      <div className="mb-4 flex flex-wrap gap-2">
        <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="me-1 h-4 w-4" /> دورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>دورة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>العنوان</Label><Input value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} /></div>
              <div className="space-y-1"><Label>الوصف</Label><Textarea value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} /></div>
              <div className="space-y-1"><Label>المدرس</Label><Input value={course.instructor} onChange={(e) => setCourse({ ...course, instructor: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createCourse.mutate()} className="gradient-primary text-primary-foreground">حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={lessonOpen} onOpenChange={setLessonOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="me-1 h-4 w-4" /> درس جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl">
            <DialogHeader><DialogTitle>درس جديد</DialogTitle></DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>الدورة</Label>
                <Select value={lesson.courseId} onValueChange={(v) => setLesson({ ...lesson, courseId: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر دورة" /></SelectTrigger>
                  <SelectContent>
                    {(courses.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>العنوان</Label><Input value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} /></div>
              <div className="space-y-1"><Label>الترتيب</Label><Input type="number" value={lesson.order} onChange={(e) => setLesson({ ...lesson, order: Number(e.target.value) })} /></div>
              <div className="space-y-1 sm:col-span-2"><Label>الوصف</Label><Textarea value={lesson.description} onChange={(e) => setLesson({ ...lesson, description: e.target.value })} /></div>
              <div className="space-y-1 sm:col-span-2">
                <Label>رابط يوتيوب أو ID</Label>
                <Input placeholder="https://youtu.be/... أو ID" value={lesson.youtubeId} onChange={(e) => setLesson({ ...lesson, youtubeId: e.target.value })} />
              </div>
              <div className="space-y-1 sm:col-span-2"><Label>النص المكتوب</Label><Textarea rows={5} value={lesson.transcript} onChange={(e) => setLesson({ ...lesson, transcript: e.target.value })} /></div>
              <div className="space-y-1 sm:col-span-2">
                <Label>المرفقات (سطر لكل مرفق: اسم | رابط | pdf/doc/image)</Label>
                <Textarea rows={3} value={lesson.attachmentsRaw} onChange={(e) => setLesson({ ...lesson, attachmentsRaw: e.target.value })} placeholder="ملخص.pdf | https://... | pdf" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => createLesson.mutate()} disabled={!lesson.courseId || !lesson.title} className="gradient-primary text-primary-foreground">حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {(courses.data ?? []).map((c) => {
          const courseLessons = (lessons.data ?? []).filter((l) => l.courseId === c.id);
          return (
            <AccordionItem key={c.id} value={c.id} className="overflow-hidden rounded-xl border bg-card">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex min-w-0 flex-1 items-center gap-3 text-right">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{courseLessons.length} درس · المدرس: {c.instructor}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t bg-muted/20 px-4 pb-4">
                <p className="mb-3 text-sm text-muted-foreground">{c.description}</p>
                <div className="space-y-2">
                  {courseLessons.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                      <Video className="h-4 w-4 text-primary" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{l.order}. {l.title}</div>
                        <div className="truncate text-xs text-muted-foreground">{l.description}</div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => confirm("حذف الدرس؟") && removeLesson.mutate(l.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => confirm("حذف الدورة وجميع دروسها؟") && removeCourse.mutate(c.id)}>
                    <Trash2 className="me-1 h-4 w-4 text-destructive" /> حذف الدورة
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </AppLayout>
  );
}

function extractYouTubeId(input: string): string {
  const s = input.trim();
  if (!s) return "";
  const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
  return m ? m[1] : s;
}

function parseAttachments(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [name = `ملف ${i + 1}`, url = "#", type = "other"] = line.split("|").map((x) => x.trim());
      return { id: `att_${i}`, name, url, type: type as "pdf" | "doc" | "image" | "other" };
    });
}
