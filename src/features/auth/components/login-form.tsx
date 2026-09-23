"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { ApiError, googleLogin, passwordLogin } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";
import { consumeReturn } from "@/lib/lens";
import { useUserStore } from "@/stores/user-store";

import { GoogleButton } from "./google-button";
import styles from "./login.module.css";

/** Kirgandan keyin qayerga: saqlangan qaytish manzili, bo'lmasa kabinet. */
function landingPath(shopCount: number): Route {
  return (consumeReturn() ?? (shopCount ? "/warehouse" : "/integrations")) as Route;
}

/**
 * Kirish.
 *
 * * Sessiya allaqachon bor bo'lsa — forma KO'RSATILMAYDI, darhol kabinetga
 *   o'tiladi. Token yaroqsiz bo'lib chiqsa kabinetdagi `AuthGuard` uni
 *   o'chirib shu yerga qaytaradi, ya'ni aylanib qolish yo'q.
 * * Asosiy yo'l — email + parol. Birinchi marta esa Google bilan: hisob
 *   faqat o'sha yerda ochiladi, parol esa kabinetga kirishdan oldin
 *   majburiy o'rnatiladi (`SetPasswordGate`).
 */
export function LoginForm() {
  const router = useRouter();
  const signIn = useUserStore((state) => state.signIn);
  const accessToken = useUserStore((state) => state.accessToken);
  const user = useUserStore((state) => state.user);
  const hydrated = useUserStore((state) => state.hydrated);

  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPasswordValue] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const alreadyConnected = hydrated && Boolean(accessToken);

  // Kirgan odam login sahifasini ko'rmaydi — to'g'ridan-to'g'ri kabinet.
  // `replace`: orqaga bosilganda yana shu sahifaga qaytib, yana yo'naltirilib
  // qolmasin.
  const redirected = React.useRef(false);
  React.useEffect(() => {
    if (!alreadyConnected || redirected.current) return;
    redirected.current = true;
    router.replace(landingPath(user?.shops.length ?? 1));
  }, [alreadyConnected, router, user]);

  const finish = React.useCallback(
    ({ accessToken: jwt, user: signedInUser }: LoginResponse) => {
      redirected.current = true;
      signIn(jwt, signedInUser);
      toast.success(`Xush kelibsiz, ${signedInUser.fullName || signedInUser.email}`);
      router.replace(landingPath(signedInUser.shops.length));
    },
    [router, signIn]
  );

  const onCredential = React.useCallback(
    async (idToken: string) => {
      setLoading(true);
      setError(null);
      try {
        finish(await googleLogin(idToken));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Kirishda xatolik yuz berdi.");
        setLoading(false);
      }
    },
    [finish]
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      finish(await passwordLogin(email.trim(), password));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kirishda xatolik yuz berdi.");
      setLoading(false);
    }
  };

  const busy = !hydrated || alreadyConnected;

  return (
    <section
      className={styles.authPanel}
      aria-labelledby="auth-title"
      aria-busy={busy || loading}
    >
      <div className={styles.authHeader}>
        <span className={styles.secureBadge}>
          <ShieldCheck aria-hidden="true" />
          Himoyalangan kirish
        </span>
        <h2 id="auth-title">Kabinetga kirish</h2>
        <p>
          {busy
            ? "Sessiya tekshirilmoqda…"
            : "Email va parolingiz bilan kiring. Birinchi marta bo‘lsa — Google bilan."}
        </p>
      </div>

      {busy ? (
        <div className={styles.verifyingState} role="status" aria-live="polite">
          <Loader2 aria-hidden="true" />
          {alreadyConnected ? "Kabinet ochilmoqda…" : "Sessiya tekshirilmoqda…"}
        </div>
      ) : (
        <div className={styles.signInContent}>
          <form className={styles.passwordForm} onSubmit={onSubmit} noValidate>
            <label className={styles.field}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                inputMode="email"
                placeholder="siz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Parol</span>
              <span className={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className={styles.revealButton}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko‘rsatish"}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </span>
            </label>

            {error ? (
              <p className={styles.formError} role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className={styles.primaryAction}
              disabled={loading || !email.trim() || !password}
            >
              {loading ? <Loader2 className={styles.spin} aria-hidden="true" /> : null}
              Kirish
              {!loading ? <ArrowRight aria-hidden="true" /> : null}
            </button>
          </form>

          <div className={styles.divider}>
            <span>{"birinchi marta kirayapsizmi?"}</span>
          </div>

          <GoogleButton onCredential={onCredential} />

          <div className={styles.trustNote}>
            <span>
              <ShieldCheck aria-hidden="true" />
            </span>
            <p>
              <strong>Birinchi kirish — Google orqali.</strong>
              {"Kirgandan keyin parol o‘rnatasiz va keyingi safar email + parol bilan kirasiz."}
            </p>
          </div>
        </div>
      )}

      <p className={styles.legalCopy}>
        Davom etish orqali <Link href="/terms">foydalanish shartlari</Link> va{" "}
        <Link href="/privacy">maxfiylik siyosati</Link>ga rozilik bildirasiz.
      </p>
    </section>
  );
}
