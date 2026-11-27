// App shell: hash router, home page, theme toggle.
import { api, store } from "./api.js";
import { renderPractice } from "./practice.js";
import { renderReact, loadLessons } from "./react-lab.js";

const view = document.getElementById("view");
let cleanup = null;

async function home() {
  view.innerHTML = '<div class="loading">Loading…</div>';
  const [lessons, stream, sql] = await Promise.all([
    loadLessons(),
    api("/api/bank/stream").then(b => b.questions).catch(() => []),
    api("/api/bank/sql").then(b => b.questions).catch(() => []),
  ]);
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
  const rs = store.countSolved("react-");
  const ss = store.countSolved("stream-");
  const qs = store.countSolved("sql-");
  const card = (href, title, sub, items, solved, total, accent) => `
    <a class="home-card" href="${href}" style="--accent:${accent}">
      <div class="hc-top"><h2>${title}</h2><span class="hc-pct">${pct(solved, total)}%</span></div>
      <p>${sub}</p>
      <ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>
      <div class="meter"><div style="width:${pct(solved, total)}%"></div></div>
      <div class="muted small">${solved} / ${total} completed</div>
    </a>`;
  view.innerHTML = `
    <section class="hero">
      <h1>Learn by doing.</h1>
      <p>Interactive React lessons with a live preview, ${stream.length} Java Stream API and ${sql.length} SQL interview questions — from beginner to advanced. Write code, run it, compare with the expected output, then study the explained answer.</p>
    </section>
    <div class="home-grid">
      ${card("#/react", "React", "Learn → Practice. Each lesson explains a concept with an editable live demo, then gives you an exercise with automatic checks.",
        ["JSX, props, state, events", "Effects, refs, reducers, context", "Suspense, transitions, portals, virtualization"], rs, lessons.length, "#14b8a6")}
      ${card("#/stream", "Java Streams", "Real Java 21 compilation. Your snippet runs against shared sample data and the output is verified.",
        ["filter / map / reduce / collect", "groupingBy, partitioningBy, toMap", "teeing, custom collectors, windows"], ss, stream.length, "#f43f5e")}
      ${card("#/sql", "SQL", "SQLite engine with an HR + sales schema. Results are compared row-by-row with the reference query.",
        ["SELECT, WHERE, GROUP BY, HAVING", "JOINs, subqueries, set operators", "Window functions, recursive CTEs, gaps & islands"], qs, sql.length, "#f59e0b")}
    </div>
    <div class="home-foot">
      <span class="muted small">Shortcuts: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> run · <kbd>Ctrl</kbd>+<kbd>/</kbd> comment · <kbd>Tab</kbd> indent · <kbd>Alt</kbd>+<kbd>←/→</kbd> prev/next question</span>
      <button class="btn ghost sm" id="reset-progress">Reset progress</button>
    </div>`;
  view.querySelector("#reset-progress").onclick = () => {
    if (confirm("Reset all progress and saved code?")) { store.reset(); home(); }
  };
}

async function route() {
  cleanup?.();
  cleanup = null;
  const [, section, id, mode] = location.hash.replace(/^#/, "").split("/");
  document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("on", a.dataset.tab === (section || "home")));
  try {
    if (section === "react") cleanup = await renderReact(view, { lessonId: id, mode });
    else if (section === "stream" || section === "sql") cleanup = await renderPractice(view, section, id);
    else await home();
  } catch (err) {
    view.innerHTML = `<div class="error pad"><b>Something went wrong</b><pre>${String(err.message).replace(/[<>&]/g, "")}</pre></div>`;
  }
  window.scrollTo(0, 0);
}

function initTheme() {
  const apply = t => { document.documentElement.dataset.theme = t; };
  apply(store.pref("theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  document.getElementById("theme-toggle").onclick = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    store.setPref("theme", next);
    apply(next);
  };
}

initTheme();
window.addEventListener("hashchange", route);
route();
