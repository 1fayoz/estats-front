"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import base from "./landing.module.css";
import styles from "./landing-chrome.module.css";

const NAV = [
  { href: "#imkoniyatlar", label: "Imkoniyatlar" },
  { href: "#mahsulot", label: "Qanday ishlaydi" },
  { href: "#narxlar", label: "Narxlar" },
  { href: "#savollar", label: "Savollar" },
];

export function LandingHeader() {
  const [open, setOpen] = React.useState(false);
  const menuId = React.useId();
  const menuButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = React.useRef<HTMLElement | null>(null);
  const logoRef = React.useRef<HTMLAnchorElement | null>(null);

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
        <Link ref={logoRef} href="/" className={styles.logo} aria-label="eStats — bosh sahifa">
          <LogoMark size={34} />
          <span>{siteConfig.name}</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Asosiy navigatsiya">
          {NAV.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className={styles.headerActions}>
          <Link href="/login" className={styles.loginLink}>Kirish</Link>
          <Link href="/login" className={cn(base.primaryButton, styles.headerCta)}>Boshlash<ArrowRight size={15} aria-hidden="true" /></Link>
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
          {NAV.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu}>{item.label}<ArrowRight size={15} aria-hidden="true" /></Link>)}
          <Link href="/login" onClick={closeMenu}>Hisobga kirish<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </nav>
    </header>
  );
}
