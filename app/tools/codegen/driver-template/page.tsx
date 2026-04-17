import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";
import { DriverTemplate } from "@/components/tools/driver-template/driver-template";

export const metadata: Metadata = {
  title: "外设驱动模板生成器",
  description:
    "按 MCU 系列（STM32F1/F4/H7/G0/L4、ESP32）与外设（UART/SPI/I2C/ADC/TIM/PWM）生成可编译的 .h/.c 驱动模板，支持 HAL/LL/Arduino 风格",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="外设驱动模板生成器"
        description="按 MCU 系列与外设类型一键生成可编译的 .h / .c 驱动模板，STM32 走 HAL/LL，ESP32 走 ESP-IDF/Arduino。常见陷阱以注释形式嵌入。"
        example="选择 STM32F4 + SPI + Mode 0，立即得到 SPI_POLARITY_LOW / SPI_PHASE_1EDGE 的完整 spi1_driver.h/.c，复制粘贴即可编译。"
      />
      <DriverTemplate />
    </div>
  );
}
