/*
 * Raqamlarni o'zbekcha ko'rinishga keltirish.
 *
 * ⚠️ `Intl` NING LOKAL MA'LUMOTIGA TAYANMAYMIZ.
 *
 * O'lchangan: Node'da `Intl.NumberFormat("uz-UZ")` to'g'ri ishlaydi
 * ("1 234 567", "57,3%"), CHROME'da esa xuddi shu chaqiruv
 * INGLIZCHA natija beradi — "1,234,567", "57.3%", "12.6G" —
 * garchi `resolvedOptions().locale` "uz-UZ" deb tursa ham.
 *
 * Ya'ni server tomonda to'g'ri, brauzerda noto'g'ri: ishlab
 * chiqishda ko'rinmaydi, foydalanuvchi esa har sahifada
 * chalkashtiruvchi raqam ko'radi ("5,125 dona" — bu besh yarim
 * mingmi yoki besh butun bir yuz yigirma beshmi?).
 *
 * Shuning uchun ajratgichlar QO'LDA qo'yiladi:
 *   minglik — bo'sh joy, o'nlik — vergul.
 */

/** Butun qismga minglik ajratgich (bo'sh joy) qo'yadi. */
function group(text: string): string {
  return text.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

/** Sonni o'zbekcha yozuvda matnga aylantiradi. */
function uz(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "\u2014";
  const fixed = Math.abs(value).toFixed(digits);
  const [whole, frac] = fixed.split(".");
  const sign = value < 0 ? "-" : "";
  const body = frac && Number(frac) !== 0 ? `${group(whole)},${frac}` : group(whole);
  return sign + body;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
});

export function formatSum(value: number): string {
  return `${uz(Math.round(value))} so'm`;
}

export function formatSumShort(value: number): string {
  return `${formatCompact(value)} so'm`;
}

export function formatNumber(value: number): string {
  // Kasr qismi bor bo'lsa bitta xona qoldiriladi: "48,3" — kunlik
  // sotuvda bu ma'noli, "48" esa yaxlitlangan yolg'on.
  return uz(value, Number.isInteger(value) ? 0 : 1);
}

/**
 * Qisqartma — "12,6 mlrd", "533,3 mln", "67,4 ming".
 *
 * `Intl` ning `notation: "compact"` i ISHLATILMAYDI: `uz-UZ` uchun
 * CLDR da qisqartma naqshi yo'q va Node ildiz naqshiga tushib
 * **"12.6G"** deb yozadi. Hisobotda "12,6G so'm" degan qator
 * paydo bo'ladi va uni hech kim o'qiy olmaydi — jadval sarlavhasida
 * ham, grafik o'qida ham.
 *
 * O'nlik ajratgich — VERGUL (o'zbek/rus yozuvi), minglik ajratgich
 * esa bo'sh joy.
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const cut = (divider: number, suffix: string) => {
    const scaled = value / divider;
    // Bir xonali kasr — ikkitasi qisqartmaning ma'nosini yo'qotadi.
    return `${uz(scaled, Math.abs(scaled) < 100 ? 1 : 0)} ${suffix}`;
  };
  if (abs >= 1e9) return cut(1e9, "mlrd");
  if (abs >= 1e6) return cut(1e6, "mln");
  if (abs >= 1e4) return cut(1e3, "ming");
  return uz(Math.round(value));
}

export function formatPercent(value: number, fromRatio = false): string {
  return `${uz(fromRatio ? value * 100 : value, 1)}%`;
}

export function formatDate(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  return DATE_FORMATTER.format(date);
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${uz(value, 1)}%`;
}
