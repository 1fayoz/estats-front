"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, KeyRound, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, setPassword } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";

/** Backend qoidasi bilan bir xil (`passwords.validate`) — xato serverga bormasdan ko'rinsin. */
const MIN_LENGTH = 8;

function localProblem(password: string, repeat: string, email?: string | null): string | null {
  if (password.length < MIN_LENGTH) return `Kamida ${MIN_LENGTH} ta belgi.`;
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return "Kamida bitta harf va bitta raqam bo‘lsin.";
  }
  if (email && password.trim().toLowerCase() === email.toLowerCase()) {
    return "Parol email bilan bir xil bo‘lmasin.";
  }
  if (repeat && repeat !== password) return "Parollar mos kelmadi.";
  return null;
}

/**
 * Parol maydonlari va saqlash. Majburiy ekran (birinchi o'rnatish) va
 * Sozlamalardagi karta (almashtirish) bir xil formani ishlatadi —
 * farqi faqat `requireCurrent`.
 */
function PasswordForm({
  requireCurrent,
  submitLabel,
}: {
  requireCurrent: boolean;
  submitLabel: string;
}) {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const [current, setCurrent] = React.useState("");
  const [password, setPasswordValue] = React.useState("");
  const [repeat, setRepeat] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const problem = password ? localProblem(password, repeat, user?.email) : null;
  const ready =
    !problem && password.length > 0 && repeat === password && (!requireCurrent || current);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      setUser(await setPassword(password, requireCurrent ? current : undefined));
      toast.success("Parol saqlandi. Keyingi safar email va parol bilan kirasiz.");
      setCurrent("");
      setPasswordValue("");
      setRepeat("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      {/* Parol menejeri parolni aynan shu email bilan saqlasin. */}
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={user?.email ?? ""}
        readOnly
        hidden
      />
      {requireCurrent ? (
        <div className="grid gap-1.5">
          <Label htmlFor="pw-current">Joriy parol</Label>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            disabled={busy}
          />
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="pw-new">{requireCurrent ? "Yangi parol" : "Parol"}</Label>
        <Input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          disabled={busy}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="pw-repeat">Parolni takrorlang</Label>
        <Input
          id="pw-repeat"
          type="password"
          autoComplete="new-password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          disabled={busy}
        />
      </div>
      <p className={`text-xs ${problem ? "text-[var(--bad)]" : "text-muted-foreground"}`}>
        {problem ?? `Kamida ${MIN_LENGTH} ta belgi, harf va raqam bilan.`}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-[var(--bad)]">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={busy || !ready} className="w-full sm:w-fit">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        {submitLabel}
      </Button>
    </form>
  );
}

/**
 * Birinchi Google kirishidan keyin — kabinet ochilishidan OLDIN.
 *
 * Chetlab o'tish yo'q: `AuthGuard` parol o'rnatilmaguncha sahifa o'rniga
 * shuni chizadi. Faqat chiqish mumkin — boshqa hisob bilan kirmoqchi
 * bo'lgan odam bu yerda qamalib qolmasin.
 */
export function SetPasswordGate() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const signOut = useUserStore((s) => s.signOut);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <span className="mb-1 text-sm font-semibold text-muted-foreground">eStats</span>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Parol o‘rnating
          </CardTitle>
          <CardDescription>
            Google orqali kirdingiz. Keyingi safar{" "}
            <b className="text-foreground">{user?.email}</b> va shu parol bilan kirasiz —
            parol o‘rnatilmaguncha kabinet ochilmaydi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <PasswordForm requireCurrent={false} submitLabel="Saqlash va davom etish" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5 text-muted-foreground"
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
          >
            <LogOut className="h-3.5 w-3.5" /> Chiqish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Sozlamalar: parolni almashtirish (joriy parol bilan, Google'dan keyin — joriysisiz). */
export function PasswordCard() {
  const user = useUserStore((s) => s.user);
  // Pochta yo'q hisob (Telegram orqali kirgan a'zo) parol bilan kira olmaydi.
  if (!user?.email || user.hasPassword === undefined) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> Parol
        </CardTitle>
        <CardDescription>
          Kirish: <b className="text-foreground">{user.email}</b> va parol. Parolni unutsangiz —
          kirish sahifasida Google bilan kiring: keyingi 15 daqiqa ichida bu yerda joriy
          parolsiz yangisini qo‘yasiz.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-sm">
        <PasswordForm
          requireCurrent={Boolean(user.hasPassword) && !user.passwordResetAllowed}
          submitLabel={user.hasPassword ? "Parolni almashtirish" : "Parol o‘rnatish"}
        />
      </CardContent>
    </Card>
  );
}
