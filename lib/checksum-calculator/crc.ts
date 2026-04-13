import type { CRCPreset } from "@/types/checksum-calculator";

function reflectBits(value: number, width: number): number {
  let reflected = 0;
  for (let i = 0; i < width; i++) {
    if (value & (1 << i)) {
      reflected |= 1 << (width - 1 - i);
    }
  }
  return reflected >>> 0;
}

function buildCRCTable(polynomial: number, width: 8 | 16 | 32): number[] {
  const table: number[] = new Array(256);
  const topBit = 1 << (width - 1);
  const mask = width === 32 ? 0xffffffff : (1 << width) - 1;

  for (let i = 0; i < 256; i++) {
    let crc = i << (width - 8);
    for (let j = 0; j < 8; j++) {
      if (crc & topBit) {
        crc = ((crc << 1) ^ polynomial) & mask;
      } else {
        crc = (crc << 1) & mask;
      }
    }
    table[i] = crc >>> 0;
  }
  return table;
}

export function calculateCRC(data: Uint8Array, preset: CRCPreset): number {
  const { width, polynomial, init, refIn, refOut, xorOut } = preset;
  const mask = width === 32 ? 0xffffffff : (1 << width) - 1;
  const table = buildCRCTable(polynomial, width);

  let crc = init & mask;

  for (let i = 0; i < data.length; i++) {
    const byte = refIn ? reflectBits(data[i], 8) : data[i];
    const index = ((crc >>> (width - 8)) ^ byte) & 0xff;
    crc = ((crc << 8) ^ table[index]) & mask;
  }

  if (refOut) {
    crc = reflectBits(crc, width);
  }

  return (crc ^ xorOut) >>> 0;
}

export function calculateXOR(data: Uint8Array): number {
  let result = 0;
  for (let i = 0; i < data.length; i++) {
    result ^= data[i];
  }
  return result;
}

export function calculateSum(data: Uint8Array): number {
  let result = 0;
  for (let i = 0; i < data.length; i++) {
    result = (result + data[i]) & 0xff;
  }
  return result;
}
