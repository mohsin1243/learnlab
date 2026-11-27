# LearnLab on GitHub Codespaces — Build Brief

**Goal:** Make LearnLab usable from anywhere through a GitHub Codespaces forwarded URL on the user's own account (github.com/mohsin1243).

**Context:** LearnLab needs a Python and Java backend, so static GitHub Pages can't run the Java section. The VS Code GitHub sign-in is a different account, and the framework leaves push and deploy to the developer.

**Approach:**
- Add a `.devcontainer` that installs Python 3.13 and JDK 21, the dependencies, and builds the banks, and that runs the server when you open the codespace.
- The Host/Origin guard rejects the `*.app.github.dev` URL, so extend its allow-list. The extra host is derived from the `CODESPACE_NAME` and `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN` env vars, or set explicitly with `LEARNLAB_ALLOWED_HOSTS`.
- Initialise a git repo and make a local commit. The user pushes.
- **Rejected alternatives:**
  - GitHub Pages: no Java without a heavy in-browser JVM. Kept as a possible follow-up.
  - A public PaaS: unsandboxed remote code execution on the internet.

**File map:**
- `app/main.py`: the allowed-hosts helper and an https origin for those hosts.
- `tests/test_api.py`: tests for the allow-list.
- `.devcontainer/devcontainer.json`: the codespace definition.
- `run.sh`: the Linux start script.
- `README.md`: a Codespaces section.

**Security & observability impact:**
- The port stays **private**: Codespaces requires GitHub login, and the token, Host and Origin checks still apply.
- Only the exact codespace host is allowed, never a wildcard.

**Constitution check:** Principle I said localhost only. Allowing the authenticated Codespaces host is a deviation, so the constitution is amended to v1.1.0.

**Out of scope:** GitHub Pages build, CI workflow, public hosting.

## Tasks
- [x] 1. Allowed hosts: tests (RED) → implement (GREEN)
- [x] 2. devcontainer + run.sh + README + constitution amendment
- [x] 3. git init + local commit; hand off push commands
- [x] verification-before-completion
