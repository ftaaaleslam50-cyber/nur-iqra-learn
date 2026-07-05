import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ClipboardCheck, X } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { AttendanceRecord } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/attendance")({
  head: () => ({ meta: [{ title: "إدارة الحضور — أكاديمية النور" }] }),
  component: AdminAttendancePage,
});

function AdminAttendancePage() {
  const qc = useQueryClient();
  const students = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const attendance = useQuery({ queryKey: ["attendance-all"], queryFn: api.attendance.list });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const record = useMutation({
    mutationFn: (input: Omit<AttendanceRecord, "id">) => api.attendance.record(input),
    onSuccess: () => {
      toast.success("تم التسجيل");
      qc.invalidateQueries({ queryKey: ["attendance-all"] });
    },
  });

  const forDate = (studentId: string) =>
    (attendance.data ?? []).find((a) => a.studentId === studentId && a.date === date);

  return (
    <AppLayout title="تسجيل الحضور">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" /> اليوم: {date}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label>التاريخ</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(students.data ?? []).map((s) => {
            const rec = forDate(s.id);
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/20 p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  {s.fullName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{s.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {rec ? (rec.status === "present" ? "حاضر" : rec.status === "absent" ? "غائب" : "بعذر") : "لم يُسجل"}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={rec?.status === "present" ? "default" : "outline"}
                    size="sm"
                    onClick={() => record.mutate({ studentId: s.id, date, status: "present" })}
                    className={rec?.status === "present" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
                  >
                    <Check className="me-1 h-3 w-3" /> حاضر
                  </Button>
                  <Button
                    variant={rec?.status === "absent" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => record.mutate({ studentId: s.id, date, status: "absent" })}
                  >
                    <X className="me-1 h-3 w-3" /> غائب
                  </Button>
                  <Button
                    variant={rec?.status === "excused" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => record.mutate({ studentId: s.id, date, status: "excused" })}
                  >
                    بعذر
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
