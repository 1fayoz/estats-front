// Oynalar orasida do'kon/hisob/foydalanuvchi almashuvi aniqlanishi.
// Ishga tushirish: `npm run test:session` (Node 22.18+).
import assert from "node:assert/strict";
import { test } from "node:test";

import { parseSessionScope, sessionScopeChanged } from "../src/lib/session-scope.ts";

const persisted = (state) => JSON.stringify({ state, version: 0 });
const base = { accessToken: "jwt-a", workspaceId: 1, activeShopId: 10, user: { id: 1 } };

test("do'kon almashsa — doira o'zgardi", () => {
  assert.equal(sessionScopeChanged(persisted(base), persisted({ ...base, activeShopId: 11 })), true);
});

test("hisob yoki foydalanuvchi almashsa — doira o'zgardi", () => {
  assert.equal(sessionScopeChanged(persisted(base), persisted({ ...base, workspaceId: 2 })), true);
  assert.equal(sessionScopeChanged(persisted(base), persisted({ ...base, accessToken: "jwt-b" })), true);
});

test("chiqish yoki localStorage tozalanishi — doira o'zgardi", () => {
  assert.equal(sessionScopeChanged(persisted(base), null), true);
  assert.equal(sessionScopeChanged(persisted(base), persisted({ ...base, accessToken: null, activeShopId: null })), true);
});

test("faqat `user` yangilansa (boshqa oyna /auth/me) — o'zgarmadi", () => {
  assert.equal(sessionScopeChanged(persisted(base), persisted({ ...base, user: { id: 1, fullName: "x" } })), false);
});

test("buzuq JSON yiqitmaydi", () => {
  assert.deepEqual(parseSessionScope("{oops"), { accessToken: null, workspaceId: null, activeShopId: null });
});
