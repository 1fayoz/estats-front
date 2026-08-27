"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { useUserStore } from "@/stores/user-store";
import { ApiError, fetchMe } from "@/lib/api";
import { ALL_NAV_ITEMS, visibleNav } from "@/config/nav";

/**
 * Protects the dashboard. Once the persisted session is rehydrated it sends the JWT to
 * `/auth/me`: no session or a rejected one lands the user back on the landing page,
 * and a valid one refreshes the store identity (shop renames show up without a
 * re-login). Dashboard data only ever renders behind a verified session.
 *
 * Sessiya SAHIFA ALMASHGANDA QAYTA tekshirilmaydi — faqat ilova ochilganda va
 * token o'zgarganda. Ilgari `pathname` bog'liqlikda turardi va har bosishda
 * butun kabinet yiqilib "Sessiya tekshirilmoqda..." ekrani chiqib ketardi:
 * bir sahifadan ikkinchisiga o'tish qorayib ko'rinardi va har o'tishda ortiqcha
 * `/auth/me` so'rovi ketardi.
 */
//: Magazini yo'q foydalanuvchi shu yerga tushadi — Uzum tokeni shu yerda.
const SETUP_PATH = "/integrations";

/** Shu manzilni ochadigan ruxsat kodi (menyu ta'rifidan). */
function actionFor(pathname: string): string | undefined {
  const item = ALL_NAV_ITEMS.filter((nav) =>
    pathname === nav.href || pathname.startsWith(`${nav.href}/`)
  )
    // Eng aniq moslik: `/warehouse` va `/warehouse/x` bo'lsa
    // uzunrog'i to'g'ri javob.
    .sort((a, b) => String(b.href).length - String(a.href).length)[0];
  return item?.action;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useUserStore((s) => s.accessToken);
  const hydrated = useUserStore((s) => s.hydrated);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const signOut = useUserStore((s) => s.signOut);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!hydrated) return;

    if (!accessToken) {
      // Landing emas, kirish sahifasi: bu odam allaqachon kabinetga
      // kirmoqchi bo'lgan, unga mahsulotni qaytadan tanishtirish emas,
      // kirish formasini ko'rsatish kerak.
      router.replace("/login");
      return;
    }

    let active = true;
    (async () => {
      try {
        const me = await fetchMe();
        if (!active) return;
        setUser(me);
      } catch (err) {
        if (!active) return;
        // A backend that's merely unreachable must not log the seller out — only an
        // actual rejection of the session does.
        if (err instanceof ApiError && err.isAuthError) {
          signOut();
          router.replace("/login");
          return;
        }
      }
      if (active) setChecked(true);
    })();

    return () => {
      active = false;
    };
  }, [hydrated, accessToken, router, setUser, signOut]);

  // Magazinsiz kabinetning boshqa sahifalari bo'sh — foydalanuvchini darhol
  // magazin qo'shadigan joyga olib boramiz. Alohida effekt, chunki bu
  // yo'nalishga bog'liq, sessiya tekshiruvi esa yo'q.
  //
  // Manzil AYNAN Integratsiyalar: Uzum tokeni o'sha yerda va magazin
  // aynan token orqali ochiladi. Boshqa sahifaga qamab qo'yish yangi
  // foydalanuvchi uchun chiqish yo'li yo'q tuzoq yasaydi.
  //
  // A'zoning `shops` — EGASINING do'konlari. Ya'ni egasida do'kon
  // bo'lsa a'zo bu yerga tushmaydi. Do'kon umuman yo'q bo'lsa esa
  // a'zoni Integratsiyalarga haydash tuzoq bo'lardi: unga o'sha
  // sahifa ochiq bo'lmasligi mumkin va u yerdan chiqolmay qolardi.
  const canSetUp =
    user?.actions === undefined || user.actions.includes("integrations.view");
  const needsShop =
    checked && user != null && user.shops.length === 0 && canSetUp;
  React.useEffect(() => {
    if (needsShop && pathname !== SETUP_PATH) router.replace(SETUP_PATH);
  }, [needsShop, pathname, router]);

  // Ruxsati yo'q sahifa. Menyudan yashiringan bo'lsa ham manzilni
  // qo'lda yozish yoki eski xatcho'p qolishi mumkin — u holda
  // 403 va bo'sh ekran o'rniga ochiq bo'limga olib boriladi.
  const needed = actionFor(pathname);
  const allowed =
    !checked ||
    user == null ||
    !needed ||
    user.actions === undefined ||
    user.actions.includes(needed);
  const firstAllowed = React.useMemo(() => {
    const groups = visibleNav(user?.actions ?? []);
    return groups[0]?.items[0]?.href ?? "/settings";
  }, [user?.actions]);

  React.useEffect(() => {
    if (!allowed) router.replace(firstAllowed as Parameters<typeof router.replace>[0]);
  }, [allowed, firstAllowed, router]);

  if (
    !hydrated ||
    !accessToken ||
    !checked ||
    !allowed ||
    (needsShop && pathname !== SETUP_PATH)
  ) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Sessiya tekshirilmoqda...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
