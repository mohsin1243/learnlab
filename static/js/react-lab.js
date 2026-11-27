// React section: lesson parser + Learn (theory + live demo) and Practice (exercise + checks) views.
import { createEditor } from "./editor.js";
import { md } from "./md.js";
import { Sandbox, loadBabel } from "./sandbox.js";
import { store } from "./api.js";

let lessonsPromise = null;

export function parseLessons(text) {
  const lessons = [];
  let cur = null;
  let section = null;
  let buf = [];
  const close = () => {
    if (!cur || !section) return;
    const body = buf.join("\n").replace(/\s+$/, "");
    if (section.startsWith("check:")) cur.checks.push({ desc: section.slice(6).trim(), code: body });
    else cur[section] = body;
    buf = [];
  };
  for (const line of text.replace(/\r/g, "").split("\n")) {
    const lessonHead = line.match(/^=== (.+?) \| (\w+) \| (.+)$/);
    const sectionHead = line.match(/^--- (.+)$/);
    if (lessonHead) {
      close();
      cur = { id: lessonHead[1].trim(), level: lessonHead[2].trim(), title: lessonHead[3].trim(), checks: [] };
      lessons.push(cur);
      section = null;
    } else if (sectionHead && cur) {
      close();
      section = sectionHead[1].trim();
    } else if (section) {
      buf.push(line);
    }
  }
  close();
  return lessons;
}

export function loadLessons() {
  if (!lessonsPromise) {
    lessonsPromise = fetch("/static/react-lessons.md").then(r => r.text()).then(parseLessons);
  }
  return lessonsPromise;
}

const LEVELS = ["beginner", "intermediate", "advanced"];
const key = id => "react-" + id;
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

function consolePanel(el) {
  return {
    clear() { el.innerHTML = '<div class="con-empty">Console output appears here</div>'; },
    add(level, text) {
      el.querySelector(".con-empty")?.remove();
      const row = document.createElement("div");
      row.className = "con-row con-" + level;
      row.textContent = text;
      el.appendChild(row);
      el.scrollTop = el.scrollHeight;
    },
  };
}

function lab(host, { lang = "jsx", value, onChange, autoRun = true }) {
  host.innerHTML = `
    <div class="lab">
      <div class="lab-editor"><div class="pane-title"><span>App.jsx</span><span class="hint">Ctrl+Enter to run</span></div><div class="ed-host"></div></div>
      <div class="lab-preview"><div class="pane-title"><span>Preview</span><button class="btn ghost sm" data-act="rerun" title="Re-run">↻</button></div><div class="frame-host"></div></div>
      <div class="lab-console"><div class="pane-title"><span>Console</span><button class="btn ghost sm" data-act="clear">clear</button></div><div class="console"></div></div>
    </div>`;
  const con = consolePanel(host.querySelector(".console"));
  con.clear();
  const sandbox = new Sandbox(host.querySelector(".frame-host"), {
    onConsole: (lvl, t) => con.add(lvl, t),
    onError: m => con.add("error", m),
  });
  let runId = 0;
  const run = async () => {
    const my = ++runId;
    con.clear();
    await sandbox.run(editor.value);
    return my === runId;
  };
  const auto = debounce(run, 700);
  const editor = createEditor(host.querySelector(".ed-host"), {
    lang, value, onRun: run, label: "React code editor",
    onChange: v => { onChange && onChange(v); if (autoRun) auto(); },
  });
  host.querySelector('[data-act="rerun"]').onclick = run;
  host.querySelector('[data-act="clear"]').onclick = () => con.clear();
  return { editor, sandbox, run, destroy: () => sandbox.destroy() };
}

export async function renderReact(view, { lessonId, mode }) {
  view.innerHTML = '<div class="loading">Loading lessons…</div>';
  const [lessons] = await Promise.all([loadLessons(), loadBabel()]);
  const lesson = lessons.find(l => l.id === lessonId) || lessons.find(l => l.id === store.last("react")) || lessons[0];
  store.setLast("react", lesson.id);
  const idx = lessons.indexOf(lesson);
  const practice = mode === "practice";
  const done = lessons.filter(l => store.status(key(l.id)) === "solved").length;

  view.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="side-head">
          <div class="side-title">React path</div>
          <div class="meter"><div style="width:${(done / lessons.length) * 100}%"></div></div>
          <div class="muted small">${done} / ${lessons.length} lessons completed</div>
        </div>
        <nav class="lesson-nav">
          ${LEVELS.map(lv => `
            <div class="group-label">${lv}</div>
            ${lessons.filter(l => l.level === lv).map(l => `
              <a class="lesson-link ${l.id === lesson.id ? "active" : ""}" href="#/react/${l.id}">
                <span class="dot ${store.status(key(l.id)) || ""}"></span>
                <span>${lessons.indexOf(l) + 1}. ${l.title}</span>
              </a>`).join("")}`).join("")}
        </nav>
      </aside>
      <section class="main">
        <div class="lesson-head">
          <div>
            <span class="badge ${lesson.level}">${lesson.level}</span>
            <h1>${idx + 1}. ${lesson.title}</h1>
          </div>
          <div class="stepper" role="tablist">
            <a role="tab" class="${practice ? "" : "on"}" href="#/react/${lesson.id}">1 · Learn</a>
            <span class="arrow">→</span>
            <a role="tab" class="${practice ? "on" : ""}" href="#/react/${lesson.id}/practice">2 · Practice</a>
          </div>
        </div>
        <div class="lesson-body"></div>
        <div class="lesson-foot">
          ${idx > 0 ? `<a class="btn ghost" href="#/react/${lessons[idx - 1].id}">← ${lessons[idx - 1].title}</a>` : "<span></span>"}
          ${idx < lessons.length - 1 ? `<a class="btn ghost" href="#/react/${lessons[idx + 1].id}">${lessons[idx + 1].title} →</a>` : "<span></span>"}
        </div>
      </section>
    </div>`;

  const body = view.querySelector(".lesson-body");
  let current;
  if (!practice) {
    body.innerHTML = `
      <div class="learn">
        <article class="theory card">${md(lesson.theory)}
          <div class="cta-row"><a class="btn primary" href="#/react/${lesson.id}/practice">Practice this →</a></div>
        </article>
        <div class="demo card"><div class="card-title">Live demo — edit me, the preview updates as you type</div><div class="lab-host"></div></div>
      </div>`;
    current = lab(body.querySelector(".lab-host"), { value: lesson.demo });
    current.run();
  } else {
    const saved = store.code(key(lesson.id));
    body.innerHTML = `
      <div class="practice-react">
        <div class="task card">
          <div class="card-title">Your task</div>
          <div class="task-text">${md(lesson.task)}</div>
          <ul class="checks">${lesson.checks.map((c, i) => `<li data-i="${i}"><span class="ck">○</span>${c.desc}</li>`).join("")}</ul>
          <div class="btn-row">
            <button class="btn primary" data-act="check">✓ Check solution</button>
            <button class="btn" data-act="run">▶ Run</button>
            <button class="btn ghost" data-act="solution">View answer</button>
            <button class="btn ghost" data-act="reset">Reset</button>
          </div>
          <div class="verdict" hidden></div>
          <div class="solution" hidden>
            <div class="card-title">Answer</div>
            <div class="sol-code"></div>
            <div class="explain">${md(lesson.explain)}</div>
            <button class="btn sm" data-act="load">Load answer into editor</button>
          </div>
        </div>
        <div class="card lab-card"><div class="lab-host"></div></div>
      </div>`;
    current = lab(body.querySelector(".lab-host"), {
      value: saved ?? lesson.starter,
      onChange: v => store.setCode(key(lesson.id), v),
    });
    current.run();
    const verdict = body.querySelector(".verdict");
    const marks = [...body.querySelectorAll(".checks li")];
    const q = s => body.querySelector(`[data-act="${s}"]`);
    q("run").onclick = () => current.run();
    q("reset").onclick = () => { current.editor.value = lesson.starter; store.clearCode(key(lesson.id)); current.run(); };
    q("solution").onclick = async () => {
      const { codeBlock } = await import("./editor.js");
      body.querySelector(".sol-code").innerHTML = codeBlock(lesson.solution, "jsx");
      body.querySelector(".solution").hidden = false;
      store.setStatus(key(lesson.id), "revealed");
    };
    q("load").onclick = () => { current.editor.value = lesson.solution; store.setCode(key(lesson.id), lesson.solution); current.run(); };
    q("check").onclick = async () => {
      q("check").disabled = true;
      marks.forEach(m => { m.className = "running"; m.querySelector(".ck").textContent = "…"; m.querySelector(".err")?.remove(); });
      verdict.hidden = true;
      const ok = await current.run();
      const results = ok ? await current.sandbox.check(lesson.checks.map(c => c.code)) : lesson.checks.map(() => ({ ok: false }));
      results.forEach((r, i) => {
        marks[i].className = r.ok ? "pass" : "fail";
        marks[i].querySelector(".ck").textContent = r.ok ? "✓" : "✗";
        if (r.error) marks[i].insertAdjacentHTML("beforeend", `<div class="err">${r.error.replace(/[<>&]/g, "")}</div>`);
      });
      const passed = results.every(r => r.ok);
      verdict.hidden = false;
      verdict.className = "verdict " + (passed ? "good" : "bad");
      verdict.innerHTML = passed
        ? `🎉 All checks passed! ${idx < lessons.length - 1 ? `<a href="#/react/${lessons[idx + 1].id}">Next lesson →</a>` : "You finished the React path!"}`
        : `${results.filter(r => r.ok).length} / ${results.length} checks passed — keep going or view the answer.`;
      store.setStatus(key(lesson.id), passed ? "solved" : "attempted");
      if (passed) {
        const dot = view.querySelector(`.lesson-link.active .dot`);
        if (dot) dot.className = "dot solved";
      }
      q("check").disabled = false;
    };
  }
  return () => current?.destroy();
}
