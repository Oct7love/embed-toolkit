import { ChecksumCalculator } from "@/components/tools/checksum-calculator/checksum-calculator";

export default function ChecksumCalculatorPage() {
  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">校验和计算器</h1>
        <p className="text-sm text-muted-foreground">
          支持 CRC-8/16/32、XOR 校验、累加和，可自定义 CRC 参数
        </p>
      </div>
      <ChecksumCalculator />
    </div>
  );
}
