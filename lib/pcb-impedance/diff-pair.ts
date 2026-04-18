/* Source: Wadell, Transmission Line Design Handbook (1991), §3.5 (edge-coupled
 * microstrip differential pair). Approximation widely cited by IPC and used
 * by Polar SI9000 as a starting estimate:
 *
 *   Z_diff ≈ 2 * Z0_single * ( 1 - 0.48 * exp(-0.96 * S / H) )
 *
 * where Z0_single is the single-ended microstrip impedance of one trace and
 * S is edge-to-edge spacing. The exponential term captures the impedance
 * reduction from broadside coupling — vanishes as S/H → ∞.
 */

import type { DiffParams } from "@/types/pcb-impedance";
import { microstripZ0, microstripEpsEff } from "./microstrip";

export interface DiffResult {
  zSingle: number;
  zDiff: number;
  epsEff: number;
}

export function diffPairImpedance(p: DiffParams): DiffResult {
  const zSingle = microstripZ0({
    widthMm: p.widthMm,
    thicknessMm: p.thicknessMm,
    heightMm: p.heightMm,
    er: p.er,
  });
  const sOverH = p.heightMm > 0 ? p.spacingMm / p.heightMm : 0;
  const coupling = 0.48 * Math.exp(-0.96 * sOverH);
  const zDiff = 2 * zSingle * (1 - coupling);
  return {
    zSingle,
    zDiff,
    epsEff: microstripEpsEff(p.er),
  };
}
