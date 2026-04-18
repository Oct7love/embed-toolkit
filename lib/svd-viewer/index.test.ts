import { describe, it, expect } from "vitest";
import {
  parseSvd,
  parseSvdNumber,
  filterFields,
  toBitGridFields,
  readFileAsText,
  SvdParseError,
  MAX_SVD_BYTES,
} from "./index";
import { EXAMPLE_SVD } from "./example";

// 注：parseSvd 在 node 环境会自动走内置 minimal XML 扫描器（不依赖 DOMParser）

describe("parseSvdNumber", () => {
  it("解析十进制", () => {
    expect(parseSvdNumber("42")).toBe(42);
  });
  it("解析十六进制 0x", () => {
    expect(parseSvdNumber("0x40010800")).toBe(0x40010800);
  });
  it("解析二进制 #", () => {
    expect(parseSvdNumber("#1010")).toBe(10);
  });
  it("空/null 返回 0", () => {
    expect(parseSvdNumber(null)).toBe(0);
    expect(parseSvdNumber("")).toBe(0);
  });
});

describe("parseSvd - 标准1: 解析示例 SVD", () => {
  it("返回 device + peripherals 结构", () => {
    const r = parseSvd(EXAMPLE_SVD);
    expect(r.device.name).toBe("STM32F103-mini");
    expect(r.peripherals.length).toBe(2);
    expect(r.peripherals.map((p) => p.name)).toEqual(["GPIOA", "RCC"]);
  });

  it("正确解析 baseAddress 为数字", () => {
    const r = parseSvd(EXAMPLE_SVD);
    const gpioa = r.peripherals.find((p) => p.name === "GPIOA")!;
    expect(gpioa.baseAddress).toBe(0x40010800);
  });

  it("解析到 register + field 级别", () => {
    const r = parseSvd(EXAMPLE_SVD);
    const gpioa = r.peripherals.find((p) => p.name === "GPIOA")!;
    const crl = gpioa.registers.find((r) => r.name === "CRL")!;
    expect(crl.addressOffset).toBe(0);
    expect(crl.resetValue).toBe(0x44444444);
    expect(crl.fields.length).toBe(8);
    const mode0 = crl.fields[0];
    expect(mode0.name).toBe("MODE0");
    expect(mode0.bitOffset).toBe(0);
    expect(mode0.bitWidth).toBe(2);
  });

  it("跨行 field（bit 16+）也能正确解析（RCC.CR.HSEON @ bit16）", () => {
    const r = parseSvd(EXAMPLE_SVD);
    const rcc = r.peripherals.find((p) => p.name === "RCC")!;
    const cr = rcc.registers.find((r) => r.name === "CR")!;
    const hseon = cr.fields.find((f) => f.name === "HSEON")!;
    expect(hseon.bitOffset).toBe(16);
    expect(hseon.bitWidth).toBe(1);
  });

  it("支持 bitRange [msb:lsb] 格式", () => {
    const xml = `<device><name>X</name><peripherals><peripheral><name>P</name><baseAddress>0</baseAddress><registers><register><name>R</name><addressOffset>0</addressOffset><resetValue>0</resetValue><fields><field><name>F</name><bitRange>[7:4]</bitRange></field></fields></register></registers></peripheral></peripherals></device>`;
    const r = parseSvd(xml);
    const f = r.peripherals[0].registers[0].fields[0];
    expect(f.bitOffset).toBe(4);
    expect(f.bitWidth).toBe(4);
  });
});

describe("parseSvd - 标准2: 拒绝非法输入", () => {
  it("空字符串抛 SvdParseError", () => {
    expect(() => parseSvd("")).toThrow(SvdParseError);
  });
  it("根节点不是 device 抛 SvdParseError", () => {
    expect(() => parseSvd("<foo></foo>")).toThrow(SvdParseError);
  });
  it("严重畸形 XML 抛 SvdParseError", () => {
    expect(() => parseSvd("<device><name>X</peripherals>")).toThrow(SvdParseError);
  });
});

describe("parseSvd - 标准3: 文件大小限制", () => {
  it("readFileAsText 超 10MB 抛 SvdParseError", async () => {
    const fakeFile = { size: MAX_SVD_BYTES + 1 } as File;
    await expect(readFileAsText(fakeFile)).rejects.toBeInstanceOf(SvdParseError);
  });
});

describe("filterFields - 标准4: 模糊搜索", () => {
  it("'MODE' 命中所有 MODE0..MODE3 field", () => {
    const r = parseSvd(EXAMPLE_SVD);
    const matches = filterFields("MODE", r);
    const fieldNames = matches
      .filter((m) => m.fieldName)
      .map((m) => m.fieldName!);
    expect(fieldNames.sort()).toEqual(["MODE0", "MODE1", "MODE2", "MODE3"]);
  });

  it("'CR' 命中 register 名 CRL 与 CR", () => {
    const r = parseSvd(EXAMPLE_SVD);
    const matches = filterFields("CR", r);
    const regNames = new Set(matches.map((m) => m.registerName));
    expect(regNames.has("CRL")).toBe(true);
    expect(regNames.has("CR")).toBe(true);
  });

  it("空 query 返回空数组", () => {
    const r = parseSvd(EXAMPLE_SVD);
    expect(filterFields("", r)).toEqual([]);
    expect(filterFields("   ", r)).toEqual([]);
  });

  it("无匹配返回空数组", () => {
    const r = parseSvd(EXAMPLE_SVD);
    expect(filterFields("NONEXISTENT_XYZ", r)).toEqual([]);
  });
});

describe("toBitGridFields - 适配 BitGrid fields prop", () => {
  it("startBit=bitOffset, endBit=bitOffset+bitWidth-1", () => {
    const out = toBitGridFields([
      { name: "F0", bitOffset: 0, bitWidth: 2 },
      { name: "F1", bitOffset: 4, bitWidth: 1 },
    ]);
    expect(out).toEqual([
      expect.objectContaining({ startBit: 0, endBit: 1, name: "F0" }),
      expect.objectContaining({ startBit: 4, endBit: 4, name: "F1" }),
    ]);
  });

  it("循环分配调色板，第 6 个回到第 1 个", () => {
    const fields = Array.from({ length: 6 }, (_, i) => ({
      name: `F${i}`,
      bitOffset: i,
      bitWidth: 1,
    }));
    const out = toBitGridFields(fields);
    expect(out[0].color).toBe(out[5].color);
  });
});

describe("集成: 16 个 2-bit field（标准7 GPIO MODER 场景）", () => {
  it("toBitGridFields 输出 16 段，每段宽度 2 bit", () => {
    const fields = Array.from({ length: 16 }, (_, i) => ({
      name: `MODER${i}`,
      bitOffset: i * 2,
      bitWidth: 2,
    }));
    const out = toBitGridFields(fields);
    expect(out.length).toBe(16);
    expect(out[15]).toEqual(
      expect.objectContaining({ startBit: 30, endBit: 31, name: "MODER15" })
    );
    // 累计覆盖 32 bit
    const totalSpan = out.reduce(
      (acc, s) => acc + (s.endBit - s.startBit + 1),
      0
    );
    expect(totalSpan).toBe(32);
  });
});
