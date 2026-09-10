"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calculator,
  ChevronDown,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNumber, formatPercent, formatSum } from "@/lib/format";
import type { ProductPnl } from "@/lib/types";

import styles from "./pnl.module.css";
import { ProfitBadge } from "./summary-cards";

type SortKey = "profit" | "revenue" | "soldQuantity" | "cogs" | "margin" | "onHand";
type Segment = "all" | "profit" | "loss" | "uncosted" | "idle";

const COLUMNS: { key: SortKey; label: string; hint?: string }[] = [
  { key: "soldQuantity", label: "Sotildi" },
  { key: "revenue", label: "Uzum to‘lovi", hint: "Komissiya va logistika ayirilgan" },
  { key: "cogs", label: "Tan narx", hint: "FIFO bo‘yicha" },
  { key: "profit", label: "Foyda / zarar" },
  { key: "margin", label: "Marja" },
  { key: "onHand", label: "Qoldiq" },
];

interface PnlTableProps {
  rows: ProductPnl[];
  allProducts: boolean;
  onAllProductsChange: (value: boolean) => void;
}

export function PnlTable({ rows, allProducts, onAllProductsChange }: PnlTableProps) {
  const [query, setQuery] = React.useState("");
  const [segment, setSegment] = React.useState<Segment>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("profit");
  const [ascending, setAscending] = React.useState(false);

  const counts = React.useMemo(
    () => ({
      all: rows.length,
      profit: rows.filter((row) => row.profit > 0).length,
      loss: rows.filter((row) => row.profit < 0).length,
      uncosted: rows.filter((row) => !row.isCosted || row.uncoveredQuantity > 0).length,
      idle: rows.filter((row) => row.soldQuantity <= 0).length,
    }),
    [rows]
  );

  const visibleRows = React.useMemo(() => {
    const needle = query.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (segment === "profit" && row.profit <= 0) return false;
        if (segment === "loss" && row.profit >= 0) return false;
        if (segment === "uncosted" && row.isCosted && row.uncoveredQuantity <= 0) return false;
        if (segment === "idle" && row.soldQuantity > 0) return false;

        if (!needle) return true;
        return [row.title, row.skuCode, row.barcode, row.categoryName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((first, second) =>
        ascending
          ? first[sortKey] - second[sortKey]
          : second[sortKey] - first[sortKey]
      );
  }, [ascending, query, rows, segment, sortKey]);

  const segmentOptions: { key: Segment; label: string; count: number }[] = [
    { key: "all", label: "Barchasi", count: counts.all },
    { key: "profit", label: "Foydada", count: counts.profit },
    { key: "loss", label: "Zararda", count: counts.loss },
    { key: "uncosted", label: "Tan narxsiz", count: counts.uncosted },
    { key: "idle", label: "Harakatsiz", count: counts.idle },
  ];

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setAscending((value) => !value);
      return;
    }
    setSortKey(key);
    setAscending(false);
  };

  const resetFilters = () => {
    setQuery("");
    setSegment("all");
  };

  return (
    <section className={styles.tablePanel} aria-labelledby="products-pnl-title">
      <header className={styles.tableHeader}>
        <div className={styles.tableTitle}>
          <span><SlidersHorizontal aria-hidden="true" /></span>
          <div>
            <span className={styles.sectionKicker}>Mahsulotlar kesimi</span>
            <h2 id="products-pnl-title">Qaysi tovar pul ishlayapti?</h2>
            <p>Foydani mahsulot, marja va tan narx bo‘yicha tahlil qiling.</p>
          </div>
        </div>
        <span className={styles.resultCount}>{visibleRows.length} ta natija</span>
      </header>

      <div className={styles.tableToolbar}>
        <label className={styles.searchField}>
          <Search aria-hidden="true" />
          <span className={styles.srOnly}>Mahsulot qidirish</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nomi, SKU, shtrix-kod yoki kategoriya…"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Qidiruvni tozalash">
              <X aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <div className={styles.segmentBar} aria-label="Mahsulotlarni filtrlash">
          {segmentOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={segment === option.key}
              onClick={() => setSegment(option.key)}
            >
              {option.label} <span>{option.count}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={allProducts}
          className={styles.productToggle}
          onClick={() => onAllProductsChange(!allProducts)}
        >
          <span className={styles.switchTrack} data-checked={allProducts} aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>Harakatsizlar</strong>
            <small>Sotilmagan tovarlar ham</small>
          </span>
        </button>
      </div>

      <div className={styles.mobileSort}>
        <label>
          <span>Saralash</span>
          <span className={styles.selectWrap}>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              aria-label="Mahsulotlarni saralash"
            >
              {COLUMNS.map((column) => (
                <option key={column.key} value={column.key}>{column.label}</option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" />
          </span>
        </label>
        <button
          type="button"
          onClick={() => setAscending((value) => !value)}
          aria-label={ascending ? "Kamayish tartibida saralash" : "O‘sish tartibida saralash"}
          title={ascending ? "O‘sish tartibida" : "Kamayish tartibida"}
        >
          {ascending ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
        </button>
      </div>

      {visibleRows.length ? (
        <>
          <div className={styles.mobileCards}>
            {visibleRows.map((row, index) => (
              <ProductCard key={rowKey(row, index)} row={row} />
            ))}
          </div>

          <div className={styles.desktopTable}>
            <table>
              <thead>
                <tr>
                  <th>Mahsulot</th>
                  <th className={styles.numeric}>Kirim</th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className={styles.numeric}
                      aria-sort={
                        sortKey === column.key
                          ? ascending ? "ascending" : "descending"
                          : undefined
                      }
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        title={column.hint}
                        data-active={sortKey === column.key}
                      >
                        {column.label}
                        {sortKey === column.key ? (
                          ascending ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />
                        ) : (
                          <ArrowUpDown aria-hidden="true" />
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr
                    key={rowKey(row, index)}
                    data-loss={row.profit < 0}
                    data-uncosted={!row.isCosted || row.uncoveredQuantity > 0}
                  >
                    <td>
                      <ProductIdentity row={row} />
                    </td>
                    <td className={styles.numeric}>
                      {row.intakeQuantity ? (
                        <>
                          <strong>{formatNumber(row.intakeQuantity)} dona</strong>
                          <small>{formatSum(row.intakeCost)}</small>
                        </>
                      ) : (
                        <span className={styles.mutedValue}>—</span>
                      )}
                    </td>
                    <td className={styles.numeric}>
                      <strong>{formatNumber(row.soldQuantity)} dona</strong>
                      {row.returnedQuantity > 0 ? (
                        <small className={styles.warningText}>
                          {formatNumber(row.returnedQuantity)} qaytdi · {formatSum(row.returnedAmount)}
                        </small>
                      ) : null}
                    </td>
                    <td className={styles.numeric}>
                      <strong>{formatSum(row.revenue)}</strong>
                      <small>Savdo {formatSum(row.gross)}</small>
                    </td>
                    <td className={styles.numeric}>
                      {row.cogs > 0 ? (
                        <strong>{formatSum(row.cogs)}</strong>
                      ) : (
                        <span className={styles.uncostedBadge}>Kiritilmagan</span>
                      )}
                    </td>
                    <td className={styles.numeric}><ProfitBadge value={row.profit} /></td>
                    <td className={styles.numeric} data-negative={row.margin < 0}>
                      <strong>{row.soldQuantity ? formatPercent(row.margin) : "—"}</strong>
                    </td>
                    <td className={styles.numeric}>
                      <strong>{formatNumber(row.onHand)} dona</strong>
                      {row.stockValue > 0 ? <small>{formatSum(row.stockValue)}</small> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className={styles.tableEmpty}>
          <span>{rows.length ? <Search aria-hidden="true" /> : <Calculator aria-hidden="true" />}</span>
          <h3>{rows.length ? "Mos mahsulot topilmadi" : "Bu davrda harakat yo‘q"}</h3>
          <p>
            {rows.length
              ? "Qidiruv so‘zini yoki tanlangan filtrni o‘zgartirib ko‘ring."
              : "Boshqa davrni tanlang yoki harakatsiz mahsulotlarni ham ko‘rsating."}
          </p>
          {rows.length ? (
            <Button type="button" variant="outline" onClick={resetFilters}>
              Filtrlarni tozalash
            </Button>
          ) : !allProducts ? (
            <Button type="button" variant="outline" onClick={() => onAllProductsChange(true)}>
              Barcha mahsulotlarni ko‘rsatish
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function ProductCard({ row }: { row: ProductPnl }) {
  return (
    <article
      className={styles.productCard}
      data-loss={row.profit < 0}
      data-uncosted={!row.isCosted || row.uncoveredQuantity > 0}
    >
      <div className={styles.productCardHead}>
        <ProductIdentity row={row} />
        <ProfitBadge value={row.profit} />
      </div>

      {!row.isCosted || row.uncoveredQuantity > 0 ? (
        <div className={styles.cardWarning}>
          <AlertTriangle aria-hidden="true" />
          {formatNumber(row.uncoveredQuantity)} dona sotuv uchun tan narx yetishmaydi
        </div>
      ) : null}

      <dl className={styles.productStats}>
        <div>
          <dt>Sotildi</dt>
          <dd>{formatNumber(row.soldQuantity)} dona</dd>
          {row.returnedQuantity > 0 ? <small>{formatNumber(row.returnedQuantity)} qaytdi</small> : null}
        </div>
        <div>
          <dt>Marja</dt>
          <dd data-negative={row.margin < 0}>{row.soldQuantity ? formatPercent(row.margin) : "—"}</dd>
        </div>
        <div>
          <dt>Uzum to‘lovi</dt>
          <dd>{formatSum(row.revenue)}</dd>
          <small>Savdo {formatSum(row.gross)}</small>
        </div>
        <div>
          <dt>Tan narx</dt>
          <dd>{row.cogs > 0 ? formatSum(row.cogs) : "Kiritilmagan"}</dd>
          <small>FIFO bo‘yicha</small>
        </div>
      </dl>

      <div className={styles.productCardFoot}>
        <span><Package aria-hidden="true" /> Qoldiq</span>
        <strong>{formatNumber(row.onHand)} dona</strong>
        {row.stockValue > 0 ? <small>{formatSum(row.stockValue)}</small> : null}
      </div>
    </article>
  );
}

function ProductIdentity({ row }: { row: ProductPnl }) {
  return (
    <div className={styles.productIdentity}>
      {row.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.image} alt="" loading="lazy" />
      ) : (
        <span className={styles.productPlaceholder}><Package aria-hidden="true" /></span>
      )}
      <span className={styles.productCopy}>
        <strong title={row.title}>{row.title}</strong>
        <small>
          {row.skuCode ?? row.barcode ?? "SKU kiritilmagan"}
          {row.categoryName ? <i>·</i> : null}
          {row.categoryName ? <span>{row.categoryName}</span> : null}
        </small>
        {!row.isCosted || row.uncoveredQuantity > 0 ? (
          <em>
            <AlertTriangle aria-hidden="true" /> {formatNumber(row.uncoveredQuantity)} dona tan narxsiz
          </em>
        ) : null}
      </span>
    </div>
  );
}

function rowKey(row: ProductPnl, index: number) {
  return String(row.warehouseProductId ?? row.skuCode ?? `${row.title}-${index}`);
}
