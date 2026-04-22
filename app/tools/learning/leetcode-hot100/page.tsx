import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolIntro } from "@/components/shared/tool-intro";
import { LeetcodeHot100 } from "@/components/tools/leetcode-hot100/leetcode-hot100";

export const metadata: Metadata = {
  title: "LeetCode Hot 100 刷题辅助",
  description:
    "LeetCode Hot 100 热门题的题型速览 + 核心思路 + C++/Python 参考代码，本地记录完成进度。题面请去官方站读原题",
};

export default function Page() {
  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <ToolIntro
        title="LeetCode Hot 100 刷题辅助"
        description="精选热门题的题型速览 + 核心思路 + C++/Python 参考代码。本地记录完成进度。**仅题型描述和解析，完整题面请点每题链接去 LeetCode 原站读原题并提交测评**。MVP 收录 10 题。"
        example="点进任一题 → 看类型描述和 3 段思路 → 切 C++ / Python 对比写法 → 去 LeetCode 原站实际提交 → 回来标记完成。"
      />
      <Suspense fallback={null}>
        <LeetcodeHot100 />
      </Suspense>
    </div>
  );
}
