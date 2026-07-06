import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { QrCode, Check } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/attendance/scan")({
  head: () => ({ meta: [{ title: "مسح الحضور — أكاديمية النور" }] }),
  component: ScanPage,
});

function ScanPage() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const check = useMutation({
    mutationFn: (c: string) => api.attendanceSessions.checkIn(c, user!.id),
    onSuccess: (r) => {
      const status = r.record.status;
      setResult(status);
      toast.success(status === "late" ? "تم التسجيل — متأخر" : "تم تسجيل حضورك");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "فشل"),
  });

  return (
    <AppLayout title="مسح الحضور">
      <div className="mx-auto max-w-lg space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> إدخال رمز الحضور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              اطلب من الأستاذ الحصول على رمز الجلسة، ثم أدخله هنا.
              ماسح الكاميرا القادم قريباً.
            </p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: A1B2C3"
              className="text-center font-mono text-2xl tracking-widest"
              maxLength={12}
            />
            <Button
              onClick={() => check.mutate(code)}
              disabled={!code || check.isPending}
              className="w-full gradient-primary text-primary-foreground"
            >
              تسجيل الحضور
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`grid h-12 w-12 place-items-center rounded-full ${
                result === "present" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
              }`}>
                <Check className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold">
                  {result === "present" ? "تم تسجيل حضورك" : "تم التسجيل — متأخر"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date().toLocaleString("ar")}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
