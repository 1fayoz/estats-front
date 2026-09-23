"use client";

import * as React from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, Treemap, XAxis, YAxis, ZAxis,
} from "recharts";

import { formatCompact, formatNumber } from "@/lib/format";

/* Grafiklar eStats palitrasida; filtrlashda animatsiya ataylab o'chirilgan. */

export const PALETTE = [
  "var(--primary)", "var(--info)", "var(--success)", "#8b5cf6", "#ec7a5c", "#f0aa3c", "#4a78db", "#dd5f96", "#73a9ec", "#8d77dd",
  "#2f8f9d", "#ef8f58", "#6f7a97", "#53ae78", "#aa63b8", "#539acf", "#ca6b6b", "#c78b3a", "#7b8bd2", "#d479a3",
  "#639da8", "#af8c31", "#7764c9",
];

const axis = { fontSize: 11, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fill: "var(--muted-foreground)" };
const tooltipContent: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  boxShadow: "0 14px 36px rgba(12, 8, 48, .2)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};
const tooltipLabel: React.CSSProperties = { color: "var(--popover-foreground)", fontWeight: 650 };
const tooltipItem: React.CSSProperties = { color: "var(--popover-foreground)" };
const compact = (v: unknown) => (v == null || v === "" ? "" : formatCompact(Number(v)));
const number = (v: unknown) => (v == null ? "-" : formatNumber(Number(v)));

export function shortDay(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** Looker donut'i: 19 ta eng katta bo'lak + «Boshqa», yorliq faqat 5% dan katta bo'lakda. */
const DONUT_SLICES = 19;

export function Donut({
  data, height = 330,
}: {
  data: { name: string; value: number; share: number | null }[];
  height?: number;
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, DONUT_SLICES);
  const rest = sorted.slice(DONUT_SLICES).reduce((sum, d) => sum + d.value, 0);
  const slices = rest > 0 ? [...head, { name: "Boshqa", value: rest, share: null }] : head;
  const total = slices.reduce((sum, d) => sum + d.value, 0) || 1;
  const RADIAN = Math.PI / 180;
  return (
    <div style={{ display: "flex", alignItems: "center", height }}>
      <div style={{ flex: "0 0 58%", height: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="88%"
                 isAnimationActive={false} startAngle={90} endAngle={-270} labelLine={false}
                 label={(p: { cx?: number; cy?: number; midAngle?: number; innerRadius?: number;
                              outerRadius?: number; value?: number }) => {
                   const share = (p.value ?? 0) / total;
                   if (share < 0.05) return null;
                   const r = ((p.innerRadius ?? 0) + (p.outerRadius ?? 0)) / 2;
                   const x = (p.cx ?? 0) + r * Math.cos(-(p.midAngle ?? 0) * RADIAN);
                   const y = (p.cy ?? 0) + r * Math.sin(-(p.midAngle ?? 0) * RADIAN);
                   return (
                     <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
                           style={{ ...axis, fontSize: 10, fill: "#fff" }}>
                       {formatNumber(Number((share * 100).toFixed(1)))}%
                     </text>
                   );
                 }}>
              {slices.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="var(--card)" />)}
            </Pie>
            <Tooltip formatter={(v) => compact(v)} contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, ...axis, fontSize: 10, lineHeight: "14px", overflow: "hidden" }}>
        {slices.map((s, i) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: PALETTE[i % PALETTE.length],
                           flex: "none" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OneLineTick(props: { x?: number; y?: number; payload?: { value: string } }) {
  const { x = 0, y = 0, payload } = props;
  const text = payload?.value ?? "";
  return (
    <text x={x} y={y} dy={3} textAnchor="end" style={{ ...axis, fontSize: 10 }}>
      {text.length > 26 ? `${text.slice(0, 25)}…` : text}
    </text>
  );
}

export function GrowthBars({ data, height = 360 }: { data: { name: string; growth: number | null }[]; height?: number }) {
  const rows = data.map((d) => ({ name: d.name, growth: d.growth == null ? 0 : Math.round(d.growth * 100) }));
  // O'q qat'iy ±100% emas, MA'LUMOTGA moslashadi (hisobotdagi kabi): 20% lik
  // qadamlar bilan eng yaqin yaxlit chegaraga kengaytiriladi. Qat'iy ±100% da
  // 58% lik ustun ham, −37% lik ham o'rtada siqilib, farqi ko'rinmay qolardi.
  const step = 20;
  const values = rows.map((r) => r.growth);
  const low = Math.min(0, ...values), high = Math.max(0, ...values);
  const from = Math.floor(low / step) * step, to = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  for (let v = from; v <= to; v += step) ticks.push(v);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 30, top: 24 }}>
        <Legend itemSorter={null} verticalAlign="top" align="center" iconType="square"
                formatter={() => "Toifa O'sish % Muddatdan Muddatga %"} wrapperStyle={{ ...axis, top: 0 }} />
        <XAxis type="number" domain={[from, to]} ticks={ticks} tickFormatter={(v) => `${v}%`}
               tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={140} tick={<OneLineTick />} axisLine={false}
               tickLine={false} interval={0} />
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <Bar dataKey="growth" fill="var(--primary)" radius={[0, 6, 6, 0]} isAnimationActive={false} barSize={9}>
          <LabelList dataKey="growth" position="right" formatter={(v: unknown) => `${v}%`}
                     style={{ ...axis, fontSize: 10, fill: "var(--primary)" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DailyBars({
  data, height = 170, name = "Tushim(so'nggi 30 kun)",
}: {
  data: { day: string; revenue: number | null }[];
  height?: number;
  name?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 10, right: 10, top: 20 }}>
        <Legend itemSorter={null} verticalAlign="top" align="left" iconType="square" wrapperStyle={{ ...axis, top: 0, left: 60 }} />
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tickFormatter={shortDay} tick={axis} interval={0} tickLine={false} />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60}
               label={{ value: name, angle: -90, position: "insideLeft", style: { ...axis, fontSize: 10 } }} />
        <Tooltip formatter={(v) => number(v)} labelFormatter={(l) => shortDay(String(l))}
                 contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
        <Bar dataKey="revenue" name={name} fill="var(--primary)" radius={[5, 5, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ComboDaily({
  data, bars, line, barName, lineName, height = 280, barColor = "var(--primary)", lineColor = "var(--info)",
  dateLabel,
}: {
  data: Record<string, unknown>[];
  bars: string;
  line: string;
  barName: string;
  lineName: string;
  height?: number;
  barColor?: string;
  lineColor?: string;
  dateLabel?: (iso: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ left: 10, right: 10, top: 24, bottom: 10 }}>
        <Legend itemSorter={null} verticalAlign="top" align="left" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tickFormatter={(v) => (dateLabel ? dateLabel(String(v)) : shortDay(String(v)))}
               tick={axis} minTickGap={12} angle={-35} textAnchor="end" height={50} />
        <YAxis yAxisId="l" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60} />
        <YAxis yAxisId="r" orientation="right" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false}
               width={60} />
        <Tooltip formatter={(v) => number(v)} contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
        <Bar yAxisId="l" dataKey={bars} name={barName} fill={barColor} isAnimationActive={false} />
        <Line yAxisId="r" dataKey={line} name={lineName} stroke={lineColor} dot={false} strokeWidth={1.5}
              isAnimationActive={false} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function TwoLines({
  data, left, right, leftName, rightName, height = 220, leftColor = "var(--primary)", rightColor = "var(--info)", dateLabel,
}: {
  data: Record<string, unknown>[];
  left: string;
  right: string;
  leftName: string;
  rightName: string;
  height?: number;
  leftColor?: string;
  rightColor?: string;
  dateLabel?: (iso: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 10, right: 10, top: 24, bottom: 10 }}>
        <Legend itemSorter={null} verticalAlign="top" align="left" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tickFormatter={(v) => (dateLabel ? dateLabel(String(v)) : shortDay(String(v)))}
               tick={axis} minTickGap={12} angle={-35} textAnchor="end" height={50} />
        <YAxis yAxisId="l" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60} />
        <YAxis yAxisId="r" orientation="right" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false}
               width={60} />
        <Tooltip formatter={(v) => number(v)} contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
        <Line yAxisId="l" dataKey={left} name={leftName} stroke={leftColor} dot={false} strokeWidth={1.5}
              isAnimationActive={false} connectNulls />
        <Line yAxisId="r" dataKey={right} name={rightName} stroke={rightColor} dot={false} strokeWidth={1.5}
              isAnimationActive={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Looker narx grafigidagi kabi: yorliqlar navbatma-navbat ikki qatorda (sig'magani ustma-ust tushmasin). */
function StaggeredTick(props: { x?: number; y?: number; payload?: { value: string; index?: number }; index?: number }) {
  const { x = 0, y = 0, payload, index = 0 } = props;
  return (
    <text x={x} y={y + (index % 2 === 0 ? 10 : 22)} textAnchor="middle" style={{ ...axis, fontSize: 10 }}>
      {payload?.value}
    </text>
  );
}

export function GroupedBars({
  data, category, series, height = 290,
}: {
  data: Record<string, unknown>[];
  category: string;
  series: { key: string; name: string; color: string; axis: "l" | "r" }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 10, right: 10, top: 28, bottom: 18 }} barGap={1}>
        <Legend itemSorter={null} verticalAlign="top" align="left" iconType="square" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey={category} tick={<StaggeredTick />} interval={0} height={34} />
        <YAxis yAxisId="l" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={55} />
        <YAxis yAxisId="r" orientation="right" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false}
               width={55} />
        <Tooltip formatter={(v) => number(v)} contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
        {series.map((s) => (
          <Bar key={s.key} yAxisId={s.axis} dataKey={s.key} name={s.name} fill={s.color} isAnimationActive={false}>
            <LabelList dataKey={s.key} position="top" formatter={compact}
                       style={{ ...axis, fontSize: 10 }} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

type TreeDatum = { name: string; size?: number; children?: TreeDatum[] };

/*
  Treemap: tepada umumiy sarlavha, 1-daraja guruhlar
  binafsha SARLAVHA chizig'i bilan, 2-daraja to'rtburchaklar nomi bilan,
  undan chuqurlari faqat ingichka chegara. Rang — tushum ulushiga qarab
  och ko'kdan to'qroq ko'kka (Looker'ning «color by metric» uslubi).
*/
const HEADER = 16;

function TreeCell(props: {
  x?: number; y?: number; width?: number; height?: number; name?: string; depth?: number;
  value?: number; root?: { value?: number };
}) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", depth = 0, value = 0, root } = props;
  if (width <= 0 || height <= 0) return null;
  const share = root?.value ? value / root.value : 0;
  const amount = Math.round(Math.min(78, 12 + share * 190));
  const fill = `color-mix(in oklch, var(--primary) ${amount}%, var(--card))`;
  const clip = (text: string, px: number) => {
    const fits = Math.floor(px / 6.2);
    return text.length > fits ? `${text.slice(0, Math.max(2, fits - 1))}…` : text;
  };
  if (depth === 1) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} style={{ fill: "var(--card)", stroke: "var(--card)", strokeWidth: 2 }} />
        <rect x={x + 1} y={y + 1} width={Math.max(0, width - 2)} height={Math.min(HEADER, height)}
              style={{ fill: "var(--primary)" }} />
        {width > 30 ? (
          <text x={x + width / 2} y={y + 12} textAnchor="middle"
                style={{ ...axis, fontSize: 11, fontWeight: 700, fill: "var(--primary-foreground)" }}>
            {clip(name, width)}
          </text>
        ) : null}
      </g>
    );
  }
  const top = depth === 2 ? y + (y === 0 ? 0 : 0) : y;
  return (
    <g>
      <rect x={x} y={top} width={width} height={height}
            style={{ fill: depth === 2 ? fill : "transparent", stroke: "var(--card)", strokeWidth: depth === 2 ? 1.5 : 0.6 }} />
      {depth === 2 && width > 34 && height > 16 ? (
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" style={{ ...axis, fontSize: 11 }}>
          {clip(name, width)}
        </text>
      ) : null}
    </g>
  );
}

export function RevenueTreemap({ data, height = 530 }: { data: TreeDatum[]; height?: number }) {
  return (
    <div>
      <div style={{ background: "var(--accent)", color: "var(--accent-foreground)", textAlign: "center", ...axis, fontSize: 12, fontWeight: 700,
                    padding: "7px 0", margin: "0 8px", borderRadius: 9 }}>
        Barchasi
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <Treemap data={data} dataKey="size" nameKey="name" isAnimationActive={false} content={<TreeCell />}
                 aspectRatio={4 / 3} />
      </ResponsiveContainer>
    </div>
  );
}

export function Bubbles({
  data, height = 520,
}: {
  data: { toifa: string; shops: number; cards: number; revenue: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ left: 20, right: 20, top: 50, bottom: 30 }}>
        <CartesianGrid stroke="var(--border)" />
        <XAxis type="number" dataKey="shops" name="magazinlar soni (raqobat)" tickFormatter={compact} tick={axis}
               label={{ value: "magazinlar soni (raqobat)", position: "insideBottom", offset: -18,
                        style: { ...axis, fontStyle: "italic" } }} />
        <YAxis type="number" dataKey="cards" name="kartochkalar soni (assortiment)" tickFormatter={compact}
               tick={axis}
               label={{ value: "kartochkalar soni (assortiment)", angle: -90, position: "insideLeft",
                        style: { ...axis, fontStyle: "italic" } }} />
        <ZAxis type="number" dataKey="revenue" range={[80, 9000]} />
        <Tooltip formatter={(v) => number(v)} contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
        <Legend itemSorter={null} verticalAlign="top" align="center" iconType="circle" iconSize={8}
                wrapperStyle={{ ...axis, fontSize: 10, top: 0 }} />
        {data.map((d, i) => (
          <Scatter key={d.toifa} name={d.toifa} data={[d]} fill={PALETTE[i % PALETTE.length]}
                   isAnimationActive={false} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function StackedDaily({
  data, keys, height = 260,
}: {
  data: Record<string, unknown>[];
  keys: { key: string; name: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 10, right: 10, top: 28 }}>
        <Legend itemSorter={null} verticalAlign="top" align="left" iconType="square" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tickFormatter={shortDay} tick={axis} reversed />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={50} />
        <Tooltip formatter={(v) => number(v)} contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
        {keys.map((k, i) => (
          <Bar key={k.key} dataKey={k.key} name={k.name} stackId="a" fill={PALETTE[(i * 3 + 10) % PALETTE.length]}
               isAnimationActive={false} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({
  data, keys, height = 150,
}: {
  data: Record<string, unknown>[];
  keys: { key: string; name: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 10, right: 10, top: 28 }}>
        <Legend itemSorter={null} verticalAlign="top" align="left" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tickFormatter={shortDay} tick={axis} />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60} />
        <Tooltip formatter={(v) => number(v)} contentStyle={tooltipContent} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
        {keys.map((k, i) => (
          <Line key={k.key} dataKey={k.key} name={k.name} stroke={PALETTE[i % PALETTE.length]} dot={false}
                strokeWidth={1.3} isAnimationActive={false} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
