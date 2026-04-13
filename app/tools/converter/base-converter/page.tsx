import type { Metadata } from "next";
import { BaseConverter } from "@/components/tools/base-converter/base-converter";

export const metadata: Metadata = {
  title: "进制转换器",
  description: "Hex/Bin/Dec/Oct 四进制实时联动互转，支持有符号整数和批量模式",
};

export default function BaseConverterPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <BaseConverter />
    </div>
  );
}
