"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { ApiError, googleLogin } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";

import { GoogleButton } from "./google-button";
import styles from "./login.module.css";

function getInitials(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function LoginForm() {
  const router = useRouter();
  const signIn = useUserStore((state) => state.signIn);
  const signOut = useUserStore((state) => state.signOut);
  const accessToken = useUserStore((state) => state.accessToken);
  const user = useUserStore((state) => state.user);
  const hydrated = useUserStore((state) => state.hydrated);

  const [loading, setLoading] = React.useState(false);
  const alreadyConnected = hydrated && Boolean(accessToken);
  const identity = user?.fullName?.trim() || user?.email || "eStats foydalanuvchisi";
  const initials = getInitials(identity) || "ES";
  const nextPath = user && user.shops.length === 0 ? "/integrations" : "/warehouse";

  const onCredential = React.useCallback(
    async (idToken: string) => {
      setLoading(true);
      try {
        const { accessToken: jwt, user: signedInUser } = await googleLogin(idToken);
        signIn(jwt, signedInUser);
        toast.success(`Xush kelibsiz, ${signedInUser.fullName || signedInUser.email}`);
        router.push(signedInUser.shops.length ? "/warehouse" : "/integrations");
      } catch (error) {
        toast.error(error instanceof ApiError ? error.message : "Kirishda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    },
    [router, signIn]
  );

  return (
    <section
      className={styles.authPanel}
      aria-labelledby="auth-title"
      aria-busy={!hydrated || loading}
    >
      <div className={styles.authHeader}>
        <span className={styles.secureBadge}>
          <ShieldCheck aria-hidden="true" />
          Himoyalangan kirish
        </span>
        <h2 id="auth-title">{alreadyConnected ? "Xush kelibsiz" : "Kabinetga kirish"}</h2>
        <p>
          {alreadyConnected
            ? "Saqlangan sessiya bilan ishni davom ettirishingiz mumkin."
            : "Google hisobingiz bilan bir qadamda xavfsiz davom eting."}
        </p>
      </div>

      {!hydrated ? (
        <div className={styles.hydrationState} role="status" aria-live="polite">
          <span className={styles.skeletonAvatar} />
          <span className={styles.skeletonLines}>
            <i />
            <i />
          </span>
          <span className="sr-only">Sessiya tekshirilmoqda</span>
        </div>
      ) : alreadyConnected ? (
        <div className={styles.sessionContent}>
          <div className={styles.sessionCard}>
            <span className={styles.avatar}>{initials}</span>
            <span className={styles.sessionIdentity}>
              <strong>{identity}</strong>
              <small>{user?.email && user.fullName ? user.email : "Faol sessiya"}</small>
              <span className={styles.sessionMeta}>
                <Check aria-hidden="true" />
                {user?.shops.length
                  ? `${user.shops.length} ta do‘kon ulangan`
                  : "Do‘kon ulashga tayyor"}
              </span>
            </span>
          </div>

          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => router.push(nextPath)}
          >
            {nextPath === "/integrations" ? "Do‘konni ulash" : "Kabinetga o‘tish"}
            <ArrowRight aria-hidden="true" />
          </button>
          <button type="button" className={styles.secondaryAction} onClick={signOut}>
            <LogOut aria-hidden="true" />
            Boshqa hisob bilan kirish
          </button>
        </div>
      ) : (
        <div className={styles.signInContent}>
          {loading ? (
            <div className={styles.verifyingState} role="status" aria-live="polite">
              <Loader2 aria-hidden="true" />
              Hisob tekshirilmoqda…
            </div>
          ) : (
            <GoogleButton onCredential={onCredential} />
          )}

          <div className={styles.trustNote}>
            <span>
              <ShieldCheck aria-hidden="true" />
            </span>
            <p>
              <strong>Parolingiz bizga berilmaydi.</strong>
              Google’dan faqat ism, email va profil rasmi olinadi.
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
