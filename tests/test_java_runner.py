import pytest

from app import java_runner
from app.java_runner import JavaUnavailable, build_source, outputs_match, run_batch, run_java

pytestmark = pytest.mark.skipif(not java_runner.java_available(), reason="JDK not installed")


def test_runs_snippet_with_harness_data():
    res = run_java("show(nums.stream().filter(n -> n % 2 == 0).count());")
    assert res.error is None, res.stderr
    assert res.stdout.strip() == "6"


def test_show_sorts_maps_and_sets():
    res = run_java('show(new HashSet<>(List.of("b", "a"))); show(Map.of(2, "x", 1, "y"));')
    assert res.stdout.splitlines() == ["[a, b]", "{1=y, 2=x}"]


def test_compile_error_reports_user_line_numbers():
    res = run_java("int x = 1;\nint y = ;")
    assert res.error == "compile"
    assert "line 2" in res.stderr


def test_runtime_exception_is_reported():
    res = run_java("Object o = null; o.toString();")
    assert res.error == "runtime" and "NullPointerException" in res.stderr


def test_infinite_loop_times_out():
    res = run_java("while (true) {}", timeout_s=4)
    assert res.error == "timeout"


def test_output_is_capped():
    res = run_java('for (int i = 0; i < 200000; i++) System.out.println("xxxxxxxxxx");', max_output=1000)
    assert res.truncated and len(res.stdout) <= 1000


def test_batch_runs_many_snippets_isolated():
    outs = run_batch(["show(1+1);", "int x = 5; show(x);", 'throw new RuntimeException("boom");'])
    assert outs[0] == "2" and outs[1] == "5" and outs[2].startswith("EXCEPTION")


def test_build_source_keeps_full_class_untouched():
    src = "public class Main { public static void main(String[] a) {} }"
    assert build_source(src) == src


def test_outputs_match_ignores_trailing_whitespace():
    assert outputs_match("a \nb\n\n", "a\nb")
    assert not outputs_match("a", "b")


def test_sandbox_hides_secret_environment(monkeypatch, tmp_path):
    monkeypatch.setenv("GITHUB_TOKEN", "ghp_should_not_leak")
    res = run_java('show(String.valueOf(System.getenv("GITHUB_TOKEN")));')
    assert "ghp_should_not_leak" not in res.stdout + res.stderr
    assert "GITHUB_TOKEN" not in {k.upper() for k in java_runner._sandbox_env(str(tmp_path))}


def test_sandbox_blocks_file_access(tmp_path):
    secret = tmp_path / "secret.txt"
    secret.write_text("top secret")
    path = str(secret).replace("\\", "\\\\")
    res = run_java(f'show(java.nio.file.Files.readString(java.nio.file.Path.of("{path}")));')
    assert res.error == "runtime" and "AccessControlException" in res.stderr
    assert "top secret" not in res.stdout


def test_sandbox_blocks_network_and_process_exec():
    net = run_java('new java.net.Socket("example.com", 80);')
    assert net.error == "runtime" and "AccessControlException" in net.stderr
    proc = run_java('new ProcessBuilder("whoami").start();')
    assert proc.error == "runtime" and "AccessControlException" in proc.stderr


def test_sandbox_still_formats_and_has_clean_stderr():
    res = run_java('show(1234.5); show(Map.of("b", 2, "a", 1));')
    assert res.error is None and res.stdout.splitlines() == ["1234.50", "{a=1, b=2}"]
    assert "Security Manager" not in res.stderr


def test_missing_jdk_raises(monkeypatch):
    monkeypatch.setattr(java_runner, "java_executable", lambda name="java": None)
    with pytest.raises(JavaUnavailable):
        run_java("show(1);")
