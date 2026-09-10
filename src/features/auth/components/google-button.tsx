"use client";

import * as React from "react";
import { Loader2, RefreshCw } from "lucide-react";

import { GOOGLE_CLIENT_ID, loadGoogleIdentity } from "../google";
import styles from "./login.module.css";

interface GoogleButtonProps {
  onCredential: (idToken: string) => void;
}

type GoogleButtonState = "loading" | "ready" | "error";

export function GoogleButton({ onCredential }: GoogleButtonProps) {
  const holder = React.useRef<HTMLDivElement>(null);
  const callbackRef = React.useRef(onCredential);
  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState<GoogleButtonState>("loading");
  callbackRef.current = onCredential;

  React.useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let animationFrame = 0;
    let lastWidth = 0;

    setState("loading");

    if (!GOOGLE_CLIENT_ID) {
      setState("error");
      return;
    }

    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !holder.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current(response.credential),
          cancel_on_tap_outside: true,
        });

        const render = () => {
          if (cancelled || !holder.current || !window.google) return;

          const availableWidth = Math.floor(holder.current.getBoundingClientRect().width);
          if (!availableWidth) return;

          const width = Math.min(400, Math.max(200, availableWidth));
          if (width === lastWidth) return;

          lastWidth = width;
          holder.current.replaceChildren();
          window.google.accounts.id.renderButton(holder.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "continue_with",
            logo_alignment: "center",
            width,
          });
          setState("ready");
        };

        render();
        resizeObserver = new ResizeObserver(() => {
          cancelAnimationFrame(animationFrame);
          animationFrame = requestAnimationFrame(render);
        });
        resizeObserver.observe(holder.current);
      })
      .catch(() => !cancelled && setState("error"));

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [attempt]);

  return (
    <div className={styles.googleArea} aria-live="polite">
      <div
        ref={holder}
        className={`${styles.googleHolder} ${state === "ready" ? styles.googleReady : ""}`}
      />

      {state === "loading" ? (
        <div className={styles.googleLoading} role="status">
          <Loader2 aria-hidden="true" />
          Google kirishi yuklanmoqda…
        </div>
      ) : null}

      {state === "error" ? (
        <div className={styles.googleError} role="alert">
          <p>Google orqali kirishni yuklab bo‘lmadi.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            <RefreshCw aria-hidden="true" />
            Qayta urinish
          </button>
        </div>
      ) : null}
    </div>
  );
}
