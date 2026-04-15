import type { Metadata } from "next";
import { AsciiTable } from "@/components/tools/ascii-table/ascii-table";

export const metadata: Metadata = {
  title: "ASCII/编码对照表",
  description: "完整 ASCII 码表和常用 Unicode 速查，支持搜索和点击复制",
};

export default function AsciiTablePage() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">ASCII/编码对照表</h1>
        <p className="text-muted-foreground mt-1">
          完整 ASCII 码表和常用 Unicode 速查，支持搜索和点击复制
        </p>
      </div>
      <AsciiTable />
    </div>
  );
}
