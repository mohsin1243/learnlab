// Minimal markdown: fenced code, inline code, bold, italics, lists, paragraphs.
import { highlight, esc } from "./highlight.js";

const LANG = { jsx: "jsx", js: "jsx", java: "java", sql: "sql" };

export function inline(s) {
  return esc(s)
    .replace(/``\s?(.+?)\s?``|`([^`]+)`/g, (_, a, b) => `<code>${a ?? b}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

export function md(src) {
  const out = [];
  const lines = (src || "").replace(/\r/g, "").split("\n");
  let para = [];
  let list = null;
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flush = () => {
    flushPara();
    if (list) out.push(`<ul>${list.map(li => `<li>${inline(li)}</li>`).join("")}</ul>`);
    list = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      flush();
      const body = [];
      while (++i < lines.length && !lines[i].startsWith("```")) body.push(lines[i]);
      const lang = LANG[fence[1]] || "";
      out.push(`<pre class="code-block"><code>${lang ? highlight(body.join("\n"), lang) : esc(body.join("\n"))}</code></pre>`);
    } else if (/^\s*[-*] /.test(line)) {
      flushPara();
      (list = list || []).push(line.replace(/^\s*[-*] /, ""));
    } else if (!line.trim()) {
      flush();
    } else if (list && /^\s+/.test(line)) {
      list[list.length - 1] += " " + line.trim();
    } else {
      if (list) flush();
      para.push(line.trim());
    }
  }
  flush();
  return out.join("\n");
}
