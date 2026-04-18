/**
 * CMSIS-SVD 解析器（零依赖）
 *
 * 浏览器优先用原生 DOMParser；node / 测试环境用内置的最小 XML 扫描器（仅支持
 * SVD 结构：无 CDATA、无 namespace、纯标签嵌套）。两条路径都返回相同的内部
 * IR (XmlNode 树)，再走同一套 SvdParsed 提取逻辑。
 *
 * 仅解析可视化所需的层级：device > peripherals > registers > fields。
 * 文件大小限制由调用方在 readFileAsText 内执行（10MB）。
 */

import type {
  SvdDevice,
  SvdField,
  SvdMatch,
  SvdParsed,
  SvdPeripheral,
  SvdRegister,
} from "@/types/svd-viewer";

export const MAX_SVD_BYTES = 10 * 1024 * 1024; // 10MB

export class SvdParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SvdParseError";
  }
}

/** 解析十进制 / 0x16 进制 / 二进制（#1010）字符串为数字 */
export function parseSvdNumber(raw: string | null | undefined): number {
  if (raw == null) return 0;
  const s = raw.trim();
  if (s === "") return 0;
  if (/^0[xX][0-9a-fA-F]+$/.test(s)) return parseInt(s.slice(2), 16);
  if (/^#[01]+$/.test(s)) return parseInt(s.slice(1), 2);
  if (/^[0-9]+$/.test(s)) return parseInt(s, 10);
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// ============================================================
// 内部 IR：极简 XML 节点
// ============================================================

interface XmlNode {
  tag: string;
  text: string; // 直接文本子节点拼接（trim 后）
  children: XmlNode[];
}

function getChild(node: XmlNode, tag: string): XmlNode | null {
  for (const c of node.children) if (c.tag === tag) return c;
  return null;
}

function getChildren(node: XmlNode, tag: string): XmlNode[] {
  return node.children.filter((c) => c.tag === tag);
}

function getChildText(node: XmlNode, tag: string): string | null {
  const c = getChild(node, tag);
  return c ? c.text : null;
}

// ============================================================
// 解析路径 1：浏览器原生 DOMParser → XmlNode 树
// ============================================================

function elementToNode(el: Element): XmlNode {
  const children: XmlNode[] = [];
  let text = "";
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === 1 /* ELEMENT_NODE */) {
      children.push(elementToNode(child as Element));
    } else if (child.nodeType === 3 /* TEXT_NODE */) {
      text += child.textContent ?? "";
    }
  }
  return { tag: el.tagName, text: text.trim(), children };
}

function parseWithDOMParser(xml: string): XmlNode {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new SvdParseError(
      `XML 解析失败: ${parserError.textContent?.slice(0, 120) ?? "未知错误"}`
    );
  }
  const root = doc.documentElement;
  if (!root) throw new SvdParseError("XML 无根节点");
  return elementToNode(root);
}

// ============================================================
// 解析路径 2：手卷 minimal XML 扫描器（node / 测试环境）
// 仅支持 SVD：自闭合 / 嵌套元素 / 文本，不支持 CDATA / 命名空间 / 实体高级特性
// （但支持 &amp; &lt; &gt; &quot; &apos; 5 个基础实体）
// ============================================================

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function parseManually(xml: string): XmlNode {
  // 去掉 XML 声明、注释
  const src = xml.replace(/<\?xml[\s\S]*?\?>/g, "").replace(/<!--[\s\S]*?-->/g, "");

  const stack: XmlNode[] = [];
  let root: XmlNode | null = null;
  let i = 0;
  const n = src.length;

  // 容器初始：使用一个伪根，方便接收第一个元素
  const sentinel: XmlNode = { tag: "#root", text: "", children: [] };
  stack.push(sentinel);

  while (i < n) {
    if (src[i] === "<") {
      if (src.startsWith("</", i)) {
        // 结束标签
        const end = src.indexOf(">", i);
        if (end === -1) throw new SvdParseError("XML 结束标签未闭合");
        const tag = src.slice(i + 2, end).trim();
        const top = stack[stack.length - 1];
        if (!top || top.tag !== tag) {
          throw new SvdParseError(`XML 标签不匹配: 期望 </${top?.tag}>, 实际 </${tag}>`);
        }
        stack.pop();
        i = end + 1;
      } else {
        // 开始标签或自闭合
        const end = src.indexOf(">", i);
        if (end === -1) throw new SvdParseError("XML 开始标签未闭合");
        let inner = src.slice(i + 1, end).trim();
        const selfClose = inner.endsWith("/");
        if (selfClose) inner = inner.slice(0, -1).trim();
        // tag 名 = 第一个空白前
        const spaceIdx = inner.search(/\s/);
        const tag = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx);
        if (!tag) throw new SvdParseError("XML 标签名为空");
        const node: XmlNode = { tag, text: "", children: [] };
        const parent = stack[stack.length - 1];
        parent.children.push(node);
        if (!root && parent === sentinel) root = node;
        if (!selfClose) stack.push(node);
        i = end + 1;
      }
    } else {
      // 文本节点：累加到栈顶元素的 text
      const next = src.indexOf("<", i);
      const chunk = src.slice(i, next === -1 ? n : next);
      const trimmed = chunk.trim();
      if (trimmed) {
        const top = stack[stack.length - 1];
        if (top && top !== sentinel) {
          top.text = (top.text + decodeEntities(trimmed)).trim();
        }
      }
      i = next === -1 ? n : next;
    }
  }

  if (stack.length !== 1) {
    // 还剩未关闭标签
    throw new SvdParseError(`XML 未闭合标签: ${stack[stack.length - 1].tag}`);
  }
  if (!root) throw new SvdParseError("XML 没有根元素");
  return root;
}

function parseToTree(xml: string): XmlNode {
  if (typeof DOMParser !== "undefined") {
    return parseWithDOMParser(xml);
  }
  return parseManually(xml);
}

// ============================================================
// SVD 提取（复用同一套 XmlNode 接口）
// ============================================================

function extractField(el: XmlNode): SvdField | null {
  const name = getChildText(el, "name");
  if (!name) return null;

  const bitOffsetRaw = getChildText(el, "bitOffset");
  const bitWidthRaw = getChildText(el, "bitWidth");
  const lsbRaw = getChildText(el, "lsb");
  const msbRaw = getChildText(el, "msb");
  const bitRangeRaw = getChildText(el, "bitRange");

  let bitOffset = 0;
  let bitWidth = 1;

  if (bitOffsetRaw != null && bitWidthRaw != null) {
    bitOffset = parseSvdNumber(bitOffsetRaw);
    bitWidth = parseSvdNumber(bitWidthRaw);
  } else if (lsbRaw != null && msbRaw != null) {
    const lsb = parseSvdNumber(lsbRaw);
    const msb = parseSvdNumber(msbRaw);
    bitOffset = Math.min(lsb, msb);
    bitWidth = Math.abs(msb - lsb) + 1;
  } else if (bitRangeRaw != null) {
    const m = bitRangeRaw.match(/\[(\d+):(\d+)\]/);
    if (m) {
      const msb = parseInt(m[1], 10);
      const lsb = parseInt(m[2], 10);
      bitOffset = Math.min(lsb, msb);
      bitWidth = Math.abs(msb - lsb) + 1;
    }
  }

  return {
    name,
    bitOffset,
    bitWidth: Math.max(1, bitWidth),
    description: getChildText(el, "description") ?? undefined,
  };
}

function extractRegister(el: XmlNode): SvdRegister | null {
  const name = getChildText(el, "name");
  if (!name) return null;

  const fieldsParent = getChild(el, "fields");
  const fields: SvdField[] = [];
  if (fieldsParent) {
    for (const fEl of getChildren(fieldsParent, "field")) {
      const f = extractField(fEl);
      if (f) fields.push(f);
    }
  }

  return {
    name,
    addressOffset: parseSvdNumber(getChildText(el, "addressOffset")),
    resetValue: parseSvdNumber(getChildText(el, "resetValue")),
    size: parseSvdNumber(getChildText(el, "size")) || 32,
    description: getChildText(el, "description") ?? undefined,
    fields,
  };
}

function extractPeripheral(el: XmlNode): SvdPeripheral | null {
  const name = getChildText(el, "name");
  if (!name) return null;

  const registersParent = getChild(el, "registers");
  const registers: SvdRegister[] = [];
  if (registersParent) {
    for (const rEl of getChildren(registersParent, "register")) {
      const r = extractRegister(rEl);
      if (r) registers.push(r);
    }
  }

  return {
    name,
    baseAddress: parseSvdNumber(getChildText(el, "baseAddress")),
    description: getChildText(el, "description") ?? undefined,
    registers,
  };
}

/**
 * 解析 SVD XML 字符串。
 * 在不合法的 XML、缺 device 根、解析错误时抛出 SvdParseError。
 */
export function parseSvd(xml: string): SvdParsed {
  if (typeof xml !== "string" || xml.trim() === "") {
    throw new SvdParseError("空内容，无法解析");
  }

  const root = parseToTree(xml);

  if (root.tag !== "device") {
    throw new SvdParseError(`根节点不是 <device>（实际 <${root.tag}>），不是合法的 CMSIS-SVD 文件`);
  }

  const device: SvdDevice = {
    name: getChildText(root, "name") ?? "Unknown",
    description: getChildText(root, "description") ?? undefined,
  };

  const peripherals: SvdPeripheral[] = [];
  const periParent = getChild(root, "peripherals");
  if (periParent) {
    for (const pEl of getChildren(periParent, "peripheral")) {
      const p = extractPeripheral(pEl);
      if (p) peripherals.push(p);
    }
  }

  return { device, peripherals };
}

/**
 * 读取上传文件为文本，超过 MAX_SVD_BYTES 时拒绝。
 * 仅在浏览器中可用（依赖 File / FileReader）。
 */
export function readFileAsText(file: File): Promise<string> {
  if (file.size > MAX_SVD_BYTES) {
    return Promise.reject(
      new SvdParseError(
        `文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），上限 10MB`
      )
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new SvdParseError("文件读取结果不是字符串"));
    };
    reader.onerror = () =>
      reject(new SvdParseError("文件读取失败：" + (reader.error?.message ?? "unknown")));
    reader.readAsText(file);
  });
}

/**
 * 模糊匹配：按 register / field name 包含 query（忽略大小写）。
 * 返回所有命中点（一个 register 命中可能伴随多个 field 命中条目）。
 */
export function filterFields(query: string, parsed: SvdParsed): SvdMatch[] {
  const q = query.trim().toLowerCase();
  if (q === "") return [];
  const out: SvdMatch[] = [];
  for (const p of parsed.peripherals) {
    for (const r of p.registers) {
      const regHit = r.name.toLowerCase().includes(q);
      let anyFieldHit = false;
      for (const f of r.fields) {
        if (f.name.toLowerCase().includes(q)) {
          out.push({
            peripheralName: p.name,
            registerName: r.name,
            fieldName: f.name,
          });
          anyFieldHit = true;
        }
      }
      if (regHit && !anyFieldHit) {
        out.push({
          peripheralName: p.name,
          registerName: r.name,
          fieldName: null,
        });
      }
    }
  }
  return out;
}

// ============================================================
// 辅助：把 SvdField[] 适配为 BitGrid 的 fields prop 格式
// ============================================================

const FIELD_PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export interface FieldBarSegment {
  startBit: number;
  endBit: number;
  name: string;
  color?: string;
}

export function toBitGridFields(fields: SvdField[]): FieldBarSegment[] {
  return fields.map((f, i) => ({
    startBit: f.bitOffset,
    endBit: f.bitOffset + f.bitWidth - 1,
    name: f.name,
    color: FIELD_PALETTE[i % FIELD_PALETTE.length],
  }));
}
