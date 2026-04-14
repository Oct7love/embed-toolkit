export type MemoryType = "flash" | "ram";

export type SectionType =
  | "text"
  | "data"
  | "bss"
  | "heap"
  | "stack"
  | "rodata"
  | "vector"
  | "custom";

export interface MemorySection {
  id: string;
  name: string;
  type: SectionType;
  startAddress: number;
  size: number;
  memoryType: MemoryType;
  color: string;
}

export interface MemoryRegion {
  type: MemoryType;
  label: string;
  startAddress: number;
  totalSize: number;
  sections: MemorySection[];
}

export interface OverlapWarning {
  sectionA: string;
  sectionB: string;
  overlapStart: number;
  overlapEnd: number;
}

export interface MemoryStats {
  totalSize: number;
  usedSize: number;
  freeSize: number;
  usagePercent: number;
}

export const SECTION_COLORS: Record<SectionType, string> = {
  text: "#3B82F6",
  rodata: "#06B6D4",
  data: "#22C55E",
  bss: "#F97316",
  heap: "#A855F7",
  stack: "#EF4444",
  vector: "#F59E0B",
  custom: "#6B7280",
};

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  text: ".text (Code)",
  rodata: ".rodata (Read-only Data)",
  data: ".data (Initialized Data)",
  bss: ".bss (Uninitialized Data)",
  heap: "Heap",
  stack: "Stack",
  vector: "Vector Table",
  custom: "Custom",
};

export const DEFAULT_FLASH_START = 0x08000000;
export const DEFAULT_FLASH_SIZE = 512 * 1024; // 512KB
export const DEFAULT_RAM_START = 0x20000000;
export const DEFAULT_RAM_SIZE = 128 * 1024; // 128KB
