"""Compile and run Java snippets with the portable JDK, inside a shared harness."""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import tempfile
import threading
import time
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HARNESS_PATH = Path(__file__).with_name("Harness.java")
BODY_MARKER = "//__BODY__"
JVM_FLAGS = ["-Xmx256m", "-XX:TieredStopAtLevel=1", "-XX:+UseSerialGC", "-Xshare:auto"]
_LINE_RE = re.compile(r"Main\.java:(\d+)")
_SEP = "@@LEARNLAB_Q{}@@"


class JavaUnavailable(RuntimeError):
    """Raised when no JDK can be found."""


class BatchCompileError(RuntimeError):
    """Raised when a batch of reference snippets fails to compile."""


@dataclass
class JavaResult:
    stdout: str = ""
    stderr: str = ""
    error: str | None = None  # None | "compile" | "runtime" | "timeout"
    truncated: bool = False
    ms: int = 0


def java_executable(name: str = "java") -> str | None:
    exe = f"{name}.exe" if os.name == "nt" else name
    home = os.environ.get("LEARNLAB_JAVA_HOME")
    candidates = [Path(home) / "bin" / exe] if home else []
    candidates += sorted((ROOT / ".tools" / "jdk-extract").glob(f"*/bin/{exe}"))
    for c in candidates:
        if c.is_file():
            return str(c)
    return shutil.which(name)


def java_available() -> bool:
    return java_executable() is not None


@lru_cache(maxsize=1)
def _harness() -> tuple[str, str]:
    text = HARNESS_PATH.read_text(encoding="utf-8")
    head, tail = text.split(BODY_MARKER)
    return head, tail


def _prefix() -> str:
    return _harness()[0] + "    public static void main(String[] args) throws Exception {\n"


def harness_source() -> str:
    """The shared sample data and helpers, for display to the learner."""
    return _harness()[0].rstrip() + "\n\n    public static void main(String[] args) throws Exception {\n        // <your code runs here>\n    }\n}\n"


def build_source(code: str) -> str:
    if re.search(r"\bclass\s+Main\b", code):
        return code
    return _prefix() + code + "\n    }\n" + _harness()[1]


def _remap_lines(text: str, offset: int) -> str:
    def repl(m: re.Match[str]) -> str:
        n = int(m.group(1)) - offset
        return f"line {n}" if n > 0 else "harness"

    return _LINE_RE.sub(repl, text)


def _read_capped(stream, sink: list[str], cap: int, overflow: threading.Event, proc) -> None:
    size = 0
    for chunk in iter(lambda: stream.read(4096), ""):
        if size < cap:
            sink.append(chunk[: cap - size])
        size += len(chunk)
        if size > cap:
            overflow.set()
            proc.kill()
            break


def _run_process(cmd: list[str], cwd: str, timeout_s: float, max_output: int):
    proc = subprocess.Popen(
        cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, encoding="utf-8", errors="replace",
    )
    out: list[str] = []
    err: list[str] = []
    overflow = threading.Event()
    threads = [
        threading.Thread(target=_read_capped, args=(proc.stdout, out, max_output, overflow, proc), daemon=True),
        threading.Thread(target=_read_capped, args=(proc.stderr, err, max_output, overflow, proc), daemon=True),
    ]
    for t in threads:
        t.start()
    timed_out = False
    try:
        proc.wait(timeout=timeout_s)
    except subprocess.TimeoutExpired:
        timed_out = True
        proc.kill()
        proc.wait()
    for t in threads:
        t.join(timeout=2)
    return proc.returncode, "".join(out), "".join(err), timed_out, overflow.is_set()


def run_java(code: str, timeout_s: float = 10.0, max_output: int = 64_000) -> JavaResult:
    java = java_executable()
    if not java:
        raise JavaUnavailable("JDK not found. Run run.ps1 or set LEARNLAB_JAVA_HOME.")
    start = time.perf_counter()
    source = build_source(code)
    offset = 0 if source == code else _prefix().count("\n")
    with tempfile.TemporaryDirectory(prefix="learnlab-") as tmp:
        Path(tmp, "Main.java").write_text(source, encoding="utf-8")
        rc, out, err, timed_out, overflow = _run_process(
            [java, *JVM_FLAGS, "Main.java"], tmp, timeout_s, max_output)
    res = JavaResult(stdout=out, stderr=_remap_lines(err, offset), truncated=overflow)
    if timed_out:
        res.error = "timeout"
        res.stderr = (res.stderr + f"\nTime limit exceeded ({timeout_s:g}s).").strip()
    elif "error: compilation failed" in err:
        res.error = "compile"
        res.stderr = res.stderr.replace("error: compilation failed", "").strip()
    elif rc != 0 and not overflow:
        res.error = "runtime"
    res.ms = int((time.perf_counter() - start) * 1000)
    return res


def outputs_match(actual: str, expected: str) -> bool:
    norm = lambda s: "\n".join(line.rstrip() for line in s.strip().splitlines())  # noqa: E731
    return norm(actual) == norm(expected)


def _batch_source(snippets: list[str]) -> str:
    methods = "".join(
        f"    static void q{i}() throws Exception {{\n{code}\n    }}\n" for i, code in enumerate(snippets)
    )
    refs = ", ".join(f"Main::q{i}" for i in range(len(snippets)))
    main = (
        "    interface Q { void run() throws Exception; }\n"
        "    public static void main(String[] args) throws Exception {\n"
        f"        Q[] qs = {{ {refs} }};\n"
        "        PrintStream real = System.out;\n"
        "        for (int i = 0; i < qs.length; i++) {\n"
        "            ByteArrayOutputStream buf = new ByteArrayOutputStream();\n"
        "            System.setOut(new PrintStream(buf, true, \"UTF-8\"));\n"
        "            String text;\n"
        "            try { qs[i].run(); System.out.flush(); text = buf.toString(\"UTF-8\"); }\n"
        "            catch (Throwable t) { text = \"EXCEPTION: \" + t; }\n"
        f"            real.println(\"{_SEP.format('\" + i + \"')}\");\n"
        "            real.println(text);\n"
        "        }\n"
        "        real.flush();\n"
        "    }\n"
    )
    head, tail = _harness()
    return head + methods + main + tail


def run_batch(snippets: list[str], timeout_s: float = 300.0) -> list[str]:
    javac, java = java_executable("javac"), java_executable()
    if not (javac and java):
        raise JavaUnavailable("JDK not found.")
    with tempfile.TemporaryDirectory(prefix="learnlab-batch-") as tmp:
        Path(tmp, "Main.java").write_text(_batch_source(snippets), encoding="utf-8")
        comp = subprocess.run([javac, "-nowarn", "-encoding", "UTF-8", "Main.java"], cwd=tmp,
                              capture_output=True, text=True, timeout=timeout_s)
        if comp.returncode != 0:
            raise BatchCompileError(comp.stdout + comp.stderr)
        run = subprocess.run([java, "-Xmx512m", "-cp", tmp, "Main"], cwd=tmp, capture_output=True,
                             text=True, encoding="utf-8", timeout=timeout_s)
    parts = re.split(r"@@LEARNLAB_Q(\d+)@@\r?\n", run.stdout)
    results = [""] * len(snippets)
    for idx in range(1, len(parts), 2):
        results[int(parts[idx])] = parts[idx + 1].replace("\r\n", "\n").strip()
    return results
