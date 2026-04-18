"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SvdParsed, SvdPeripheral, SvdRegister } from "@/types/svd-viewer";

export interface SelectedRef {
  peripheralName: string;
  registerName: string;
}

interface PeripheralTreeProps {
  parsed: SvdParsed;
  selected: SelectedRef | null;
  onSelect: (ref: SelectedRef) => void;
  /** 命中关键字（小写已处理）。命中的 register / peripheral 高亮显示 */
  query: string;
  /** 命中的 (peripheral, register) 集合，用于高亮 */
  highlighted: Set<string>;
}

function regKey(p: string, r: string) {
  return `${p}/${r}`;
}

export function PeripheralTree({
  parsed,
  selected,
  onSelect,
  query,
  highlighted,
}: PeripheralTreeProps) {
  // 默认折叠所有 peripheral；命中搜索时自动展开命中项
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const autoExpanded = useMemo(() => {
    if (query.trim() === "") return expanded;
    const e = new Set(expanded);
    for (const p of parsed.peripherals) {
      for (const r of p.registers) {
        if (highlighted.has(regKey(p.name, r.name))) e.add(p.name);
      }
    }
    return e;
  }, [expanded, query, parsed.peripherals, highlighted]);

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (parsed.peripherals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground text-sm p-6 gap-2">
        <Microscope className="h-6 w-6 opacity-40" />
        <p>未发现任何 peripheral</p>
      </div>
    );
  }

  return (
    <ul className="text-sm font-mono space-y-0.5" role="tree">
      {parsed.peripherals.map((p) => (
        <PeripheralNode
          key={p.name}
          peripheral={p}
          isExpanded={autoExpanded.has(p.name)}
          onToggle={() => toggle(p.name)}
          selected={selected}
          onSelect={onSelect}
          highlighted={highlighted}
        />
      ))}
    </ul>
  );
}

function PeripheralNode({
  peripheral,
  isExpanded,
  onToggle,
  selected,
  onSelect,
  highlighted,
}: {
  peripheral: SvdPeripheral;
  isExpanded: boolean;
  onToggle: () => void;
  selected: SelectedRef | null;
  onSelect: (ref: SelectedRef) => void;
  highlighted: Set<string>;
}) {
  const periHighlighted = peripheral.registers.some((r) =>
    highlighted.has(regKey(peripheral.name, r.name))
  );

  return (
    <li role="treeitem" aria-expanded={isExpanded}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1 w-full text-left px-1.5 py-1 rounded hover:bg-muted",
          periHighlighted && "bg-primary/10"
        )}
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="font-semibold truncate">{peripheral.name}</span>
        <span className="text-xs text-muted-foreground ml-auto shrink-0">
          0x{peripheral.baseAddress.toString(16).toUpperCase()}
        </span>
      </button>
      {isExpanded && (
        <ul className="pl-5 mt-0.5 space-y-0.5" role="group">
          {peripheral.registers.map((r) => (
            <RegisterNode
              key={r.name}
              register={r}
              peripheralName={peripheral.name}
              selected={selected}
              onSelect={onSelect}
              isHighlighted={highlighted.has(regKey(peripheral.name, r.name))}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function RegisterNode({
  register,
  peripheralName,
  selected,
  onSelect,
  isHighlighted,
}: {
  register: SvdRegister;
  peripheralName: string;
  selected: SelectedRef | null;
  onSelect: (ref: SelectedRef) => void;
  isHighlighted: boolean;
}) {
  const isSelected =
    selected?.peripheralName === peripheralName &&
    selected.registerName === register.name;

  return (
    <li role="treeitem">
      <button
        type="button"
        onClick={() =>
          onSelect({ peripheralName, registerName: register.name })
        }
        className={cn(
          "flex items-center gap-2 w-full text-left px-1.5 py-1 rounded hover:bg-muted text-xs",
          isSelected && "bg-primary text-primary-foreground hover:bg-primary",
          !isSelected && isHighlighted && "bg-primary/15"
        )}
      >
        <span className="truncate">{register.name}</span>
        <span
          className={cn(
            "ml-auto text-[10px] shrink-0",
            isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          +0x{register.addressOffset.toString(16).toUpperCase()}
        </span>
      </button>
    </li>
  );
}
