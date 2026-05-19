import type { Route } from "next";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Search,
  Star,
  Wallet,
  Settings,
  Award,
  Store,
  Rocket,
  ScanSearch,
  PackageX,
  RadioTower,
  Globe2,
  Lightbulb,
  Flame,
  type LucideIcon,
} from "lucide-react";

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
    title: "Analitika",
    items: [
      {
        label: "Umumiy ko'rinish",
        href: "/dashboard" as Route,
        icon: LayoutDashboard,
        description: "KPI va daromad",
      },
      {
        label: "Bozor sharhi",
        href: "/market" as Route,
        icon: Globe2,
        description: "Top kategoriya, do'kon, treemap",
      },
      {
        label: "Mahsulotlar",
        href: "/products" as Route,
        icon: Package,
        description: "Statistika va komissiya",
      },
      {
        label: "Kategoriyalar",
        href: "/categories" as Route,
        icon: FolderTree,
        description: "Nisha tahlili",
      },
      {
        label: "Brendlar",
        href: "/brands" as Route,
        icon: Award,
        description: "Top brendlar reytingi",
      },
      {
        label: "Sotuvchilar",
        href: "/sellers" as Route,
        icon: Store,
        description: "Do'konlar va yurik shaxs",
      },
      {
        label: "Raqobatchilar",
        href: "/competitors" as Route,
        icon: Users,
        description: "Sizning kuzatuvingiz",
      },
    ],
  },
  {
    title: "Strategiya",
    items: [
      {
        label: "Mahsulot fursatlari",
        href: "/opportunities" as Route,
        icon: Lightbulb,
        description: "AI tavsiyalar",
        badge: "AI",
      },
      {
        label: "Trendlar",
        href: "/trends" as Route,
        icon: Flame,
        description: "Hot nishlar va mavsumlar",
        badge: "Hot",
      },
    ],
  },
  {
    title: "SEO va reklama",
    items: [
      {
        label: "Kalit so'zlar",
        href: "/keywords" as Route,
        icon: Search,
        description: "Pozitsiyalar",
      },
      {
        label: "Boost va reklama",
        href: "/boost" as Route,
        icon: Rocket,
        description: "DRR, kampaniyalar",
        badge: "Pro",
      },
    ],
  },
  {
    title: "Vositalar",
    items: [
      {
        label: "Rasm qidiruvi",
        href: "/photo-search" as Route,
        icon: ScanSearch,
        description: "Reverse image search",
        badge: "AI",
      },
      {
        label: "Yo'qolgan mahsulotlar",
        href: "/lost-products" as Route,
        icon: PackageX,
        description: "Potеryashki",
      },
      {
        label: "Monitoring",
        href: "/monitoring" as Route,
        icon: RadioTower,
        description: "Avto kuzatuv (4 soat)",
      },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      {
        label: "Sharhlar",
        href: "/reviews" as Route,
        icon: Star,
      },
      {
        label: "Moliya",
        href: "/finance" as Route,
        icon: Wallet,
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
