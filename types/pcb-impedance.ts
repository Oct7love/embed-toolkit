/**
 * PCB impedance calculator types.
 *
 * All internal calculations use millimeters (mm). The UI layer is responsible
 * for translating mil <-> mm for display.
 */

export type LengthUnit = "mil" | "mm";

export type Geometry = "microstrip" | "stripline" | "diff";

/** 1 mil = 0.0254 mm. Use this constant everywhere; never hard-code. */
export const MIL_TO_MM = 0.0254;

/** Convert mil -> mm. */
export function milToMm(mil: number): number {
  return mil * MIL_TO_MM;
}

/** Convert mm -> mil. */
export function mmToMil(mm: number): number {
  return mm / MIL_TO_MM;
}

/**
 * Microstrip / stripline single-ended geometry parameters (all mm).
 *   W = trace width
 *   T = trace (copper) thickness
 *   H = dielectric height between trace and reference plane
 *  er = relative permittivity of dielectric (FR-4 ≈ 4.5)
 */
export interface SingleEndedParams {
  widthMm: number;
  thicknessMm: number;
  heightMm: number;
  er: number;
}

/**
 * Differential pair geometry parameters (edge-coupled microstrip-style, mm).
 *   W = trace width
 *   S = edge-to-edge spacing between the two traces
 *   T = trace thickness
 *   H = dielectric height
 *  er = relative permittivity
 */
export interface DiffParams extends SingleEndedParams {
  spacingMm: number;
}

/** Result of a forward impedance calculation. */
export interface ImpedanceResult {
  /** Characteristic impedance (Ω). For diff pairs, Z0 is single-ended; zDiff is the differential. */
  z0: number;
  /** Differential impedance (Ω). Only meaningful for diff geometry. */
  zDiff?: number;
  /** Effective relative permittivity. */
  epsEff: number;
  /** Propagation delay in picoseconds per inch (ps/in). */
  propDelayPsPerInch: number;
  /** Non-blocking warnings (out-of-range parameters etc). */
  warnings: string[];
}

/** Result of a reverse-solve (target Z0 -> trace width). */
export interface SolveWidthResult {
  /** Solved trace width (mm). */
  widthMm: number;
  /** Number of iterations consumed (Newton steps + bisection sweep). */
  iterations: number;
  /** True if Newton converged within tolerance; false if it fell back to scan. */
  converged: boolean;
  /** Achieved Z0 at the returned width (Ω). */
  achievedZ0: number;
}
