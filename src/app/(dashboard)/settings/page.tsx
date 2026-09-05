"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Palette, Plug } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sozlamalar"
        description="Tashqi ko'rinish. Ism, raqam va tokenlar — Jamoa va Integratsiyalarda"
        actions={
          <Link href={"/integrations" as Route}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plug className="h-3.5 w-3.5" /> Integratsiyalar
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Tashqi ko&apos;rinish
            </CardTitle>
            <CardDescription>Yorug&apos; yoki qorong&apos;u rejim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
                    theme === t ? "border-primary bg-primary/5 text-primary" : "hover:bg-accent"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-md border ${
                      t === "light"
                        ? "bg-white"
                        : t === "dark"
                          ? "bg-zinc-900"
                          : "bg-gradient-to-br from-white to-zinc-900"
                    }`}
                  />
                  <span className="capitalize">
                    {t === "light" ? "Yorug'" : t === "dark" ? "Qorong'u" : "Avto"}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
