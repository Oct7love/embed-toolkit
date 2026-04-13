"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toolCategories, getAllTools } from "@/lib/tools-config";
import { useAppStore } from "@/stores/app-store";

const priorityColor = {
  P0: "bg-primary text-primary-foreground",
  P1: "bg-secondary text-secondary-foreground",
  P2: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const { recentTools, addRecentTool } = useAppStore();
  const allTools = useMemo(() => getAllTools(), []);

  const filteredTools = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [search, allTools]);

  const handleToolClick = (tool: {
    slug: string;
    name: string;
    categorySlug: string;
    category: string;
  }) => {
    addRecentTool({
      path: `/tools/${tool.categorySlug}/${tool.slug}`,
      name: tool.name,
      category: tool.category,
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* 搜索栏 */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索工具..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 text-base"
        />
      </div>

      {/* 搜索结果 */}
      {filteredTools !== null ? (
        <section>
          <h2 className="text-lg font-semibold mb-4">
            搜索结果（{filteredTools.length}）
          </h2>
          {filteredTools.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              没有找到匹配的工具
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  categorySlug={tool.categorySlug}
                  onClick={() => handleToolClick(tool)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 最近使用 */}
          {recentTools.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">最近使用</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {recentTools.slice(0, 5).map((rt) => {
                  const tool = allTools.find(
                    (t) =>
                      `/tools/${t.categorySlug}/${t.slug}` === rt.path
                  );
                  if (!tool) return null;
                  return (
                    <Link
                      key={rt.path}
                      href={rt.path}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <tool.icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">{rt.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 分类工具卡片 */}
          {toolCategories.map((category) => (
            <section key={category.slug}>
              <div className="flex items-center gap-2 mb-4">
                <category.icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{category.name}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.tools.map((tool) => (
                  <ToolCard
                    key={tool.slug}
                    tool={tool}
                    categorySlug={category.slug}
                    onClick={() =>
                      handleToolClick({
                        ...tool,
                        categorySlug: category.slug,
                        category: category.name,
                      })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function ToolCard({
  tool,
  categorySlug,
  onClick,
}: {
  tool: {
    name: string;
    slug: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    priority: "P0" | "P1" | "P2";
  };
  categorySlug: string;
  onClick: () => void;
}) {
  const Icon = tool.icon;

  return (
    <Link href={`/tools/${categorySlug}/${tool.slug}`} onClick={onClick}>
      <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            <Badge
              variant="outline"
              className={priorityColor[tool.priority]}
            >
              {tool.priority}
            </Badge>
          </div>
          <CardTitle className="text-base mt-3">{tool.name}</CardTitle>
          <CardDescription className="text-sm">
            {tool.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
