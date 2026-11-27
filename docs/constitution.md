# LearnLab Constitution

**Version:** 1.1.0
**Status:** Ratified
**Created:** 2026-11-27
**Ratification date:** 2026-11-27

## Core Principles

### I. Local-Only Execution
**Statement:** User code (JSX, Java, SQL) MUST run only on the user's own machine or the user's own GitHub Codespace. The server MUST bind to `127.0.0.1`. Apart from localhost, it MUST only accept the exact, login-protected Codespaces forwarding host, and MUST reject other hosts and cross-origin requests. The Codespaces port MUST stay private.

**Rationale:** A local endpoint that runs code is a remote-code-execution risk if any web page can reach it.

**Acceptance criteria:** Tests show that requests with a foreign `Host`/`Origin` or without the session token are rejected, and that runs time out and cap output.

### II. Verified Answers
**Statement:** Every question's expected output MUST be produced by running its reference answer, never written by hand.

**Rationale:** Wrong "correct answers" would teach wrong things.

**Acceptance criteria:** A test runs every reference SQL answer and checks each Java answer's recorded output against a fresh run.

### III. Learn, Then Practice
**Statement:** Every topic MUST provide an explanation, a runnable practice exercise, an output check, and a revealable answer with explanation.

**Rationale:** The tool exists to teach, not just to quiz.

**Acceptance criteria:** Data validation tests confirm that every lesson and question has these fields.

### IV. Lightweight and Minimal
**Statement:** The UI MUST be plain HTML/CSS/JS with vendored runtime libraries and no frontend build step.

**Rationale:** The tool should start quickly and work offline once installed.

## Architectural Constraints

- **Backend:** Python 3.13 with FastAPI and uvicorn, and `structlog` JSON logging that never logs user code.
- **Runtimes:** A portable Temurin JDK 21 in `.tools/` (not committed), in-process SQLite for SQL, and React 18 UMD with Babel standalone, vendored, for JSX.
- **Cloud and integration services:** None.
- **Stakeholders:** The individual learner (the project owner).

## Applied Stellantis Standards

| Standard | Application |
|---|---|
| Security | Localhost-only binding, a session token, Host/Origin checks, and timeouts; `pip-audit` must report no high or critical issues. |
| Development gates | A build brief and test-first development are required, with at least 80% coverage on the Python backend. |
| Observability | Structured JSON logs only; user code and output are never logged. |
| Design system | Stellantis colors and typography, and the official logo PNG. |

## Governance

The owner approves amendments, which use semantic versioning. Each build brief must include a constitution check.

## Amendment Log

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-11-27 | GitHub Copilot | Initial version |
| 1.1.0 | 2026-11-27 | GitHub Copilot | Principle I now allows the user's own private Codespace host |
