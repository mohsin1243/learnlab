import json

import pytest
from fastapi.testclient import TestClient

from app import java_runner
from app.main import create_app

TOKEN = "t0ken"
HDRS = {"X-LearnLab-Token": TOKEN}


@pytest.fixture()
def client(tmp_path):
    (tmp_path / "sql.json").write_text(json.dumps({"questions": [{
        "id": "sql-1", "answer": "SELECT 1", "expected": {"columns": ["1"], "rows": [[1]]}, "ordered": False,
    }]}))
    (tmp_path / "stream.json").write_text(json.dumps({"questions": [{
        "id": "st-1", "answer": "show(2);", "expected": "2",
    }]}))
    return TestClient(create_app(data_dir=tmp_path, token=TOKEN), base_url="http://127.0.0.1:8765")


def test_index_injects_token(client):
    r = client.get("/")
    assert r.status_code == 200 and TOKEN in r.text


def test_api_requires_token(client):
    assert client.get("/api/bank/sql").status_code == 403
    assert client.get("/api/bank/sql", headers=HDRS).status_code == 200


def test_foreign_host_rejected(client):
    r = client.get("/api/bank/sql", headers={**HDRS, "Host": "evil.com"})
    assert r.status_code == 403


def test_foreign_origin_rejected(client):
    r = client.post("/api/run/sql", json={"sql": "SELECT 1"}, headers={**HDRS, "Origin": "https://evil.com"})
    assert r.status_code == 403


def test_unknown_bank_404(client):
    assert client.get("/api/bank/nope", headers=HDRS).status_code == 404


def test_run_sql_grades_against_question(client):
    r = client.post("/api/run/sql", json={"sql": "SELECT 1", "question_id": "sql-1"}, headers=HDRS).json()
    assert r["rows"] == [[1]] and r["correct"] is True
    r = client.post("/api/run/sql", json={"sql": "SELECT 2", "question_id": "sql-1"}, headers=HDRS).json()
    assert r["correct"] is False


def test_run_sql_without_question_has_no_grade(client):
    r = client.post("/api/run/sql", json={"sql": "SELECT 1"}, headers=HDRS).json()
    assert r["correct"] is None


def test_sql_schema(client):
    r = client.get("/api/sql/schema", headers=HDRS).json()
    assert any(t["name"] == "employees" for t in r["tables"])


def test_payload_too_large_rejected(client):
    r = client.post("/api/run/sql", json={"sql": "x" * 60_000}, headers=HDRS)
    assert r.status_code == 422


def test_allowed_hosts_from_codespaces_env(monkeypatch):
    from app.main import allowed_hosts

    monkeypatch.setenv("CODESPACE_NAME", "fuzzy-space")
    monkeypatch.setenv("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", "app.github.dev")
    monkeypatch.setenv("LEARNLAB_ALLOWED_HOSTS", "a.example, b.example")
    hosts = allowed_hosts(8765)
    assert {"127.0.0.1", "localhost", "fuzzy-space-8765.app.github.dev", "a.example", "b.example"} <= hosts


def test_codespaces_host_and_https_origin_accepted(monkeypatch, tmp_path):
    monkeypatch.setenv("LEARNLAB_ALLOWED_HOSTS", "cs-8765.app.github.dev")
    (tmp_path / "sql.json").write_text('{"questions": []}')
    c = TestClient(create_app(data_dir=tmp_path, token=TOKEN), base_url="https://cs-8765.app.github.dev")
    ok = c.get("/api/bank/sql", headers={**HDRS, "Origin": "https://cs-8765.app.github.dev"})
    assert ok.status_code == 200
    bad = c.get("/api/bank/sql", headers={**HDRS, "Origin": "http://cs-8765.app.github.dev"})
    assert bad.status_code == 403
    assert c.get("/api/bank/sql", headers={**HDRS, "Host": "other-8765.app.github.dev"}).status_code == 403


def test_proxied_same_origin_module_request_accepted(client):
    # Codespaces proxies with Host=localhost and the public origin in X-Forwarded-Host.
    h = {"Host": "localhost:8765", "X-Forwarded-Host": "cs-8765.app.github.dev",
         "Origin": "https://cs-8765.app.github.dev"}
    assert client.get("/static/js/app.js", headers=h).status_code == 200
    assert client.get("/api/bank/sql", headers={**HDRS, **h}).status_code == 200


def test_proxied_foreign_origin_still_rejected(client):
    h = {"Host": "localhost:8765", "X-Forwarded-Host": "cs-8765.app.github.dev", "Origin": "https://evil.example"}
    assert client.get("/static/js/app.js", headers=h).status_code == 403


def test_codespaces_proxy_rewritten_origin_accepted(client):
    # Exact headers from the Codespaces log: proxy rewrites Origin to https://localhost:PORT.
    h = {"Host": "localhost:8765", "Origin": "https://localhost:8765",
         "X-Forwarded-Host": "cuddly-invention-55rj4v9r75g29g6-8765.app.github.dev"}
    assert client.get("/static/js/app.js", headers=h).status_code == 200
    assert client.post("/api/run/sql", json={"sql": "SELECT 1"}, headers={**HDRS, **h}).status_code == 200


def test_fetch_metadata_same_origin_accepted_behind_any_proxy(client):
    h = {"Sec-Fetch-Site": "same-origin", "Origin": "https://anything-8765.app.github.dev"}
    assert client.get("/static/js/app.js", headers=h).status_code == 200
    r = client.post("/api/run/sql", json={"sql": "SELECT 1"}, headers={**HDRS, **h})
    assert r.status_code == 200


def test_fetch_metadata_cross_site_rejected(client):
    h = {"Sec-Fetch-Site": "cross-site", "Origin": "https://evil.example"}
    assert client.get("/static/js/app.js", headers=h).status_code == 403


def test_codespaces_forwarding_hosts_accepted(monkeypatch, tmp_path):
    monkeypatch.setenv("CODESPACES", "true")
    monkeypatch.delenv("CODESPACE_NAME", raising=False)
    (tmp_path / "sql.json").write_text('{"questions": []}')
    c = TestClient(create_app(data_dir=tmp_path, token=TOKEN), base_url="https://x-8765.app.github.dev")
    assert c.get("/", headers={"Origin": "https://x-8765.app.github.dev"}).status_code == 200
    assert c.get("/", headers={"Host": "evil.example"}).status_code == 403
    assert c.get("/", headers={"Host": "x.app.github.dev.evil.example"}).status_code == 403


def test_health_reports_version(client):
    from app import __version__

    assert client.get("/api/health").json() == {"status": "ok", "version": __version__}


def test_health_is_public(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_stream_harness_source(client):
    src = client.get("/api/stream/harness", headers=HDRS).json()["source"]
    assert "record Employee" in src and "__BODY__" not in src


@pytest.mark.skipif(not java_runner.java_available(), reason="JDK not installed")
def test_run_java_grades(client):
    r = client.post("/api/run/java", json={"code": "show(1+1);", "question_id": "st-1"}, headers=HDRS).json()
    assert r["stdout"].strip() == "2" and r["correct"] is True


def test_run_java_unavailable_returns_503(client, monkeypatch):
    def boom(*_a, **_k):
        raise java_runner.JavaUnavailable("no jdk")

    monkeypatch.setattr("app.main.run_java", boom)
    r = client.post("/api/run/java", json={"code": "show(1);"}, headers=HDRS)
    assert r.status_code == 503
