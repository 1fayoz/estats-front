"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Check, LogOut, Palette, Plug } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { useUserStore } from "@/stores/user-store";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const user = useUserStore((s) => s.user);
  const signOut = useUserStore((s) => s.signOut);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sozlamalar"
        description="Magazinlaringiz va tashqi ko'rinish"
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Hisob
            </CardTitle>
            <CardDescription>Google akkaunt orqali kirgansiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="font-medium">{user?.fullName ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
