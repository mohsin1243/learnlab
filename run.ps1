$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$jdk = Get-ChildItem ".tools\jdk-extract" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($jdk) { $env:LEARNLAB_JAVA_HOME = $jdk.FullName } else { Write-Warning "Portable JDK not found in .tools - Java questions will not run." }
if (-not (Test-Path "data\stream.json") -or -not (Test-Path "data\sql.json")) { & .\.venv\Scripts\python build_banks.py }
$port = if ($env:LEARNLAB_PORT) { $env:LEARNLAB_PORT } else { "8765" }
Write-Host "LearnLab running at http://127.0.0.1:$port"
& .\.venv\Scripts\python -m app.main
