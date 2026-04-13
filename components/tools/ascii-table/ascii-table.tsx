"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateAsciiTable, filterAsciiEntries } from "@/lib/ascii-table";
import type { AsciiEntry } from "@/types/ascii-table";
import { Search, Table, Check } from "lucide-react";

export function AsciiTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");

  const allEntries = useMemo(() => generateAsciiTable(), []);
  const filteredEntries = useMemo(
    () => filterAsciiEntries(allEntries, searchQuery),
    [allEntries, searchQuery]
  );

  const handleCopy = useCallback(
    async (entry: AsciiEntry, field: string, value: string) => {
      await navigator.clipboard.writeText(value);
      setCopiedCode(entry.code);
      setCopiedField(field);
      setTimeout(() => {
        setCopiedCode(null);
        setCopiedField("");
      }, 1500);
    },
    []
  );

  const isCopied = (code: number, field: string) =>
    copiedCode === code && copiedField === field;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                ASCII/编码对照表
              </CardTitle>
              <CardDescription>
                完整 ASCII 码表 (0-127)，点击任意单元格一键复制，支持搜索过滤
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredEntries.length} / 128 条
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card size="sm">
        <CardContent className="pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索：输入字符、十进制、十六进制 (0xFF) 或描述..."
              className="pl-8 font-mono"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Dec
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Hex
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    Oct
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    字符
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                    描述
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.code}
                    className={`border-b last:border-0 transition-colors hover:bg-muted/50 ${
                      entry.isControl ? "bg-muted/20" : ""
                    }`}
                  >
                    <CopyableCell
                      value={String(entry.code)}
                      copied={isCopied(entry.code, "dec")}
                      onCopy={() =>
                        handleCopy(entry, "dec", String(entry.code))
                      }
                      mono
                    />
                    <CopyableCell
                      value={`0x${entry.hex}`}
                      copied={isCopied(entry.code, "hex")}
                      onCopy={() =>
                        handleCopy(entry, "hex", `0x${entry.hex}`)
                      }
                      mono
                    />
                    <CopyableCell
                      value={entry.oct}
                      copied={isCopied(entry.code, "oct")}
                      onCopy={() =>
                        handleCopy(entry, "oct", entry.oct)
                      }
                      mono
                    />
                    <CopyableCell
                      value={entry.char}
                      copied={isCopied(entry.code, "char")}
                      onCopy={() =>
                        handleCopy(
                          entry,
                          "char",
                          entry.isControl ? entry.char : String.fromCharCode(entry.code)
                        )
                      }
                      mono
                      highlight={entry.isControl}
                    />
                    <CopyableCell
                      value={entry.description}
                      copied={isCopied(entry.code, "desc")}
                      onCopy={() =>
                        handleCopy(entry, "desc", entry.description)
                      }
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              未找到匹配的 ASCII 字符
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** 可点击复制的表格单元格 */
function CopyableCell({
  value,
  copied,
  onCopy,
  mono = false,
  highlight = false,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <td className="px-3 py-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onCopy}
              className={`inline-flex items-center gap-1 rounded px-1 py-0.5 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
                mono ? "font-mono" : ""
              } ${highlight ? "text-orange-600 dark:text-orange-400 font-semibold" : ""} ${
                copied ? "bg-green-500/10 text-green-600 dark:text-green-400" : ""
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 shrink-0" />
                  <span className="text-xs">已复制</span>
                </>
              ) : (
                value
              )}
            </button>
          }
        />
        <TooltipContent>
          {copied ? "已复制!" : `点击复制: ${value}`}
        </TooltipContent>
      </Tooltip>
    </td>
  );
}
