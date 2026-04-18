/* Source: IPC-2141A §4.2.1 (microstrip surface trace) */

import type { SingleEndedParams } from "@/types/pcb-impedance";

/**
 * IPC-2141A surface microstrip impedance.
 *
 *   Z0 = (87 / sqrt(er + 1.41)) * ln(5.98 * H / (0.8 * W + T))      (Ω)
 *
 * All lengths in mm. The formula is dimensionally consistent — only the
 * ratio H/(0.8W+T) matters — so mm vs mil yields the same Z0 as long as
 * the units are uniform.
 *
 * Effective dielectric constant (for εeff and propagation delay):
 *
 *   εeff = 0.475 * er + 0.67          (IPC-2141A simple form)
 *
 * Propagation delay:
 *
 *   tpd = sqrt(εeff) / c   (s/m)  →  ps/inch via 0.0254 m/inch * 1e12
 */
export function microstripZ0(p: SingleEndedParams): number {
  const { widthMm: w, thicknessMm: t, heightMm: h, er } = p;
  const denom = 0.8 * w + t;
  if (denom <= 0 || h <= 0) return 0;
  return (87 / Math.sqrt(er + 1.41)) * Math.log((5.98 * h) / denom);
}

export function microstripEpsEff(er: number): number {
  return 0.475 * er + 0.67;
}
