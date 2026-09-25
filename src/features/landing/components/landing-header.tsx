"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { LanguageSwitcher } from "@/components/seo/language-switcher";
import { cn } from "@/lib/utils";
import base from "./landing.module.css";
import styles from "./landing-chrome.module.css";

const NAV_BY_LOCALE = {
  uz: [
    { href: "#imkoniyatlar", label: "Imkoniyatlar" },
    { href: "#mahsulot", label: "Qanday ishlaydi" },
    { href: "#narxlar", label: "Narxlar" },
    { href: "#savollar", label: "Savollar" },
  ],
  ru: [
    { href: "#imkoniyatlar", label: "Возможности" },
    { href: "#mahsulot", label: "Как это работает" },
    { href: "#narxlar", label: "Тарифы" },
    { href: "#savollar", label: "Вопросы" },
  ],
  en: [
    { href: "#imkoniyatlar", label: "Features" },
    { href: "#mahsulot", label: "How it works" },
    { href: "#narxlar", label: "Pricing" },
    { href: "#savollar", label: "FAQ" },
  ],
};

const LABELS = {
  uz: { login: "Kirish", cta: "Boshlash", home: "eStats — bosh sahifa" },
  ru: { login: "Вход", cta: "Начать", home: "eStats — главная страница" },
  en: { login: "Log in", cta: "Get Started", home: "eStats — home" },
};

export function LandingHeader({ locale = "uz" }: { locale?: "uz" | "ru" | "en" }) {
  const [open, setOpen] = React.useState(false);
  const menuId = React.useId();
  const menuButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = React.useRef<HTMLElement | null>(null);
  const logoRef = React.useRef<HTMLAnchorElement | null>(null);

  const navItems = NAV_BY_LOCALE[locale] || NAV_BY_LOCALE.uz;
  const t = LABELS[locale] || LABELS.uz;
  const homeHref = locale === "uz" ? "/" : `/${locale}`;

  const closeMenu = () => {
    setOpen(false);
    menuButtonRef.current?.focus({ preventScroll: true });
  };

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  React.useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 1000px)");
    const onBreakpointChange = () => {
      if (!breakpoint.matches) return;
      if (mobileNavRef.current?.contains(document.activeElement) || document.activeElement === menuButtonRef.current) logoRef.current?.focus();
      setOpen(false);
    };
    breakpoint.addEventListener("change", onBreakpointChange);
    return () => breakpoint.removeEventListener("change", onBreakpointChange);
  }, []);

  return (
    <header className={styles.header}>
      <div className={cn(base.container, styles.headerInner)}>
        <Link ref={logoRef} href={homeHref} className={styles.logo} aria-label={t.home}>
          <LogoMark size={34} />
          <span>{siteConfig.name}</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Asosiy navigatsiya">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className={styles.headerActions}>
          <LanguageSwitcher className="mr-1" />
          <Link href="/login" className={styles.loginLink}>{t.login}</Link>
          <Link href="/login" className={cn(base.primaryButton, styles.headerCta)}>{t.cta}<ArrowRight size={15} aria-hidden="true" /></Link>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            className={styles.menuButton}
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={open}
            aria-controls={menuId}
          >
            {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav ref={mobileNavRef} id={menuId} className={cn(styles.mobileNav, open && styles.mobileNavOpen)} aria-label="Mobil navigatsiya" hidden={!open}>
        <div className={base.container}>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
            <span className="text-xs text-muted-foreground font-medium">Til / Язык / Language:</span>
            <LanguageSwitcher />
          </div>
          {navItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}<ArrowRight size={15} aria-hidden="true" /></Link>)}
          <Link href="/login" onClick={closeMenu}>{t.login}<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </nav>
    </header>
  );
}
