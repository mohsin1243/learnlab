"""Question-bank templates and expansion into concrete questions."""

from __future__ import annotations

from typing import Any, Callable

LEVEL_ORDER = ["beginner", "intermediate", "advanced"]
_TEXT_FIELDS = ("title", "prompt", "answer", "explanation")


def t(level: str, topic: str, title: str, prompt: str, answer: str, explanation: str,
      *vary: dict[str, Any]) -> dict[str, Any]:
    return {"level": level, "topic": topic, "title": title, "prompt": prompt,
            "answer": answer.strip("\n"), "explanation": explanation, "vary": list(vary)}


def _fill(text: str, params: dict[str, Any]) -> str:
    for key, val in params.items():
        text = text.replace("{{" + key + "}}", str(val))
    return text


def trim_to(templates: list[dict[str, Any]], total: int) -> list[dict[str, Any]]:
    """Drop trailing variants from the most-varied templates until exactly `total` remain."""
    tpls = [dict(tpl, vary=list(tpl["vary"])) for tpl in templates]
    count = sum(max(1, len(tpl["vary"])) for tpl in tpls)
    while count > total:
        widest = max(tpls, key=lambda tpl: len(tpl["vary"]))
        if len(widest["vary"]) <= 1:
            break
        widest["vary"].pop()
        count -= 1
    return tpls


def expand(templates: list[dict[str, Any]], prefix: str,
           starter: Callable[[dict[str, Any]], str] | None = None) -> list[dict[str, Any]]:
    ordered = sorted(templates, key=lambda tpl: LEVEL_ORDER.index(tpl["level"]))
    out: list[dict[str, Any]] = []
    for tpl in ordered:
        for params in tpl.get("vary") or [{}]:
            q = {k: tpl[k] for k in ("level", "topic")}
            q.update({f: _fill(tpl[f], params) for f in _TEXT_FIELDS})
            q["id"] = f"{prefix}-{len(out) + 1:03d}"
            q["starter"] = starter(q) if starter else ""
            out.append(q)
    return out
