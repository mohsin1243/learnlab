// Practice screen shared by the Java Stream and SQL sections.
import { api, store } from "./api.js";
import { createEditor, codeBlock } from "./editor.js";
import { inline, md } from "./md.js";
import { esc } from "./highlight.js";

const LEVELS = ["beginner", "intermediate", "advanced"];
const banks = {};
const extras = {};

const CONFIG = {
  stream: { lang: "java", title: "Java Stream API", runPath: "/api/run/java", extraTab: "Data", file: "Main.java" },
  sql: { lang: "sql", title: "SQL", runPath: "/api/run/sql", extraTab: "Schema", file: "query.sql" },
};

function loadBank(kind) {
  if (!banks[kind]) banks[kind] = api(`/api/bank/${kind}`).then(b => b.questions);
  return banks[kind];
}

function tableHtml(columns, rows, { max = 200 } = {}) {
  if (!columns?.length) return '<div class="muted">Statement executed — no result set.</div>';
  const cell = v => (v === null ? '<i class="null">NULL</i>' : esc(String(typeof v === "number" && !Number.isInteger(v) ? +v.toFixed(4) : v)));
  return `<div class="table-wrap"><table class="grid"><thead><tr>${columns.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${rows.slice(0, max).map(r => `<tr>${r.map(v => `<td>${cell(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <div class="muted small">${rows.length} row${rows.length === 1 ? "" : "s"}${rows.length > max ? ` (showing ${max})` : ""}</div>`;
}

function diffHtml(actual, expected) {
  const a = actual.replace(/\s+$/, "").split("\n");
  const e = expected.replace(/\s+$/, "").split("\n");
  const n = Math.max(a.length, e.length);
  const rows = [];
  for (let i = 0; i < n; i++) {
    const same = (a[i] ?? "").trimEnd() === (e[i] ?? "").trimEnd();
    rows.push(`<tr class="${same ? "" : "diff"}"><td class="ln">${i + 1}</td><td>${esc(a[i] ?? "")}</td><td>${esc(e[i] ?? "")}</td></tr>`);
  }
  return `<table class="diff-table"><thead><tr><th></th><th>Your output</th><th>Expected</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
}

function filterQuestions(qs, f) {
  const term = f.q.trim().toLowerCase();
  return qs.filter(q =>
    (f.level === "all" || q.level === f.level) &&
    (f.topic === "all" || q.topic === f.topic) &&
    (f.status === "all" || (f.status === "todo" ? store.status(q.id) !== "solved" : store.status(q.id) === f.status)) &&
    (!term || q.title.toLowerCase().includes(term) || q.prompt.toLowerCase().includes(term) || q.id.includes(term)));
}

async function extraPanel(kind) {
  if (kind === "sql") {
    if (!extras.sql) extras.sql = api("/api/sql/schema");
    const { tables } = await extras.sql;
    return `<div class="schema">${tables.map(t => `
      <details class="tbl"><summary><b>${t.name}</b> <span class="muted small">${t.rows} rows</span>
        <button class="btn ghost sm" data-preview="${t.name}">preview</button></summary>
        <div class="cols">${t.columns.map(c => `<span><code>${c.name}</code> <i>${c.type.toLowerCase()}</i></span>`).join("")}</div>
        <div class="prev" data-for="${t.name}"></div>
      </details>`).join("")}</div>`;
  }
  if (!extras.stream) extras.stream = api("/api/stream/harness");
  const { source } = await extras.stream;
  return `<p class="muted small">Your code runs inside <code>main()</code> of this class. Use <code>show(x)</code> to print — maps and sets print sorted, doubles with 2 decimals, records by name.</p>${codeBlock(source, "java")}`;
}

export async function renderPractice(view, kind, questionId) {
  const cfg = CONFIG[kind];
  view.innerHTML = '<div class="loading">Loading questions…</div>';
  const qs = await loadBank(kind);
  const q = qs.find(x => x.id === questionId) || qs.find(x => x.id === store.last(kind)) || qs[0];
  store.setLast(kind, q.id);
  const f = store.pref(`filter-${kind}`, { q: "", level: "all", topic: "all", status: "all" });
  const topics = [...new Set(qs.map(x => x.topic))].sort();
  const solved = lv => qs.filter(x => (lv ? x.level === lv : true) && store.status(x.id) === "solved").length;

  view.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="side-head">
          <div class="side-title">${cfg.title} · ${qs.length} questions</div>
          <div class="meter"><div style="width:${(solved() / qs.length) * 100}%"></div></div>
          <div class="muted small">${solved()} solved · ${LEVELS.map(lv => `${lv[0].toUpperCase()} ${solved(lv)}/${qs.filter(x => x.level === lv).length}`).join(" · ")}</div>
          <input class="search" type="search" placeholder="Search title, text or id…" value="${esc(f.q)}" aria-label="Search questions">
          <div class="chips" role="group" aria-label="Level">${["all", ...LEVELS].map(lv => `<button class="chip ${f.level === lv ? "on" : ""}" data-level="${lv}">${lv}</button>`).join("")}</div>
          <div class="selects">
            <select data-f="topic" aria-label="Topic"><option value="all">All topics</option>${topics.map(t => `<option ${f.topic === t ? "selected" : ""}>${t}</option>`).join("")}</select>
            <select data-f="status" aria-label="Status">${[["all", "Any status"], ["todo", "Unsolved"], ["solved", "Solved"], ["attempted", "Attempted"], ["revealed", "Answer viewed"]].map(([v, l]) => `<option value="${v}" ${f.status === v ? "selected" : ""}>${l}</option>`).join("")}</select>
          </div>
        </div>
        <div class="qlist" role="list"></div>
      </aside>
      <section class="main">
        <div class="q-head">
          <div class="q-meta">
            <span class="badge ${q.level}">${q.level}</span><span class="badge topic">${q.topic}</span><span class="muted small">${q.id}</span>
            <span class="status-tag ${store.status(q.id) || ""}">${{ solved: "✓ solved", attempted: "attempted", revealed: "answer viewed" }[store.status(q.id)] || ""}</span>
          </div>
          <div class="q-nav">
            <button class="btn ghost sm" data-nav="-1" title="Previous (Alt+←)">←</button>
            <button class="btn ghost sm" data-nav="random" title="Random unsolved">⚄</button>
            <button class="btn ghost sm" data-nav="1" title="Next (Alt+→)">→</button>
          </div>
        </div>
        <h1 class="q-title">${esc(q.title)}</h1>
        <div class="q-prompt">${inline(q.prompt)}</div>
        <div class="work">
          <div class="pane editor-pane card">
            <div class="pane-title"><span>${cfg.file}</span>
              <div class="tools">
                <button class="btn primary sm" data-act="run" title="Ctrl+Enter">▶ Run</button>
                <button class="btn ghost sm" data-act="reset">Reset</button>
              </div>
            </div>
            <div class="ed-host"></div>
          </div>
          <div class="pane output-pane card">
            <div class="tabs-bar" role="tablist">
              ${["Output", "Expected", "Answer", cfg.extraTab].map((t, i) => `<button role="tab" class="tab ${i === 0 ? "on" : ""}" data-tab="${t}">${t}</button>`).join("")}
            </div>
            <div class="verdict-bar" hidden></div>
            <div class="tab-body" data-body="Output"><div class="muted">Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or ▶ Run to ${kind === "sql" ? "execute your query" : "compile and run"}.</div></div>
            <div class="tab-body" data-body="Expected" hidden></div>
            <div class="tab-body" data-body="Answer" hidden>
              <div class="reveal"><p>Try it yourself first! Revealing marks this question as <i>answer viewed</i> (solving it later still counts).</p><button class="btn" data-act="reveal">Reveal answer & explanation</button></div>
            </div>
            <div class="tab-body" data-body="${cfg.extraTab}" hidden><div class="muted">Loading…</div></div>
          </div>
        </div>
      </section>
    </div>`;

  // ---- sidebar list ----
  const list = view.querySelector(".qlist");
  const drawList = () => {
    const items = filterQuestions(qs, f);
    list.innerHTML = items.length
      ? items.map(x => `<a role="listitem" class="qitem ${x.id === q.id ? "active" : ""}" href="#/${kind}/${x.id}">
          <span class="dot ${store.status(x.id) || ""}"></span><span class="qnum">${x.id.split("-")[1]}</span>
          <span class="qt">${esc(x.title)}</span><span class="lv ${x.level}">${x.level[0].toUpperCase()}</span></a>`).join("")
      : '<div class="muted pad">No questions match these filters.</div>';
    store.setPref(`filter-${kind}`, f);
  };
  drawList();
  list.querySelector(".active")?.scrollIntoView({ block: "center" });
  view.querySelector(".search").addEventListener("input", e => { f.q = e.target.value; drawList(); });
  view.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
    f.level = c.dataset.level;
    view.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === c));
    drawList();
  }));
  view.querySelectorAll("select[data-f]").forEach(s => s.addEventListener("change", () => { f[s.dataset.f] = s.value; drawList(); }));

  // ---- tabs ----
  const showTab = name => {
    view.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.tab === name));
    view.querySelectorAll(".tab-body").forEach(b => (b.hidden = b.dataset.body !== name));
  };
  view.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));
  const body = name => view.querySelector(`[data-body="${name}"]`);
  body("Expected").innerHTML = kind === "sql"
    ? `<p class="muted small">${q.ordered ? "Row order matters (the reference query uses ORDER BY)." : "Row order does not matter."} Column order may differ if your column names match.</p>${tableHtml(q.expected.columns, q.expected.rows)}`
    : `<p class="muted small">Your stdout must match exactly (trailing spaces ignored).</p><pre class="out">${esc(q.expected)}</pre>`;
  extraPanel(kind).then(html => {
    const b = body(cfg.extraTab);
    b.innerHTML = html;
    b.querySelectorAll("[data-preview]").forEach(btn => btn.addEventListener("click", async ev => {
      ev.preventDefault();
      const t = btn.dataset.preview;
      const res = await api("/api/run/sql", { sql: `SELECT * FROM ${t} LIMIT 10` });
      b.querySelector(`.prev[data-for="${t}"]`).innerHTML = tableHtml(res.columns, res.rows);
      btn.closest("details").open = true;
    }));
  }).catch(err => (body(cfg.extraTab).innerHTML = `<div class="error">${esc(err.message)}</div>`));

  const revealAnswer = () => {
    body("Answer").innerHTML = `${codeBlock(q.answer, cfg.lang)}<div class="explain"><div class="card-title">Explanation</div>${md(q.explanation)}</div>
      <button class="btn sm" data-act="load">Load answer into editor</button>`;
    body("Answer").querySelector('[data-act="load"]').onclick = () => { editor.value = q.starter + q.answer + "\n"; store.setCode(q.id, editor.value); };
    if (store.status(q.id) !== "solved") store.setStatus(q.id, "revealed");
  };
  view.querySelector('[data-act="reveal"]').onclick = revealAnswer;
  if (store.status(q.id) === "revealed" || store.status(q.id) === "solved") {
    body("Answer").querySelector(".reveal p").textContent = "You already viewed or solved this one.";
  }

  // ---- editor & run ----
  const verdict = view.querySelector(".verdict-bar");
  const runBtn = view.querySelector('[data-act="run"]');
  const run = async () => {
    if (runBtn.disabled) return;
    runBtn.disabled = true;
    runBtn.textContent = kind === "sql" ? "Running…" : "Compiling…";
    showTab("Output");
    const out = body("Output");
    out.innerHTML = `<div class="spinner"></div>`;
    verdict.hidden = true;
    try {
      const payload = kind === "sql" ? { sql: editor.value, question_id: q.id } : { code: editor.value, question_id: q.id };
      const res = await api(cfg.runPath, payload);
      const meta = `<div class="muted small">${res.ms} ms${res.truncated ? " · output truncated" : ""}</div>`;
      if (kind === "sql") {
        out.innerHTML = res.error ? `<div class="error"><b>SQL error</b><pre>${esc(res.error)}</pre></div>` : tableHtml(res.columns, res.rows) + meta;
      } else {
        const label = { compile: "Compilation error", runtime: "Runtime exception", timeout: "Time limit exceeded" }[res.error];
        out.innerHTML = `${res.error ? `<div class="error"><b>${label}</b><pre>${esc(res.stderr)}</pre></div>` : ""}
          ${res.stdout ? `<pre class="out">${esc(res.stdout)}</pre>` : res.error ? "" : '<div class="muted">(no output — did you call show(...)?)</div>'}${meta}`;
        if (!res.error && res.correct === false && res.stdout) out.insertAdjacentHTML("beforeend", diffHtml(res.stdout, q.expected));
      }
      verdict.hidden = false;
      if (res.correct) {
        verdict.className = "verdict-bar good";
        const next = qs[qs.indexOf(q) + 1];
        verdict.innerHTML = `✓ Correct! ${next ? `<a href="#/${kind}/${next.id}">Next question →</a>` : ""}`;
        store.setStatus(q.id, "solved");
      } else {
        verdict.className = "verdict-bar bad";
        verdict.innerHTML = res.error ? "✗ Fix the error and run again." : `✗ Not quite — compare with the <a href="#" data-goto="Expected">expected output</a>.`;
        verdict.querySelector("[data-goto]")?.addEventListener("click", e => { e.preventDefault(); showTab("Expected"); });
        store.setStatus(q.id, "attempted");
      }
      const tag = view.querySelector(".status-tag");
      const st = store.status(q.id);
      tag.className = "status-tag " + st;
      tag.textContent = { solved: "✓ solved", attempted: "attempted", revealed: "answer viewed" }[st];
      const dot = list.querySelector(".qitem.active .dot");
      if (dot) dot.className = "dot " + st;
    } catch (err) {
      out.innerHTML = `<div class="error"><b>Could not run</b><pre>${esc(err.message)}</pre></div>`;
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = "▶ Run";
    }
  };
  const editor = createEditor(view.querySelector(".ed-host"), {
    lang: cfg.lang, value: store.code(q.id) ?? q.starter, onRun: run,
    onChange: v => store.setCode(q.id, v), label: `${cfg.title} editor`,
  });
  runBtn.onclick = run;
  view.querySelector('[data-act="reset"]').onclick = () => { editor.value = q.starter; store.clearCode(q.id); editor.focus(); };
  const ta = editor.textarea;
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);

  // ---- navigation ----
  const go = step => {
    let target;
    if (step === "random") {
      const pool = qs.filter(x => store.status(x.id) !== "solved" && x.id !== q.id);
      target = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const visible = filterQuestions(qs, f);
      const pos = visible.indexOf(q);
      target = pos === -1 ? qs[qs.indexOf(q) + step] : visible[pos + step];
    }
    if (target) location.hash = `#/${kind}/${target.id}`;
  };
  view.querySelectorAll("[data-nav]").forEach(b => b.addEventListener("click", () => go(b.dataset.nav === "random" ? "random" : Number(b.dataset.nav))));
  const onKey = e => {
    if (e.altKey && e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}
