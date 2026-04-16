import type { MemorySection, MemoryType, SectionType } from "@/types/memory-layout";
import { SECTION_COLORS } from "@/types/memory-layout";

/**
 * Parse a GCC linker .map file and extract memory sections.
 *
 * Looks for patterns like:
 *   .text           0x08000000    0x1a3c
 *   .rodata         0x0800xxxx    0xxxx
 *   .data           0x20000000    0xxxx
 *   .bss            0x200xxxxx    0xxxx
 *
 * Also attempts to detect _estack, _Min_Heap_Size, _Min_Stack_Size.
 */
export function parseMapFile(content: string): MemorySection[] {
  const sections: MemorySection[] = [];
  const lines = content.split("\n");

  // Pattern 1: Standard section output lines
  // .text           0x08000000    0x1a3c
  const sectionPattern =
    /^(\.\w+)\s+(0x[0-9a-fA-F]+)\s+(0x[0-9a-fA-F]+)/;

  // Pattern 2: Section with size on same line (GNU ld output)
  // *(.text)
  //                 0x08000000       0x1a3c  startup.o
  const addressSizePattern =
    /^\s+(0x[0-9a-fA-F]+)\s+(0x[0-9a-fA-F]+)/;

  let currentSectionName = "";
  let idCounter = 0;

  for (const line of lines) {
    // Try direct section match
    const sectionMatch = line.match(sectionPattern);
    if (sectionMatch) {
      const name = sectionMatch[1];
      const addr = parseInt(sectionMatch[2], 16);
      const size = parseInt(sectionMatch[3], 16);

      if (size > 0) {
        const sectionType = mapNameToType(name);
        const memType = inferMemoryType(addr);

        sections.push({
          id: `parsed-${idCounter++}`,
          name,
          type: sectionType,
          startAddress: addr,
          size,
          memoryType: memType,
          color: SECTION_COLORS[sectionType],
        });
      }
      currentSectionName = name;
      continue;
    }

    // Track current section name from headers like:
    // .text           0x00000000       0x0
    const headerPattern = /^(\.\w+)\s/;
    const headerMatch = line.match(headerPattern);
    if (headerMatch) {
      currentSectionName = headerMatch[1];
    }

    // Try address+size pattern for sub-entries
    if (currentSectionName && !sectionMatch) {
      const subMatch = line.match(addressSizePattern);
      if (subMatch) {
        // We already captured the main section; skip sub-entries
      }
    }
  }

  // Try to extract heap/stack from symbol definitions
  const heapSize = extractSymbolValue(content, "_Min_Heap_Size");
  const stackSize = extractSymbolValue(content, "_Min_Stack_Size");
  const stackTop = extractSymbolValue(content, "_estack");

  // Place heap/stack after the last RAM section
  const lastRamSection = sections
    .filter((s) => s.memoryType === "ram")
    .sort((a, b) => (a.startAddress + a.size) - (b.startAddress + b.size))
    .pop();

  const heapStart = lastRamSection
    ? lastRamSection.startAddress + lastRamSection.size
    : 0x20000000;

  if (heapSize && heapSize > 0) {
    sections.push({
      id: `parsed-${idCounter++}`,
      name: "Heap",
      type: "heap",
      startAddress: heapStart,
      size: heapSize,
      memoryType: "ram",
      color: SECTION_COLORS.heap,
    });
  }

  if (stackSize && stackSize > 0 && stackTop) {
    sections.push({
      id: `parsed-${idCounter++}`,
      name: "Stack",
      type: "stack",
      startAddress: stackTop - stackSize,
      size: stackSize,
      memoryType: "ram",
      color: SECTION_COLORS.stack,
    });
  }

  return sections;
}

function mapNameToType(name: string): SectionType {
  const lower = name.toLowerCase();
  if (lower.includes("text") || lower.includes("isr_vector")) return "text";
  if (lower.includes("rodata")) return "rodata";
  if (lower.includes("data") && !lower.includes("bss")) return "data";
  if (lower.includes("bss")) return "bss";
  if (lower.includes("heap")) return "heap";
  if (lower.includes("stack")) return "stack";
  if (lower.includes("vector")) return "vector";
  return "custom";
}

function inferMemoryType(address: number): MemoryType {
  // Common ARM memory map:
  // Flash: 0x08000000 - 0x080FFFFF
  // RAM:   0x20000000 - 0x2001FFFF
  if (address >= 0x20000000 && address < 0x40000000) return "ram";
  return "flash";
}

function extractSymbolValue(content: string, symbol: string): number | null {
  // Matches patterns like:
  //   0x00000200                _Min_Heap_Size = 0x200
  //   _Min_Heap_Size = 0x200;
  const patterns = [
    new RegExp(`${symbol}\\s*=\\s*(0x[0-9a-fA-F]+)`, "i"),
    new RegExp(`(0x[0-9a-fA-F]+)\\s+${symbol}\\b`, "i"),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1], 16);
    }
  }
  return null;
}
