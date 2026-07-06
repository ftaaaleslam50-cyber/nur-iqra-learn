import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Library, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/admin/books")({
  head: () => ({ meta: [{ title: "إدارة الكتب — أكاديمية النور" }] }),
  component: AdminBooksPage,
});

function AdminBooksPage() {
  const qc = useQueryClient();
  const books = useQuery({ queryKey: ["books"], queryFn: api.books.list });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", category: "", coverUrl: "", fileUrl: "", description: "" });

  const create = useMutation({
    mutationFn: () => api.books.create(form),
    onSuccess: () => {
      toast.success("تمت الإضافة");
      qc.invalidateQueries({ queryKey: ["books"] });
      setOpen(false);
      setForm({ title: "", author: "", category: "", coverUrl: "", fileUrl: "", description: "" });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.books.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books"] }),
  });

  return (
    <AppLayout title="إدارة الكتب">
      <div className="mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="me-1 h-4 w-4" /> كتاب جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-lg">
            <DialogHeader><DialogTitle>كتاب جديد</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>العنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>المؤلف</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div><Label>الفئة</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="التفسير، الحديث…" /></div>
              <div><Label>رابط الغلاف (اختياري)</Label><Input value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} /></div>
              <div><Label>رابط الملف</Label><Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /></div>
              <div><Label>الوصف</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={!form.title || !form.category || !form.fileUrl}
                className="gradient-primary text-primary-foreground">حفظ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(books.data ?? []).map((b) => (
          <Card key={b.id} className="card-hover">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <Badge variant="outline" className="mb-1">{b.category}</Badge>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Library className="h-4 w-4 text-primary" /> {b.title}
                </CardTitle>
                <div className="mt-1 text-xs text-muted-foreground">{b.author}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => confirm("حذف؟") && remove.mutate(b.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            {b.description && <CardContent className="text-sm text-muted-foreground">{b.description}</CardContent>}
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
