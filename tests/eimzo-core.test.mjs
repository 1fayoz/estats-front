// E-IMZO sof qismi: xabarlar, versiya, STIR tekshiruvi.
// Ishga tushirish: `npm run test:eimzo` = `node --test tests/eimzo-core.test.mjs` (Node 22.18+ — TS turlarini o'zi olib tashlaydi).
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildMessage, certificateMatches, compareVersions, eimzoSocketUrl, isBase64, isCancelReason,
  isExpired, isWrongPassword, messages, parseAlias, parseApiKeys, parseVersion, toCertificate, versionStatus,
} from "../src/features/didox/eimzo-core.ts";

const ALIAS =
  "cn=aliyev ali valiyevich,name=ali,surname=aliyev,l=toshkent,c=uz,o=ooo test savdo," +
  "uid=512345678,1.2.860.3.16.1.1=309999999,1.2.860.3.16.1.2=31234567890123," +
  "serialnumber=7a1b2c3d,validfrom=2025.01.15 10:00:00,validto=2027.01.15 23:59:59";
const REF = { disk: "C:", path: "DSKEYS", name: "DS3099999990001", alias: ALIAS };

test("xabarlar E-IMZO shaklida", () => {
  assert.deepEqual(messages.version(), { name: "version" });
  assert.deepEqual(messages.listCertificates(), { plugin: "pfx", name: "list_all_certificates" });
  assert.deepEqual(messages.loadKey(REF), { plugin: "pfx", name: "load_key", arguments: ["C:", "DSKEYS", "DS3099999990001", ALIAS] });
  assert.deepEqual(messages.createPkcs7("MzA5OTk5OTk5", "key-1"), { plugin: "pkcs7", name: "create_pkcs7", arguments: ["MzA5OTk5OTk5", "key-1", "no"] });
  assert.deepEqual(messages.unloadKey("key-1"), { plugin: "pfx", name: "unload_key", arguments: ["key-1"] });
  assert.deepEqual(messages.apikey([["estats.uz", "K1"], ["localhost", "K2"]]), { plugin: "apikey", name: "apikey", arguments: ["estats.uz", "K1", "localhost", "K2"] });
  assert.deepEqual(buildMessage("x", undefined, []), { name: "x" });
});

test("socket manzili sahifa protokoliga qarab", () => {
  assert.equal(eimzoSocketUrl("https:"), "wss://127.0.0.1:64443/service/cryptapi");
  assert.equal(eimzoSocketUrl("http:"), "ws://127.0.0.1:64646/service/cryptapi");
});

test("domen kalitlari env'dan", () => {
  assert.deepEqual(parseApiKeys("estats.uz:AAA; www.estats.uz:BBB"), [["estats.uz", "AAA"], ["www.estats.uz", "BBB"]]);
  assert.deepEqual(parseApiKeys(""), []);
  assert.deepEqual(parseApiKeys("buzuq;:x;y:"), []);
});

test("versiya o'qish va solishtirish", () => {
  assert.deepEqual(parseVersion({ major: "6", minor: "3", build: "5", success: true }), [6, 3, 5]);
  assert.deepEqual(parseVersion({ version: "6.4" }), [6, 4]);
  assert.deepEqual(parseVersion({ major: "4", minor: "86" }), [4, 86]);
  assert.equal(parseVersion({ success: true }), null);
  assert.equal(compareVersions([6, 3, 5], [6, 3, 5]), 0);
  assert.equal(compareVersions([6, 3], [6, 3, 5]), -1);
  assert.equal(compareVersions([6, 10], [6, 3, 5]), 1);

  assert.equal(versionStatus([6, 3, 5], "6.3.5"), "ok");
  assert.equal(versionStatus([6, 4], "6.3.5"), "ok");
  assert.equal(versionStatus([7], "6.3.5"), "ok");
  assert.equal(versionStatus([6, 3, 4], "6.3.5"), "old");
  assert.equal(versionStatus([4, 86], "6.3.5"), "old");
  assert.equal(versionStatus([6, 3], "6.3.5"), "unknown"); // 6.3 ≥ 6.3.5 mi — aytib bo'lmaydi
  assert.equal(versionStatus(null, "6.3.5"), "unknown");
  assert.equal(versionStatus(null, null), "ok");
});

test("sertifikat alias'idan STIR, JShShIR va muddat", () => {
  const x = parseAlias(ALIAS);
  assert.equal(x["1.2.860.3.16.1.1"], "309999999");
  const cert = toCertificate(REF);
  assert.equal(cert.orgTin, "309999999");
  assert.equal(cert.uid, "512345678");
  assert.equal(cert.pinfl, "31234567890123");
  assert.equal(cert.organization, "ooo test savdo");
  assert.equal(cert.validTo?.getFullYear(), 2027);
  assert.equal(isExpired(cert, new Date("2026-11-17")), false);
  assert.equal(isExpired(cert, new Date("2027-02-01")), true);
});

test("STIR tekshiruvi", () => {
  const cert = toCertificate(REF);
  assert.equal(certificateMatches(cert, ["309999999"]), true); // kompaniya
  assert.equal(certificateMatches(cert, ["512345678"]), true); // shaxs STIRi
  assert.equal(certificateMatches(cert, ["31234567890123"]), true); // JShShIR
  assert.equal(certificateMatches(cert, ["123456789"]), false); // boshqa kompaniya
  assert.equal(certificateMatches(cert, ["123********234", null, ""]), true); // yashirilgan — tekshirib bo'lmaydi
  assert.equal(certificateMatches(cert, ["123456789", "309999999"]), true);
});

test("bekor qilish va parol xatosi matnlari", () => {
  assert.equal(isCancelReason("Отменено пользователем"), true);
  assert.equal(isCancelReason("User canceled"), true);
  assert.equal(isCancelReason("Ключ не найден"), false);
  assert.equal(isWrongPassword("Неверный пароль"), true);
  assert.equal(isWrongPassword("Incorrect password"), true);
  assert.equal(isBase64("MzA5OTk5OTk5"), true);
  assert.equal(isBase64("not base64!"), false);
});
