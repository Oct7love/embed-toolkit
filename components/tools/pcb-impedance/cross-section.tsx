"use client";

import type { Geometry } from "@/types/pcb-impedance";

/**
 * Schematic cross-section diagrams for the three supported geometries.
 * Lengths are in mil, scaled to viewBox space; only relative proportions
 * matter for visual feedback. Colors come from CSS theme tokens via
 * `var(--color-*)` and `currentColor`, never hard-coded hex.
 */

interface Props {
  geometry: Geometry;
  /** All values in mil, used for proportional scaling. */
  widthMil: number;
  thicknessMil: number;
  heightMil: number;
  spacingMil?: number;
}

const VIEW_W = 320;
const VIEW_H = 160;

const PLANE_FILL = "var(--color-muted-foreground)";
const DIELECTRIC_FILL = "var(--color-muted)";
const TRACE_FILL = "var(--color-primary)";
const BORDER_STROKE = "var(--color-border)";

export function CrossSection({
  geometry,
  widthMil,
  thicknessMil,
  heightMil,
  spacingMil = 5,
}: Props) {
  const totalW =
    geometry === "diff" ? 2 * widthMil + spacingMil + 20 : widthMil + 40;
  const totalH = heightMil + thicknessMil + 30;
  const scale = Math.min((VIEW_W - 40) / totalW, (VIEW_H - 40) / totalH);

  const w = Math.max(widthMil * scale, 4);
  const t = Math.max(thicknessMil * scale, 2);
  const h = Math.max(heightMil * scale, 6);
  const s = Math.max(spacingMil * scale, 2);

  const planeY = VIEW_H - 30;
  const planeH = 8;
  const dielectricY = planeY - h;
  const traceY = dielectricY - t;

  if (geometry === "stripline") {
    const topPlaneY = 22;
    const bottomPlaneY = VIEW_H - 30;
    const dielectricH = bottomPlaneY - topPlaneY;
    const dielectricCenter = topPlaneY + dielectricH / 2;
    const traceX = (VIEW_W - w) / 2;
    return (
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full max-w-md h-auto"
        role="img"
        aria-label="Stripline cross section"
      >
        <rect
          x={20}
          y={topPlaneY - planeH}
          width={VIEW_W - 40}
          height={planeH}
          fill={PLANE_FILL}
          opacity={0.6}
        />
        <rect
          x={20}
          y={topPlaneY}
          width={VIEW_W - 40}
          height={dielectricH}
          fill={DIELECTRIC_FILL}
          opacity={0.5}
          stroke={BORDER_STROKE}
          strokeWidth={1}
        />
        <rect
          x={traceX}
          y={dielectricCenter - t / 2}
          width={w}
          height={t}
          fill={TRACE_FILL}
        />
        <rect
          x={20}
          y={bottomPlaneY}
          width={VIEW_W - 40}
          height={planeH}
          fill={PLANE_FILL}
          opacity={0.6}
        />
        <Label x={traceX + w / 2} y={dielectricCenter - t / 2 - 4} text="W" />
        <Label x={VIEW_W - 16} y={dielectricCenter} text="H" anchor="end" />
      </svg>
    );
  }

  if (geometry === "diff") {
    const totalTraceW = 2 * w + s;
    const startX = (VIEW_W - totalTraceW) / 2;
    return (
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full max-w-md h-auto"
        role="img"
        aria-label="Differential pair cross section"
      >
        <rect
          x={20}
          y={dielectricY}
          width={VIEW_W - 40}
          height={h}
          fill={DIELECTRIC_FILL}
          opacity={0.5}
          stroke={BORDER_STROKE}
          strokeWidth={1}
        />
        <rect x={startX} y={traceY} width={w} height={t} fill={TRACE_FILL} />
        <rect
          x={startX + w + s}
          y={traceY}
          width={w}
          height={t}
          fill={TRACE_FILL}
        />
        <rect
          x={20}
          y={planeY}
          width={VIEW_W - 40}
          height={planeH}
          fill={PLANE_FILL}
          opacity={0.6}
        />
        <Label x={startX + w / 2} y={traceY - 4} text="W" />
        <Label x={startX + w + s / 2} y={traceY - 4} text="S" />
        <Label x={startX + 1.5 * w + s} y={traceY - 4} text="W" />
        <Label
          x={VIEW_W - 16}
          y={traceY + (planeY - traceY) / 2}
          text="H"
          anchor="end"
        />
      </svg>
    );
  }

  // microstrip
  const traceX = (VIEW_W - w) / 2;
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full max-w-md h-auto"
      role="img"
      aria-label="Microstrip cross section"
    >
      <rect
        x={20}
        y={dielectricY}
        width={VIEW_W - 40}
        height={h}
        fill={DIELECTRIC_FILL}
        opacity={0.5}
        stroke={BORDER_STROKE}
        strokeWidth={1}
      />
      <rect x={traceX} y={traceY} width={w} height={t} fill={TRACE_FILL} />
      <rect
        x={20}
        y={planeY}
        width={VIEW_W - 40}
        height={planeH}
        fill={PLANE_FILL}
        opacity={0.6}
      />
      <Label x={traceX + w / 2} y={traceY - 4} text="W" />
      <Label x={VIEW_W - 16} y={traceY + (planeY - traceY) / 2} text="H" anchor="end" />
    </svg>
  );
}

function Label({
  x,
  y,
  text,
  anchor = "middle",
}: {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="currentColor"
      className="text-foreground/70 text-[10px] font-mono"
    >
      {text}
    </text>
  );
}
