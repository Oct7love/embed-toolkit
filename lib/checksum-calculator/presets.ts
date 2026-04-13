import type { CRCPreset } from "@/types/checksum-calculator";

export const CRC_PRESETS: CRCPreset[] = [
  // CRC-8
  {
    name: "CRC-8",
    width: 8,
    polynomial: 0x07,
    init: 0x00,
    refIn: false,
    refOut: false,
    xorOut: 0x00,
  },
  {
    name: "CRC-8/MAXIM",
    width: 8,
    polynomial: 0x31,
    init: 0x00,
    refIn: true,
    refOut: true,
    xorOut: 0x00,
  },
  // CRC-16
  {
    name: "CRC-16/MODBUS",
    width: 16,
    polynomial: 0x8005,
    init: 0xffff,
    refIn: true,
    refOut: true,
    xorOut: 0x0000,
  },
  {
    name: "CRC-16/CCITT-FALSE",
    width: 16,
    polynomial: 0x1021,
    init: 0xffff,
    refIn: false,
    refOut: false,
    xorOut: 0x0000,
  },
  {
    name: "CRC-16/XMODEM",
    width: 16,
    polynomial: 0x1021,
    init: 0x0000,
    refIn: false,
    refOut: false,
    xorOut: 0x0000,
  },
  {
    name: "CRC-16/USB",
    width: 16,
    polynomial: 0x8005,
    init: 0xffff,
    refIn: true,
    refOut: true,
    xorOut: 0xffff,
  },
  {
    name: "CRC-16/IBM",
    width: 16,
    polynomial: 0x8005,
    init: 0x0000,
    refIn: true,
    refOut: true,
    xorOut: 0x0000,
  },
  // CRC-32
  {
    name: "CRC-32",
    width: 32,
    polynomial: 0x04c11db7,
    init: 0xffffffff,
    refIn: true,
    refOut: true,
    xorOut: 0xffffffff,
  },
  {
    name: "CRC-32/MPEG-2",
    width: 32,
    polynomial: 0x04c11db7,
    init: 0xffffffff,
    refIn: false,
    refOut: false,
    xorOut: 0x00000000,
  },
];

export function getPresetByName(name: string): CRCPreset | undefined {
  return CRC_PRESETS.find((p) => p.name === name);
}
