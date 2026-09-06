"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { PackagePlus, X } from "lucide-react";

import styles from "./product-dialog.module.css";

export function ProductDialog({
  open,
  onClose,
  title,
  description,
  subheader,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description: string;
  subheader?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalContainer(document.querySelector<HTMLElement>(".air-shell"));
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal container={portalContainer}>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/55 motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:duration-200" />
      <DialogPrimitive.Content
        className={`air-slider ${styles.dialog} fixed inset-0 z-50 flex min-w-0 flex-col overflow-hidden shadow-2xl outline-none sm:inset-x-5 sm:inset-y-5 sm:rounded-3xl lg:inset-x-[max(24px,calc((100vw-1180px)/2))] motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:slide-in-from-bottom-4 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:duration-200`}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
          titleRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <header className="shrink-0 border-b border-[color:var(--air-line)] bg-[color:var(--air-card)] px-4 pb-4 pt-4 sm:px-7 sm:pt-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-[color:var(--ok)] sm:size-12">
              <PackagePlus className="size-5 sm:size-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title ref={titleRef} tabIndex={-1} className="text-lg font-semibold leading-tight tracking-tight outline-none sm:text-2xl">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--air-line)] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Oynani yopish">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          {subheader && <div className="mt-5 space-y-4">{subheader}</div>}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
          {children}
        </div>
        {footer && (
          <footer className={`${styles.footer} shrink-0 border-t border-[color:var(--air-line)] bg-[color:var(--air-card)] px-4 pt-3 sm:px-7 sm:pt-4`}>
            {footer}
          </footer>
        )}
      </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
