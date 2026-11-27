#!/usr/bin/env bash
# Start LearnLab on Linux / GitHub Codespaces.
set -euo pipefail
cd "$(dirname "$0")"
PY=.venv/bin/python
[ -x "$PY" ] || PY=python3
if [ ! -f data/stream.json ] || [ ! -f data/sql.json ]; then "$PY" build_banks.py; fi
export LEARNLAB_PORT="${LEARNLAB_PORT:-8765}"
echo "LearnLab running on port $LEARNLAB_PORT (open the forwarded URL from the Ports tab)"
exec "$PY" -m app.main
