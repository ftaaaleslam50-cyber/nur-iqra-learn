import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/schedule")({
  head: () => ({ meta: [{ title: "الجدول الدراسي — أكاديمية النور" }] }),
  component: SchedulePage,
});

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function SchedulePage() {
  const events = useQuery({ queryKey: ["schedule"], queryFn: api.schedule.list });

  const weekly = (events.data ?? []).filter((e) => e.type === "lesson" && e.dayOfWeek != null);
  const exams = (events.data ?? []).filter((e) => e.type === "exam");
  const other = (events.data ?? []).filter((e) => e.type === "event");

  return (
    <AppLayout title="الجدول الدراسي">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              الجدول الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DAYS.map((day, i) => {
                const dayEvents = weekly.filter((e) => e.dayOfWeek === i);
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 rounded-lg border bg-muted/20 p-3"
                  >
                    <div className="font-display font-bold text-primary">{day}</div>
                    <div className="min-w-0">
                      {dayEvents.length === 0 && (
                        <span className="text-sm text-muted-foreground">لا توجد دروس</span>
                      )}
                      {dayEvents.map((e) => (
                        <div key={e.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-semibold">{e.title}</span>
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {e.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-base">مواعيد الاختبارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exams.length === 0 && (
                <p className="text-sm text-muted-foreground">لا توجد اختبارات مجدولة.</p>
              )}
              {exams.map((e) => (
                <div key={e.id} className="rounded-lg border bg-muted/20 p-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-warning text-warning-foreground">امتحان</Badge>
                    <span className="font-semibold">{e.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{e.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {e.time}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-base">فعاليات الأكاديمية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {other.length === 0 && (
                <p className="text-sm text-muted-foreground">لا توجد فعاليات قادمة.</p>
              )}
              {other.map((e) => (
                <div key={e.id} className="rounded-lg border bg-muted/20 p-3">
                  <div className="font-semibold">{e.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{e.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {e.time}
                    </span>
                    {e.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {e.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
