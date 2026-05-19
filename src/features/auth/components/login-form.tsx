"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, AtSign, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/user-store";

export function LoginForm() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [username, setUsername] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, "");
    if (clean.length < 2) {
      toast.error("Iltimos, do'kon nomini kiriting (kamida 2 belgi)");
      return;
    }
    setLoading(true);
    setUser({ username: clean, storeName: clean });
    await new Promise((r) => setTimeout(r, 850));
    toast.success(`@${clean} do'koni ulandi. Analitika tayyorlanmoqda...`);
    router.push("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card className="border-border/60 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Do'koningizni ulang</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <CardDescription>
            Uzum Marketdagi do'kon foydalanuvchi nomingizni kiriting va dashboard ochiladi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Uzum do'kon nomi</Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  autoFocus
                  autoComplete="off"
                  placeholder="masalan: techzone_uz"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 pl-9 text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Demo rejimda istalgan nom ishlaydi — barcha statistika namuna ma'lumotlar bilan ko'rsatiladi.
              </p>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ulanmoqda...
                </>
              ) : (
                <>
                  Dashboardga kirish
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              tezkor demo
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["techzone_uz", "modastyle"].map((demo) => (
                <Button
                  key={demo}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUsername(demo)}
                  className="font-mono text-xs"
                >
                  @{demo}
                </Button>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
