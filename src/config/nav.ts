import type { Route } from "next";
import { BarChart3, ListChecks, Boxes, Building2, FileText, LayoutDashboard, PackagePlus, Wallet, Calculator, Megaphone, Rocket, Plug, Receipt, SearchCheck, Share2, Store, Target, Settings, Users, type LucideIcon } from "lucide-react";

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
    title: "Asosiy",
    items: [
      {
        label: "Bugun",
        // Tavsiyalarda foyda raqamlari bor — P&L ruxsati bilan (backend `page("pnl")`).
        action: "pnl.view",
        href: "/dashboard/today" as Route,
        icon: ListChecks,
        description: "Nima qilish kerak — pul ta'siri bilan",
      },
    ],
  },
  {
    title: "Ombor",
    items: [
      {
        label: "Tovarlar",
        action: "warehouse.view",
        href: "/dashboard/warehouse" as Route,
        icon: Boxes,
        description: "Uzum katalogi va tan narx",
      },
      {
        label: "Kirimlar",
        action: "intakes.view",
        href: "/dashboard/intakes" as Route,
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
        href: "/dashboard/plan" as Route,
        icon: Target,
        description: "Balans, prognoz va maqsadlar",
      },
      {
        label: "Doimiy to'lovlar",
        action: "expenses.view",
        href: "/dashboard/expenses" as Route,
        icon: Receipt,
        description: "Soliq, arenda — to'landimi yo'qmi",
      },
      {
        label: "Foyda va zarar",
        action: "pnl.view",
        href: "/dashboard/pnl" as Route,
        icon: Calculator,
        description: "FIFO bo'yicha tovar kesimida",
        badge: "FIFO",
      },
      {
        label: "Moliya",
        action: "finance.view",
        href: "/dashboard/finance" as Route,
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
        href: "/dashboard/marketing" as Route,
        icon: Megaphone,
        description: "Nima ishlayapti va nimaga kuch sarflash kerak",
        badge: "Yangi",
      },
      {
        label: "Bust TOP",
        action: "pnl.view",
        href: "/dashboard/bust" as Route,
        icon: Rocket,
        description: "Reklama: qaysi tovar foydali, kampaniyalar va avto-rejim",
      },
      {
        label: "SEO audit",
        action: "seo.view",
        href: "/dashboard/seo" as Route,
        icon: SearchCheck,
        description: "Kartochka qidiruvda topiladimi",
        badge: "Yangi",
      },
      {
        label: "Ijtimoiy tarmoqlar",
        action: "socials.view",
        href: "/dashboard/socials" as Route,
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
        href: "/dashboard/market" as Route,
        icon: Store,
        description: "Butun Uzum bozori bir qarashda",
      },
      {
        label: "Kategoriya va qatlamlar",
        action: "market.categories",
        href: "/dashboard/market/categories" as Route,
        icon: LayoutDashboard,
        children: [
          { label: "Kategoriyalar", action: "market.categories", href: "/dashboard/market/categories" as Route, icon: Boxes },
          { label: "Dinamikasi", action: "market.dynamics", href: "/dashboard/market/dynamics" as Route, icon: Boxes },
          { label: "Qatlamlari", action: "market.niches", href: "/dashboard/market/niches" as Route, icon: Boxes },
          { label: "Byudjetga mos nishalar", action: "market.niches", href: "/dashboard/market/portfolio" as Route, icon: Boxes },
          { label: "Narx asosida tahlil", action: "market.prices", href: "/dashboard/market/prices" as Route, icon: Boxes },
          { label: "Raqobat / assortiment", action: "market.competition", href: "/dashboard/market/competition" as Route, icon: Boxes },
        ],
      },
      {
        label: "Mahsulot tanlash",
        action: "market.products",
        href: "/dashboard/market/products" as Route,
        icon: BarChart3,
        children: [
          { label: "Kartochka asosida", action: "market.products", href: "/dashboard/market/products" as Route, icon: Boxes },
          { label: "SKU asosida", action: "market.skus", href: "/dashboard/market/skus" as Route, icon: Boxes },
          { label: "Mahsulot kartochkasi", action: "market.card", href: "/dashboard/market/card" as Route, icon: Boxes },
          { label: "Kartochkalar jadvali", action: "market.card_table", href: "/dashboard/market/card-table" as Route, icon: Boxes },
        ],
      },
      {
        label: "SEO | Joylashuv",
        action: "market.seo",
        href: "/dashboard/market/seo" as Route,
        icon: FileText,
        children: [
          { label: "Mahsulot kalitlari", action: "market.seo", href: "/dashboard/market/seo" as Route, icon: Boxes },
          { label: "Kalit soʻz tahlili", action: "market.seo_keyword", href: "/dashboard/market/seo/keyword" as Route, icon: Boxes },
          { label: "Raqobatchilar va pozitsiyalar", action: "market.seo_competitors",
            href: "/dashboard/market/seo/competitors" as Route, icon: Boxes },
        ],
      },
      {
        label: "Sotuvchi va do\u2019konlar",
        action: "market.shops",
        href: "/dashboard/market/shops" as Route,
        icon: Building2,
        children: [
          { label: "Do\u2019konlar reytingi", action: "market.shops", href: "/dashboard/market/shops" as Route, icon: Boxes },
          { label: "Do\u2019kon tahlili", action: "market.shop", href: "/dashboard/market/shop" as Route, icon: Boxes },
          { label: "Sotuvchining SKUlari", action: "market.seller_skus", href: "/dashboard/market/seller-skus" as Route, icon: Boxes },
          { label: "Sotuvchilar", action: "market.sellers", href: "/dashboard/market/sellers" as Route, icon: Boxes },
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
        href: "/dashboard/integrations" as Route,
        icon: Plug,
        description: "Uzum va tarmoqlarga ulanish",
      },
      {
        label: "Jamoa",
        href: "/dashboard/team" as Route,
        icon: Users,
        description: "Kim ulangan va nimaga ruxsati bor",
        action: "team.view",
      },
      {
        label: "Sozlamalar",
        action: "settings.view",
        href: "/dashboard/settings" as Route,
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
