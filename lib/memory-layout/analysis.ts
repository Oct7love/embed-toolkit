import type {
  MemorySection,
  MemoryType,
  MemoryStats,
  OverlapWarning,
} from "@/types/memory-layout";

/**
 * Compute usage statistics for a given memory region type.
 */
export function computeMemoryStats(
  sections: MemorySection[],
  memoryType: MemoryType,
  totalSize: number
): MemoryStats {
  const filtered = sections.filter((s) => s.memoryType === memoryType);
  const usedSize = filtered.reduce((sum, s) => sum + s.size, 0);
  const freeSize = Math.max(0, totalSize - usedSize);
  const usagePercent = totalSize > 0 ? (usedSize / totalSize) * 100 : 0;

  return { totalSize, usedSize, freeSize, usagePercent };
}

/**
 * Detect overlapping memory sections within the same memory type.
 */
export function detectOverlaps(sections: MemorySection[]): OverlapWarning[] {
  const warnings: OverlapWarning[] = [];

  for (const memType of ["flash", "ram"] as MemoryType[]) {
    const filtered = sections
      .filter((s) => s.memoryType === memType)
      .sort((a, b) => a.startAddress - b.startAddress);

    for (let i = 0; i < filtered.length; i++) {
      for (let j = i + 1; j < filtered.length; j++) {
        const a = filtered[i];
        const b = filtered[j];

        const aEnd = a.startAddress + a.size;
        const bEnd = b.startAddress + b.size;

        if (a.startAddress < bEnd && b.startAddress < aEnd) {
          const overlapStart = Math.max(a.startAddress, b.startAddress);
          const overlapEnd = Math.min(aEnd, bEnd);

          warnings.push({
            sectionA: a.name,
            sectionB: b.name,
            overlapStart,
            overlapEnd,
          });
        }
      }
    }
  }

  return warnings;
}

/**
 * Sort sections by start address within each memory type.
 */
export function sortSectionsByAddress(
  sections: MemorySection[]
): MemorySection[] {
  return [...sections].sort((a, b) => {
    if (a.memoryType !== b.memoryType) {
      return a.memoryType === "flash" ? -1 : 1;
    }
    return a.startAddress - b.startAddress;
  });
}
