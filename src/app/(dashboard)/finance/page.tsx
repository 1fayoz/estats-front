"use client";

import * as React from "react";
import { CalendarRange, Calculator } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { FinanceReport } from "@/features/finance/components/finance-report";
import { CalculatorTab } from "@/features/finance/components/calculator-tab";
import { useQueryState } from "@/lib/use-query-state";

export default function FinancePage() {
  const [tab, setTab] = useQueryState("view", "report");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moliya"
        description="Kunlik savdo, komissiya, logistika va Uzum yechimlari — hamda foyda kalkulyatori."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="report">
            <CalendarRange className="h-4 w-4" />
            Kunlik hisobot
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4" />
            Kalkulyator va tariflar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <FinanceReport />
        </TabsContent>
        <TabsContent value="calculator">
          <CalculatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
