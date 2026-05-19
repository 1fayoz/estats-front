import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-svh w-full bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 pb-24 pt-6 md:px-6 lg:px-8 lg:pb-10">
            <div className="mx-auto w-full max-w-[1400px] animate-fade-in">{children}</div>
          </main>
        </div>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
