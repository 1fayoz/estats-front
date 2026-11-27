// Kabinet vazifalari — eStats Lens holati banneri (sof qism).
// Ishga tushirish: `npm test` (Node 22.18+).
//
// 2026-11-24: serverdagi brauzer o'chirildi — voronka, Bust, reklama,
// moderatsiya sababi va kartochka nusxasi faqat sotuvchi brauzerida.
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DISMISS_MS, EXTENSION_HREF, SELLER_CABINET_URL, dismissKey, extensionBannerView, extensionIssue, isDismissed,
} from "../src/lib/cabinet-extension.ts";

const base = {
  serverBrowser: false, minVersion: "1.4.0", paired: true, online: true, loggedIn: true, outdated: false,
  version: "1.4.0", lastSeenAt: "2026-11-24T15:00:00Z",
};

test("hammasi joyida — banner yo'q", () => {
  assert.equal(extensionIssue(base), null);
});

test("holat noma'lum yoki server brauzeri yoqilgan — banner yo'q", () => {
  assert.equal(extensionIssue(null), null);
  assert.equal(extensionIssue({ ...base, paired: false, serverBrowser: true }), null);
});

test("holatlar tartibi: ulanmagan → oflayn → kirilmagan → eski versiya", () => {
  assert.equal(extensionIssue({ ...base, paired: false, online: false, loggedIn: false }), "unpaired");
  assert.equal(extensionIssue({ ...base, online: false, loggedIn: false, outdated: true }), "offline");
  assert.equal(extensionIssue({ ...base, loggedIn: false, outdated: true }), "logged_out");
  assert.equal(extensionIssue({ ...base, outdated: true }), "outdated");
});

test("ulanmagan va oflayn — kengaytma sozlamasiga olib boradi, nima ishlamasligini aytadi", () => {
  for (const issue of ["unpaired", "offline"]) {
    const view = extensionBannerView(issue);
    assert.deepEqual(view.action, { href: EXTENSION_HREF, label: "Kengaytmani ulash" });
    assert.ok(view.text.includes("Voronka"), view.text);
    assert.ok(!/Oyna|VNC|Verify you are human/i.test(view.text), view.text);
  }
  assert.ok(extensionBannerView("offline").text.includes("oflayn"));
});

test("kirilmagan — seller.uzum.uz tashqi havolasi", () => {
  const view = extensionBannerView("logged_out");
  assert.deepEqual(view.action, { href: SELLER_CABINET_URL, label: "seller.uzum.uz ni ochish", external: true });
});

test("eski versiya — kerakli versiya aytiladi", () => {
  assert.ok(extensionBannerView("outdated", "1.4.0").text.includes("kamida 1.4.0"));
  assert.ok(!extensionBannerView("outdated").text.includes("kamida"));
});

test("yopish: do'kon va holat bo'yicha, 24 soat", () => {
  assert.equal(dismissKey(7, "offline"), "estats-ext-banner:7:offline");
  assert.notEqual(dismissKey(7, "offline"), dismissKey(7, "logged_out"));
  assert.notEqual(dismissKey(7, "offline"), dismissKey(8, "offline"));
  const now = 1_800_000_000_000;
  assert.equal(isDismissed(String(now - 1000), now), true);
  assert.equal(isDismissed(String(now - DISMISS_MS - 1), now), false);
  for (const bad of [null, undefined, "", "abc", "0", "-5"]) assert.equal(isDismissed(bad, now), false);
});
