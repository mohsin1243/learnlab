"""LearnLab FastAPI app: serves the UI and runs user code locally."""

from __future__ import annotations

import json
import os
import secrets
import threading
import time
import uuid
from functools import lru_cache
from pathlib import Path
from typing import Any

import structlog
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from app import __version__
from app.java_runner import JavaUnavailable, harness_source, outputs_match, run_java
from app.sql_runner import compare_rows, run_query, schema_info

ROOT = Path(__file__).resolve().parent.parent
STATIC_DIR = ROOT / "static"
DATA_DIR = ROOT / "data"
LOCAL_HOSTS = {"127.0.0.1", "localhost"}
BANKS = {"stream", "sql"}
TOKEN_PLACEHOLDER = "__LEARNLAB_TOKEN__"

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger(service="learnlab")


class JavaRun(BaseModel):
    code: str = Field(min_length=1, max_length=50_000)
    question_id: str | None = Field(default=None, max_length=64)


class SqlRun(BaseModel):
    sql: str = Field(min_length=1, max_length=20_000)
    question_id: str | None = Field(default=None, max_length=64)


def _host_name(host_header: str) -> str:
    if host_header.startswith("["):
        return host_header.split("]")[0] + "]"
    return host_header.rsplit(":", 1)[0] if ":" in host_header else host_header


def allowed_hosts(port: int) -> set[str]:
    """Localhost plus the exact Codespaces forwarding host and any LEARNLAB_ALLOWED_HOSTS entries."""
    return LOCAL_HOSTS | _extra_hosts(port)


def _extra_hosts(port: int) -> set[str]:
    hosts = {h.strip().lower() for h in os.environ.get("LEARNLAB_ALLOWED_HOSTS", "").split(",") if h.strip()}
    name = os.environ.get("CODESPACE_NAME")
    domain = os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN")
    if name and domain:
        hosts.add(f"{name}-{port}.{domain}".lower())
    return hosts


def _codespaces_domain() -> str | None:
    """Forwarding domain when running inside GitHub Codespaces (only GitHub controls it)."""
    if os.environ.get("CODESPACES", "").lower() != "true":
        return None
    return os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN", "app.github.dev").lower()


def _host_allowed(host: str, allowed: set[str], domain: str | None) -> bool:
    return host in allowed or bool(domain and host.endswith("." + domain))


def _origin_ok(origin: str | None, extra: set[str], domain: str | None = None) -> bool:
    if not origin:
        return True
    for scheme in ("http://", "https://"):
        if origin.startswith(scheme):
            host = _host_name(origin[len(scheme):]).lower()
            # The Codespaces proxy rewrites Origin to https://localhost:PORT.
            if host in LOCAL_HOSTS:
                return True
            return scheme == "https://" and _host_allowed(host, extra, domain)
    return False


def create_app(data_dir: Path = DATA_DIR, token: str | None = None) -> FastAPI:
    app_token = token or secrets.token_urlsafe(24)
    app = FastAPI(title="LearnLab", docs_url=None, redoc_url=None, openapi_url=None)
    java_slots = threading.BoundedSemaphore(2)
    extra = _extra_hosts(int(os.environ.get("LEARNLAB_PORT", "8765")))
    hosts = LOCAL_HOSTS | extra
    domain = _codespaces_domain()

    @lru_cache(maxsize=4)
    def load_bank(name: str) -> dict[str, Any]:
        path = data_dir / f"{name}.json"
        if not path.is_file():
            raise HTTPException(404, f"Bank '{name}' not built. Run build_banks.py.")
        return json.loads(path.read_text(encoding="utf-8"))

    def question(name: str, qid: str | None) -> dict[str, Any] | None:
        if not qid:
            return None
        for q in load_bank(name)["questions"]:
            if q["id"] == qid:
                return q
        raise HTTPException(404, "Unknown question")

    @app.middleware("http")
    async def guard(request: Request, call_next):
        trace_id = request.headers.get("traceparent", "").split("-")[1:2] or [uuid.uuid4().hex]
        host_ok = _host_allowed(_host_name(request.headers.get("host", "")).lower(), hosts, domain)
        forwarded = _host_name(request.headers.get("x-forwarded-host", "").split(",")[0].strip()).lower()
        origin_hosts = extra | {forwarded} if forwarded else extra
        # Fetch Metadata can't be forged by web pages; same-origin requests are safe behind any proxy.
        same_origin = request.headers.get("sec-fetch-site") in ("same-origin", "none")
        origin_ok = same_origin or _origin_ok(request.headers.get("origin"), origin_hosts, domain)
        if not host_ok or not origin_ok:
            log.warning("request.rejected", reason="host_or_origin", path=request.url.path,
                        host=request.headers.get("host"), origin=request.headers.get("origin"),
                        forwarded_host=forwarded or None, trace_id=trace_id[0])
            return JSONResponse({"detail": "Forbidden"}, status_code=403)
        path = request.url.path
        if path.startswith("/api/") and path != "/api/health":
            if not secrets.compare_digest(request.headers.get("x-learnlab-token", ""), app_token):
                log.warning("request.rejected", reason="token", path=path, trace_id=trace_id[0])
                return JSONResponse({"detail": "Forbidden"}, status_code=403)
        start = time.perf_counter()
        response = await call_next(request)
        log.info("request.done", path=path, status=response.status_code,
                 ms=int((time.perf_counter() - start) * 1000), trace_id=trace_id[0])
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        return response

    @app.get("/", response_class=HTMLResponse)
    def index() -> str:
        html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
        return html.replace(TOKEN_PLACEHOLDER, app_token)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "version": __version__}

    @app.get("/api/bank/{name}")
    def bank(name: str) -> dict[str, Any]:
        if name not in BANKS:
            raise HTTPException(404, "Unknown bank")
        return load_bank(name)

    @app.get("/api/sql/schema")
    def sql_schema() -> dict[str, Any]:
        return {"tables": schema_info()}

    @app.get("/api/stream/harness")
    def stream_harness() -> dict[str, str]:
        return {"source": harness_source()}

    @app.post("/api/run/sql")
    def run_sql(body: SqlRun) -> dict[str, Any]:
        q = question("sql", body.question_id)
        res = run_query(body.sql)
        correct = None
        if q is not None:
            correct = res.error is None and compare_rows(
                res.rows, q["expected"]["rows"], q.get("ordered", False),
                actual_columns=res.columns, expected_columns=q["expected"].get("columns"))
        log.info("run.sql", ms=res.ms, ok=res.error is None, graded=q is not None, correct=correct)
        return {"columns": res.columns, "rows": res.rows, "error": res.error,
                "truncated": res.truncated, "ms": res.ms, "correct": correct}

    @app.post("/api/run/java")
    async def run_java_endpoint(body: JavaRun) -> dict[str, Any]:
        q = question("stream", body.question_id)

        def job():
            with java_slots:
                return run_java(body.code)

        try:
            res = await run_in_threadpool(job)
        except JavaUnavailable as exc:
            raise HTTPException(503, str(exc)) from exc
        correct = None
        if q is not None:
            correct = res.error is None and outputs_match(res.stdout, q["expected"])
        log.info("run.java", ms=res.ms, status=res.error or "ok", graded=q is not None, correct=correct)
        return {"stdout": res.stdout, "stderr": res.stderr, "error": res.error,
                "truncated": res.truncated, "ms": res.ms, "correct": correct}

    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    return app


def main() -> None:
    import uvicorn

    port = int(os.environ.get("LEARNLAB_PORT", "8765"))
    uvicorn.run(create_app(), host="127.0.0.1", port=port, log_level="warning")


if __name__ == "__main__":
    main()
