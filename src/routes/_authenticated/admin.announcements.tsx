import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  head: () => ({ meta: [{ title: "إدارة الإعلانات — أكاديمية النور" }] }),
  component: AdminAnnouncementsPage,
});

function AdminAnnouncementsPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["announcements"], queryFn: api.announcements.list });
  const [form, setForm] = useState({ title: "", body: "", important: false });

  const create = useMutation({
    mutationFn: () => api.announcements.create(form),
    onSuccess: () => {
      toast.success("تم النشر");
      qc.invalidateQueries({ queryKey: ["announcements"] });
      setForm({ title: "", body: "", important: false });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.announcements.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });

  return (
    <AppLayout title="إدارة الإعلانات">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> إعلان جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1"><Label>النص</Label><Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="imp">إعلان مهم</Label>
              <Switch id="imp" checked={form.important} onCheckedChange={(v) => setForm({ ...form, important: v })} />
            </div>
            <Button onClick={() => create.mutate()} disabled={!form.title} className="w-full gradient-primary text-primary-foreground">
              نشر
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> الإعلانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(list.data ?? []).map((a) => (
              <div key={a.id} className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{a.title}</div>
                      {a.important && <Badge className="bg-warning text-warning-foreground">هام</Badge>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString("ar")}</div>
                    <p className="mt-2 text-sm">{a.body}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(a.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
