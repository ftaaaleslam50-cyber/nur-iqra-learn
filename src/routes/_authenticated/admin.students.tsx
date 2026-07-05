import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/students")({
  head: () => ({ meta: [{ title: "إدارة الطلاب — أكاديمية النور" }] }),
  component: AdminStudentsPage,
});

type Editable = Omit<User, "id" | "role" | "joinedAt">;

const empty: Editable = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
  courseId: "",
  avatarUrl: "",
};

function AdminStudentsPage() {
  const qc = useQueryClient();
  const students = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Editable>(empty);

  const create = useMutation({
    mutationFn: () => api.students.create(form),
    onSuccess: () => {
      toast.success("تم إنشاء حساب الطالب");
      qc.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: () => api.students.update(editing!, form),
    onSuccess: () => {
      toast.success("تم حفظ التعديلات");
      qc.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      setEditing(null);
      setForm(empty);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.students.remove(id),
    onSuccess: () => {
      toast.success("تم حذف الطالب");
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (s: Omit<User, "password">) => {
    setEditing(s.id);
    setForm({
      username: s.username,
      password: "",
      fullName: s.fullName,
      email: s.email,
      phone: s.phone ?? "",
      courseId: s.courseId ?? "",
      avatarUrl: s.avatarUrl ?? "",
    });
    setOpen(true);
  };

  return (
    <AppLayout title="إدارة الطلاب">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            الطلاب ({(students.data ?? []).length})
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gradient-primary text-primary-foreground">
                <Plus className="me-1 h-4 w-4" />
                طالب جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>{editing ? "تعديل طالب" : "طالب جديد"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="الاسم الكامل" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
                <FormField label="اسم المستخدم" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
                <FormField
                  label={editing ? "كلمة المرور (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  type="password"
                />
                <FormField label="البريد الإلكتروني" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                <FormField label="الهاتف" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
                <div className="space-y-1">
                  <Label>الدورة</Label>
                  <Select value={form.courseId ?? ""} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر دورة" /></SelectTrigger>
                    <SelectContent>
                      {(courses.data ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => (editing ? update.mutate() : create.mutate())}
                  disabled={create.isPending || update.isPending}
                  className="gradient-primary text-primary-foreground"
                >
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">اسم المستخدم</TableHead>
                <TableHead className="text-right">البريد</TableHead>
                <TableHead className="text-right">الدورة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(students.data ?? []).map((s) => {
                const course = (courses.data ?? []).find((c) => c.id === s.courseId);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell className="font-mono text-xs">{s.username}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{course?.title ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`حذف الطالب "${s.fullName}"؟`)) remove.mutate(s.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function FormField({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
