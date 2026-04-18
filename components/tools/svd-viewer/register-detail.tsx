"use client";

import { Badge } from "@/components/ui/badge";
import { BitGrid } from "@/components/shared/bit-grid";
import type { SvdRegister } from "@/types/svd-viewer";
import type { FieldBarSegment } from "@/lib/svd-viewer";

export function RegisterDetail({
  peripheralName,
  register,
  bitGridFields,
}: {
  peripheralName: string;
  register: SvdRegister;
  bitGridFields: FieldBarSegment[] | undefined;
}) {
  const width = (register.size === 8 || register.size === 16 ? register.size : 32) as
    | 8
    | 16
    | 32;
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground">
          {peripheralName} ·
        </span>
        <h3 className="text-base font-semibold font-mono">{register.name}</h3>
        <Badge variant="outline" className="font-mono text-xs">
          +0x{register.addressOffset.toString(16).toUpperCase()}
        </Badge>
        <Badge variant="outline" className="font-mono text-xs">
          reset = 0x{register.resetValue.toString(16).toUpperCase().padStart(8, "0")}
        </Badge>
      </div>
      {register.description && (
        <p className="text-xs text-muted-foreground">{register.description}</p>
      )}
      <BitGrid
        value={register.resetValue >>> 0}
        width={width}
        readOnly
        fields={bitGridFields}
      />
      {register.fields.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-2 py-1.5">名称</th>
                <th className="px-2 py-1.5">位域</th>
                <th className="px-2 py-1.5 font-sans">描述</th>
              </tr>
            </thead>
            <tbody>
              {register.fields.map((f) => {
                const high = f.bitOffset + f.bitWidth - 1;
                return (
                  <tr key={f.name} className="border-t">
                    <td className="px-2 py-1.5 font-semibold">{f.name}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      [{high}:{f.bitOffset}]
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground font-sans">
                      {f.description ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">该寄存器未声明 field</p>
      )}
    </div>
  );
}
