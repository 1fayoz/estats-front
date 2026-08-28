import type { Route } from "next";
import { Boxes, PackagePlus, Sparkles, Wallet, Calculator, Megaphone, Plug, Receipt, SearchCheck, Share2, Target, Settings, Users, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: Route;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  /**
   * Shu sahifani ochadigan ruxsat kodi.
   *
   * Berilmasa — hammaga ochiq (Sozlamalar: odam o'z raqami va
   * ko'rinishini har doim boshqara oladi). Kodlar backend
   * katalogidan (`src/api/team/permissions.py`) olinadi va
   * ikkalasi bir xil bo'lishi shart: front'da ko'rinib turgan,
   * lekin API 403 beradigan sahifa — eng bezovta qiladigan holat.
   */
  action?: string;
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
        action: "warehouse.view",
        href: "/warehouse" as Route,
        icon: Boxes,
        description: "Uzum katalogi va tan narx",
      },
      {
        label: "AI bilan mahsulot",
        action: "products_ai.view",
        href: "/products-ai" as Route,
        icon: Sparkles,
        description: "Rasm tashlang — kartochkani AI tayyorlaydi",
        badge: "Yangi",
      },
      {
        label: "Kirimlar",
        action: "intakes.view",
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
        action: "plan.view",
        href: "/plan" as Route,
        icon: Target,
        description: "Balans, prognoz va maqsadlar",
      },
      {
        label: "Doimiy to'lovlar",
        action: "expenses.view",
        href: "/expenses" as Route,
        icon: Receipt,
        description: "Soliq, arenda — to'landimi yo'qmi",
      },
      {
        label: "Foyda va zarar",
        action: "pnl.view",
        href: "/pnl" as Route,
        icon: Calculator,
        description: "FIFO bo'yicha tovar kesimida",
        badge: "FIFO",
      },
      {
        label: "Moliya",
        action: "finance.view",
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
        action: "marketing.view",
        href: "/marketing" as Route,
        icon: Megaphone,
        description: "Nima ishlayapti va nimaga kuch sarflash kerak",
        badge: "Yangi",
      },
      {
        label: "SEO audit",
        action: "seo.view",
        href: "/seo" as Route,
        icon: SearchCheck,
        description: "Kartochka qidiruvda topiladimi",
        badge: "Yangi",
      },
      {
        label: "Ijtimoiy tarmoqlar",
        action: "socials.view",
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
        action: "integrations.view",
        href: "/integrations" as Route,
        icon: Plug,
        description: "Uzum va tarmoqlarga ulanish",
      },
      {
        label: "Jamoa",
        href: "/team" as Route,
        icon: Users,
        description: "Kim ulangan va nimaga ruxsati bor",
        action: "team.view",
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

/**
 * Ruxsat bo'yicha filtrlangan menyu.
 *
 * Butunlay bo'shab qolgan guruh chiqarib tashlanadi — sarlavhasi
 * bor, ichi bo'sh bo'lim "nimadir yo'qolgan" degan taassurot
 * qoldiradi.
 */
export function visibleNav(actions: string[] | undefined): NavGroup[] {
  // `undefined` — backend ruxsat yubormayapti (eski versiya):
  // hammasi ochiq. Bo'sh RO'YXAT esa boshqa gap — hech nima ochiq
  // emas. Ikkalasini aralashtirish front backend'dan oldin
  // joylangan paytda menyuni hammaga bo'shatib qo'yardi.
  if (actions === undefined) return NAV_GROUPS;
  const allowed = new Set(actions);
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.action || allowed.has(item.action)),
  })).filter((group) => group.items.length > 0);
}
