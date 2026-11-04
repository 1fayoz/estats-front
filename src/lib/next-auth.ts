// Server-side session config. The browser never stores the backend JWT itself:
// next-auth keeps it inside its encrypted, httpOnly session cookie and hands it to
// the page through `useSession` only while the tab is open.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { LOGIN_PATH } from "@/config/private-routes";
import { AUTH_SECRET } from "@/lib/auth-secret";
import type { LoginResponse } from "@/lib/types";

// The server talks to the backend directly; an internal URL can be set apart
// from the public one baked into the bundle.
const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

// Without an `exp` claim the backend JWT is assumed to live this long.
const FALLBACK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Reads `exp` from the JWT payload without verifying it (the backend does that). */
function expiresAt(jwt: string): number {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
    if (typeof payload.exp === "number") return payload.exp * 1000;
  } catch {
    // opaque token: fall through
  }
  return Date.now() + FALLBACK_TTL_MS;
}

/** Calls a backend login endpoint and turns its error into the message the form shows. */
async function backendLogin(path: string, body: unknown) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error("Serverga ulanib bo'lmadi. Keyinroq urinib ko'ring.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const raw = data && (data.detail ?? data.message ?? data.error);
    const message = raw && typeof raw === "object" ? raw.message : raw;
    throw new Error(typeof message === "string" && message ? message : "Kirishda xatolik yuz berdi.");
  }

  const { accessToken, user } = data as LoginResponse;
  return {
    id: String(user.id),
    email: user.email ?? null,
    name: user.fullName ?? null,
    accessToken,
  };
}

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: LOGIN_PATH },
  providers: [
    CredentialsProvider({
      id: "password",
      name: "Email va parol",
      credentials: { email: {}, password: {} },
      authorize: (credentials) =>
        backendLogin("/auth/password/login", {
          email: credentials?.email?.trim(),
          password: credentials?.password,
        }),
    }),
    CredentialsProvider({
      id: "google",
      name: "Google",
      credentials: { idToken: {} },
      authorize: (credentials) =>
        backendLogin("/auth/google", { idToken: credentials?.idToken }),
    }),
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: { initData: {} },
      authorize: (credentials) =>
        backendLogin("/auth/telegram", { initData: credentials?.initData }),
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.accessTokenExpires = expiresAt(user.accessToken);
        delete token.error;
      }
      // No refresh token from the backend: an expired JWT ends the session.
      if (token.accessTokenExpires && Date.now() >= token.accessTokenExpires) {
        return { ...token, error: "SessionExpired" as const };
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.error ? null : (token.accessToken ?? null);
      session.error = token.error;
      return session;
    },
  },
};
