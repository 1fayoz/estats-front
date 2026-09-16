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

export function Donut({
  data, height = 330,
}: {
  data: { name: string; value: number; share: number | null }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="75%" cx="38%"
             isAnimationActive={false}
             label={(entry: { percent?: number }) =>
               (entry.percent ?? 0) >= 0.05 ? `${formatNumber(Number(((entry.percent ?? 0) * 100).toFixed(1)))}%` : ""}
             labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" />)}
        </Pie>
        <Tooltip formatter={(v) => compact(v)} />
        <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={9}
                wrapperStyle={{ ...axis, fontSize: 10, lineHeight: "16px", width: "40%" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GrowthBars({ data, height = 360 }: { data: { name: string; growth: number | null }[]; height?: number }) {
  const rows = data.map((d) => ({ name: d.name, growth: d.growth == null ? 0 : Math.round(d.growth * 100) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 30, top: 24 }}>
        <Legend verticalAlign="top" align="center" iconType="square"
                formatter={() => "Toifa O'sish % Muddatdan Muddatga %"} wrapperStyle={{ ...axis, top: 0 }} />
        <XAxis type="number" domain={[-100, 100]} ticks={[-100, -50, 0, 50, 100]} tickFormatter={(v) => `${v}%`}
               tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={140} tick={{ ...axis, fill: "#1f3b73" }} axisLine={false}
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
        <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ ...axis, top: 0, left: 60 }} />
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
        <Legend verticalAlign="top" align="left" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
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
        <Legend verticalAlign="top" align="left" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
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
        <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
        <CartesianGrid vertical={false} stroke="#e6e6e6" />
        <XAxis dataKey={category} tick={{ ...axis, fontSize: 10 }} interval={0} angle={0} height={34}
               tickFormatter={(v, i) => (i % 2 === 0 ? String(v) : `\n${v}`)} />
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

function TreeCell(props: {
  x?: number; y?: number; width?: number; height?: number; name?: string; depth?: number; root?: unknown;
  value?: number; index?: number;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name = "", depth = 0, value = 0 } = props;
  if (width <= 0 || height <= 0) return null;
  const header = depth <= 2 && width > 40;
  const shade = Math.min(0.9, 0.25 + Math.log10(Math.max(value, 1)) / 14);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height}
            style={{ fill: depth === 1 ? "#a8c8f0" : `rgba(100,160,235,${shade.toFixed(2)})`, stroke: "#fff",
                     strokeWidth: depth === 1 ? 2 : 1 }} />
      {header && depth === 1 ? (
        <text x={x + width / 2} y={y + 13} textAnchor="middle" style={{ ...axis, fontSize: 12, fontWeight: 700 }}>
          {name}
        </text>
      ) : null}
      {depth >= 2 && width > 36 && height > 16 ? (
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" style={{ ...axis, fontSize: 11 }}>
          {name.length * 5.5 > width ? `${name.slice(0, Math.max(3, Math.floor(width / 6)))}…` : name}
        </text>
      ) : null}
    </g>
  );
}

export function RevenueTreemap({ data, height = 530 }: { data: TreeDatum[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={data} dataKey="size" nameKey="name" isAnimationActive={false} content={<TreeCell />}
               aspectRatio={4 / 3} />
    </ResponsiveContainer>
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
        <Legend verticalAlign="top" align="center" iconType="circle" iconSize={8}
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
        <Legend verticalAlign="top" align="left" iconType="square" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
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
        <Legend verticalAlign="top" align="left" wrapperStyle={{ ...axis, top: 0, left: 40 }} />
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
