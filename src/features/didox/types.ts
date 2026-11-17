/**
 * Didox API turlari — backend `src/api/didox/schemas.py` bilan 1:1
 * (camelCase). Sirlar (parol, token) bu yerda YO'Q: backend ularni
 * hech qachon qaytarmaydi, faqat `passwordSaved: boolean`.
 */

export type DidoxDirection = "incoming" | "outgoing";
export type DidoxSignAction = "accept" | "reject" | "send" | "cancel";

export interface DidoxConnection {
  connected: boolean;
  partnerConfigured: boolean;
  environment: "test" | "prod" | string;
  authMode?: "password" | "signature" | null;
  /** 9 xonali STIR ochiq, 14 xonali JShShIR o'rtasi yashirilgan. */
  taxId?: string | null;
  companyTin?: string | null;
  companyName?: string | null;
  branchNum?: string | null;
  passwordSaved: boolean;
  tokenValid: boolean;
  tokenExpiresAt?: string | null;
  needsSignature: boolean;
  connectedAt?: string | null;
  lastCheckedAt?: string | null;
  lastError?: string | null;
  lastErrorMessage?: string | null;
}

export interface DidoxConnectInput {
  authMode: "password" | "signature";
  taxId: string;
  companyTin?: string;
  branchNum?: string;
  password?: string;
  pkcs7?: string;
  signatureHex?: string;
}

export interface DidoxDocument {
  id: string;
  number?: string | null;
  docDate?: string | null;
  doctype?: string | null;
  doctypeName?: string | null;
  status?: number | null;
  statusName?: string | null;
  direction: DidoxDirection;
  partnerTin?: string | null;
  partnerName?: string | null;
  totalSum: number;
  vatSum: number;
  contractNumber?: string | null;
  contractDate?: string | null;
  updatedAt?: string | null;
  isUzum: boolean;
}

export interface DidoxDocumentList {
  items: DidoxDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface DidoxDocumentDetail {
  document: DidoxDocument;
  meta: Record<string, unknown>;
  content?: unknown;
  relatedDocuments: unknown[];
}

export interface DidoxDocumentFilters {
  direction: DidoxDirection;
  page?: number;
  limit?: number;
  /** Vergul bilan: "2" yoki "1,2". */
  status?: string;
  /** Vergul bilan: "002,005". */
  doctype?: string;
  /** Kontragent STIRi (9) yoki JShShIRi (14). */
  partner?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DidoxPrepareResult {
  action: DidoxSignAction;
  dataToSignB64: string;
  data?: unknown;
  minEimzoVersion?: string | null;
}

export interface DidoxSignResult {
  ok: boolean;
  warning?: string | null;
}

export interface DidoxUzumMonth {
  period: string;
  invoices: DidoxDocument[];
  acts: DidoxDocument[];
  invoiceTotal: number;
  actTotal: number;
  pendingSignature: number;
}

export interface DidoxUzumMonthly {
  uzumTin: string;
  months: DidoxUzumMonth[];
}

export interface DidoxReconcile {
  period: string;
  didoxTotal: number;
  commission: number;
  logistics: number;
  expenses: number;
  candidates: Record<string, number>;
  closest?: string | null;
  difference?: number | null;
  differencePct: number;
  matches: boolean;
  isEstimate: boolean;
}
