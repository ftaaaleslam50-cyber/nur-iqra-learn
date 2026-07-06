import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Eye, Library, Search } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/books")({
  head: () => ({ meta: [{ title: "الكتب — أكاديمية النور" }] }),
  component: BooksPage,
});

function BooksPage() {
  const books = useQuery({ queryKey: ["books"], queryFn: api.books.list });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (books.data ?? []).filter((b) =>
      !t || b.title.toLowerCase().includes(t) || (b.author ?? "").toLowerCase().includes(t)
    );
  }, [books.data, q]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach((b) => set.add(b.category));
    return ["الكل", ...Array.from(set)];
  }, [filtered]);

  return (
    <AppLayout title="الكتب">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن كتاب…" className="pe-10" />
        </div>
      </div>

      <Tabs defaultValue="الكل" dir="rtl">
        <TabsList className="mb-4 flex-wrap">
          {categories.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
        </TabsList>
        {categories.map((c) => {
          const list = c === "الكل" ? filtered : filtered.filter((b) => b.category === c);
          return (
            <TabsContent key={c} value={c}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((b) => (
                  <Card key={b.id} className="card-hover overflow-hidden">
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-primary/5">
                      {b.coverUrl ? (
                        <img src={b.coverUrl} alt={b.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <Library className="h-14 w-14 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <Badge variant="outline" className="w-fit">{b.category}</Badge>
                      <CardTitle className="line-clamp-2 text-base">{b.title}</CardTitle>
                      {b.author && <p className="text-xs text-muted-foreground">{b.author}</p>}
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <a href={b.fileUrl} target="_blank" rel="noreferrer"><Eye className="me-1 h-4 w-4" /> معاينة</a>
                      </Button>
                      <Button asChild size="sm" className="flex-1 gradient-primary text-primary-foreground">
                        <a href={b.fileUrl} download={b.title}><Download className="me-1 h-4 w-4" /> تنزيل</a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {list.length === 0 && <p className="text-sm text-muted-foreground">لا توجد كتب.</p>}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </AppLayout>
  );
}
