/* PCB impedance — main entry. Orchestrates microstrip / stripline / diff
 * formulas, attaches εeff and propagation delay, and provides a Newton +
 * bisection-fallback solver for the reverse problem (target Z0 -> width).
 *
 * Source notes per geometry live in the corresponding sub-file:
 *   - microstrip.ts → IPC-2141A §4.2.1
 *   - stripline.ts  → IPC-2141A §4.2.2
 *   - diff-pair.ts  → Wadell, Transmission Line Design Handbook (1991), §3.5
 */

import type {
  Geometry,
  SingleEndedParams,
  DiffParams,
  ImpedanceResult,
  SolveWidthResult,
} from "@/types/pcb-impedance";
import { MIL_TO_MM, milToMm } from "@/types/pcb-impedance";
import { microstripZ0, microstripEpsEff } from "./microstrip";
import { striplineZ0, striplineEpsEff } from "./stripline";
import { diffPairImpedance } from "./diff-pair";

/** Speed of light in vacuum (m/s). */
const C_MS = 2.99792458e8;
/** Meters per inch. */
const M_PER_INCH = 0.0254;

/** Compute propagation delay (ps/in) given effective dielectric constant. */
function propDelayPsPerInch(epsEff: number): number {
  // tpd (s/m) = sqrt(epsEff) / c
  // ps/in    = tpd * M_PER_INCH * 1e12
  return (Math.sqrt(Math.max(epsEff, 0)) / C_MS) * M_PER_INCH * 1e12;
}

function buildWarnings(
  geometry: Geometry,
  p: SingleEndedParams | DiffParams,
): string[] {
  const warnings: string[] = [];
  const widthMil = p.widthMm / MIL_TO_MM;
  const thicknessMil = p.thicknessMm / MIL_TO_MM;
  const heightMil = p.heightMm / MIL_TO_MM;
  if (widthMil < 3) {
    warnings.push(`线宽 W=${widthMil.toFixed(2)} mil 小于 3 mil（PCB 工艺最小线宽）`);
  }
  if (thicknessMil < 0.5) {
    warnings.push(`铜厚 T=${thicknessMil.toFixed(2)} mil 小于 0.5 mil`);
  }
  if (heightMil < 1) {
    warnings.push(`介质厚度 H=${heightMil.toFixed(2)} mil 小于 1 mil`);
  }
  if (p.er < 2 || p.er > 6) {
    warnings.push(`εr=${p.er} 超出 IPC-2141 适用范围 [2, 6]`);
  }
  if (geometry === "diff") {
    const spacingMil = (p as DiffParams).spacingMm / MIL_TO_MM;
    if (spacingMil < 3) {
      warnings.push(`间距 S=${spacingMil.toFixed(2)} mil 小于 3 mil`);
    }
  }
  return warnings;
}

/**
 * Forward calculation: geometry + parameters → Z0, εeff, propagation delay.
 */
export function calculateImpedance(
  geometry: "microstrip" | "stripline",
  params: SingleEndedParams,
): ImpedanceResult;
export function calculateImpedance(
  geometry: "diff",
  params: DiffParams,
): ImpedanceResult;
export function calculateImpedance(
  geometry: Geometry,
  params: SingleEndedParams | DiffParams,
): ImpedanceResult {
  const warnings = buildWarnings(geometry, params);

  if (geometry === "microstrip") {
    const z0 = microstripZ0(params as SingleEndedParams);
    const epsEff = microstripEpsEff(params.er);
    return {
      z0,
      epsEff,
      propDelayPsPerInch: propDelayPsPerInch(epsEff),
      warnings,
    };
  }

  if (geometry === "stripline") {
    const z0 = striplineZ0(params as SingleEndedParams);
    const epsEff = striplineEpsEff(params.er);
    return {
      z0,
      epsEff,
      propDelayPsPerInch: propDelayPsPerInch(epsEff),
      warnings,
    };
  }

  // diff
  const r = diffPairImpedance(params as DiffParams);
  return {
    z0: r.zSingle,
    zDiff: r.zDiff,
    epsEff: r.epsEff,
    propDelayPsPerInch: propDelayPsPerInch(r.epsEff),
    warnings,
  };
}

/** Convenience alias matching the spec wording (`generateImpedance`). */
export const generateImpedance = calculateImpedance;

// ---------- Reverse solver: target Z0 -> trace width ----------

const NEWTON_MAX_ITERS = 30;
const TOLERANCE_OHMS = 0.01;
const SCAN_MIN_MIL = 3;
const SCAN_MAX_MIL = 50;
const SCAN_STEP_MIL = 0.5;

interface FixedSingle {
  thicknessMm: number;
  heightMm: number;
  er: number;
}

interface FixedDiff extends FixedSingle {
  spacingMm: number;
}

/**
 * For diff-pair reverse-solving the "target" is the differential impedance
 * Zdiff (typical use: 90 / 100 Ω). For microstrip / stripline it is Z0.
 */
function evalZ(
  geometry: Geometry,
  widthMm: number,
  fixed: FixedSingle | FixedDiff,
): number {
  if (geometry === "microstrip") {
    return microstripZ0({ ...fixed, widthMm });
  }
  if (geometry === "stripline") {
    return striplineZ0({ ...fixed, widthMm });
  }
  const f = fixed as FixedDiff;
  return diffPairImpedance({ ...f, widthMm }).zDiff;
}

export function solveWidth(
  geometry: "microstrip" | "stripline",
  targetZ0: number,
  fixed: FixedSingle,
): SolveWidthResult;
export function solveWidth(
  geometry: "diff",
  targetZ0: number,
  fixed: FixedDiff,
): SolveWidthResult;
export function solveWidth(
  geometry: Geometry,
  targetZ0: number,
  fixed: FixedSingle | FixedDiff,
): SolveWidthResult {
  // Newton's method using a numerical derivative (central difference).
  let widthMm = milToMm(10); // sensible starting point
  let iterations = 0;
  let converged = false;
  let lastZ = 0;

  for (let i = 0; i < NEWTON_MAX_ITERS; i++) {
    iterations++;
    const z = evalZ(geometry, widthMm, fixed);
    lastZ = z;
    const err = z - targetZ0;
    if (Math.abs(err) < TOLERANCE_OHMS) {
      converged = true;
      break;
    }
    // Numerical derivative dZ/dW
    const eps = Math.max(widthMm * 1e-4, 1e-6);
    const zPlus = evalZ(geometry, widthMm + eps, fixed);
    const dZdW = (zPlus - z) / eps;
    if (!isFinite(dZdW) || dZdW === 0) break;
    let next = widthMm - err / dZdW;
    // Keep search bounded to the realistic PCB width window.
    const minMm = milToMm(SCAN_MIN_MIL);
    const maxMm = milToMm(SCAN_MAX_MIL);
    if (next < minMm) next = minMm;
    if (next > maxMm) next = maxMm;
    if (Math.abs(next - widthMm) < 1e-9) {
      // Stuck at boundary; let bisection take over.
      break;
    }
    widthMm = next;
  }

  if (converged) {
    return { widthMm, iterations, converged: true, achievedZ0: lastZ };
  }

  // Fallback: linear scan over W ∈ [3, 50] mil step 0.5, pick closest.
  let bestW = widthMm;
  let bestZ = lastZ;
  let bestErr = Math.abs(lastZ - targetZ0);
  for (let mil = SCAN_MIN_MIL; mil <= SCAN_MAX_MIL + 1e-9; mil += SCAN_STEP_MIL) {
    iterations++;
    const w = milToMm(mil);
    const z = evalZ(geometry, w, fixed);
    const err = Math.abs(z - targetZ0);
    if (err < bestErr) {
      bestErr = err;
      bestW = w;
      bestZ = z;
    }
  }
  return {
    widthMm: bestW,
    iterations,
    converged: bestErr < TOLERANCE_OHMS,
    achievedZ0: bestZ,
  };
}
