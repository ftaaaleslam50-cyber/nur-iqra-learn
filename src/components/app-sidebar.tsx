import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Library,
  LogOut,
  Megaphone,
  QrCode,
  UserCog,
  Users,
  ClipboardCheck,
  Award,
  Star,
  Trophy,
  BookMarked,
  Sparkles,
  Trophy as TrophyIcon,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const studentItems: Item[] = [
  { title: "التقدم والإنجازات", url: "/dashboard", icon: TrophyIcon },
  { title: "الدورات", url: "/courses", icon: BookOpen },
  { title: "الواجبات والاختبارات", url: "/assignments", icon: BookMarked },
  { title: "الكتب", url: "/books", icon: Library },
  { title: "مسح الحضور", url: "/attendance/scan", icon: QrCode },
  { title: "الجدول الدراسي", url: "/schedule", icon: CalendarDays },
  { title: "الإعلانات", url: "/announcements", icon: Megaphone },
  { title: "الملف الشخصي", url: "/profile", icon: UserCog },
];

const adminItems: Item[] = [
  { title: "لوحة التحكم", url: "/dashboard", icon: TrophyIcon },
  { title: "الطلاب", url: "/admin/students", icon: Users },
  { title: "الدورات", url: "/admin/courses", icon: BookOpen },
  { title: "الكتب", url: "/admin/books", icon: Library },
  { title: "الجدول الدراسي", url: "/admin/schedule", icon: CalendarDays },
  { title: "الواجبات والاختبارات", url: "/admin/assignments", icon: BookMarked },
  { title: "بنك الأسئلة", url: "/admin/questions", icon: HelpCircle },
  { title: "الحضور", url: "/admin/attendance", icon: ClipboardCheck },
  { title: "النقاط", url: "/admin/points", icon: Star },
  { title: "الشهادات", url: "/admin/certificates", icon: Trophy },
  { title: "الإعلانات", url: "/admin/announcements", icon: Megaphone },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = user?.role === "admin" ? adminItems : studentItems;

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate font-display text-base font-bold">أكاديمية النور</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>منصة التعلم الإسلامي</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {user?.role === "admin" ? "الإدارة" : "القائمة"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
            {user?.fullName?.[0] ?? "؟"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user?.fullName}</div>
            <div className="truncate text-xs text-muted-foreground">
              {user?.role === "admin" ? "مدير" : "طالب"}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="تسجيل الخروج">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="mx-auto hidden group-data-[collapsible=icon]:flex"
          aria-label="تسجيل الخروج"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export { studentItems, adminItems, Award };
export type { Item };
