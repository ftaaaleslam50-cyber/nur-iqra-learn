import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { ScheduleEvent } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/schedule")({
  head: () => ({ meta: [{ title: "إدارة الجدول — أكاديمية النور" }] }),
  component: AdminSchedulePage,
});

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function AdminSchedulePage() {
  const qc = useQueryClient();
  const events = useQuery({ queryKey: ["schedule"], queryFn: api.schedule.list });
  const [form, setForm] = useState<{ title: string; type: ScheduleEvent["type"]; date: string; time: string; dayOfWeek: string; location: string }>({
    title: "", type: "lesson", date: "", time: "", dayOfWeek: "1", location: "",
  });

  const create = useMutation({
    mutationFn: () =>
      api.schedule.create({
        title: form.title,
        type: form.type,
        date: form.date,
        time: form.time,
        dayOfWeek: form.type === "lesson" ? Number(form.dayOfWeek) : undefined,
        location: form.location || undefined,
      }),
    onSuccess: () => {
      toast.success("تمت الإضافة");
      qc.invalidateQueries({ queryKey: ["schedule"] });
      setForm({ ...form, title: "", date: "", time: "", location: "" });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.schedule.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule"] }),
  });

  return (
    <AppLayout title="إدارة الجدول الدراسي">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> عنصر جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>النوع</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ScheduleEvent["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">درس أسبوعي</SelectItem>
                  <SelectItem value="exam">امتحان</SelectItem>
                  <SelectItem value="event">فعالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === "lesson" ? (
              <div className="space-y-1">
                <Label>اليوم</Label>
                <Select value={form.dayOfWeek} onValueChange={(v) => setForm({ ...form, dayOfWeek: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1"><Label>التاريخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            )}
            <div className="space-y-1"><Label>الوقت</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            {form.type !== "lesson" && (
              <div className="space-y-1"><Label>المكان (اختياري)</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            )}
            <Button onClick={() => create.mutate()} className="w-full gradient-primary text-primary-foreground">إضافة</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> عناصر الجدول
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(events.data ?? []).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                <Badge variant="outline">
                  {e.type === "lesson" ? "درس" : e.type === "exam" ? "امتحان" : "فعالية"}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{e.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.dayOfWeek != null ? DAYS[e.dayOfWeek] : e.date} — {e.time}
                    {e.location ? ` — ${e.location}` : ""}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(e.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {(events.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">لا توجد عناصر.</p>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
