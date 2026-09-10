"use client";

import * as React from "react";
import {
  Calculator,
  CircleDollarSign,
  Info,
  Percent,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UZUM_CATEGORY_COMMISSION,
  UZUM_FULFILLMENT_PER_ITEM,
  UZUM_PAYMENT_FEE,
  UZUM_PICKUP_FEE_PERCENT,
  UZUM_RETURNS_RATE,
  UZUM_VAT_PERCENT,
  calculateCommission,
} from "@/lib/commission";
import { formatPercent, formatSum } from "@/lib/format";
import type { CategoryCommissionKey } from "@/types/domain";

import styles from "./calculator-tab.module.css";

const COMMISSION_TABLE: { key: CategoryCommissionKey; name: string; commission: number }[] = [
  { key: "electronics", name: "Elektronika", commission: UZUM_CATEGORY_COMMISSION.electronics },
  { key: "fashion", name: "Kiyim-kechak", commission: UZUM_CATEGORY_COMMISSION.fashion },
  { key: "beauty", name: "Go'zallik", commission: UZUM_CATEGORY_COMMISSION.beauty },
  { key: "home", name: "Uy va bog'", commission: UZUM_CATEGORY_COMMISSION.home },
  { key: "kids", name: "Bolalar tovarlari", commission: UZUM_CATEGORY_COMMISSION.kids },
  { key: "sports", name: "Sport", commission: UZUM_CATEGORY_COMMISSION.sports },
  { key: "auto", name: "Avto", commission: UZUM_CATEGORY_COMMISSION.auto },
  { key: "food", name: "Oziq-ovqat", commission: UZUM_CATEGORY_COMMISSION.food },
  { key: "books", name: "Kitoblar", commission: UZUM_CATEGORY_COMMISSION.books },
];

const MAX_CURRENCY = 1_000_000_000_000;
const MAX_UNITS = 1_000_000;

export function CalculatorTab() {
  const [price, setPrice] = React.useState(500_000);
  const [cost, setCost] = React.useState(220_000);
  const [units, setUnits] = React.useState(100);
  const [category, setCategory] = React.useState<CategoryCommissionKey>("fashion");
  const [advertisingPercent, setAdvertisingPercent] = React.useState(8);

  const breakdown = calculateCommission({
    price,
    cost,
    category,
    units,
    advertisingPercent,
  });
  const selectedCategory = COMMISSION_TABLE.find((item) => item.key === category);
  const profitTone =
    breakdown.profit > 0 ? "positive" : breakdown.profit < 0 ? "negative" : "neutral";
  const profitLabel = `${breakdown.profit > 0 ? "+" : ""}${formatSum(breakdown.profit)}`;

  const deductions = [
    {
      label: "Kategoriya komissiyasi",
      detail: `${selectedCategory?.name ?? "Kategoriya"} · ${breakdown.categoryCommissionPercent}%`,
      value: breakdown.categoryCommission,
    },
    {
      label: "To'lov tizimi",
      detail: `Yalpi tushumdan ${UZUM_PAYMENT_FEE}%`,
      value: breakdown.paymentFee,
    },
    {
      label: "Pickup xizmati",
      detail: `Yalpi tushumdan ${UZUM_PICKUP_FEE_PERCENT}%`,
      value: breakdown.pickupFee,
    },
    {
      label: "Fulfillment",
      detail: `${formatSum(UZUM_FULFILLMENT_PER_ITEM)} × ${units} dona`,
      value: breakdown.fulfillment,
    },
    {
      label: "Reklama",
      detail: `Yalpi tushumdan ${formatPercent(advertisingPercent)}`,
      value: breakdown.advertising,
    },
    {
      label: "Qaytarishlar zaxirasi",
      detail: `Taxminiy koeffitsiyent · ${UZUM_RETURNS_RATE}%`,
      value: breakdown.returns,
    },
    {
      label: "QQS",
      detail: `Yalpi tushumdan ${UZUM_VAT_PERCENT}%`,
      value: breakdown.vat,
    },
    {
      label: "Mahsulot tannarxi",
      detail: `${formatSum(cost)} × ${units} dona`,
      value: breakdown.totalCost,
    },
  ];

  return (
    <div className={styles.workspace}>
      <section className={styles.calculatorCard} aria-labelledby="profit-calculator-title">
        <header className={styles.calculatorHeader}>
          <div>
            <span className={styles.eyebrow}>
              <Calculator aria-hidden="true" />
              Taxminiy model
            </span>
            <h2 id="profit-calculator-title">Mahsulot foydasini oldindan hisoblang</h2>
            <p>
              Narx, tannarx va sotuv hajmini kiriting — barcha xarajatlar bitta tartibli
              hisobda ko&apos;rinadi.
            </p>
          </div>
          <span className={styles.estimateBadge}>Yakuniy hisobot emas</span>
        </header>

        <div className={styles.calculatorGrid}>
          <form
            className={styles.controls}
            aria-label="Foyda kalkulyatori parametrlari"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className={styles.panelHeading}>
              <span className={styles.panelIcon}>
                <ReceiptText aria-hidden="true" />
              </span>
              <div>
                <h3>Mahsulot parametrlari</h3>
                <p>Bir ssenariy uchun qiymatlarni belgilang.</p>
              </div>
            </div>

            <div className={styles.fields}>
              <Field
                id="finance-price"
                label="Sotuv narxi"
                suffix="so'm"
                value={price}
                onChange={setPrice}
                max={MAX_CURRENCY}
              />
              <Field
                id="finance-cost"
                label="Bir dona tannarxi"
                suffix="so'm"
                value={cost}
                onChange={setCost}
                max={MAX_CURRENCY}
              />
              <Field
                id="finance-units"
                label="Sotiladigan miqdor"
                suffix="dona"
                value={units}
                onChange={setUnits}
                step={1}
                min={1}
                max={MAX_UNITS}
                integer
              />
              <Field
                id="finance-advertising"
                label="Reklama ulushi"
                suffix="%"
                value={advertisingPercent}
                onChange={setAdvertisingPercent}
                step={0.5}
                max={100}
              />
            </div>

            <div className={styles.selectField}>
              <Label htmlFor="finance-category">Mahsulot kategoriyasi</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as CategoryCommissionKey)}
              >
                <SelectTrigger id="finance-category" className={styles.selectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMISSION_TABLE.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.name} — {item.commission}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.inputHint}>
              <Info aria-hidden="true" />
              <p>
                Reklama foizini o&apos;zgartirib, foyda qaysi nuqtada kamayishini tez solishtiring.
              </p>
            </div>
          </form>

          <aside className={styles.result} data-tone={profitTone} aria-labelledby="estimate-title">
            <div className={styles.resultTop}>
              <div>
                <h3 id="estimate-title" className={styles.resultLabel}>
                  Taxminiy sof foyda
                </h3>
                <output
                  className={styles.profit}
                  aria-labelledby="estimate-title"
                  aria-live="polite"
                >
                  {profitLabel}
                </output>
              </div>
              <span className={styles.profitState}>
                {profitTone === "positive" ? (
                  <TrendingUp aria-hidden="true" />
                ) : profitTone === "negative" ? (
                  <TrendingDown aria-hidden="true" />
                ) : (
                  <CircleDollarSign aria-hidden="true" />
                )}
                {profitTone === "positive"
                  ? "Foydali"
                  : profitTone === "negative"
                    ? "Zarar"
                    : "Nol nuqta"}
              </span>
            </div>

            <dl className={styles.resultMetrics}>
              <div>
                <dt>Marja</dt>
                <dd>{formatPercent(breakdown.marginPercent)}</dd>
              </div>
              <div>
                <dt>ROI</dt>
                <dd>{formatPercent(breakdown.roiPercent)}</dd>
              </div>
              <div>
                <dt>Sof tushum</dt>
                <dd>{formatSum(breakdown.netRevenue)}</dd>
              </div>
            </dl>

            <div className={styles.flow}>
              <div>
                <span>Yalpi tushum</span>
                <strong>{formatSum(breakdown.gross)}</strong>
              </div>
              <div>
                <span>Jami xizmat va soliqlar</span>
                <strong>−{formatSum(breakdown.totalFees)}</strong>
              </div>
              <div>
                <span>Jami tannarx</span>
                <strong>−{formatSum(breakdown.totalCost)}</strong>
              </div>
            </div>

            <details className={styles.breakdown} open>
              <summary>
                <span>
                  <CircleDollarSign aria-hidden="true" />
                  Hisob taxminlari
                </span>
                <small>{deductions.length} ta xarajat</small>
              </summary>
              <dl className={styles.deductions}>
                {deductions.map((item) => (
                  <div key={item.label}>
                    <dt>
                      <span>{item.label}</span>
                      <small>{item.detail}</small>
                    </dt>
                    <dd>−{formatSum(item.value)}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <p className={styles.disclaimer}>
              Natija kiritilgan qiymatlar va ko&apos;rsatilgan stavkalarga asoslangan prognoz. Haqiqiy
              to&apos;lovlar shartnoma va operatsion holatga qarab farq qilishi mumkin.
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.tariffs} aria-labelledby="commission-title">
        <header className={styles.tariffHeader}>
          <div>
            <span className={styles.eyebrow}>
              <Percent aria-hidden="true" />
              Kategoriya stavkalari
            </span>
            <h2 id="commission-title">Uzum komissiya tariflari</h2>
            <p>Sotuv summasidan olinadigan kategoriya komissiyasini tez solishtiring.</p>
          </div>
          <div className={styles.activeCategory}>
            <span>Tanlangan</span>
            <strong>{selectedCategory?.name}</strong>
            <small>{selectedCategory?.commission}% komissiya</small>
          </div>
        </header>

        <div className={styles.desktopTable}>
          <table>
            <thead>
              <tr>
                <th scope="col">Kategoriya</th>
                <th scope="col">Komissiya</th>
                <th scope="col">100 000 dan</th>
                <th scope="col">500 000 dan</th>
                <th scope="col">1 000 000 dan</th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_TABLE.map((item) => (
                <tr key={item.key} data-selected={item.key === category}>
                  <th scope="row">{item.name}</th>
                  <td>
                    <span className={styles.rate}>{item.commission}%</span>
                  </td>
                  <td>{formatSum((100_000 * item.commission) / 100)}</td>
                  <td>{formatSum((500_000 * item.commission) / 100)}</td>
                  <td>{formatSum((1_000_000 * item.commission) / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={styles.mobileTariffs}>
          {COMMISSION_TABLE.map((item) => (
            <li key={item.key} data-selected={item.key === category}>
              <div>
                <strong>{item.name}</strong>
                <span>100 000 so&apos;mdan {formatSum((100_000 * item.commission) / 100)}</span>
              </div>
              <span className={styles.rate}>{item.commission}%</span>
            </li>
          ))}
        </ul>

        <footer className={styles.tariffNote}>
          <Info aria-hidden="true" />
          <p>
            Komissiyadan tashqari hisobda to&apos;lov tizimi {UZUM_PAYMENT_FEE}%, pickup{" "}
            {UZUM_PICKUP_FEE_PERCENT}%, qaytarishlar {UZUM_RETURNS_RATE}%, QQS{" "}
            {UZUM_VAT_PERCENT}% va har dona uchun {formatSum(UZUM_FULFILLMENT_PER_ITEM)}{" "}
            fulfillment xarajati alohida qo&apos;llanadi.
          </p>
        </footer>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  suffix,
  value,
  onChange,
  step = 1000,
  min = 0,
  max,
  integer = false,
}: {
  id: string;
  label: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max: number;
  integer?: boolean;
}) {
  const updateValue = (nextValue: number) => {
    const finiteValue = Number.isFinite(nextValue) ? nextValue : min;
    const clampedValue = Math.min(max, Math.max(min, finiteValue));
    onChange(integer ? Math.trunc(clampedValue) : clampedValue);
  };

  return (
    <div className={styles.field}>
      <Label htmlFor={id}>{label}</Label>
      <div className={styles.inputWrap}>
        <Input
          id={id}
          type="number"
          inputMode={integer ? "numeric" : "decimal"}
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(event) => updateValue(event.currentTarget.valueAsNumber)}
          onBlur={(event) => updateValue(event.currentTarget.valueAsNumber)}
        />
        <span aria-hidden="true">{suffix}</span>
      </div>
    </div>
  );
}
