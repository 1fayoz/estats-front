import type { Route } from "next";
import { Boxes, PackagePlus, Wallet, Calculator, Megaphone, Plug, Receipt, Share2, Target, Settings, type LucideIcon } from "lucide-react";

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
        label: "Marketing",
        href: "/marketing" as Route,
        icon: Megaphone,
        description: "Nima ishlayapti va nimaga kuch sarflash kerak",
        badge: "Yangi",
      },
      {
        label: "Ijtimoiy tarmoqlar",
        href: "/socials" as Route,
        icon: Share2,
        description: "E'lonlar, obunachilar, bog'lash va joylash",
      },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      {
        label: "Integratsiyalar",
        href: "/integrations" as Route,
        icon: Plug,
        description: "Uzum va tarmoqlarga ulanish",
      },
      {
        label: "Sozlamalar",
        href: "/settings" as Route,
        icon: Settings,
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
