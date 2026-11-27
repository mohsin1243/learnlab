from app.sql_runner import compare_rows, run_query


def test_select_returns_columns_and_rows():
    res = run_query("SELECT name FROM departments ORDER BY dept_id LIMIT 2")
    assert res.error is None
    assert res.columns == ["name"]
    assert res.rows == [["Engineering"], ["Sales"]]


def test_syntax_error_is_reported_not_raised():
    res = run_query("SELEC * FROM employees")
    assert res.error and "syntax" in res.error.lower()


def test_multiple_statements_return_last_result():
    res = run_query("CREATE TABLE t(x); INSERT INTO t VALUES (1),(2); SELECT SUM(x) AS s FROM t;")
    assert res.error is None and res.rows == [[3]]


def test_each_run_uses_fresh_database():
    run_query("DELETE FROM employees")
    assert run_query("SELECT COUNT(*) FROM employees").rows[0][0] > 0


def test_attach_is_denied():
    res = run_query("ATTACH DATABASE 'x.db' AS x")
    assert res.error and "not authorized" in res.error.lower()


def test_runaway_query_times_out():
    sql = (
        "WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c) "
        "SELECT COUNT(*) FROM c"
    )
    res = run_query(sql, timeout_s=0.3)
    assert res.error and "time" in res.error.lower()


def test_rows_are_capped():
    sql = "WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c WHERE n<900) SELECT n FROM c"
    res = run_query(sql, max_rows=100)
    assert len(res.rows) == 100 and res.truncated


def test_empty_input_is_an_error():
    assert run_query("   ").error


def test_too_many_statements_rejected():
    assert "too many" in run_query("SELECT 1;" * 30).error.lower()


def test_compare_unordered_ignores_row_order():
    assert compare_rows([[1], [2]], [[2], [1]], ordered=False)
    assert not compare_rows([[1], [2]], [[2], [1]], ordered=True)


def test_compare_rounds_floats_and_checks_shape():
    assert compare_rows([[1.0000001]], [[1.0]], ordered=True)
    assert not compare_rows([[1, 2]], [[1]], ordered=True)
    assert not compare_rows([[1]], [[1], [1]], ordered=False)


def test_compare_accepts_reordered_columns_by_name():
    exp_cols, exp_rows = ["name", "salary"], [["Ana", 10], ["Ben", 20]]
    assert compare_rows([[10, "Ana"], [20, "Ben"]], exp_rows, ordered=True,
                        actual_columns=["SALARY", "name"], expected_columns=exp_cols)
    assert not compare_rows([[10, "Ana"], [20, "Ben"]], exp_rows, ordered=True,
                            actual_columns=["x", "y"], expected_columns=exp_cols)


def test_schema_lists_tables():
    from app.sql_runner import schema_info

    tables = {t["name"] for t in schema_info()}
    assert {"employees", "departments", "orders", "customers", "products", "order_items"} <= tables
