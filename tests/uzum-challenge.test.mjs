// Uzum (Cloudflare) tekshiruvi — banner va oyna qoidalari (sof qism).
// Ishga tushirish: `npm test` (Node 22.18+).
//
// 2026-11-24: banner «Bir marta belgi qo'ysangiz, qolganini eStats o'zi davom
// ettiradi» deb va'da berardi, sotuvchi esa belgini qayta-qayta bosardi —
// tekshiruv eStats serverining IP'siga qo'yilgan, bosish bilan o'tmaydi.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CHALLENGE_LOOP_AFTER, EXTENSION_HREF, WINDOW_HREF, approxDuration, canSaveSession, challengeBannerView,
  vncSessionView,
} from "../src/lib/uzum-challenge.ts";

const pending = { pending: true, since: 1 };

test("banner bajarilmaydigan va'da bermaydi — hech bir holatda", () => {
  for (const extra of [{}, { extensionEnabled: true }, { extensionEnabled: true, extensionOnline: true }]) {
    const view = challengeBannerView({ ...pending, ...extra });
    assert.ok(!view.text.includes("qolganini eStats o'zi davom ettiradi"), view.text);
    assert.ok(!view.text.includes("Bir marta belgi"), view.text);
  }
});

test("kengaytma yo'li yoqilgan, lekin oflayn — asosiy tugma kengaytmaga olib boradi", () => {
  const view = challengeBannerView({ ...pending, extensionEnabled: true, extensionOnline: false });
  assert.deepEqual(view.primary, { href: EXTENSION_HREF, label: "Kengaytmani yoqish" });
  assert.equal(view.secondary?.href, WINDOW_HREF);
  assert.ok(view.text.includes("eStats Lens"));
});

test("kengaytma onlayn — voronka/Bust ishlayapti, faqat joylash to'xtagan", () => {
  const view = challengeBannerView({ ...pending, extensionEnabled: true, extensionOnline: true });
  assert.ok(view.text.includes("ishlayapti"));
  assert.ok(view.text.includes("joylash"));
  assert.equal(view.primary.href, WINDOW_HREF);
  assert.equal(view.secondary, null);
});

test("kengaytma yo'li yoqilmagan do'kon — oyna yagona yo'l, lekin rost matn bilan", () => {
  const view = challengeBannerView(pending);
  assert.equal(view.primary.href, WINDOW_HREF);
  assert.equal(view.secondary, null);
  assert.ok(view.text.includes("qayta-qayta bosish yordam bermaydi"));
});

test("pauza — keyingi urinish vaqti daqiqada; yo'q bo'lsa izohsiz", () => {
  assert.equal(challengeBannerView({ ...pending, cooldown: 1790 }).note,
    "Server orqali keyingi urinish ~30 daqiqadan keyin, o'zi.");
  assert.equal(challengeBannerView({ ...pending, cooldown: 20 }).note,
    "Server orqali keyingi urinish ~1 daqiqadan keyin, o'zi.");
  for (const cooldown of [null, undefined, 0, -5]) {
    assert.equal(challengeBannerView({ ...pending, cooldown }).note, null);
  }
  // Uzun pauza soatda — «~360 daqiqa» emas.
  assert.equal(challengeBannerView({ ...pending, cooldown: 6 * 3600 }).note,
    "Server orqali keyingi urinish ~6 soatdan keyin, o'zi.");
});

test("approxDuration: 90 daqiqagacha daqiqada, keyin soatda", () => {
  assert.equal(approxDuration(5), "~1 daqiqa");
  assert.equal(approxDuration(3600), "~60 daqiqa");
  assert.equal(approxDuration(89 * 60), "~89 daqiqa");
  assert.equal(approxDuration(2 * 3600), "~2 soat");
  assert.equal(approxDuration(4 * 3600 - 200), "~4 soat");
});

const mine = { active: true, mine: true, shopId: 1, startedAt: 1 };

test("oyna: holat noma'lum — hech narsa ko'rsatilmaydi (tarmoq uzilishi sessiya tugashi emas)", () => {
  assert.deepEqual(vncSessionView(null), { kind: "ok" });
  assert.equal(canSaveSession(null), true);
});

test("oyna: sessiya yo'q yoki begona — «tugadi» (qora ekran o'rniga)", () => {
  assert.deepEqual(vncSessionView({ active: false, mine: false, shopId: null, startedAt: null }), { kind: "ended" });
  assert.deepEqual(vncSessionView({ ...mine, mine: false }), { kind: "ended" });
});

test("oyna: tekshiruv birinchi marta — ko'rsatma; qayta-qayta — sababi", () => {
  assert.deepEqual(vncSessionView({ ...mine, challenged: true, challengeCount: 1 }), { kind: "challenge" });
  assert.deepEqual(
    vncSessionView({ ...mine, challenged: true, challengeCount: CHALLENGE_LOOP_AFTER }),
    { kind: "loop", count: CHALLENGE_LOOP_AFTER, extension: false },
  );
  // Kengaytma yo'li yoqilgan do'kon — oyna o'sha yo'lni ko'rsatadi.
  assert.deepEqual(
    vncSessionView({ ...mine, challenged: true, challengeCount: 9, extensionEnabled: true }),
    { kind: "loop", count: 9, extension: true },
  );
});

test("oyna: tekshiruv o'tgan (kabinet ochilgan) — eslatmasiz, saqlash mumkin", () => {
  const status = { ...mine, challenged: false, challengeCount: 3 };
  assert.deepEqual(vncSessionView(status), { kind: "ok" });
  assert.equal(canSaveSession(status), true);
  // Eski backend (maydonlar yo'q) — avvalgidek.
  assert.deepEqual(vncSessionView(mine), { kind: "ok" });
  assert.equal(canSaveSession(mine), true);
});

test("«Kirdim, saqlash» tekshiruv turganda saqlamaydi", () => {
  assert.equal(canSaveSession({ ...mine, challenged: true, challengeCount: 1 }), false);
  // Begona sessiya holati bizga taalluqli emas.
  assert.equal(canSaveSession({ ...mine, mine: false, challenged: true }), true);
});
