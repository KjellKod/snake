#!/usr/bin/env sh
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
OUTPUT_FILE="$REPO_ROOT/dist-single/index.html"

if [ ! -f "$OUTPUT_FILE" ]; then
  printf 'ERROR: expected %s but it was not produced.\n' "$OUTPUT_FILE" >&2
  exit 1
fi

SIZE=$(du -h "$OUTPUT_FILE" | awk '{print $1}')

printf '\n'
printf '  Built standalone HTML\n'
printf '  ---------------------\n'
printf '  Path:  %s\n' "$OUTPUT_FILE"
printf '  Size:  %s (single self-contained file, all JS/CSS inlined)\n' "$SIZE"
printf '  Use it:\n'
printf '    - Open directly:  open "%s"\n' "$OUTPUT_FILE"
printf '    - Drag it into a Claude.ai conversation — renders as an Artifact.\n'
printf '    - Host it anywhere static (GitHub Pages, S3, a USB stick).\n'
printf '    - Or grab snake.html from the latest GitHub Release.\n'
printf '\n'
