import json
from pathlib import Path

import pytest

from app import java_runner
from app.banks import expand, sql_bank, stream_bank, trim_to
from app.java_runner import outputs_match, run_batch
from app.sql_runner import compare_rows, run_query

DATA = Path(__file__).resolve().parent.parent / "data"
LEVELS = {"beginner", "intermediate", "advanced"}
FIELDS = {"id", "title", "level", "topic", "prompt", "starter", "answer", "explanation", "expected"}


def _load(name):
    path = DATA / f"{name}.json"
    if not path.is_file():
        pytest.skip(f"{name}.json not built")
    return json.loads(path.read_text(encoding="utf-8"))["questions"]


def test_expand_substitutes_params_and_ids():
    tpl = [{"level": "beginner", "topic": "t", "title": "Gt {{k}}", "prompt": "p {{k}}",
            "answer": "a {{k}}", "explanation": "e {{k}}", "vary": [{"k": 1}, {"k": 2}]}]
    out = expand(tpl, "x")
    assert [q["id"] for q in out] == ["x-001", "x-002"]
    assert out[1]["title"] == "Gt 2" and out[1]["answer"] == "a 2"


def test_trim_to_removes_variants_from_widest_template():
    tpls = [{"vary": [1, 2, 3]}, {"vary": [1]}, {"vary": []}]
    out = trim_to(tpls, 3)
    assert [len(x["vary"]) for x in out] == [1, 1, 0]
    assert len(tpls[0]["vary"]) == 3


def test_template_sources_have_exact_counts():
    assert len(stream_bank.questions()) == 500
    assert len(sql_bank.questions()) == 200


@pytest.mark.parametrize("name,count", [("stream", 500), ("sql", 200)])
def test_built_bank_integrity(name, count):
    qs = _load(name)
    assert len(qs) == count
    assert len({q["id"] for q in qs}) == count
    assert len({q["prompt"] for q in qs}) == count, "prompts must be unique"
    assert {q["level"] for q in qs} == LEVELS
    for q in qs:
        assert FIELDS <= q.keys(), q["id"]
        assert all(q[f] not in ("", None) for f in FIELDS - {"expected"}), q["id"]
    levels = [q["level"] for q in qs]
    assert levels == sorted(levels, key=["beginner", "intermediate", "advanced"].index)


def test_sql_expected_outputs_are_reproducible():
    for q in _load("sql"):
        res = run_query(q["answer"])
        assert res.error is None, (q["id"], res.error)
        assert res.rows, q["id"]
        assert compare_rows(res.rows, q["expected"]["rows"], q["ordered"]), q["id"]


@pytest.mark.skipif(not java_runner.java_available(), reason="JDK not installed")
def test_stream_expected_outputs_are_reproducible():
    qs = _load("stream")
    outs = run_batch([q["answer"] for q in qs])
    for q, out in zip(qs, outs):
        assert out and not out.startswith("EXCEPTION"), q["id"]
        assert outputs_match(out, q["expected"]), q["id"]
