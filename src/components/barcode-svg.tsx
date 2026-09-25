"use client";

import React, { useMemo } from "react";
import { encodeCode128 } from "@/lib/barcode";

interface BarcodeSvgProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
  textColor?: string;
  barColor?: string;
}

export function BarcodeSvg({
  value,
  height = 50,
  barWidth = 2,
  showText = true,
  className,
  textColor = "#000000",
  barColor = "#000000",
}: BarcodeSvgProps) {
  const modules = useMemo(() => encodeCode128(value), [value]);

  if (!value || modules.length === 0) {
    return (
      <div className="flex h-16 w-full items-center justify-center rounded border border-dashed border-muted-foreground/30 text-xs text-muted-foreground">
        Shtrix-kod kiritilmadi
      </div>
    );
  }

  const totalWidth = modules.length * barWidth;
  const textHeight = showText ? 14 : 0;
  const svgHeight = height + textHeight;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className || ""}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${svgHeight}`}
        width="100%"
        height="100%"
        style={{ maxHeight: `${svgHeight}px`, maxWidth: `${totalWidth}px` }}
        shapeRendering="crispEdges"
      >
        <rect width={totalWidth} height={svgHeight} fill="transparent" />
        {modules.map((isBar, idx) => {
          if (!isBar) return null;
          return (
            <rect
              key={idx}
              x={idx * barWidth}
              y={0}
              width={barWidth}
              height={height}
              fill={barColor}
            />
          );
        })}
        {showText && (
          <text
            x={totalWidth / 2}
            y={height + 11}
            textAnchor="middle"
            fill={textColor}
            fontSize="11"
            fontFamily="monospace, Courier, monospace"
            fontWeight="bold"
            letterSpacing="2"
          >
            {value}
          </text>
        )}
      </svg>
    </div>
  );
}
