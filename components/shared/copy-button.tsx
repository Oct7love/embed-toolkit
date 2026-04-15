"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "default" | "sm" | "icon";
  label?: string;
}

export function CopyButton({
  value,
  className,
  size = "icon",
  label = "复制",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [value]);

  // 组件卸载时清理 timer，避免对已卸载组件 setState
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size={size}
            onClick={handleCopy}
            className={cn("shrink-0", className)}
            aria-label={copied ? "已复制" : label}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {size !== "icon" && (
              <span className="ml-1.5">{copied ? "已复制" : label}</span>
            )}
          </Button>
        }
      />
      <TooltipContent>{copied ? "已复制!" : label}</TooltipContent>
    </Tooltip>
  );
}
