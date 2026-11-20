// Audit tuzatishlari uchun sof qismlar: Telegram login CSRF, ruxsatsiz a'zo,
// xatcho'p, kirishdan keyin qaytish, OAuth xato matni, CSP.
// Ishga tushirish: `npm run test:guards` (Node 22.18+).
import assert from "node:assert/strict";
import { test } from "node:test";

import { isInsideTelegramClient, stripTelegramHash } from "../src/features/telegram/telegram-client.ts";
import { firstAllowedPath } from "../src/config/nav.ts";
import { safeBookmarklet } from "../src/features/settings/bookmarklet.ts";
import { isReturnAllowed } from "../src/lib/return-path.ts";
import { GENERIC_OAUTH_ERROR, oauthErrorMessage, oauthReturnTab } from "../src/lib/oauth-return.ts";
import { buildVncUrl } from "../src/lib/vnc-url.ts";
import { buildCsp } from "../src/config/csp.ts";

// ── #36 Telegram: hash'dagi initData oddiy brauzerda login qilmaydi ──────────

test("oddiy brauzer (yuqori oyna, ko'priksiz) — Telegram ichida EMAS", () => {
  const win = { external: {} };
  win.parent = win;
  assert.equal(isInsideTelegramClient(win), false);
});

test("Chrome'ning `window.external` i (notify yo'q) — Telegram emas", () => {
  const win = { external: { AddSearchProvider() {} } };
  win.parent = win;
  assert.equal(isInsideTelegramClient(win), false);
});

test("Telegram mobil/desktop ko'prigi bor — ichida", () => {
  const win = { TelegramWebviewProxy: { postEvent() {} } };
  win.parent = win;
  assert.equal(isInsideTelegramClient(win), true);
});

test("eski Windows mijozi (external.notify) — ichida", () => {
  const win = { external: { notify() {} } };
  win.parent = win;
  assert.equal(isInsideTelegramClient(win), true);
});

test("Telegram Web iframe'i — ichida", () => {
  assert.equal(isInsideTelegramClient({ parent: {} }), true);
});

test("hash'dan faqat tgWebApp* kalitlari olib tashlanadi", () => {
  assert.equal(stripTelegramHash("#tgWebAppData=a%3Db&tgWebAppVersion=7.0&tgWebAppPlatform=web"), "");
  assert.equal(stripTelegramHash("#section&tgWebAppData=x"), "#section");
  assert.equal(stripTelegramHash("#top"), "#top");
  assert.equal(stripTelegramHash(""), "");
});

// ── #38 Ruxsatsiz a'zo cheksiz spinnerda qolmaydi ────────────────────────────

test("bo'sh ruxsat ro'yxati — ochiq sahifa yo'q (null, '/market' emas)", () => {
  assert.equal(firstAllowedPath([]), null);
});

test("ruxsat bor — birinchi ochiq sahifa shu ruxsat sahifasi", () => {
  assert.equal(firstAllowedPath(["market.view"]), "/market");
});

test("eski backend (actions yo'q) — hammasi ochiq, birinchi sahifa bor", () => {
  assert.equal(typeof firstAllowedPath(undefined), "string");
});

// ── #39 Xatcho'p: faqat backend yasaydigan shakl ─────────────────────────────

test("backend bookmarklet'i qabul qilinadi", () => {
  const code = "javascript:(async()=>{try{alert(1)}catch(e){}})()";
  assert.equal(safeBookmarklet(code), code);
});

test("boshqa shakl yoki tur — rad etiladi", () => {
  assert.equal(safeBookmarklet("https://evil.example"), null);
  assert.equal(safeBookmarklet("javascript:alert(document.cookie)"), null);
  assert.equal(safeBookmarklet("javascript:(async()=>{\nalert(1)})()"), null);
  assert.equal(safeBookmarklet(undefined), null);
  assert.equal(safeBookmarklet(42), null);
});

// ── #66 Kirishdan keyin qaytish: AI kengaytma ham ────────────────────────────

test("ulash sahifalari — qaytish mumkin", () => {
  assert.equal(isReturnAllowed("/extension/connect?state=abc"), true);
  assert.equal(isReturnAllowed("/extension/ai-connect?state=0f0e&version=1.0"), true);
  assert.equal(isReturnAllowed("/extension/ai-connect"), true);
});

test("boshqa manzillar — open redirect yo'q", () => {
  assert.equal(isReturnAllowed("//evil.example/extension/connect"), false);
  assert.equal(isReturnAllowed("https://evil.example"), false);
  assert.equal(isReturnAllowed("/extension/ai-connectx"), false);
  assert.equal(isReturnAllowed("/warehouse"), false);
  assert.equal(isReturnAllowed("/extension/connect#x"), false);
  assert.equal(isReturnAllowed(null), false);
});

// ── #67 OAuth xatosi: begona matn kabinetda ko'rsatilmaydi ───────────────────

test("havoladagi begona matn — umumiy xabar bilan almashtiriladi", () => {
  const phishing = "Hisobingiz bloklandi. +998... ga qo'ng'iroq qiling";
  assert.equal(oauthErrorMessage(phishing, false), GENERIC_OAUTH_ERROR);
});

test("backend'ning o'zgarmas xabari — har doim o'zi", () => {
  assert.equal(oauthErrorMessage("Ulanish havolasi eskirgan.", false), "Ulanish havolasi eskirgan.");
});

test("odam o'zi ulashni boshlagan — provayder matni (qisqartirilgan)", () => {
  assert.equal(oauthErrorMessage("access_denied", true), "access_denied");
  assert.equal(oauthErrorMessage("x".repeat(500), true).length, 201);
});

test("#50: backend'ning yangi state xabari — boshqa brauzerda ham o'zi", () => {
  const text = "Ulanish havolasi eskirgan yoki boshqa brauzerda ochilgan.";
  // Boshqa brauzerda `pending` belgisi yo'q — baribir aniq izoh chiqadi.
  assert.equal(oauthErrorMessage(text, false), text);
});

// ── #51 Instagram'dan qaytish Instagram tabini ochadi ────────────────────────

const getter = (query) => {
  const params = new URLSearchParams(query);
  return (key) => params.get(key);
};

test("#51: ?ig_connected / ?ig_error — Instagram tabi", () => {
  assert.equal(oauthReturnTab(getter("ig_connected=1")), "instagram");
  assert.equal(oauthReturnTab(getter("ig_error=Facebook+kod+qaytarmadi.")), "instagram");
});

test("#51: tab aniq berilgan yoki ig_* yo'q — tegilmaydi", () => {
  assert.equal(oauthReturnTab(getter("tab=ai&ig_connected=1")), null);
  assert.equal(oauthReturnTab(getter("net_connected=tiktok")), null);
  assert.equal(oauthReturnTab(getter("")), null);
});

test("xato yo'q — hech narsa", () => {
  assert.equal(oauthErrorMessage(null, true), null);
  assert.equal(oauthErrorMessage("   ", false), null);
});

// ── #65 CSP ──────────────────────────────────────────────────────────────────

test("majburiy CSP faqat xavfsiz direktivalar", () => {
  const { enforced } = buildCsp({ apiUrls: ["https://api.estats.uz/api/v1"] });
  assert.equal(enforced, "base-uri 'self'; object-src 'none'; frame-ancestors 'self'");
});

test("report-only: API, Telegram, Google, E-IMZO ruxsat etilgan", () => {
  const { reportOnly } = buildCsp({
    apiUrls: ["https://api.estats.uz/api/v1", undefined, "not a url", "javascript:alert(1)"],
  });
  assert.match(reportOnly, /connect-src 'self' https:\/\/api\.estats\.uz wss:\/\/api\.estats\.uz https:\/\/accounts\.google\.com wss:\/\/127\.0\.0\.1:64443 ws:\/\/127\.0\.0\.1:64646/);
  assert.match(reportOnly, /script-src 'self' 'unsafe-inline' https:\/\/telegram\.org https:\/\/accounts\.google\.com/);
  assert.doesNotMatch(reportOnly, /unsafe-eval/);
  assert.doesNotMatch(reportOnly, /javascript/);
});

test("dev rejimda HMR uchun eval va websocket", () => {
  const { reportOnly } = buildCsp({ apiUrls: [], dev: true });
  assert.match(reportOnly, /'unsafe-eval'/);
  assert.match(reportOnly, /connect-src [^;]* ws: wss:/);
});

// ── #48/#49 VNC WebSocket manzili ────────────────────────────────────────────

test("#49: manzilda faqat bir martalik chipta — JWT (token=) yo'q", () => {
  const url = buildVncUrl("https://api.estats.uz/api/v1", "/product-ai/uzum-login-vnc", { ticket: "t/1+2", shopId: 7 });
  const parsed = new URL(url);
  assert.equal(parsed.protocol, "wss:");
  assert.equal(parsed.pathname, "/api/v1/product-ai/uzum-login-vnc");
  assert.equal(parsed.searchParams.get("ticket"), "t/1+2");
  assert.equal(parsed.searchParams.get("shop_id"), "7");
  assert.equal(parsed.searchParams.has("token"), false);
});

test("#48: joriy workspace `workspace_id` bilan yuboriladi", () => {
  const url = new URL(buildVncUrl("http://127.0.0.1:8000/api/v1", "/product-ai/uzum-login-vnc", { ticket: "a", workspaceId: 42, shopId: 3 }));
  assert.equal(url.protocol, "ws:");
  assert.equal(url.searchParams.get("workspace_id"), "42");
});

test("#48: workspace tanlanmagan — parametr qo'shilmaydi (backend o'zi tanlaydi)", () => {
  const url = new URL(buildVncUrl("https://api.estats.uz/api/v1", "/product-ai/market-login-vnc", { ticket: "a", workspaceId: null }));
  assert.equal(url.searchParams.has("workspace_id"), false);
  assert.equal(url.searchParams.has("shop_id"), false);
});
