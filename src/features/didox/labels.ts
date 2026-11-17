/** Didox ma'lumotnomalari (backend `client.DOC_STATUS` va `router._DOCTYPE_NAMES` bilan bir xil). */

export const DOCTYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "002", label: "Hisob-faktura" },
  { value: "005", label: "Dalolatnoma (akt)" },
  { value: "008", label: "Hisob-faktura (farm)" },
  { value: "023", label: "Gibrid hisob-faktura" },
  { value: "041", label: "TTN" },
  { value: "006", label: "Ishonchnoma" },
  { value: "062", label: "Ishonchnoma (yangi)" },
  { value: "007", label: "Shartnoma (SQ)" },
  { value: "000", label: "Erkin hujjat" },
  { value: "010", label: "Ko'p tomonlama hujjat" },
  { value: "052", label: "Solishtirma dalolatnoma" },
  { value: "054", label: "Qabul-topshirish dalolatnomasi" },
];

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "2", label: "Sizning imzongizni kutmoqda" },
  { value: "1", label: "Hamkor imzosini kutmoqda" },
  { value: "3", label: "Imzolangan" },
  { value: "4", label: "Rad etilgan" },
  { value: "5", label: "Bekor qilingan" },
  { value: "0", label: "Qoralama" },
  { value: "40", label: "Yaroqsiz" },
];

/** Kiruvchi hujjat shu holatda bo'lsa sotuvchi qabul/rad qila oladi. */
export const AWAITING_ME = 2;

export function statusVariant(status?: number | null): "warning" | "success" | "destructive" | "secondary" | "info" {
  if (status === AWAITING_ME) return "warning";
  if (status === 3) return "success";
  if (status === 4 || status === 5 || status === 40 || status === 50) return "destructive";
  if (status === 1) return "info";
  return "secondary";
}

export function doctypeLabel(code?: string | null, fallback?: string | null): string {
  return fallback || DOCTYPE_OPTIONS.find((o) => o.value === code)?.label || (code ? `Hujjat ${code}` : "Hujjat");
}

/** «2026-10-31» → «31.10.2026». */
export function formatDocDate(raw?: string | null): string {
  if (!raw) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : raw;
}

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

/** «2026-10» → «2026 oktabr». */
export function formatPeriod(period: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  return m ? `${m[1]} ${MONTHS[Number(m[2]) - 1] ?? m[2]}` : period;
}
