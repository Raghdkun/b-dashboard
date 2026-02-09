"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────── */

export interface SpeedZone {
  /** Start value of this zone */
  from: number;
  /** End value of this zone */
  to: number;
  /** Color of the zone arc */
  color: string;
}

interface SpeedometerGaugeProps {
  /** Current value */
  value: number;
  /** Minimum scale value (default 0) */
  min?: number;
  /** Maximum scale value (default 100) */
  max?: number;
  /** Colored zones to render on the arc */
  zones: SpeedZone[];
  /** Status text (e.g. "On Target", "Critical") */
  statusLabel: string;
  /** Color for the status text */
  statusColor: string;
  /** Formatted display value (e.g. "21%") */
  valueDisplay: string;
  className?: string;
}

/* ─── Layout constants ──────────────────────────────────────── */

const CX = 110;       // center X
const CY = 80;        // center Y
const R = 65;         // arc radius
const ARC_W = 10;     // arc stroke width
const START = 135;    // gauge start angle (SVG deg, bottom-left)
const SWEEP = 270;    // total sweep degrees
const NEEDLE = 50;    // needle length

/* ─── Geometry helpers ──────────────────────────────────────── */

const d2r = (d: number) => (d * Math.PI) / 180;

function polar(r: number, deg: number) {
  const rad = d2r(deg);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arcPath(r: number, s: number, e: number) {
  const a = polar(r, s);
  const b = polar(r, e);
  const large = e - s > 180 ? 1 : 0;
  return [
    `M${a.x.toFixed(1)},${a.y.toFixed(1)}`,
    `A${r},${r} 0 ${large} 1 ${b.x.toFixed(1)},${b.y.toFixed(1)}`,
  ].join(" ");
}

/** Map a value to its SVG angle on the gauge arc */
function v2a(v: number, min: number, max: number) {
  const ratio = Math.max(0, Math.min(1, (v - min) / (max - min)));
  return START + ratio * SWEEP;
}

/* ─── Component ─────────────────────────────────────────────── */

export function SpeedometerGauge({
  value,
  min = 0,
  max = 100,
  zones,
  statusLabel,
  statusColor,
  valueDisplay,
  className,
}: SpeedometerGaugeProps) {
  const { resolvedTheme } = useTheme();
  const angle = useMemo(() => v2a(value, min, max), [value, min, max]);
  const tip = useMemo(() => polar(NEEDLE, angle), [angle]);
  
  // Value text color: white in dark mode, light gray in light mode for contrast
  const valueTextColor = resolvedTheme === "dark" ? "#ffffff" : "#f5f5f5";

  // Build zone arc paths
  const zoneArcs = useMemo(
    () =>
      zones.map((z) => ({
        d: arcPath(R, v2a(z.from, min, max), v2a(z.to, min, max)),
        color: z.color,
        key: `${z.from}-${z.to}`,
      })),
    [zones, min, max],
  );

  // Tick marks — 20 minor divisions, major every 5
  const ticks = useMemo(() => {
    const out: {
      x1: number; y1: number;
      x2: number; y2: number;
      major: boolean; key: number;
    }[] = [];
    for (let i = 0; i <= 20; i++) {
      const a = START + (i / 20) * SWEEP;
      const major = i % 5 === 0;
      const outerR = R - ARC_W / 2 - 2;
      const innerR = outerR - (major ? 8 : 4);
      const o = polar(outerR, a);
      const p = polar(innerR, a);
      out.push({ x1: p.x, y1: p.y, x2: o.x, y2: o.y, major, key: i });
    }
    return out;
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox="0 0 220 128" className="w-full h-auto">
        {/* Background track */}
        <path
          d={arcPath(R, START, START + SWEEP)}
          fill="none"
          stroke="currentColor"
          strokeWidth={ARC_W}
          className="text-muted/20"
          strokeLinecap="round"
        />

        {/* Colored zone arcs */}
        {zoneArcs.map((z) => (
          <path
            key={z.key}
            d={z.d}
            fill="none"
            stroke={z.color}
            strokeWidth={ARC_W}
            strokeLinecap="butt"
            opacity={0.85}
          />
        ))}

        {/* Tick marks */}
        {ticks.map((t) => (
          <line
            key={t.key}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="currentColor"
            strokeWidth={t.major ? 1.5 : 0.75}
            className="text-muted-foreground/40"
          />
        ))}

        {/* Needle */}
        <line
          x1={CX}
          y1={CY}
          x2={tip.x}
          y2={tip.y}
          stroke="#DC2626"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
        />

        {/* Center hub */}
        <circle cx={CX} cy={CY} r={5} fill="#DC2626" />
        <circle cx={CX} cy={CY} r={2.5} fill="hsl(var(--background))" />

        {/* Value display */}
        <text
          x={CX}
          y={CY + 38}
          textAnchor="middle"
          fill={valueTextColor}
          fontSize="13"
          fontWeight="700"
          style={{ filter: "drop-shadow(0 0.5px 1px rgba(0,0,0,0.4))" }}
        >
          {valueDisplay}
        </text>
      </svg>
    </div>
  );
}
