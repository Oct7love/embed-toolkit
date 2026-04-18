import { Suspense } from "react";
import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { McuCompare } from "@/components/tools/mcu-compare/mcu-compare";

export const metadata: Metadata = {
  title: "MCU 选型对比器",
  description:
    "并排对比已收录芯片的核心规格（CPU / 主频 / Flash / RAM / 外设 / 卖点），雷达图与差异表格",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="MCU 选型对比器"
        description="对比已收录芯片的核心规格（CPU / 主频 / Flash / RAM / 外设 / 卖点）。数据收录手工填写、可能不全也可能过时；价格仅标参考定位段（$/$$/$$$）。精确选型请回查官方 datasheet。"
        example="勾选 STM32F103C8T6、STM32F407VGT6、ESP32-WROOM-32 三款，雷达图直观看出性能/Flash/RAM/外设的相对大小，差异表格高亮 USB / Ethernet / 主频等关键差异。URL 自动同步，可直接分享。"
      />
      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">加载中...</div>
        }
      >
        <McuCompare />
      </Suspense>
    </div>
  );
}
