"use client";

import { IEEE754Parser } from "@/components/tools/ieee754-parser/ieee754-parser";

export default function IEEE754ParserPage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">IEEE 754 浮点解析器</h1>
        <p className="text-muted-foreground mt-1">
          可视化拆解浮点数的符号位、指数位和尾数位，支持 Float32/Float64 和十六进制↔十进制互转
        </p>
      </div>
      <IEEE754Parser />
    </div>
  );
}
