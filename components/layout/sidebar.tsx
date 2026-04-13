"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { toolCategories } from "@/lib/tools-config";
import { useAppStore } from "@/stores/app-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsedCategories, toggleCategory } = useAppStore();

  return (
    <aside className="hidden lg:flex w-[260px] flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <Wrench className="h-5 w-5 text-primary" />
        <Link href="/" className="font-semibold text-lg">
          Embed Toolkit
        </Link>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="px-2">
          {toolCategories.map((category) => {
            const isCollapsed = sidebarCollapsedCategories.includes(
              category.slug
            );
            const CategoryIcon = category.icon;

            return (
              <div key={category.slug} className="mb-1">
                <button
                  onClick={() => toggleCategory(category.slug)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">{category.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </button>

                {!isCollapsed && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {category.tools.map((tool) => {
                      const toolPath = `/tools/${category.slug}/${tool.slug}`;
                      const isActive = pathname === toolPath;
                      const ToolIcon = tool.icon;

                      return (
                        <Link
                          key={tool.slug}
                          href={toolPath}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <ToolIcon className="h-3.5 w-3.5" />
                          <span className="truncate">{tool.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
