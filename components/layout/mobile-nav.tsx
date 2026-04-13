"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { toolCategories } from "@/lib/tools-config";

const mobileLabels: Record<string, string> = {
  converter: "转换",
  protocol: "协议",
  hardware: "硬件",
  rtos: "RTOS",
  codegen: "代码",
  learning: "题库",
};

export function MobileNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-bottom">
      <div className="flex items-stretch justify-around h-16">
        {/* 首页按钮 */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[48px] px-1",
            isHome
              ? "text-primary"
              : "text-muted-foreground active:text-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] leading-none font-medium">首页</span>
        </Link>

        {/* 6 个分类 */}
        {toolCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isActive =
            !isHome && pathname.startsWith(`/tools/${category.slug}`);

          return (
            <Link
              key={category.slug}
              href={`/tools/${category.slug}/${category.tools[0].slug}`}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[48px] px-1",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <CategoryIcon className="h-5 w-5" />
              <span className="text-[10px] leading-none font-medium">
                {mobileLabels[category.slug] ?? category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
