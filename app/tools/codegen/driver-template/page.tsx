import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { DriverTemplate } from "@/components/tools/driver-template/driver-template";

export const metadata: Metadata = {
  title: "外设驱动模板生成器",
  description:
    "生成外设驱动脚手架（初始化 / 收发 / 中断框架），覆盖 STM32F1/F4/H7/G0/L4 + ESP32 常见 HAL/LL/ESP-IDF 场景。生成后需根据具体硬件和 RTOS 做少量适配。",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="外设驱动模板生成器"
        description="生成外设驱动脚手架（初始化 / 收发 / 中断框架），覆盖常见 HAL / LL / ESP-IDF 场景。HAL 路径成熟稳定；LL 与 ESP-IDF 路径提供骨架 + TODO 注释，需根据具体板卡、时钟、DMA 通道做少量适配。"
        example="选择 STM32F4 + SPI + Mode 0，得到 SPI_POLARITY_LOW / SPI_PHASE_1EDGE 的 spi1_driver.h/.c 脚手架，配合板卡的 GPIO 复用与 CS 引脚即可投入使用。"
      />
      <DriverTemplate />
    </div>
  );
}
