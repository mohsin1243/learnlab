"""Run user SQL against a fresh, seeded, in-memory SQLite database."""

from __future__ import annotations

import sqlite3
import time
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any

SEED_PATH = Path(__file__).with_name("seed.sql")
MAX_STATEMENTS = 20
_DENIED_ACTIONS = {sqlite3.SQLITE_ATTACH, sqlite3.SQLITE_DETACH}


@dataclass
class QueryResult:
    columns: list[str] = field(default_factory=list)
    rows: list[list[Any]] = field(default_factory=list)
    error: str | None = None
    truncated: bool = False
    ms: int = 0


@lru_cache(maxsize=1)
def _seed_sql() -> str:
    return SEED_PATH.read_text(encoding="utf-8")


def _authorizer(action: int, *_args: Any) -> int:
    return sqlite3.SQLITE_DENY if action in _DENIED_ACTIONS else sqlite3.SQLITE_OK


def _split_statements(sql: str) -> list[str]:
    statements: list[str] = []
    buf = ""
    for line in sql.splitlines(keepends=True):
        buf += line
        while sqlite3.complete_statement(buf):
            # complete_statement is true once the buffer ends a statement; peel one off at a time.
            idx = _first_terminator(buf)
            statements.append(buf[: idx + 1].strip())
            buf = buf[idx + 1 :]
    if buf.strip():
        statements.append(buf.strip())
    return [s for s in statements if s.strip(" ;\n\t\r")]


def _first_terminator(buf: str) -> int:
    for i, ch in enumerate(buf):
        if ch == ";" and sqlite3.complete_statement(buf[: i + 1]):
            return i
    return len(buf) - 1


def new_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.executescript(_seed_sql())
    conn.set_authorizer(_authorizer)
    return conn


def run_query(sql: str, timeout_s: float = 3.0, max_rows: int = 500) -> QueryResult:
    start = time.perf_counter()
    statements = _split_statements(sql or "")
    if not statements:
        return QueryResult(error="Write a query first.")
    if len(statements) > MAX_STATEMENTS:
        return QueryResult(error=f"Too many statements (max {MAX_STATEMENTS}).")

    conn = new_connection()
    deadline = start + timeout_s
    conn.set_progress_handler(lambda: 1 if time.perf_counter() > deadline else 0, 10_000)
    result = QueryResult()
    try:
        for stmt in statements:
            cur = conn.execute(stmt)
            if cur.description:
                result.columns = [d[0] for d in cur.description]
                fetched = cur.fetchmany(max_rows + 1)
                result.truncated = len(fetched) > max_rows
                result.rows = [list(r) for r in fetched[:max_rows]]
    except sqlite3.OperationalError as exc:
        msg = str(exc)
        result.error = "Query timed out." if msg == "interrupted" else msg
    except sqlite3.DatabaseError as exc:
        result.error = str(exc)
    except sqlite3.Warning as exc:
        result.error = str(exc)
    finally:
        conn.close()
    result.ms = int((time.perf_counter() - start) * 1000)
    return result


def _norm(value: Any) -> Any:
    if isinstance(value, float):
        rounded = round(value, 2)
        return int(rounded) if rounded.is_integer() else rounded
    return value


def _norm_rows(rows: list[list[Any]]) -> list[tuple[Any, ...]]:
    return [tuple(_norm(v) for v in row) for row in rows]


def _rows_equal(a: list[tuple[Any, ...]], e: list[tuple[Any, ...]], ordered: bool) -> bool:
    if ordered:
        return a == e
    key = lambda r: tuple((v is None, str(type(v)), str(v)) for v in r)  # noqa: E731
    return sorted(a, key=key) == sorted(e, key=key)


def _reorder_by_name(rows: list[list[Any]], actual: list[str], expected: list[str]) -> list[list[Any]] | None:
    a = [c.lower() for c in actual]
    e = [c.lower() for c in expected]
    if sorted(a) != sorted(e) or len(set(a)) != len(a):
        return None
    idx = [a.index(c) for c in e]
    return [[row[i] for i in idx] for row in rows]


def compare_rows(actual: list[list[Any]], expected: list[list[Any]], ordered: bool,
                 actual_columns: list[str] | None = None, expected_columns: list[str] | None = None) -> bool:
    if _rows_equal(_norm_rows(actual), _norm_rows(expected), ordered):
        return True
    if actual_columns and expected_columns:
        reordered = _reorder_by_name(actual, actual_columns, expected_columns)
        if reordered is not None:
            return _rows_equal(_norm_rows(reordered), _norm_rows(expected), ordered)
    return False


@lru_cache(maxsize=1)
def _schema_cache() -> tuple[tuple[str, tuple[tuple[str, str], ...], int], ...]:
    conn = new_connection()
    try:
        names = [r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")]
        out = []
        for name in names:
            cols = tuple((c[1], c[2]) for c in conn.execute(f"PRAGMA table_info({name})"))
            count = conn.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]
            out.append((name, cols, count))
        return tuple(out)
    finally:
        conn.close()


def schema_info() -> list[dict[str, Any]]:
    return [
        {"name": n, "columns": [{"name": c, "type": t} for c, t in cols], "rows": count}
        for n, cols, count in _schema_cache()
    ]
