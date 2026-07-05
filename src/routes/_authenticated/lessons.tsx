import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookOpen, Download, FileText, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/lessons")({
  head: () => ({ meta: [{ title: "الدروس — أكاديمية النور" }] }),
  component: LessonsPage,
});

function LessonsPage() {
  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: api.lessons.list });
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const grouped = (courses.data ?? []).map((c) => ({
    course: c,
    lessons: (lessons.data ?? [])
      .filter((l) => l.courseId === c.id)
      .sort((a, b) => a.order - b.order),
  }));

  const firstCourseId = grouped[0]?.course.id;

  return (
    <AppLayout title="الدروس">
      {grouped.length === 0 ? (
        <EmptyState />
      ) : (
        <Tabs defaultValue={firstCourseId} dir="rtl">
          <TabsList className="mb-4 flex-wrap">
            {grouped.map((g) => (
              <TabsTrigger key={g.course.id} value={g.course.id}>
                {g.course.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {grouped.map((g) => (
            <TabsContent key={g.course.id} value={g.course.id} className="space-y-4">
              {g.lessons.length === 0 && (
                <p className="text-sm text-muted-foreground">لا توجد دروس في هذه الدورة بعد.</p>
              )}
              {g.lessons.map((l) => {
                const open = activeLesson === l.id;
                return (
                  <Card key={l.id} className="card-hover overflow-hidden">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                              {l.order}
                            </span>
                            <span className="min-w-0 truncate">{l.title}</span>
                          </CardTitle>
                          <p className="mt-2 text-sm text-muted-foreground">{l.description}</p>
                        </div>
                        <Button
                          variant={open ? "secondary" : "default"}
                          onClick={() => setActiveLesson(open ? null : l.id)}
                          className={!open ? "gradient-primary text-primary-foreground" : ""}
                        >
                          <PlayCircle className="me-1 h-4 w-4" />
                          {open ? "إخفاء" : "مشاهدة"}
                        </Button>
                      </div>
                    </CardHeader>
                    {open && (
                      <CardContent className="space-y-4">
                        <div className="aspect-video overflow-hidden rounded-xl border bg-black">
                          <iframe
                            className="h-full w-full"
                            src={`https://www.youtube.com/embed/${l.youtubeId}`}
                            title={l.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {l.attachments.length > 0 && (
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 font-semibold">
                              <FileText className="h-4 w-4 text-primary" />
                              المرفقات
                            </h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {l.attachments.map((a) => (
                                <a
                                  key={a.id}
                                  href={a.url}
                                  download
                                  className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3 transition hover:bg-muted"
                                >
                                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                                    <Download className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1 truncate text-sm font-medium">
                                    {a.name}
                                  </div>
                                  <span className="text-xs uppercase text-muted-foreground">
                                    {a.type}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </AppLayout>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <p className="text-muted-foreground">لا توجد دورات بعد.</p>
    </div>
  );
}
