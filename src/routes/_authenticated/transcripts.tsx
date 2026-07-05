import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/transcripts")({
  head: () => ({ meta: [{ title: "النصوص المكتوبة — أكاديمية النور" }] }),
  component: TranscriptsPage,
});

function downloadText(name: string, content: string) {
  const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function TranscriptsPage() {
  const lessons = useQuery({ queryKey: ["lessons"], queryFn: api.lessons.list });
  const courses = useQuery({ queryKey: ["courses"], queryFn: api.courses.list });

  return (
    <AppLayout title="النصوص المكتوبة">
      <p className="mb-4 text-sm text-muted-foreground">
        النصوص الكاملة لكل درس متاحة للقراءة والتحميل.
      </p>
      <Accordion type="multiple" className="space-y-3">
        {(lessons.data ?? []).map((l) => {
          const course = (courses.data ?? []).find((c) => c.id === l.courseId);
          return (
            <AccordionItem
              key={l.id}
              value={l.id}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex min-w-0 flex-1 items-center gap-3 text-right">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{l.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {course?.title}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t bg-muted/20 px-4 py-4">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {l.transcript || "لا يوجد نص لهذا الدرس بعد."}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadText(`${l.title}.doc`, l.transcript || "")}
                  >
                    <Download className="me-1 h-4 w-4" />
                    تحميل DOC
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const w = window.open("", "_blank");
                      if (!w) return;
                      w.document.write(
                        `<html dir="rtl"><head><title>${l.title}</title></head><body style="font-family:sans-serif;padding:2rem;line-height:1.9"><h1>${l.title}</h1><div style="white-space:pre-line">${l.transcript}</div><script>window.print()</script></body></html>`,
                      );
                    }}
                  >
                    <Download className="me-1 h-4 w-4" />
                    طباعة / PDF
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </AppLayout>
  );
}
