import type { CategoryCommissionKey } from "@/types/domain";

export const UZUM_CATEGORY_COMMISSION: Record<CategoryCommissionKey, number> = {
  electronics: 14,
  fashion: 22,
  beauty: 20,
  home: 18,
  kids: 19,
  sports: 17,
  auto: 12,
  food: 10,
  books: 15,
  other: 18,
};

export const UZUM_PAYMENT_FEE = 2.5;
export const UZUM_FULFILLMENT_PER_ITEM = 4000;
export const UZUM_PICKUP_FEE_PERCENT = 1.2;
export const UZUM_RETURNS_RATE = 4.5;
export const UZUM_VAT_PERCENT = 12;

export interface CommissionInput {
  price: number;
  cost: number;
  category: CategoryCommissionKey;
  units: number;
  advertisingPercent?: number;
}

export interface CommissionBreakdown {
  gross: number;
  categoryCommissionPercent: number;
  categoryCommission: number;
  paymentFee: number;
  fulfillment: number;
  pickupFee: number;
  advertising: number;
  returns: number;
  vat: number;
  totalFees: number;
  totalCost: number;
  netRevenue: number;
  profit: number;
  marginPercent: number;
  roiPercent: number;
}

export function calculateCommission({
  price,
  cost,
  category,
  units,
  advertisingPercent = 0,
}: CommissionInput): CommissionBreakdown {
  const gross = price * units;
  const categoryCommissionPercent = UZUM_CATEGORY_COMMISSION[category];
  const categoryCommission = (gross * categoryCommissionPercent) / 100;
  const paymentFee = (gross * UZUM_PAYMENT_FEE) / 100;
  const pickupFee = (gross * UZUM_PICKUP_FEE_PERCENT) / 100;
  const fulfillment = UZUM_FULFILLMENT_PER_ITEM * units;
  const advertising = (gross * advertisingPercent) / 100;
  const returns = (gross * UZUM_RETURNS_RATE) / 100;
  const vat = (gross * UZUM_VAT_PERCENT) / 100;

  const totalFees =
    categoryCommission + paymentFee + pickupFee + fulfillment + advertising + returns + vat;

  const totalCost = cost * units;
  const netRevenue = gross - totalFees;
  const profit = netRevenue - totalCost;
  const marginPercent = gross > 0 ? (profit / gross) * 100 : 0;
  const roiPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return {
    gross,
    categoryCommissionPercent,
    categoryCommission,
    paymentFee,
    fulfillment,
    pickupFee,
    advertising,
    returns,
    vat,
    totalFees,
    totalCost,
    netRevenue,
    profit,
    marginPercent,
    roiPercent,
  };
}
