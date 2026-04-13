"use client";

import Link from "next/link";
import { Menu, Moon, Sun, Wrench } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-50 flex items-center h-14 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <button
        onClick={toggleSidebar}
        className="lg:hidden mr-3"
        aria-label="打开菜单"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link
        href="/"
        className="lg:hidden flex items-center gap-2 font-semibold"
      >
        <Wrench className="h-5 w-5 text-primary" />
        <span>Embed Toolkit</span>
      </Link>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="切换主题"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    </header>
  );
}
