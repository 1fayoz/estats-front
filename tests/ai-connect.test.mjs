// eStats AI ulash sahifasi: Lens (1.2.0+) va eski «eStats AI» kengaytmasini
// ajratish, ikkala kengaytma birga bo'lganda `ok:false` poygasi.
// Ishga tushirish: `npm test` (Node 22.18+).
import assert from "node:assert/strict";
import { test } from "node:test";

import { aiConnectedDecision, bothInstalled, EMPTY_HANDSHAKE, onAiReady } from "../src/lib/ai-connect.ts";

test("Lens ai:ready — versiya va ruxsat holati olinadi", () => {
  const s = onAiReady(EMPTY_HANDSHAKE, { type: "ai:ready", app: "estats-lens", version: "1.2.0" });
  assert.deepEqual(s, { lens: true, legacy: false, permitted: undefined, version: "1.2.0" });
  const s2 = onAiReady(s, { type: "ai:ready", app: "estats-lens", version: "1.2.0", permissions: false });
  assert.equal(s2.permitted, false);
  // Keyingi `ai:ready` ruxsatsiz kelsa — oldingi holat saqlanadi.
  assert.equal(onAiReady(s2, { type: "ai:ready", app: "estats-lens", version: "1.2.0" }).permitted, false);
});

test("eski kengaytma (app yo'q) — legacy; Lens versiyasi ustun", () => {
  const legacyFirst = onAiReady(EMPTY_HANDSHAKE, { type: "ai:ready", version: "1.0.2" });
  assert.deepEqual(legacyFirst, { lens: false, legacy: true, permitted: undefined, version: "1.0.2" });
  const both = onAiReady(legacyFirst, { type: "ai:ready", app: "estats-lens", version: "1.2.0", permissions: true });
  assert.equal(both.version, "1.2.0");
  assert.equal(bothInstalled(both), true);
  // Tartib teskari bo'lsa ham Lens versiyasi qoladi.
  const lensFirst = onAiReady(onAiReady(EMPTY_HANDSHAKE, { app: "estats-lens", version: "1.2.0" }), { version: "1.0.2" });
  assert.equal(lensFirst.version, "1.2.0");
  assert.equal(bothInstalled(lensFirst), true);
  assert.equal(bothInstalled(onAiReady(EMPTY_HANDSHAKE, { app: "estats-lens" })), false);
});

test("ai:connected — ok:false darhol xato emas, ok:true ustun, keyingilari e'tiborsiz", () => {
  assert.equal(aiConnectedDecision(false, false), "wait");
  assert.equal(aiConnectedDecision(false, true), "connected");
  assert.equal(aiConnectedDecision(true, false), "ignore");
  assert.equal(aiConnectedDecision(true, true), "ignore");
});
