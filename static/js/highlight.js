// Tiny regex-based syntax highlighter for java, sql and jsx.
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const JAVA_KW = "abstract|assert|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|null|package|private|protected|public|record|return|short|static|super|switch|this|throw|throws|try|var|void|while|true|false|yield";
const SQL_KW = "select|from|where|and|or|not|in|is|null|as|join|inner|left|right|full|outer|cross|on|group|by|order|having|limit|offset|distinct|union|all|intersect|except|case|when|then|else|end|with|recursive|over|partition|rows|range|between|unbounded|preceding|following|current|row|window|insert|into|values|update|set|delete|create|table|drop|alter|primary|key|references|exists|like|asc|desc|cast|integer|text|real|default";
const SQL_FN = "count|sum|avg|min|max|round|coalesce|ifnull|nullif|upper|lower|length|substr|strftime|date|julianday|row_number|rank|dense_rank|ntile|lag|lead|first_value|last_value|percent_rank|cume_dist|group_concat|json_group_array|abs|trim|replace|printf";
const JS_KW = "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|import|export|from|default|try|catch|finally|throw|async|await|typeof|instanceof|in|of|null|undefined|true|false|yield|static|get|set";

const RULES = {
  java: new RegExp([
    "(?<c>\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)",
    "(?<s>\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])')",
    "(?<n>\\b\\d[\\d_]*(?:\\.\\d+)?[LlDdFf]?\\b)",
    `(?<k>\\b(?:${JAVA_KW})\\b)`,
    "(?<t>\\b[A-Z][A-Za-z0-9_]*\\b)",
    "(?<f>\\b[a-z_][A-Za-z0-9_]*(?=\\())",
  ].join("|"), "g"),
  sql: new RegExp([
    "(?<c>--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)",
    "(?<s>'(?:''|[^'])*')",
    "(?<n>\\b\\d+(?:\\.\\d+)?\\b)",
    `(?<k>\\b(?:${SQL_KW})\\b)`,
    `(?<f>\\b(?:${SQL_FN})(?=\\s*\\())`,
  ].join("|"), "gi"),
  jsx: new RegExp([
    "(?<c>\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)",
    "(?<s>\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)",
    "(?<g><\\/?[A-Za-z][\\w.]*|\\/?>)",
    "(?<n>\\b\\d+(?:\\.\\d+)?\\b)",
    `(?<k>\\b(?:${JS_KW})\\b)`,
    "(?<t>\\b[A-Z][A-Za-z0-9_]*\\b)",
    "(?<f>\\b[a-zA-Z_$][\\w$]*(?=\\())",
  ].join("|"), "g"),
};
const CLS = { c: "tk-c", s: "tk-s", n: "tk-n", k: "tk-k", t: "tk-t", f: "tk-f", g: "tk-g" };

export function highlight(code, lang) {
  const re = RULES[lang];
  if (!re) return esc(code);
  let out = "";
  let last = 0;
  re.lastIndex = 0;
  for (const m of code.matchAll(re)) {
    out += esc(code.slice(last, m.index));
    const group = Object.keys(m.groups).find(g => m.groups[g] !== undefined);
    out += `<span class="${CLS[group]}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

export { esc };
