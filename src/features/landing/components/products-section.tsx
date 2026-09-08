import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, PlugZap } from "lucide-react";

import base from "./landing.module.css";
import styles from "./landing-features.module.css";

const STEPS = [
  {
    number: "01",
    icon: PlugZap,
    label: "Ulash",
    title: "Do'koningizni ulang.",
    description: "Uzum integratsiyasini sozlang. Tovarlar va sotuv ma'lumotlari kabinetingizga yig'iladi.",
    detail: "Boshlanish nuqtasi — Integratsiyalar",
  },
  {
    number: "02",
    icon: Boxes,
    label: "Hisob",
    title: "Kirim va tan narxni kiriting.",
    description: "Har bir kelgan partiyaning miqdori, narxi va sanasini saqlang. Foyda hisobi shu ma'lumotlarga tayanadi.",
    detail: "Har bir partiya alohida hisobda",
  },
  {
    number: "03",
    icon: BarChart3,
    label: "Kundalik ish",
    title: "Tahlil qiling. Keyin joylang.",
    description: "Foyda va qoldiqni kuzating, SEO tavsiyalarini tekshiring. Tayyor tovar postini ulangan tarmoqlarga yuboring.",
    detail: "Oxirgi qaror o'zingizda",
  },
];

export function ProductsSection() {
  return (
    <section id="mahsulot" className={styles.workflow} aria-labelledby="workflow-title">
      <div className={base.container}>
        <div className={styles.workflowIntro}>
          <div><p className={base.eyebrow}>Qanday boshlanadi?</p><h2 id="workflow-title" className={base.sectionTitle}>Uch qadam.<br />Tartibli kundalik ish.</h2></div>
          <p className={base.lead}>Avval ma'lumotlarni ulang, keyin hisobni to'ldiring. eStats bilan ishlash shundan boshlanadi.</p>
        </div>

        <ol className={styles.workflowSteps}>
          {STEPS.map((step) => {
            const Icon = step.icon;
            return <li key={step.number} className={styles.step}>
              <div className={styles.stepTop}><span className={styles.stepNumber}>{step.number}</span><span className={styles.stepIcon}><Icon aria-hidden="true" /></span></div>
              <p className={styles.stepLabel}>{step.label}</p>
              <h3>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              <div className={styles.stepDetail}><span />{step.detail}</div>
            </li>;
          })}
        </ol>

        <div className={styles.workflowFootnote}><p>O'z do'koningiz ma'lumotlari bilan boshlang.</p><Link href="/login" className={base.textLink}>Ishni boshlash <ArrowRight aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
