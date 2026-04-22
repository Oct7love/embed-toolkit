import { describe, it, expect } from "vitest";
import { highlightCode, escapeHtml } from "./index";

describe("highlightCode", () => {
  it("highlights C++ code → returns HTML containing shiki <pre> and tokens", async () => {
    const html = await highlightCode("int x = 1;", "cpp");
    expect(html).toMatch(/<pre[\s>]/);
    // Shiki renders tokens as <span style="color:..."> nodes
    expect(html).toContain("<span");
    expect(html).toContain("style=");
  });

  it("highlights Python code → returns HTML", async () => {
    const html = await highlightCode("x = 1", "python");
    expect(html).toMatch(/<pre[\s>]/);
    expect(html).toContain("<span");
  });

  it("escapes special HTML chars (<, >, &) inside C++ code", async () => {
    const html = await highlightCode("a < b && b > c", "cpp");
    // shiki 用十六进制实体（&#x3C;, &#x26;）或命名实体（&lt;, &amp;）都算合法
    const hasLt = html.includes("&lt;") || html.includes("&#x3C;");
    const hasAmp = html.includes("&amp;") || html.includes("&#x26;");
    expect(hasLt).toBe(true);
    expect(hasAmp).toBe(true);
    // make sure raw `a < b &&` literal is NOT in output (would be unescaped)
    expect(html).not.toContain("a < b &&");
  });

  it("empty code → still returns valid <pre>...</pre>", async () => {
    const html = await highlightCode("", "cpp");
    expect(html).toMatch(/<pre[\s>][\s\S]*<\/pre>/);
  });
});

describe("escapeHtml (fallback path used while shiki loads)", () => {
  it("escapes the 5 standard HTML entities", () => {
    expect(escapeHtml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;");
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("handles a realistic C++ snippet", () => {
    const out = escapeHtml("if (a < b && c > 0) { return; }");
    expect(out).not.toContain("<");
    expect(out).not.toContain("&&");
    expect(out).toContain("&lt;");
    expect(out).toContain("&amp;&amp;");
    expect(out).toContain("&gt;");
  });
});
