import json

import build_banks


def test_is_ordered_detects_only_top_level_order_by():
    assert build_banks.is_ordered("SELECT a FROM t ORDER BY a;")
    assert not build_banks.is_ordered("SELECT ROW_NUMBER() OVER (ORDER BY a) FROM t")
    assert not build_banks.is_ordered("SELECT a FROM t")


def test_main_builds_sql_bank_with_verified_outputs(tmp_path, monkeypatch):
    monkeypatch.setattr(build_banks, "DATA_DIR", tmp_path)
    assert build_banks.main(["--only", "sql"]) == 0
    qs = json.loads((tmp_path / "sql.json").read_text(encoding="utf-8"))["questions"]
    assert len(qs) == 200 and all(q["expected"]["rows"] for q in qs)


def test_build_sql_fails_loudly_on_broken_answer(monkeypatch):
    broken = [{"id": "sql-x", "title": "bad", "answer": "SELECT nope FROM nowhere"}]
    monkeypatch.setattr(build_banks.sql_bank, "questions", lambda: broken)
    try:
        build_banks.build_sql()
    except SystemExit as exc:
        assert "sql-x" in str(exc)
    else:
        raise AssertionError("expected SystemExit")
