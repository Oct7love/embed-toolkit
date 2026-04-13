"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { toolCategories } from "@/lib/tools-config";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-14 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {toolCategories.map((category) => {
        const CategoryIcon = category.icon;
        const isActive = pathname.startsWith(`/tools/${category.slug}`);

        return (
          <Link
            key={category.slug}
            href={`/tools/${category.slug}/${category.tools[0].slug}`}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CategoryIcon className="h-5 w-5" />
            <span className="truncate max-w-[56px]">
              {category.name.replace("工具", "").replace("与", "/")}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
