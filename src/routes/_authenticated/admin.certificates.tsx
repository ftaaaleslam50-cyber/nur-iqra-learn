import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Trophy } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/certificates")({
  head: () => ({ meta: [{ title: "إدارة الشهادات — أكاديمية النور" }] }),
  component: AdminCertsPage,
});

function AdminCertsPage() {
  const qc = useQueryClient();
  const students = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const certs = useQuery({ queryKey: ["certs-all"], queryFn: api.certificates.list });
  const [form, setForm] = useState({ studentId: "", title: "" });

  const issue = useMutation({
    mutationFn: () => api.certificates.issue({ studentId: form.studentId, title: form.title }),
    onSuccess: () => {
      toast.success("تم إصدار الشهادة");
      qc.invalidateQueries({ queryKey: ["certs-all"] });
      setForm({ studentId: "", title: "" });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.certificates.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certs-all"] }),
  });

  return (
    <AppLayout title="إدارة الشهادات">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> إصدار شهادة
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
            <div className="space-y-1"><Label>عنوان الشهادة</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <Button onClick={() => issue.mutate()} disabled={!form.studentId || !form.title} className="w-full gradient-primary text-primary-foreground">
              إصدار
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> الشهادات الصادرة
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(certs.data ?? []).map((c) => {
              const s = (students.data ?? []).find((x) => x.id === c.studentId);
              return (
                <div key={c.id} className="relative overflow-hidden rounded-xl border bg-gradient-to-bl from-primary/10 to-primary-glow/10 p-4">
                  <Trophy className="absolute -bottom-4 -left-4 h-24 w-24 text-primary/10" />
                  <div className="relative">
                    <div className="text-xs uppercase tracking-wide text-primary">شهادة</div>
                    <div className="mt-1 font-display text-lg font-bold">{c.title}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{s?.fullName ?? "—"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.issuedAt}</div>
                    <Button variant="ghost" size="icon" className="absolute -end-2 -top-2" onClick={() => remove.mutate(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {(certs.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">لا توجد شهادات.</p>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
