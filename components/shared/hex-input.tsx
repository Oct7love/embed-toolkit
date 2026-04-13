"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HexInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

function formatHex(raw: string): string {
  const clean = raw.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  return clean.replace(/(.{2})(?=.)/g, "$1 ");
}

function isValidHexChar(char: string): boolean {
  return /^[0-9a-fA-F\s]$/.test(char);
}

export function HexInput({
  value,
  onChange,
  placeholder = "输入 hex 数据，如 AA BB CC",
  className,
  label,
}: HexInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "" || raw.split("").every((c) => isValidHexChar(c))) {
        onChange(formatHex(raw));
      }
    },
    [onChange]
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="font-mono"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
