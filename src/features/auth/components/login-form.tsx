"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import { ApiError, googleLogin } from "@/lib/api";

import { GoogleButton } from "./google-button";

export function LoginForm() {
  const router = useRouter();
  const signIn = useUserStore((s) => s.signIn);
  const accessToken = useUserStore((s) => s.accessToken);
  const hydrated = useUserStore((s) => s.hydrated);

  const [loading, setLoading] = React.useState(false);
  const alreadyConnected = hydrated && Boolean(accessToken);

  const onCredential = React.useCallback(
    async (idToken: string) => {
      setLoading(true);
      try {
        const { accessToken: jwt, user } = await googleLogin(idToken);
        signIn(jwt, user);
        toast.success(`Xush kelibsiz, ${user.fullName || user.email}`);
        // Magazini bo'lmagan yangi foydalanuvchini darhol qo'shish sahifasiga
        // olib boramiz — bo'sh ombor ko'rsatib chalkashtirmaymiz.
        router.push(user.shops.length ? "/warehouse" : "/settings");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Kirishda xatolik.");
      } finally {
        setLoading(false);
      }
    },
    [router, signIn]
  );

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
            <CardTitle className="text-2xl">Kirish</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <CardDescription>
            Google akkauntingiz bilan kiring. Uzum tokenini keyin, magazin qo'shayotganda
            kiritasiz — bitta hisobga bir nechta magazin ulash mumkin.
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
                Kabinetga o'tish
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {loading ? (
                <div className="flex h-11 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tekshirilmoqda...
                </div>
              ) : (
                <GoogleButton onCredential={onCredential} />
              )}

              <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Biz Google'dan faqat ismingiz va emailingizni olamiz. Uzum tokeningiz
                serverda saqlanadi va brauzerga qaytarilmaydi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
