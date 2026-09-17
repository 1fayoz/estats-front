"use client";

import * as React from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, Treemap, XAxis, YAxis, ZAxis,
} from "recharts";

import { formatCompact, formatNumber } from "@/lib/format";

/*
  Grafiklar — Looker Studio uslubida: Oswald 11px o'qlar, yupqa
  kulrang to'r, legenda tepada, animatsiyasiz (Looker ham animatsiya
  qilmaydi va tez-tez almashadigan filtrda animatsiya ko'zni charchatadi).
*/

export const PALETTE = [
  "#1f3b73", "#f4a93b", "#e02c8f", "#7eb2f4", "#4cb6c4", "#8bb04c", "#4a8ef0", "#ef7648", "#e25c6c", "#e8508f",
  "#4a2ea0", "#737373", "#b56a4a", "#96c173", "#7f9fd1", "#8fcdf2", "#c6644e", "#f0b37e", "#c86a9c", "#e3a1c7",
  "#5c9ead", "#d4a017", "#6a5acd",
];

const axis = { fontSize: 11, fontFamily: "var(--font-oswald), Oswald, sans-serif", fill: "#333" };
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
              {slices.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" />)}
            </Pie>
            <Tooltip formatter={(v) => compact(v)} />
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
    <text x={x} y={y} dy={3} textAnchor="end" style={{ ...axis, fontSize: 10, fill: "#1f3b73" }}>
      {text.length > 26 ? `${text.slice(0, 25)}…` : text}
    </text>
  );
}

export function GrowthBars({ data, height = 360 }: { data: { name: string; growth: number | null }[]; height?: number }) {
  const rows = data.map((d) => ({ name: d.name, growth: d.growth == null ? 0 : Math.round(d.growth * 100) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 30, top: 24 }}>
        <Legend itemSorter={null} verticalAlign="top" align="center" iconType="square"
                formatter={() => "Toifa O'sish % Muddatdan Muddatga %"} wrapperStyle={{ ...axis, top: 0 }} />
        <XAxis type="number" domain={[-100, 100]} ticks={[-100, -50, 0, 50, 100]} tickFormatter={(v) => `${v}%`}
               tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={140} tick={<OneLineTick />} axisLine={false}
               tickLine={false} interval={0} />
        <CartesianGrid horizontal={false} stroke="#e6e6e6" />
        <Bar dataKey="growth" fill="#7eb2f4" isAnimationActive={false} barSize={8}>
          <LabelList dataKey="growth" position="right" formatter={(v: unknown) => `${v}%`}
                     style={{ ...axis, fontSize: 10, fill: "#7eb2f4" }} />
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
        <CartesianGrid vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey="day" tickFormatter={shortDay} tick={axis} interval={0} tickLine={false} />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60}
               label={{ value: name, angle: -90, position: "insideLeft", style: { ...axis, fontSize: 10 } }} />
        <Tooltip formatter={(v) => number(v)} labelFormatter={(l) => shortDay(String(l))} />
        <Bar dataKey="revenue" name={name} fill="#3a66c4" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ComboDaily({
  data, bars, line, barName, lineName, height = 280, barColor = "#4fb3cf", lineColor = "#e2552b",
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
        <CartesianGrid vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey="day" tickFormatter={(v) => (dateLabel ? dateLabel(String(v)) : shortDay(String(v)))}
               tick={axis} minTickGap={12} angle={-35} textAnchor="end" height={50} />
        <YAxis yAxisId="l" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60} />
        <YAxis yAxisId="r" orientation="right" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false}
               width={60} />
        <Tooltip formatter={(v) => number(v)} />
        <Bar yAxisId="l" dataKey={bars} name={barName} fill={barColor} isAnimationActive={false} />
        <Line yAxisId="r" dataKey={line} name={lineName} stroke={lineColor} dot={false} strokeWidth={1.5}
              isAnimationActive={false} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function TwoLines({
  data, left, right, leftName, rightName, height = 220, leftColor = "#e2552b", rightColor = "#4fb3cf", dateLabel,
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
        <CartesianGrid vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey="day" tickFormatter={(v) => (dateLabel ? dateLabel(String(v)) : shortDay(String(v)))}
               tick={axis} minTickGap={12} angle={-35} textAnchor="end" height={50} />
        <YAxis yAxisId="l" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60} />
        <YAxis yAxisId="r" orientation="right" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false}
               width={60} />
        <Tooltip formatter={(v) => number(v)} />
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
        <CartesianGrid vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey={category} tick={<StaggeredTick />} interval={0} height={34} />
        <YAxis yAxisId="l" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={55} />
        <YAxis yAxisId="r" orientation="right" tickFormatter={compact} tick={axis} axisLine={false} tickLine={false}
               width={55} />
        <Tooltip formatter={(v) => number(v)} />
        {series.map((s) => (
          <Bar key={s.key} yAxisId={s.axis} dataKey={s.key} name={s.name} fill={s.color} isAnimationActive={false}>
            <LabelList dataKey={s.key} position="top" formatter={compact}
                       style={{ ...axis, fontSize: 10, fill: "#777" }} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

type TreeDatum = { name: string; size?: number; children?: TreeDatum[] };

/*
  Treemap — Looker ko'rinishida: tepada «Все» sarlavhasi, 1-daraja guruhlar
  to'q ko'k SARLAVHA chizig'i bilan, 2-daraja to'rtburchaklar nomi bilan,
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
  const fill = `rgba(66, 133, 244, ${Math.min(0.85, 0.12 + share * 2.2).toFixed(3)})`;
  const clip = (text: string, px: number) => {
    const fits = Math.floor(px / 6.2);
    return text.length > fits ? `${text.slice(0, Math.max(2, fits - 1))}…` : text;
  };
  if (depth === 1) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} style={{ fill: "#fff", stroke: "#fff", strokeWidth: 2 }} />
        <rect x={x + 1} y={y + 1} width={Math.max(0, width - 2)} height={Math.min(HEADER, height)}
              style={{ fill: "#5b9bef" }} />
        {width > 30 ? (
          <text x={x + width / 2} y={y + 12} textAnchor="middle"
                style={{ ...axis, fontSize: 11, fontWeight: 700, fill: "#000" }}>
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
            style={{ fill: depth === 2 ? fill : "transparent", stroke: "#fff", strokeWidth: depth === 2 ? 1.5 : 0.6 }} />
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
      <div style={{ background: "#5b9bef", textAlign: "center", ...axis, fontSize: 12, fontWeight: 700,
                    padding: "2px 0", margin: "0 4px" }}>
        Все
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
        <CartesianGrid stroke="#e6e6e6" />
        <XAxis type="number" dataKey="shops" name="magazinlar soni (raqobat)" tickFormatter={compact} tick={axis}
               label={{ value: "magazinlar soni (raqobat)", position: "insideBottom", offset: -18,
                        style: { ...axis, fontStyle: "italic" } }} />
        <YAxis type="number" dataKey="cards" name="kartochkalar soni (assortiment)" tickFormatter={compact}
               tick={axis}
               label={{ value: "kartochkalar soni (assortiment)", angle: -90, position: "insideLeft",
                        style: { ...axis, fontStyle: "italic" } }} />
        <ZAxis type="number" dataKey="revenue" range={[80, 9000]} />
        <Tooltip formatter={(v) => number(v)} />
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
        <CartesianGrid vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey="day" tickFormatter={shortDay} tick={axis} reversed />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={50} />
        <Tooltip formatter={(v) => number(v)} />
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
        <CartesianGrid vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey="day" tickFormatter={shortDay} tick={axis} />
        <YAxis tickFormatter={compact} tick={axis} axisLine={false} tickLine={false} width={60} />
        <Tooltip formatter={(v) => number(v)} />
        {keys.map((k, i) => (
          <Line key={k.key} dataKey={k.key} name={k.name} stroke={PALETTE[i % PALETTE.length]} dot={false}
                strokeWidth={1.3} isAnimationActive={false} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
