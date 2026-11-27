// Runs inside the sandboxed (opaque-origin) preview iframe.
(function () {
  "use strict";
  const send = msg => parent.postMessage(Object.assign({ src: "learnlab-sandbox" }, msg), "*");
  const logs = [];

  const fmt = v => {
    if (typeof v === "string") return v;
    if (v instanceof Error) return v.name + ": " + v.message;
    if (typeof v === "function") return "ƒ " + (v.name || "anonymous") + "()";
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  };
  const format = args => {
    if (typeof args[0] === "string" && /%[sdoO]/.test(args[0])) {
      let i = 1;
      const head = args[0].replace(/%[sdoO]/g, () => (i < args.length ? fmt(args[i++]) : ""));
      return [head].concat(args.slice(i).map(fmt)).join(" ");
    }
    return args.map(fmt).join(" ");
  };
  ["log", "info", "warn", "error"].forEach(level => {
    const orig = console[level].bind(console);
    console[level] = function () {
      const args = Array.prototype.slice.call(arguments);
      const text = format(args);
      logs.push(text);
      send({ type: "console", level, text: text.slice(0, 4000) });
      orig.apply(console, args);
    };
  });

  function showError(message) {
    let box = document.getElementById("__err");
    if (!box) {
      box = document.createElement("pre");
      box.id = "__err";
      box.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;margin:0;padding:10px;background:#fff1ec;color:#b3261e;border:1px solid #F39671;border-radius:6px;font:12px/1.4 Consolas,monospace;white-space:pre-wrap;max-height:45%;overflow:auto;z-index:99999";
      document.body.appendChild(box);
    }
    box.textContent = message;
  }
  function reportError(err) {
    const message = err && err.message ? err.message : String(err);
    showError(message);
    send({ type: "error", message });
  }
  window.addEventListener("error", e => reportError(e.error || e.message));
  window.addEventListener("unhandledrejection", e => reportError(e.reason));

  // ---- fake backend used by lessons ----
  const users = [
    { id: 1, name: "Ada Lovelace" }, { id: 2, name: "Alan Turing" },
    { id: 3, name: "Grace Hopper" }, { id: 4, name: "Linus Torvalds" },
  ];
  window.fakeFetch = (data, ms = 300, fail = false) =>
    new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error("Network error")) : res(data)), ms));
  window.api = {
    getUsers: (ms = 300, fail = false) => window.fakeFetch(users.map(u => Object.assign({}, u)), ms, fail),
    save: (ms = 300, fail = false) => window.fakeFetch({ ok: true }, ms, fail),
  };

  // ---- test helpers for lesson checks ----
  const el = s => (typeof s === "string" ? document.querySelector(s) : s);
  const H = {
    $: s => document.querySelector(s),
    $$: s => Array.from(document.querySelectorAll(s)),
    text: s => { const n = el(s); return n ? n.textContent.trim() : null; },
    click: s => { const n = el(s); if (!n) throw new Error("Element not found: " + s); n.click(); },
    type: (s, value) => {
      const n = el(s);
      if (!n) throw new Error("Element not found: " + s);
      const proto = n.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(n, value);
      n.dispatchEvent(new Event("input", { bubbles: true }));
    },
    tick: (ms = 30) => new Promise(r => setTimeout(r, ms)),
    logs,
  };

  window.addEventListener("message", async e => {
    if (e.source !== parent || !e.data || e.data.src !== "learnlab-host") return;
    const m = e.data;
    if (m.type === "run") {
      try {
        window.__root = ReactDOM.createRoot(document.getElementById("root"));
        (0, eval)(m.code);
      } catch (err) {
        reportError(err);
      }
      setTimeout(() => send({ type: "ran" }), 60);
    } else if (m.type === "check") {
      const results = [];
      for (const src of m.checks) {
        try {
          const fn = new Function("H", "with (H) { return (async () => {\n" + src + "\n})(); }");
          const ok = await Promise.race([fn(H), new Promise((_, rej) => setTimeout(() => rej(new Error("Check timed out")), 4000))]);
          results.push({ ok: ok === true });
        } catch (err) {
          results.push({ ok: false, error: err && err.message ? err.message : String(err) });
        }
      }
      send({ type: "checkResult", id: m.id, results });
    }
  });
  send({ type: "ready" });
})();
