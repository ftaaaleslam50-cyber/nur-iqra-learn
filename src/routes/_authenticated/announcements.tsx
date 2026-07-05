import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => ({ meta: [{ title: "الإعلانات — أكاديمية النور" }] }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const list = useQuery({ queryKey: ["announcements"], queryFn: api.announcements.list });
  return (
    <AppLayout title="الإعلانات">
      <div className="space-y-3">
        {(list.data ?? []).map((a) => (
          <Card key={a.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    {a.important && (
                      <Badge className="bg-warning text-warning-foreground">هام</Badge>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString("ar")}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{a.body}</p>
            </CardContent>
          </Card>
        ))}
        {(list.data ?? []).length === 0 && (
          <p className="text-center text-sm text-muted-foreground">لا توجد إعلانات.</p>
        )}
      </div>
    </AppLayout>
  );
}
