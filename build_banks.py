"""Build data/stream.json and data/sql.json with expected outputs computed by running reference answers."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from app.banks import sql_bank, stream_bank
from app.java_runner import run_batch
from app.sql_runner import run_query

DATA_DIR = Path(__file__).resolve().parent / "data"
_TOP_LEVEL_ORDER = re.compile(r"order\s+by[^()]*$", re.IGNORECASE | re.DOTALL)


def is_ordered(sql: str) -> bool:
    return bool(_TOP_LEVEL_ORDER.search(sql.strip().rstrip(";")))


def build_stream() -> list[dict[str, Any]]:
    qs = stream_bank.questions()
    outs = run_batch([q["answer"] for q in qs])
    bad = [(q["id"], q["title"], out[:200]) for q, out in zip(qs, outs) if not out or out.startswith("EXCEPTION")]
    if bad:
        raise SystemExit("Stream answers failed:\n" + "\n".join(map(str, bad)))
    for q, out in zip(qs, outs):
        q["expected"] = out
    return qs


def build_sql() -> list[dict[str, Any]]:
    qs = sql_bank.questions()
    bad = []
    for q in qs:
        res = run_query(q["answer"])
        if res.error or not res.rows:
            bad.append((q["id"], q["title"], res.error or "no rows"))
            continue
        q["expected"] = {"columns": res.columns, "rows": res.rows}
        q["ordered"] = is_ordered(q["answer"])
    if bad:
        raise SystemExit("SQL answers failed:\n" + "\n".join(map(str, bad)))
    return qs


def write(name: str, qs: list[dict[str, Any]]) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    path = DATA_DIR / f"{name}.json"
    path.write_text(json.dumps({"questions": qs}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {path.name}: {len(qs)} questions")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=["stream", "sql"])
    args = parser.parse_args(argv)
    if args.only in (None, "sql"):
        write("sql", build_sql())
    if args.only in (None, "stream"):
        write("stream", build_stream())
    return 0


if __name__ == "__main__":
    sys.exit(main())
