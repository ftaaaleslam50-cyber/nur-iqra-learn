import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Star, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/points")({
  head: () => ({ meta: [{ title: "إدارة النقاط — أكاديمية النور" }] }),
  component: AdminPointsPage,
});

function AdminPointsPage() {
  const qc = useQueryClient();
  const students = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const points = useQuery({ queryKey: ["points-all"], queryFn: api.points.list });
  const [form, setForm] = useState({ studentId: "", points: 10, reason: "" });

  const add = useMutation({
    mutationFn: () => api.points.add({ studentId: form.studentId, points: Number(form.points), reason: form.reason }),
    onSuccess: () => {
      toast.success("تم منح النقاط");
      qc.invalidateQueries({ queryKey: ["points-all"] });
      setForm({ ...form, reason: "" });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.points.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["points-all"] }),
  });

  return (
    <AppLayout title="نقاط المكافآت">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> منح نقاط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>الطالب</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر طالب" /></SelectTrigger>
                <SelectContent>
                  {(students.data ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>النقاط (- للخصم)</Label><Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} /></div>
            <div className="space-y-1"><Label>السبب</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <Button onClick={() => add.mutate()} disabled={!form.studentId} className="w-full gradient-primary text-primary-foreground">
              منح
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> سجل النقاط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(points.data ?? []).map((p) => {
              const s = (students.data ?? []).find((x) => x.id === p.studentId);
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${p.points >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                    {p.points > 0 ? `+${p.points}` : p.points}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{s?.fullName ?? "طالب محذوف"}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.reason} — {p.date}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
            {(points.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">لا توجد نقاط بعد.</p>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
