# Sandboxed Java Runner for a Public Codespace URL — Build Brief

**Goal:** Make it safe to set the Codespaces port to **Public** so anyone can use LearnLab, Java included.

**Context:** The public URL would allow arbitrary Java to run inside the owner's Codespace. Today that code inherits `GITHUB_TOKEN` and has full access to files, the network and processes.

**Approach:**
- Compile with `javac`.
- Run with `java -Djava.security.manager=allow -Djava.security.policy==sandbox.policy`, where the policy grants user code only harmless property reads. That means no files, network, process exec or reflection hacks. The JDK's own modules keep their built-in permissions.
- Child processes get a minimal environment allow-list: PATH and the OS essentials, with HOME set to the temp directory. No tokens.
- Existing limits stay: a 10-second timeout, a 64KB output cap, a 256MB heap, and at most 2 concurrent runs.
- The JDK's "Security Manager is deprecated" warning is filtered out of stderr.
- **Rejected alternatives:**
  - Disabling Java in public mode: the user wants Java available.
  - A container per run: no Docker-in-Codespace by default.

**File map:**
- `app/java_runner.py`: the two-step compile and sandboxed run, the clean environment, and the policy.
- `tests/test_java_runner.py`: sandbox tests.
- `README.md` and `docs/constitution.md` (v1.2.0): updated.

**Security & observability impact:** Closes the remote-code-execution and token-theft exposure. Remaining risk is CPU and memory abuse within the existing limits; it is documented.

**Constitution check:** Amends Principle I to allow a public port only with the sandbox in place.

## Tasks
- [x] 1. Sandbox tests (RED) → implement (GREEN)
- [x] 2. Docs, constitution, commit; hand off steps
- [x] verification-before-completion
