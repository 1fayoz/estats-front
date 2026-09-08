import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import shared from "./landing.module.css";
import styles from "./landing-pricing.module.css";

export function CtaSection() {
  return (
    <section className={styles.cta} aria-labelledby="cta-heading">
      <div className={shared.container}>
        <div className={styles.ctaPanel}>
          <div className={styles.ctaContent}>
            <p className={styles.ctaEyebrow}>Keyingi qadam — sizniki</p>
            <h2 id="cta-heading">Keyingi qarorni taxmin bilan emas, <span>raqam bilan qiling.</span></h2>
            <p className={styles.ctaDescription}>Do&apos;koningizni ulang. Savdo, xarajat va foydani bir joyda ko&apos;ring.</p>
            <div className={styles.ctaActions}>
              <Link href="/login" className={styles.ctaButton}>Do&apos;konni ulash <ArrowRight aria-hidden="true" /></Link>
              <a href="#imkoniyatlar" className={styles.ctaLink}>Imkoniyatlarni ko&apos;rish <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <div className={styles.ctaMark} aria-hidden="true"><span /><span /><span /><span /></div>
        </div>
      </div>
    </section>
  );
}
