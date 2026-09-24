import type { ReactNode } from "react";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingFooter } from "@/features/landing/components/footer";
import styles from "@/features/landing/components/landing.module.css";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`landing-light ${styles.page}`}>
      <LandingHeader />
      <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10 sm:py-16">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
