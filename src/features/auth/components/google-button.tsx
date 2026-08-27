"use client";

import * as React from "react";

import { GOOGLE_CLIENT_ID, loadGoogleIdentity } from "../google";

interface GoogleButtonProps {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}

/**
 * Google's own rendered sign-in button.
 *
 * Using Google's button rather than a look-alike is deliberate: it is what users
 * are trained to trust, and the ID token it returns is signed by Google, so the
 * server can verify it without ever seeing a password.
 */
export function GoogleButton({ onCredential, disabled }: GoogleButtonProps) {
  const holder = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  // Kept in a ref so re-renders never re-initialise GIS with a stale callback.
  const callbackRef = React.useRef(onCredential);
  callbackRef.current = onCredential;

  React.useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google login sozlanmagan (NEXT_PUBLIC_GOOGLE_CLIENT_ID yo'q)");
      return;
    }
    let cancelled = false;
    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !holder.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current(response.credential),
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(holder.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: 320,
        });
      })
      .catch(() => !cancelled && setError("Google skriptini yuklab bo'lmadi"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={holder}
      className={disabled ? "pointer-events-none opacity-60" : undefined}
      // GIS iframe'i o'z o'lchamini o'zi boshqaradi; markazga tekislaymiz.
      style={{ display: "flex", justifyContent: "center", minHeight: 44 }}
    />
  );
}
