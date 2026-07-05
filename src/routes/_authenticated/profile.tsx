import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Save, UserCog } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "الملف الشخصي — أكاديمية النور" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (next.length < 6) return toast.error("كلمة المرور الجديدة قصيرة جداً");
    if (next !== confirm) return toast.error("كلمة المرور غير متطابقة");
    setSaving(true);
    try {
      await api.auth.changePassword(user.id, current, next);
      toast.success("تم تغيير كلمة المرور. الرجاء تسجيل الدخول مرة أخرى.");
      logout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تغيير كلمة المرور");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout title="الملف الشخصي">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              المعلومات الشخصية
            </CardTitle>
            <CardDescription>
              لتعديل بياناتك، الرجاء التواصل مع إدارة الأكاديمية.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground shadow-soft">
                {user.fullName[0]}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-lg font-bold">{user.fullName}</div>
                <div className="text-sm text-muted-foreground">
                  {user.role === "admin" ? "مدير" : "طالب"}
                </div>
              </div>
            </div>
            <Field label="اسم المستخدم" value={user.username} />
            <Field label="البريد الإلكتروني" value={user.email} />
            {user.phone && <Field label="رقم الهاتف" value={user.phone} />}
            <Field label="تاريخ الانضمام" value={user.joinedAt} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              تغيير كلمة المرور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onChangePassword} className="space-y-3">
              <div className="space-y-1">
                <Label>كلمة المرور الحالية</Label>
                <Input
                  type="password"
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>كلمة المرور الجديدة</Label>
                <Input
                  type="password"
                  required
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>تأكيد كلمة المرور</Label>
                <Input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="gradient-primary text-primary-foreground"
              >
                <Save className="me-1 h-4 w-4" />
                حفظ
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
