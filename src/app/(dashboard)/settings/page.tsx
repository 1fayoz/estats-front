"use client";

import { Store, Bell, Palette, KeyRound } from "lucide-react";
import { useTheme } from "next-themes";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { useUserStore } from "@/stores/user-store";

export default function SettingsPage() {
  const { username, storeName, setUser } = useUserStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sozlamalar"
        description="Do'kon ma'lumotlari, mavzu va bildirishnomalarni boshqaring."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-4 w-4" /> Do'kon profili
            </CardTitle>
            <CardDescription>Uzum Marketdagi do'kon ma'lumotlaringiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Uzum username</Label>
              <Input
                id="username"
                defaultValue={username ?? ""}
                onChange={(e) => setUser({ username: e.target.value, storeName: storeName ?? undefined })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storeName">Do'kon nomi</Label>
              <Input
                id="storeName"
                defaultValue={storeName ?? ""}
                onChange={(e) => setUser({ username: username ?? "", storeName: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
              <div>
                <div className="font-medium">Hisob holati</div>
                <div className="text-xs text-muted-foreground">Demo rejim faol</div>
              </div>
              <Badge variant="success">Faol</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> Tashqi ko'rinish
            </CardTitle>
            <CardDescription>Yorug' yoki qorong'u rejimni tanlang</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
                    theme === t
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-accent"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-md border ${
                      t === "light" ? "bg-white" : t === "dark" ? "bg-zinc-900" : "bg-gradient-to-br from-white to-zinc-900"
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
              <Bell className="h-4 w-4" /> Bildirishnomalar
            </CardTitle>
            <CardDescription>Qaysi hodisalar haqida xabardor bo'lishni xohlaysiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Yangi buyurtma", desc: "Har bir yangi buyurtma uchun" },
              { label: "Qoldiq tugashi", desc: "Mahsulot 10 donadan kam qolganda" },
              { label: "SEO pozitsiya o'zgarishi", desc: "Top 10 ga kirish/chiqishda" },
              { label: "Yangi salbiy sharh", desc: "Reyting 3 yulduzdan past bo'lganda" },
            ].map((n) => (
              <label key={n.label} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div>
                  <div className="font-medium">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.desc}</div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[var(--primary)]"
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> API integratsiyasi
            </CardTitle>
            <CardDescription>
              Telegram bot va Chrome kengaytmasini ulang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-3 font-mono text-xs">
              ms_demo_token_•••••_2026_a8f7c
            </div>
            <div className="flex gap-2">
              <Button size="sm">Tokenni nusxa olish</Button>
              <Button size="sm" variant="outline">Yangilash</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Token orqali @mystats_bot botiga ulanib, avtomatik hisobotlarni olishingiz mumkin.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
