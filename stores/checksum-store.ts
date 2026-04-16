import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChecksumAlgorithm, InputMode } from "@/types/checksum-calculator";
import { isRecord, makeSafeMerge } from "./_schema-guards";

const VALID_ALGORITHMS = ["crc", "xor", "sum"];
const VALID_MODES = ["hex", "ascii"];

interface ChecksumState {
  algorithm: ChecksumAlgorithm;
  crcPreset: string;
  inputMode: InputMode;

  setAlgorithm: (algorithm: ChecksumAlgorithm) => void;
  setCrcPreset: (preset: string) => void;
  setInputMode: (mode: InputMode) => void;
}

export const useChecksumStore = create<ChecksumState>()(
  persist(
    (set) => ({
      algorithm: "crc",
      crcPreset: "CRC-16/MODBUS",
      inputMode: "hex",

      setAlgorithm: (algorithm) => set({ algorithm }),
      setCrcPreset: (crcPreset) => set({ crcPreset }),
      setInputMode: (inputMode) => set({ inputMode }),
    }),
    {
      name: "embed-toolkit-checksum",
      merge: makeSafeMerge<ChecksumState>((p) => {
        if (!isRecord(p)) return null;
        return {
          algorithm: VALID_ALGORITHMS.includes(p.algorithm as string)
            ? (p.algorithm as ChecksumAlgorithm)
            : "crc",
          crcPreset: typeof p.crcPreset === "string" ? p.crcPreset : "CRC-16/MODBUS",
          inputMode: VALID_MODES.includes(p.inputMode as string)
            ? (p.inputMode as InputMode)
            : "hex",
        };
      }),
    }
  )
);
