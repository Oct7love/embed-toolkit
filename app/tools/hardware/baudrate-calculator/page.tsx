import type { Metadata } from "next";
import { ToolIntro } from "@/components/shared/tool-intro";

export const metadata: Metadata = {
  title: "工具开发中",
  description: "",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="工具开发中"
        description="该工具正在开发中..."
      />
    </div>
  );
}
