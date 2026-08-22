// Session helpers.
//
// The credential a seller types is their Uzum Seller API token. It is sent to the
// backend once, exchanged for a JWT, and never stored in the browser again — what
// persists on the device is the JWT, not the Uzum token.

export const AUTH_STORAGE_KEY = "mystats-auth";

/** Minimum length a token must have to be worth sending to the backend. */
export const MIN_TOKEN_LENGTH = 10;

// Accepts opaque tokens as well as base64 / base64url values (which contain + / = _ -).
const TOKEN_RE = /^[A-Za-z0-9+/=_.:-]{10,512}$/;

/** Cheap local format check, so an obviously wrong paste never hits the network. */
export function isValidTokenFormat(token: string): boolean {
  return TOKEN_RE.test(token.trim());
}

/** Mask a token for display, keeping only the head and tail visible. */
export function maskToken(token: string): string {
  const clean = token.trim();
  if (clean.length <= 8) return "•".repeat(Math.max(clean.length, 4));
  return `${clean.slice(0, 6)}••••••${clean.slice(-4)}`;
}
