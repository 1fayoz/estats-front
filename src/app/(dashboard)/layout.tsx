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
      {/* `air-shell` — Bitrix24 dizayn tili (globals.css dagi "AIR"
          qatlami). `bg-background` OLIB TASHLANDI: fon endi shell'ning
          o'z `::before` qatlamidan keladi va u `fixed`, ya'ni sahifa
          aylanganda joyida qoladi. */}
      <div className="air-shell flex min-h-svh w-full">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          {/* Ikki xil yuza — Bitrix24 dagi kabi:
              sarlavha va menyu fon rasmi ustida (shisha), ma'lumot
              esa QATTIQ OQ idishda. Shaffof fon ustidagi zich
              raqamlar o'qilmaydi — orqadagi rasm kontrastni yeb
              qo'yadi. `air-surface` ichida shadcn tokenlari yorug'
              rejimga qaytadi, aks holda oq fonda oq matn chiqardi. */}
          <main className="flex-1 px-3 pb-24 pt-1 md:px-5 lg:px-6 lg:pb-6">
            <div className="air-surface min-h-[calc(100svh-6.5rem)] px-4 py-5 md:px-6 md:py-6">
              <PageTransition>{children}</PageTransition>
            </div>
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
