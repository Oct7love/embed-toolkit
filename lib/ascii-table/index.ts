import type { AsciiEntry } from "@/types/ascii-table";

/** 控制字符中文说明 (0-31 及 127) */
const CONTROL_CHAR_DESCRIPTIONS: Record<number, string> = {
  0: "空字符 NUL",
  1: "标题开始 SOH",
  2: "正文开始 STX",
  3: "正文结束 ETX",
  4: "传输结束 EOT",
  5: "请求 ENQ",
  6: "确认 ACK",
  7: "响铃 BEL",
  8: "退格 BS",
  9: "水平制表符 HT",
  10: "换行 LF",
  11: "垂直制表符 VT",
  12: "换页 FF",
  13: "回车 CR",
  14: "移出 SO",
  15: "移入 SI",
  16: "数据链路转义 DLE",
  17: "设备控制1 DC1",
  18: "设备控制2 DC2",
  19: "设备控制3 DC3",
  20: "设备控制4 DC4",
  21: "否定确认 NAK",
  22: "同步空闲 SYN",
  23: "传输块结束 ETB",
  24: "取消 CAN",
  25: "介质结束 EM",
  26: "替代 SUB",
  27: "转义 ESC",
  28: "文件分隔符 FS",
  29: "组分隔符 GS",
  30: "记录分隔符 RS",
  31: "单元分隔符 US",
  127: "删除 DEL",
};

/** 可打印字符说明 */
const PRINTABLE_DESCRIPTIONS: Record<number, string> = {
  32: "空格 SP",
  33: "感叹号",
  34: "双引号",
  35: "井号",
  36: "美元符号",
  37: "百分号",
  38: "和号",
  39: "单引号",
  40: "左圆括号",
  41: "右圆括号",
  42: "星号",
  43: "加号",
  44: "逗号",
  45: "连字符/减号",
  46: "句点",
  47: "斜杠",
  58: "冒号",
  59: "分号",
  60: "小于号",
  61: "等号",
  62: "大于号",
  63: "问号",
  64: "电子邮件符号",
  91: "左方括号",
  92: "反斜杠",
  93: "右方括号",
  94: "脱字符",
  95: "下划线",
  96: "反引号",
  123: "左花括号",
  124: "竖线",
  125: "右花括号",
  126: "波浪号",
};

function getDescription(code: number): string {
  if (CONTROL_CHAR_DESCRIPTIONS[code]) {
    return CONTROL_CHAR_DESCRIPTIONS[code];
  }
  if (PRINTABLE_DESCRIPTIONS[code]) {
    return PRINTABLE_DESCRIPTIONS[code];
  }
  if (code >= 48 && code <= 57) {
    return `数字 ${String.fromCharCode(code)}`;
  }
  if (code >= 65 && code <= 90) {
    return `大写字母 ${String.fromCharCode(code)}`;
  }
  if (code >= 97 && code <= 122) {
    return `小写字母 ${String.fromCharCode(code)}`;
  }
  return String.fromCharCode(code);
}

function getDisplayChar(code: number): string {
  if (code <= 31) {
    // 显示常见的控制字符缩写
    const abbrevs: Record<number, string> = {
      0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ",
      6: "ACK", 7: "BEL", 8: "BS", 9: "HT", 10: "LF", 11: "VT",
      12: "FF", 13: "CR", 14: "SO", 15: "SI", 16: "DLE", 17: "DC1",
      18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN", 23: "ETB",
      24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS",
      30: "RS", 31: "US",
    };
    return abbrevs[code] ?? "";
  }
  if (code === 32) return "SP";
  if (code === 127) return "DEL";
  return String.fromCharCode(code);
}

/** 生成完整 ASCII 码表 (0-127) */
export function generateAsciiTable(): AsciiEntry[] {
  const entries: AsciiEntry[] = [];
  for (let i = 0; i <= 127; i++) {
    entries.push({
      code: i,
      hex: i.toString(16).toUpperCase().padStart(2, "0"),
      oct: i.toString(8).padStart(3, "0"),
      char: getDisplayChar(i),
      description: getDescription(i),
      isControl: i <= 31 || i === 127,
    });
  }
  return entries;
}

/** 搜索/过滤 ASCII 条目 */
export function filterAsciiEntries(
  entries: AsciiEntry[],
  query: string
): AsciiEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;

  return entries.filter((entry) => {
    // 匹配十进制
    if (entry.code.toString() === q) return true;
    // 匹配十六进制 (支持 0x 前缀)
    const hexQuery = q.replace(/^0x/, "");
    if (entry.hex.toLowerCase() === hexQuery) return true;
    // 匹配八进制 (支持 0o 前缀)
    const octQuery = q.replace(/^0o/, "");
    if (entry.oct === octQuery) return true;
    // 匹配字符
    if (entry.char.toLowerCase() === q) return true;
    // 匹配描述
    if (entry.description.toLowerCase().includes(q)) return true;
    // 单字符搜索
    if (q.length === 1 && String.fromCharCode(entry.code) === q) return true;
    return false;
  });
}
