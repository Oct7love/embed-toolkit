import type { Metadata } from "next";
import { EndianConverter } from "@/components/tools/endian-converter/endian-converter";

export const metadata: Metadata = {
  title: "字节序转换器",
  description: "Big-Endian / Little-Endian 一键互转，支持 16/32/64 位宽度",
};

export default function EndianConverterPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <EndianConverter />
    </div>
  );
}
