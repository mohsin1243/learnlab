# LearnLab: React, Java Streams and SQL

LearnLab is a local, interactive learning site with three sections. You can do all of them offline once everything is installed (only the web font needs the internet).

| Section | What you do | How it runs |
|---|---|---|
| **React** (33 lessons, beginner → advanced) | **Learn**: an explanation plus an editable live demo. **Practice**: an exercise with automatic checks, then the answer and an explanation. | JSX is compiled in the browser by Babel and runs in a sandboxed `iframe` (React 18). |
| **Java Streams** (500 questions) | Write a snippet, run it, compare with the expected output, then view the answer and explanation. | Real compilation on JDK 21 (`java Main.java`) against shared sample data. |
| **SQL** (200 questions) | Write a query, run it, compare the result table, then view the answer and explanation. | An in-memory SQLite database (HR and sales schema), rebuilt fresh on every run. |

Every expected output is produced by running the reference answer (`build_banks.py`); none are written by hand.

## Run

```powershell
cd C:\AutoAp\learnlab
.\run.ps1            # then open http://127.0.0.1:8765
```

`run.ps1` points `LEARNLAB_JAVA_HOME` at the portable JDK in `.tools\`, builds the question banks if they are missing, and starts the server.

## Use it from anywhere (GitHub Codespaces)

1. On github.com/mohsin1243/learnlab, click **Code → Codespaces → Create codespace on main**.
2. The first start takes about 2–3 minutes while it installs Python 3.13 and JDK 21. After that the server starts by itself and LearnLab opens in a new tab at a URL like `https://<codespace>-8765.app.github.dev`.
3. The URL is **private**: only you can open it, after signing in to GitHub, on any device. Don't change the port to *Public*, because that would let anyone run Java code in your codespace.
4. Stop the codespace when you're done (**github.com/codespaces → … → Stop**). The free tier gives 60 core-hours a month, and idle codespaces stop on their own after 30 minutes.

Progress is stored in the browser, so it is kept per device. If you close the terminal that runs the server, start it again with `bash run.sh`.

**First-time setup** (already done on this machine):

```powershell
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt -r requirements-dev.txt
# Portable Temurin JDK 21 → .tools\jdk-extract\ (any JDK 17+ works via LEARNLAB_JAVA_HOME)
.\.venv\Scripts\python build_banks.py
```

## Using it

**Keyboard shortcuts**

| Keys | Action |
|---|---|
| `Ctrl+Enter` | Run |
| `Ctrl+/` | Toggle comment |
| `Tab` / `Shift+Tab` | Indent / outdent |
| `Alt+←` / `Alt+→` | Previous / next question |

**Java helpers**

- Print with `show(x)`. Maps and sets print sorted, doubles print with 2 decimals, and records print by name. This makes output deterministic.
- The **Data** tab shows the sample records: `employees`, `orders`, `transactions`, `students`, `nums`, `words`, `sentence` and `matrix`.

**SQL grading**

- Row order is ignored unless the reference query ends with `ORDER BY`.
- Columns may be in any order as long as their names match.
- The **Schema** tab lists the tables and lets you preview their rows.

**Progress**

- Progress (solved / attempted / answer viewed) and your code are saved in `localStorage`.
- **Reset progress** on the home page clears them.

## Security

- The server binds to `127.0.0.1` only.
- Every `/api` call needs a per-start random token, which is injected into the page.
- Requests with a non-local `Host` or `Origin` are rejected, which blocks CSRF and DNS-rebinding attacks.
- Java runs time out after 10 seconds, output is capped at 64KB, and at most 2 run at once.
- SQL runs on a throwaway in-memory database with `ATTACH` denied and a 3-second timeout.
- Logs are structured JSON (`structlog`) and never contain your code or output.

⚠️ Java code runs with your user's permissions. Only run code you trust; this is a personal, local tool.

## Develop

```powershell
.\.venv\Scripts\python -m pytest --cov=app --cov=build_banks --cov-branch   # 46 tests, 92% coverage
.\.venv\Scripts\pip-audit -r requirements.txt -r requirements-dev.txt
```

**Layout**

- `app/`: the FastAPI app (`main.py`), `java_runner.py` with `Harness.java`, `sql_runner.py` with `seed.sql`, and the question templates in `banks/`.
- `static/`: the UI (plain ES modules, no build step), `react-lessons.md` (lesson content) and `vendor/` (React and Babel).
- `data/`: the generated question banks.

**Editing content**

- **Questions**: edit the templates in `app/banks/*.py`. `{{param}}` variants expand into separate questions. Then rerun `build_banks.py`.
- **React lessons**: edit `static/react-lessons.md`. Each lesson has these sections: `theory`, `demo`, `task`, `starter`, `solution`, `explain`, and any number of `check: <description>` blocks. A check is the body of an async function that returns `true` and can use the helpers `$`, `$$`, `text`, `click`, `type`, `tick` and `logs`.
