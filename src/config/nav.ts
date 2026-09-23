import type { Route } from "next";
import { BarChart3, Boxes, Building2, FileText, Info, LayoutDashboard, PackagePlus, Wallet, Calculator, Megaphone, Plug, Receipt, SearchCheck, Share2, Store, Target, Settings, Users, type LucideIcon } from "lucide-react";

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
  /**
   * Ichma-ich bo'limlar — «Bozor» menyusi tashqi hisobotdagi
   * tuzilishda: guruh bosilganda ochiladi/yopiladi, o'zi sahifa emas.
   */
  children?: NavItem[];
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
    title: "Bozor",
    items: [
      {
        label: "Uzum bozori",
        action: "market.view",
        href: "/market" as Route,
        icon: Store,
        description: "Butun Uzum bozori bir qarashda",
      },
      {
        label: "Kategoriya va qatlamlar",
        action: "market.view",
        href: "/market/categories" as Route,
        icon: LayoutDashboard,
        children: [
          { label: "Kategoriyalar", action: "market.view", href: "/market/categories" as Route, icon: Boxes },
          { label: "Dinamikasi", action: "market.view", href: "/market/dynamics" as Route, icon: Boxes },
          { label: "Qatlamlari", action: "market.view", href: "/market/niches" as Route, icon: Boxes },
          { label: "Narx asosida tahlil", action: "market.view", href: "/market/prices" as Route, icon: Boxes },
          { label: "Raqobat / assortiment", action: "market.view", href: "/market/competition" as Route, icon: Boxes },
        ],
      },
      {
        label: "Mahsulot tanlash",
        action: "market.view",
        href: "/market/products" as Route,
        icon: BarChart3,
        children: [
          { label: "Kartochka asosida", action: "market.view", href: "/market/products" as Route, icon: Boxes },
          { label: "SKU asosida", action: "market.view", href: "/market/skus" as Route, icon: Boxes },
          { label: "Mahsulot kartochkasi", action: "market.view", href: "/market/card" as Route, icon: Boxes },
          { label: "Kartochkalar jadvali", action: "market.view", href: "/market/card-table" as Route, icon: Boxes },
        ],
      },
      {
        label: "SEO | Joylashuv",
        action: "market.view",
        href: "/market/seo" as Route,
        icon: FileText,
        children: [
          { label: "Mahsulot kalitlari", action: "market.view", href: "/market/seo" as Route, icon: Boxes },
          { label: "Kalit soʻz tahlili", action: "market.view", href: "/market/seo/keyword" as Route, icon: Boxes },
          { label: "Raqobatchilar va pozitsiyalar", action: "market.view",
            href: "/market/seo/competitors" as Route, icon: Boxes },
        ],
      },
      {
        label: "Sotuvchi va do\u2019konlar",
        action: "market.view",
        href: "/market/shops" as Route,
        icon: Building2,
        children: [
          { label: "Do\u2019konlar reytingi", action: "market.view", href: "/market/shops" as Route, icon: Boxes },
          { label: "Do\u2019kon tahlili", action: "market.view", href: "/market/shop" as Route, icon: Boxes },
          { label: "Sotuvchining SKUlari", action: "market.view", href: "/market/seller-skus" as Route, icon: Boxes },
          { label: "Sotuvchilar", action: "market.view", href: "/market/sellers" as Route, icon: Boxes },
        ],
      },
      {
        label: "Video yo‘riqnomalar",
        action: "market.view",
        href: "/market/videos" as Route,
        icon: Info,
        children: [
          { label: "Video yo‘riqnomalar", action: "market.view", href: "/market/videos" as Route, icon: Boxes },
        ],
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

/** Guruh ichidagi hamma OCHILADIGAN sahifa — bolalari bo'lsa bolalari, bo'lmasa o'zi. */
export function leafItems(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.children?.length ? item.children : [item]));
}

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => leafItems(g.items));

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
    items: group.items
      .filter((item) => !item.action || allowed.has(item.action))
      .map((item) => (item.children
        ? { ...item, children: item.children.filter((c) => !c.action || allowed.has(c.action)) }
        : item))
      .filter((item) => !item.children || item.children.length > 0),
  })).filter((group) => group.items.length > 0);
}
