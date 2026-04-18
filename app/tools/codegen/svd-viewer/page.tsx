import type { Metadata } from "next";
import { SvdViewer } from "@/components/tools/svd-viewer/svd-viewer";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "CMSIS-SVD 查看器",
  description: "上传或粘贴 CMSIS-SVD 文件，可视化 STM32 / Espressif 等芯片寄存器位域",
};

export default function SvdViewerPage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <ToolIntro
        title="CMSIS-SVD 查看器"
        description="粘贴或上传 CMSIS-SVD 文件，可视化 STM32 / Espressif 等芯片的寄存器位域。纯前端解析，文件不上传到任何服务器。文件大小上限 10MB。"
        example={`不知道某个 STM32 寄存器某 bit 的含义？加载芯片厂商的 .svd 文件，按名字搜索 register 或 field，立即看到位域布局和复位值。`}
      />
      <SvdViewer />
    </div>
  );
}
