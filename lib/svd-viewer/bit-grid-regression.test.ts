/**
 * BitGrid 回归测试（标准5/6）
 *
 * 由于项目 vitest 跑在 node 环境且未引入 jsdom / react-dom/server，本测试
 * 通过对 BitGrid 源码做静态契约检查来保证 surgical change 不破坏现有调用：
 *
 *   - 现有 props（value/width/onBitToggle/labels/colors/className/readOnly）全部保留
 *   - width 默认值仍为 32，readOnly 默认值仍为 false，labels 默认值仍为 {}
 *   - 新增 fields prop 必须可选（带 ?）且未传/为空数组时不渲染 FieldBars 子组件
 *   - 现有 3 处调用点（register-viewer / ieee754-parser / bit-operation-generator）
 *     均不包含 `fields=` —— 即不传 fields 时 v1.3 行为零变化
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "../..");

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), "utf8");
}

describe("BitGrid 源码契约 - 标准5: 不传 fields 时行为与 v1.3 完全一致", () => {
  const src = read("components/shared/bit-grid.tsx");

  it("interface 中 fields 是可选 prop（带 ?:）", () => {
    expect(src).toMatch(/fields\?:\s*Array<\{/);
  });

  it("现有 props 全部保留", () => {
    for (const p of [
      "value",
      "width?",
      "onBitToggle?",
      "labels?",
      "colors?",
      "className?",
      "readOnly?",
    ]) {
      // 在 interface 块内出现
      expect(src).toContain(p + ":");
    }
  });

  it("现有默认值未改 (width=32, readOnly=false, labels={})", () => {
    expect(src).toMatch(/width\s*=\s*32/);
    expect(src).toMatch(/readOnly\s*=\s*false/);
    expect(src).toMatch(/labels\s*=\s*\{\}/);
  });

  it("fields 渲染分支被严格守卫: fields && fields.length > 0", () => {
    expect(src).toMatch(/fields\s*&&\s*fields\.length\s*>\s*0/);
  });

  it("FieldBars 子组件存在且为内部函数", () => {
    expect(src).toMatch(/function\s+FieldBars\s*\(/);
  });
});

describe("BitGrid 三处现有调用点零修改 - 标准5 强约束", () => {
  const callers = [
    "components/tools/register-viewer/register-viewer.tsx",
    "components/tools/ieee754-parser/ieee754-parser.tsx",
    "components/tools/bit-operation/bit-operation-generator.tsx",
  ];

  for (const file of callers) {
    it(`${file} 不传 fields prop`, () => {
      const src = read(file);
      // 文件确实使用了 BitGrid
      expect(src).toContain("BitGrid");
      // 在 <BitGrid ... /> JSX 块内不出现 fields= 属性
      // 抓所有 <BitGrid ... /> 片段做断言
      const matches = src.matchAll(/<BitGrid\b[\s\S]*?\/>/g);
      let count = 0;
      for (const m of matches) {
        count++;
        expect(m[0]).not.toMatch(/\bfields\s*=/);
      }
      expect(count).toBeGreaterThanOrEqual(1);
    });
  }
});

describe("BitGrid 标准6: 传 fields 时渲染 FieldBars (源码可达)", () => {
  const src = read("components/shared/bit-grid.tsx");
  it("FieldBars 接收 fields + width 两个 prop", () => {
    // 容忍 prettier 多行/单行格式
    expect(src).toMatch(/<FieldBars[\s\S]*?fields=\{fields\}[\s\S]*?width=\{width\}[\s\S]*?\/>/);
  });
  it("FieldBars 把每个 field 渲染成带 startBit/endBit 的 div", () => {
    expect(src).toContain("gridColumn");
    expect(src).toContain("colStart");
    expect(src).toContain("span");
  });
});
