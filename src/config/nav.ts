import type { Route } from "next";
import { Boxes, PackagePlus, Wallet, Calculator, Camera, Receipt, Target, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: Route;
  icon: LucideIcon;
  description?: string;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Ombor",
    items: [
      {
        label: "Tovarlar",
        href: "/warehouse" as Route,
        icon: Boxes,
        description: "Uzum katalogi va tan narx",
      },
      {
        label: "Kirimlar",
        href: "/intakes" as Route,
        icon: PackagePlus,
        description: "Nechtadan, qanchadan keldi",
      },
    ],
  },
  {
    title: "Hisob-kitob",
    items: [
      {
        label: "Reja",
        href: "/plan" as Route,
        icon: Target,
        description: "Balans, prognoz va maqsadlar",
      },
      {
        label: "Doimiy to'lovlar",
        href: "/expenses" as Route,
        icon: Receipt,
        description: "Soliq, arenda — to'landimi yo'qmi",
      },
      {
        label: "Foyda va zarar",
        href: "/pnl" as Route,
        icon: Calculator,
        description: "FIFO bo'yicha tovar kesimida",
        badge: "FIFO",
      },
      {
        label: "Moliya",
        href: "/finance" as Route,
        icon: Wallet,
        description: "Uzum komissiya va to'lovlari",
      },
    ],
  },
  {
    title: "Sotuv",
    items: [
      {
        label: "Instagram",
        href: "/instagram" as Route,
        icon: Camera,
        description: "Postlar, statistika va reklama",
        badge: "Yangi",
      },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      {
        label: "Sozlamalar",
        href: "/settings" as Route,
        icon: Settings,
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
