/* Source: IPC-2141A §4.2.2 (stripline embedded trace) */

import type { SingleEndedParams } from "@/types/pcb-impedance";

/**
 * IPC-2141A stripline impedance (trace centered between two reference planes).
 *
 *   Z0 = (60 / sqrt(er)) * ln( 4 * H / (0.67 * π * (0.8 * W + T)) )   (Ω)
 *
 * H here is the total dielectric height between the two planes (with the
 * trace on the centerline). All lengths in mm, dimensionally consistent.
 *
 * For a fully embedded stripline εeff equals the bulk dielectric εr.
 */
export function striplineZ0(p: SingleEndedParams): number {
  const { widthMm: w, thicknessMm: t, heightMm: h, er } = p;
  const denom = 0.67 * Math.PI * (0.8 * w + t);
  if (denom <= 0 || h <= 0 || er <= 0) return 0;
  return (60 / Math.sqrt(er)) * Math.log((4 * h) / denom);
}

export function striplineEpsEff(er: number): number {
  return er;
}
