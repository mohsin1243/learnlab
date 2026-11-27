// Host side of the React sandbox: compiles JSX with Babel and runs it in an isolated iframe.
let babelPromise = null;

export function loadBabel() {
  if (!babelPromise) {
    babelPromise = new Promise((resolve, reject) => {
      if (window.Babel) return resolve(window.Babel);
      const s = document.createElement("script");
      s.src = "/static/vendor/babel.min.js";
      s.onload = () => resolve(window.Babel);
      s.onerror = () => { babelPromise = null; reject(new Error("Failed to load the JSX compiler")); };
      document.head.appendChild(s);
    });
  }
  return babelPromise;
}

const HOOKS = [
  "useState", "useEffect", "useLayoutEffect", "useRef", "useMemo", "useCallback", "useReducer",
  "useContext", "createContext", "useId", "useTransition", "useDeferredValue", "useSyncExternalStore",
  "useImperativeHandle", "forwardRef", "memo", "lazy", "Suspense", "Fragment", "Component",
  "PureComponent", "StrictMode", "startTransition", "Children", "cloneElement", "isValidElement",
];
const PRELUDE = `const { ${HOOKS.join(", ")} } = React; const { createPortal, flushSync } = ReactDOM;`;

export async function compile(src) {
  const Babel = await loadBabel();
  const code = src
    .replace(/^\s*import\s[\s\S]*?from\s*['"][^'"]+['"];?[ \t]*$/gm, "")
    .replace(/^\s*import\s+['"][^'"]+['"];?[ \t]*$/gm, "")
    .replace(/\bexport\s+default\s+(?=(function|class)\b)/g, "")
    .replace(/\bexport\s+default\s+/g, "const __default = ")
    .replace(/\bexport\s+(?=(const|let|var|function|class)\b)/g, "");
  const autoRender = !/createRoot\s*\(|ReactDOM\.render\s*\(/.test(code);
  const tail = autoRender
    ? "\n;if (typeof App === 'undefined') throw new Error('Define a component named App to render it.');\nwindow.__root.render(<App />);"
    : "";
  const out = Babel.transform(code + tail, { presets: [["react", { runtime: "classic" }]], filename: "App.jsx" }).code;
  return `(function () {\n${PRELUDE}\n{\n${out}\n}\n})();`;
}

const cleanBabelError = msg => msg.replace(/^App\.jsx: /, "").replace(/\x1b\[[0-9;]*m/g, "");

function srcdoc() {
  const o = location.origin;
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
  body{font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;margin:12px;color:#1A1A2E;background:#fff}
  button{font:inherit;padding:4px 10px;border:1px solid #c9cfda;border-radius:6px;background:#F5F7FA;cursor:pointer}
  button:hover{background:#e9edf3} button:disabled{opacity:.5;cursor:not-allowed}
  input,select,textarea{font:inherit;padding:4px 8px;border:1px solid #c9cfda;border-radius:6px}
  .done{text-decoration:line-through;color:#6B7280} .active,.selected{outline:2px solid #243782}
</style>
<script src="${o}/static/vendor/react.development.js"></script>
<script src="${o}/static/vendor/react-dom.development.js"></script>
</head><body><div id="root"></div><div id="modal-root"></div>
<script src="${o}/static/sandbox-harness.js"></script></body></html>`;
}

export class Sandbox {
  constructor(host, { onConsole = () => {}, onError = () => {} } = {}) {
    this.host = host;
    this.onConsole = onConsole;
    this.onError = onError;
    this.frame = null;
    this.pending = new Map();
    this.seq = 0;
    this.listener = e => this.#onMessage(e);
    window.addEventListener("message", this.listener);
  }

  destroy() {
    window.removeEventListener("message", this.listener);
    this.frame?.remove();
    this.frame = null;
  }

  #onMessage(e) {
    if (!this.frame || e.source !== this.frame.contentWindow || e.data?.src !== "learnlab-sandbox") return;
    const m = e.data;
    if (m.type === "console") this.onConsole(m.level, m.text);
    else if (m.type === "error") this.onError(m.message);
    else if (m.type === "ready") this.readyResolve?.();
    else if (m.type === "ran") this.ranResolve?.();
    else if (m.type === "checkResult") {
      this.pending.get(m.id)?.(m.results);
      this.pending.delete(m.id);
    }
  }

  #post(msg, frame = this.frame) {
    if (!frame || !frame.contentWindow) return false;
    frame.contentWindow.postMessage({ src: "learnlab-host", ...msg }, "*");
    return true;
  }

  async run(src) {
    let compiled;
    try {
      compiled = await compile(src);
    } catch (err) {
      this.onError(cleanBabelError(err.message));
      return false;
    }
    this.frame?.remove();
    const frame = document.createElement("iframe");
    frame.title = "Live preview";
    frame.className = "preview-frame";
    frame.setAttribute("sandbox", "allow-scripts allow-modals allow-forms");
    const ready = new Promise(r => (this.readyResolve = r));
    const ran = new Promise(r => (this.ranResolve = r));
    frame.srcdoc = srcdoc();
    this.frame = frame;
    this.host.appendChild(frame);
    await Promise.race([ready, new Promise(r => setTimeout(r, 8000))]);
    if (this.frame !== frame || !this.#post({ type: "run", code: compiled }, frame)) return false;
    await Promise.race([ran, new Promise(r => setTimeout(r, 3000))]);
    return this.frame === frame;
  }

  check(checks) {
    const id = ++this.seq;
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        resolve(checks.map(() => ({ ok: false, error: "Preview did not respond" })));
      }, 4500 * Math.max(1, checks.length));
      this.pending.set(id, results => { clearTimeout(timer); resolve(results); });
      if (!this.#post({ type: "check", id, checks })) {
        clearTimeout(timer);
        this.pending.delete(id);
        resolve(checks.map(() => ({ ok: false, error: "Preview is not running" })));
      }
    });
  }
}
