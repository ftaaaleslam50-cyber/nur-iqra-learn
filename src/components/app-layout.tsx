import type { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  const { user } = useAuth();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background" dir="rtl">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <h1 className="truncate font-display text-lg font-bold sm:text-xl">{title}</h1>
            <div className="ms-auto flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden text-sm text-muted-foreground sm:block">
                مرحباً، <span className="font-semibold text-foreground">{user?.fullName}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
