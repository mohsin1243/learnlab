// Lightweight code editor: textarea over a highlighted <pre>, with gutter, indent and shortcuts.
import { highlight } from "./highlight.js";

const INDENT = { java: "    ", sql: "  ", jsx: "  " };
const COMMENT = { java: "//", sql: "--", jsx: "//" };
const PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };

function insertText(ta, text) {
  ta.focus();
  if (!document.execCommand("insertText", false, text)) {
    ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

export function createEditor(host, { lang = "java", value = "", onChange, onRun, readOnly = false, label = "Code editor" } = {}) {
  host.classList.add("ed");
  host.innerHTML = `
    <div class="ed-gutter" aria-hidden="true"></div>
    <div class="ed-body">
      <pre class="ed-hl" aria-hidden="true"><code></code></pre>
      <textarea class="ed-input" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${label}"></textarea>
    </div>`;
  const ta = host.querySelector("textarea");
  const code = host.querySelector("code");
  const gutter = host.querySelector(".ed-gutter");
  ta.readOnly = readOnly;
  const indent = INDENT[lang] || "  ";

  const paint = () => {
    const v = ta.value;
    code.innerHTML = highlight(v, lang) + "\n";
    const lines = v.split("\n").length;
    if (gutter.childElementCount !== lines) {
      gutter.innerHTML = Array.from({ length: lines }, (_, i) => `<span>${i + 1}</span>`).join("");
    }
  };

  ta.addEventListener("input", () => { paint(); onChange && onChange(ta.value); });
  ta.addEventListener("keydown", e => {
    const { selectionStart: s, selectionEnd: end, value: v } = ta;
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun && onRun();
      return;
    }
    if (readOnly) return;
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      let le = v.indexOf("\n", end);
      if (le === -1) le = v.length;
      const block = v.slice(ls, le).split("\n");
      const mark = COMMENT[lang];
      const markRe = new RegExp("^(\\s*)" + mark.replace(/\//g, "\\/") + " ?");
      const all = block.every(l => l.trimStart().startsWith(mark) || !l.trim());
      const next = block.map(l => (all ? l.replace(markRe, "$1") : l.trim() ? mark + " " + l : l)).join("\n");
      ta.setSelectionRange(ls, le);
      insertText(ta, next);
      ta.setSelectionRange(ls, ls + next.length);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (s === end && !e.shiftKey) return insertText(ta, indent);
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      const block = v.slice(ls, end).split("\n");
      const outdent = new RegExp("^ {1," + indent.length + "}");
      const next = block.map(l => (e.shiftKey ? l.replace(outdent, "") : indent + l)).join("\n");
      ta.setSelectionRange(ls, end);
      insertText(ta, next);
      ta.setSelectionRange(ls, ls + next.length);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      const cur = v.slice(ls, s);
      const base = cur.match(/^\s*/)[0];
      const lastCh = cur.trim().slice(-1);
      const opener = /[{([]$/.test(cur.trimEnd());
      if (opener && v[s] === PAIRS[lastCh]) {
        insertText(ta, "\n" + base + indent + "\n" + base);
        const pos = s + 1 + base.length + indent.length;
        ta.setSelectionRange(pos, pos);
      } else {
        insertText(ta, "\n" + base + (opener ? indent : ""));
      }
      return;
    }
    if (PAIRS[e.key] && s !== end) {
      e.preventDefault();
      insertText(ta, e.key + v.slice(s, end) + PAIRS[e.key]);
      return;
    }
    if (/[)\]}]/.test(e.key) && v[s] === e.key && s === end) {
      e.preventDefault();
      ta.setSelectionRange(s + 1, s + 1);
    }
  });

  const api = {
    get value() { return ta.value; },
    set value(v) { ta.value = v ?? ""; paint(); },
    focus() { ta.focus(); },
    textarea: ta,
  };
  api.value = value;
  return api;
}

export function codeBlock(text, lang) {
  return `<pre class="code-block"><code>${highlight(text, lang)}</code></pre>`;
}
