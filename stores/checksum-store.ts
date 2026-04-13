import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChecksumAlgorithm, InputMode } from "@/types/checksum-calculator";

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
    }
  )
);
