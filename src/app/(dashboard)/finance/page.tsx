"use client";

import { BarChart3, Calculator, Landmark, Sparkles } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceReport } from "@/features/finance/components/finance-report";
import { CalculatorTab } from "@/features/finance/components/calculator-tab";
import { useQueryState } from "@/lib/use-query-state";
import styles from "@/features/finance/components/finance.module.css";

export default function FinancePage() {
  const [tab, setTab] = useQueryState("view", "report");
  const activeTab = tab === "calculator" ? "calculator" : "report";

  return (
    <div className={styles.page}>
      <Tabs value={activeTab} onValueChange={setTab}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <Sparkles aria-hidden="true" /> Moliyaviy nazorat
            </span>
            <h1>Pul oqimini aniq boshqaring</h1>
            <p>
              Uzum hisob-kitoblarini tahlil qiling yoki mahsulot foydasini sotuvdan oldin
              hisoblab ko&apos;ring.
            </p>
          </div>

          <div className={styles.heroMark} aria-hidden="true">
            <Landmark />
            <span>Finance</span>
          </div>

          <TabsList className={styles.tabsList} aria-label="Moliya bo'limlari">
            <TabsTrigger value="report" className={styles.tabTrigger}>
              <span className={styles.tabIcon}><BarChart3 aria-hidden="true" /></span>
              <span>
                <strong>Hisobot</strong>
                <small>Real pul oqimi</small>
              </span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className={styles.tabTrigger}>
              <span className={styles.tabIcon}><Calculator aria-hidden="true" /></span>
              <span>
                <strong>Kalkulyator</strong>
                <small>Foyda prognozi</small>
              </span>
            </TabsTrigger>
          </TabsList>
        </header>

        <TabsContent value="report" className={styles.tabContent}>
          <FinanceReport />
        </TabsContent>
        <TabsContent value="calculator" className={styles.tabContent}>
          <CalculatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
