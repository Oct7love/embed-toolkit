export type BandCount = 4 | 5 | 6;

export type ColorName =
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "grey"
  | "white"
  | "gold"
  | "silver";

export interface ColorInfo {
  name: ColorName;
  label: string;
  hex: string;
  digit?: number;
  multiplier?: number;
  tolerance?: number;
  tempCoeff?: number;
}

export interface ResistorResult {
  resistance: number;
  tolerance: number;
  formattedResistance: string;
  formattedTolerance: string;
  minResistance: number;
  maxResistance: number;
  tempCoeff?: number;
}

export interface ReverseLookupResult {
  bands: ColorName[];
  bandCount: BandCount;
  exactMatch: boolean;
  nearestE24: number;
  formattedE24: string;
}
