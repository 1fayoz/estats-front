import type { ReactNode } from "react";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingFooter } from "@/features/landing/components/footer";
import styles from "@/features/landing/components/landing.module.css";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`landing-light ${styles.page}`}>
      <LandingHeader locale="en" />
      {children}
      <LandingFooter locale="en" />
    </div>
  );
}
