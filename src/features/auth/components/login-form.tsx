"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/user-store";
import { ApiError, login } from "@/lib/api";
import { MIN_TOKEN_LENGTH, isValidTokenFormat } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const signIn = useUserStore((s) => s.signIn);
  const accessToken = useUserStore((s) => s.accessToken);
  const hydrated = useUserStore((s) => s.hydrated);

  const [token, setTokenInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const alreadyConnected = hydrated && Boolean(accessToken);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = token.trim();
    if (clean.length < MIN_TOKEN_LENGTH || !isValidTokenFormat(clean)) {
      toast.error(`Token yaroqsiz ko'rinishda (kamida ${MIN_TOKEN_LENGTH} belgi)`);
      return;
    }

    setLoading(true);
    try {
      // The backend validates the token against Uzum, remembers it, and returns a JWT.
      const { accessToken: jwt, user } = await login(clean);
      signIn(jwt, user);
      toast.success(
        user.storeName
          ? `"${user.storeName}" do'koni ulandi.`
          : "Token qabul qilindi."
      );
      router.push("/warehouse");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Kirishda kutilmagan xatolik.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-2xl">Uzum tokeni bilan kiring</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <CardDescription>
            Uzum Seller kabinetingizdagi API tokenini kiriting. Do'koningiz, tovarlaringiz
            va sotuvlaringiz shu token orqali yuklanadi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alreadyConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border bg-emerald-500/5 p-3 text-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="font-medium">Siz allaqachon tizimdasiz</div>
                  <div className="text-xs text-muted-foreground">
                    Bu qurilmadagi sessiya bilan davom etishingiz mumkin.
                  </div>
                </div>
              </div>
              <Button
                variant="gradient"
                size="lg"
                className="w-full text-base"
                onClick={() => router.push("/warehouse")}
              >
                Omborga o'tish
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="token">Uzum Seller API tokeni</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="token"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="••••••••••••••••••••••••"
                    value={token}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="h-12 pl-9 font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Token serverda saqlanadi va brauzerga qaytarilmaydi — bu yerda faqat
                  sessiya kaliti qoladi.
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
                    Tekshirilmoqda...
                  </>
                ) : (
                  <>
                    Kirish
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Token Uzum Seller kabinetingizdagi API bo'limidan olinadi.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
