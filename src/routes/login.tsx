import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — أكاديمية النور" },
      { name: "description", content: "تسجيل دخول الطلاب والإدارة إلى منصة أكاديمية النور." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard" });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-background to-primary-glow/10" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />
      </div>

      <div className="absolute left-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight">أكاديمية النور</h1>
          <p className="mt-1 text-sm text-muted-foreground">منصة التعلم الإسلامي الخاصة</p>
        </div>

        <div className="rounded-2xl border bg-card/80 p-6 shadow-elegant backdrop-blur-sm sm:p-8">
          <h2 className="mb-1 font-display text-xl font-bold">تسجيل الدخول</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            الدخول متاح للحسابات التي أنشأها المدير فقط.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اكتب اسم المستخدم"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full gradient-primary text-primary-foreground shadow-soft"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "دخول"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-semibold text-foreground">حسابات تجريبية:</div>
            <div>• مدير: <span className="font-mono">admin / admin123</span></div>
            <div>• طالب: <span className="font-mono">student / student123</span></div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} أكاديمية النور — جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
