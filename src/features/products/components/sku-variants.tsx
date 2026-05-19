"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatmapCell } from "@/components/dashboard/heatmap-cell";
import { formatDate, formatNumber, formatSum, formatSumShort } from "@/lib/format";
import type { Product } from "@/types/domain";

const VARIANT_NAMES = [
  "iPhone 11 Pro Max",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 13 mini",
  "iPhone 15",
  "iPhone 12 / 12 Pro",
  "iPhone X / XS",
  "iPhone 7 / 8 / SE 2020",
  "iPhone 11",
  "iPhone 15 Plus",
];

const COLORS = [
  "oklch(0.65 0.22 25)",
  "oklch(0.62 0.22 285)",
  "oklch(0.68 0.18 200)",
  "oklch(0.7 0.2 145)",
  "oklch(0.78 0.18 75)",
  "oklch(0.7 0.2 320)",
  "oklch(0.68 0.18 240)",
  "oklch(0.72 0.16 110)",
];

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function SkuVariants({ product }: { product: Product }) {
  const seed = hashSeed(product.id);
  const r = rand(seed);
  const variants = VARIANT_NAMES.slice(0, 8).map((name, i) => {
    const minPrice = Math.round(product.price * (0.6 + r() * 0.4));
    const maxPrice = Math.round(product.price * (1.0 + r() * 0.5));
    const sales = Math.round(15 + r() * 95);
    const revenue = sales * ((minPrice + maxPrice) / 2);
    return {
      id: `${product.id}-v${i + 1}`,
      sku: String(379_000 + Math.floor(r() * 200_000)),
      name,
      minPrice,
      maxPrice,
      sales,
      revenue,
      color: COLORS[i % COLORS.length],
    };
  });

  const totalSales = variants.reduce((a, v) => a + v.sales, 0);
  const totalRevenue = variants.reduce((a, v) => a + v.revenue, 0);
  const maxRevenue = Math.max(...variants.map((v) => v.revenue));
  const maxSales = Math.max(...variants.map((v) => v.sales));

  const priceSeries = product.history.map((p) => {
    const obj: Record<string, number | string> = { date: p.date };
    variants.forEach((v, i) => {
      obj[v.name] = v.minPrice + Math.round(((v.maxPrice - v.minPrice) * Math.sin(i + p.date.length)) / 4 + (v.maxPrice - v.minPrice) / 2);
    });
    return obj;
  });

  const salesSeries = product.history.map((p) => {
    const obj: Record<string, number | string> = { date: p.date };
    variants.slice(0, 5).forEach((v) => {
      obj[v.name] = Math.max(0, Math.round((v.sales / 30) * (0.4 + Math.random() * 1.6)));
    });
    return obj;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Karta SKU ro'yxati</CardTitle>
          <CardDescription>
            Karta {product.sku} ichida {variants.length} ta variant · jami{" "}
            <span className="font-medium text-foreground">{formatSumShort(totalRevenue)}</span> daromad,{" "}
            <span className="font-medium text-foreground">{formatNumber(totalSales)}</span> sotuv
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-2 font-medium">SKU</th>
                  <th className="px-6 py-2 font-medium">Nomi</th>
                  <th className="px-6 py-2 text-right font-medium">Daromad</th>
                  <th className="px-6 py-2 text-right font-medium">Sotuv, dona</th>
                  <th className="px-6 py-2 text-right font-medium">Min narx</th>
                  <th className="px-6 py-2 text-right font-medium">Max narx</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-6 py-2 text-right tabular-nums text-muted-foreground">
                      <span className="text-muted-foreground">{i + 1}.</span>
                    </td>
                    <td className="px-6 py-2 font-medium">
                      <a className="text-primary hover:underline">{v.name}</a>
                      <div className="text-[10px] font-mono text-muted-foreground">SKU {v.sku}</div>
                    </td>
                    <td className="px-6 py-2 text-right">
                      <HeatmapCell
                        value={v.revenue}
                        max={maxRevenue}
                        display={formatSumShort(v.revenue)}
                        tone="primary"
                      />
                    </td>
                    <td className="px-6 py-2 text-right">
                      <HeatmapCell
                        value={v.sales}
                        max={maxSales}
                        display={formatNumber(v.sales)}
                        tone="emerald"
                      />
                    </td>
                    <td className="px-6 py-2 text-right tabular-nums text-muted-foreground">
                      {formatSum(v.minPrice)}
                    </td>
                    <td className="px-6 py-2 text-right tabular-nums font-medium">
                      {formatSum(v.maxPrice)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/40">
                  <td className="px-6 py-2" />
                  <td className="px-6 py-2 font-semibold">Jami</td>
                  <td className="px-6 py-2 text-right font-bold tabular-nums">{formatSumShort(totalRevenue)}</td>
                  <td className="px-6 py-2 text-right font-bold tabular-nums">{formatNumber(totalSales)}</td>
                  <td className="px-6 py-2 text-right tabular-nums text-muted-foreground">
                    {formatSum(Math.min(...variants.map((v) => v.minPrice)))}
                  </td>
                  <td className="px-6 py-2 text-right font-medium tabular-nums">
                    {formatSum(Math.max(...variants.map((v) => v.maxPrice)))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Narxlar har bir SKU bo'yicha</CardTitle>
            <CardDescription>30 kunlik narx dinamikasi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDate(v)}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  minTickGap={28}
                />
                <YAxis
                  tickFormatter={(v) => formatSumShort(Number(v))}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  width={64}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                        <div className="mb-1 font-semibold">{formatDate(label as string)}</div>
                        {payload.slice(0, 6).map((p) => (
                          <div key={p.dataKey as string} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                            <span className="truncate text-muted-foreground max-w-[120px]">{p.name as string}:</span>
                            <span className="font-medium tabular-nums">{formatSum(Number(p.value))}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 9, color: "var(--muted-foreground)" }}
                />
                {variants.slice(0, 6).map((v) => (
                  <Line
                    key={v.id}
                    type="monotone"
                    dataKey={v.name}
                    stroke={v.color}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sotuvlar har bir SKU bo'yicha</CardTitle>
            <CardDescription>Kunlik sotuv bar chart</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDate(v)}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  minTickGap={28}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                        <div className="mb-1 font-semibold">{formatDate(label as string)}</div>
                        {payload.map((p) => (
                          <div key={p.dataKey as string} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
                            <span className="truncate text-muted-foreground max-w-[140px]">{p.name as string}:</span>
                            <span className="font-medium tabular-nums">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 9, color: "var(--muted-foreground)" }} />
                {variants.slice(0, 5).map((v) => (
                  <Bar key={v.id} dataKey={v.name} stackId="a" fill={v.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
