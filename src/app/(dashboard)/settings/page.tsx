"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Palette, RefreshCw, ShieldCheck, Store } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { useUserStore } from "@/stores/user-store";
import { ApiError, login } from "@/lib/api";
import { MIN_TOKEN_LENGTH, isValidTokenFormat } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const accessToken = useUserStore((s) => s.accessToken);
  const storeName = useUserStore((s) => s.storeName);
  const shops = useUserStore((s) => s.shops);
  const signIn = useUserStore((s) => s.signIn);
  const signOut = useUserStore((s) => s.signOut);

  const [newToken, setNewToken] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  /** Re-authenticating with a fresh Uzum token replaces the one stored server-side. */
  const onSave = async () => {
    const clean = newToken.trim();
    if (clean.length < MIN_TOKEN_LENGTH || !isValidTokenFormat(clean)) {
      toast.error(`Token yaroqsiz ko'rinishda (kamida ${MIN_TOKEN_LENGTH} belgi)`);
      return;
    }
    setSaving(true);
    try {
      const { accessToken: jwt, user } = await login(clean);
      signIn(jwt, user);
      setNewToken("");
      toast.success("Token yangilandi va serverda saqlandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Token yangilanmadi.");
    } finally {
      setSaving(false);
    }
  };

  const onDisconnect = () => {
    signOut();
    toast.success("Sessiya yopildi");
    router.push("/");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sozlamalar"
        description="Uzum ulanishi va tashqi ko'rinishni boshqaring."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Uzum ulanishi
            </CardTitle>
            <CardDescription>
              Uzum tokeni serverda saqlanadi — brauzerda faqat sessiya kaliti turadi.
              Token yangilansa, keyingi sinxronizatsiyalar yangisi bilan ishlaydi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="min-w-0">
                <div className="font-medium">{storeName ?? "Ulanmagan"}</div>
                <div className="text-xs text-muted-foreground">
                  {accessToken ? "Sessiya faol" : "Sessiya yo'q"}
                </div>
              </div>
              <Badge variant={accessToken ? "success" : "secondary"}>
                {accessToken ? "Faol" : "Yo'q"}
              </Badge>
            </div>

            {shops.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Store className="h-3.5 w-3.5" /> Ulangan do'konlar ({shops.length})
                </div>
                {shops.map((shop) => (
                  <div
                    key={shop.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{shop.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{shop.shopId}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5 border-t pt-4">
              <Label htmlFor="newToken">Tokenni yangilash</Label>
              <div className="flex gap-2">
                <Input
                  id="newToken"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="••••••••••••••••"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button size="sm" onClick={onSave} disabled={saving}>
                  {saving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  Saqlash
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Yangi token Uzum'da tekshiriladi. Yaroqsiz bo'lsa saqlanmaydi.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={onDisconnect}
              disabled={!accessToken}
            >
              <LogOut className="h-3.5 w-3.5" /> Chiqish
            </Button>
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
