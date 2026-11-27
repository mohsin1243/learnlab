// Shared API client and local progress store.
const TOKEN = document.querySelector('meta[name="learnlab-token"]').content;

export async function api(path, body) {
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", "X-LearnLab-Token": TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 403) throw new Error("Session expired — the LearnLab server was restarted. Reload the page (F5).");
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Request failed (${res.status})`);
  return data;
}

const KEY = "learnlab:v1";
const blank = () => ({ status: {}, code: {}, last: {}, prefs: {} });

function load() {
  try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return blank(); }
}

const state = load();
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const listeners = new Set();

export const store = {
  // status: "solved" | "attempted" | "revealed"
  status: id => state.status[id],
  setStatus(id, s) {
    if (state.status[id] === "solved" && s !== "solved") return;
    state.status[id] = s;
    save();
    listeners.forEach(l => l(id));
  },
  code: id => state.code[id],
  setCode(id, c) { state.code[id] = c; save(); },
  clearCode(id) { delete state.code[id]; save(); },
  last: section => state.last[section],
  setLast(section, id) { state.last[section] = id; save(); },
  pref: (k, d) => (k in state.prefs ? state.prefs[k] : d),
  setPref(k, v) { state.prefs[k] = v; save(); },
  countSolved: prefix => Object.entries(state.status).filter(([k, v]) => k.startsWith(prefix) && v === "solved").length,
  onChange: fn => listeners.add(fn),
  reset() { Object.assign(state, blank()); save(); listeners.forEach(l => l()); },
};
