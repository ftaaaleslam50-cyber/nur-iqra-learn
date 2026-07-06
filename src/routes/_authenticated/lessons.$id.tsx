import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  ChevronLeft, Download, FileText, Music, Paperclip, PlayCircle, QrCode, RefreshCw, StickyNote, X,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Attachment } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/lessons/$id")({
  head: () => ({ meta: [{ title: "درس — أكاديمية النور" }] }),
  component: LessonDetailPage,
});

function LessonDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const lesson = useQuery({ queryKey: ["lesson", id], queryFn: () => api.lessons.get(id) });
  const [session, setSession] = useState<{ id: string; code: string; expiresAt: string } | null>(null);
  const [openAttendance, setOpenAttendance] = useState(false);

  const startSession = useMutation({
    mutationFn: () => api.attendanceSessions.open(id),
    onSuccess: (s) => { setSession(s); setOpenAttendance(true); },
  });
  const regenerate = useMutation({
    mutationFn: (sid: string) => api.attendanceSessions.regenerate(sid),
    onSuccess: (s) => setSession(s),
  });
  const close = useMutation({
    mutationFn: (sid: string) => api.attendanceSessions.close(sid),
    onSuccess: () => { setOpenAttendance(false); setSession(null); toast.success("تم إغلاق الجلسة"); qc.invalidateQueries({ queryKey: ["attendance-all"] }); },
  });

  const l = lesson.data;
  if (!l) return <AppLayout title="درس"><p className="text-sm text-muted-foreground">جار التحميل…</p></AppLayout>;

  return (
    <AppLayout title={l.title}>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/courses/$id" params={{ id: l.courseId }}>
          <ChevronLeft className="me-1 h-4 w-4" /> عودة للدورة
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video overflow-hidden rounded-xl border bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${l.youtubeId}`}
              title={l.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5 text-primary" /> وصف الدرس</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap text-sm">{l.description}</p></CardContent>
          </Card>

          {l.transcript && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> النص المكتوب</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm leading-7">{l.transcript}</p></CardContent>
            </Card>
          )}

          {l.notes && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5 text-primary" /> ملاحظات</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm">{l.notes}</p></CardContent>
            </Card>
          )}

          {l.audioUrl && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Music className="h-5 w-5 text-primary" /> التسجيل الصوتي</CardTitle></CardHeader>
              <CardContent><audio controls src={l.audioUrl} className="w-full" /></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {user?.role === "admin" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" /> جلسة الحضور</CardTitle></CardHeader>
              <CardContent>
                <Button
                  onClick={() => startSession.mutate()}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  <QrCode className="me-1 h-4 w-4" /> بدء جلسة حضور
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">صلاحية الرمز ٦٠ ثانية، يمكن تجديده.</p>
              </CardContent>
            </Card>
          )}

          <FileList title="المرفقات" icon={Paperclip} files={l.attachments} />
          <FileList title="الواجبات" icon={FileText} files={l.homework ?? []} />
          <FileList title="مصادر إضافية" icon={Paperclip} files={l.resources ?? []} />
        </div>
      </div>

      {/* Attendance dialog */}
      <Dialog open={openAttendance} onOpenChange={(o) => { if (!o && session) close.mutate(session.id); else setOpenAttendance(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" /> جلسة حضور — {l.title}</DialogTitle></DialogHeader>
          {session && (
            <div className="space-y-3 text-center">
              <div className="mx-auto grid place-items-center rounded-xl border bg-white p-4">
                <QRCodeSVG value={session.code} size={200} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">الرمز</div>
                <div className="font-mono text-2xl font-black tracking-widest">{session.code}</div>
              </div>
              <Countdown until={session.expiresAt} />
              <div className="flex justify-center gap-2">
                <Button onClick={() => regenerate.mutate(session.id)} variant="outline">
                  <RefreshCw className="me-1 h-4 w-4" /> تجديد
                </Button>
                <Button onClick={() => close.mutate(session.id)} variant="destructive">
                  <X className="me-1 h-4 w-4" /> إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function Countdown({ until }: { until: string }) {
  const [left, setLeft] = useState(() => Math.max(0, Math.floor((new Date(until).getTime() - Date.now()) / 1000)));
  useState(() => {
    const t = setInterval(() => {
      setLeft(Math.max(0, Math.floor((new Date(until).getTime() - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(t);
  });
  return (
    <div className={`text-sm font-semibold ${left <= 10 ? "text-destructive" : "text-primary"}`}>
      ينتهي خلال {left} ثانية
    </div>
  );
}

function FileList({
  title, icon: Icon, files,
}: { title: string; icon: React.ComponentType<{ className?: string }>; files: Attachment[] }) {
  if (files.length === 0) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {files.map((f) => (
          <a key={f.id} href={f.url} download={f.name} target="_blank" rel="noreferrer"
             className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3 transition hover:bg-muted">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Download className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 truncate text-sm font-medium">{f.name}</div>
            <span className="text-xs uppercase text-muted-foreground">{f.type}</span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
