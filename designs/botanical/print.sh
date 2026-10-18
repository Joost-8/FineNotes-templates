#!/usr/bin/env bash
# Print each out/<name>.html to out/<name>.pdf with headless Edge, then render
# every page to out/png/<name>-<n>.png with PyMuPDF.
set -euo pipefail
cd "$(dirname "$0")"
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
WIN=$(cygpath -w "$PWD")
mkdir -p out/png
for html in out/*.html; do
  name=$(basename "$html" .html)
  rm -f "out/$name.pdf"
  prof="$TEMP/edge-tpl-$name-$RANDOM"
  "$EDGE" --headless=new --disable-gpu --no-first-run --user-data-dir="$prof" \
    --virtual-time-budget=15000 --no-pdf-header-footer \
    --print-to-pdf="$WIN\\out\\$name.pdf" "file:///$WIN/out/$name.html" >/dev/null 2>&1 || true
  for i in $(seq 1 40); do [ -s "out/$name.pdf" ] && break; sleep 0.5; done
  ls -la "out/$name.pdf"
done
python -I render.py out
