import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/layout/auth-guard";
import { PageTransition } from "@/components/layout/page-transition";
import { BroadcastTray } from "@/components/layout/broadcast-tray";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-svh w-full bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 pb-24 pt-6 md:px-6 lg:px-8 lg:pb-10">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <MobileNav />
        {/* Layout ichida: sahifa almashsa ham fon ishlari ketaveradi
            va ularning holati burchakda ko'rinib turadi. Ish serverda
            bajarilgani uchun yangilash ham, saytdan chiqib qayta
            kirish ham uni to'xtatmaydi. */}
        <BroadcastTray />
      </div>
    </AuthGuard>
  );
}
