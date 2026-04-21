#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "${SCRIPT_DIR}/.." && pwd)"
SOURCE_HTML="${REPO_ROOT}/dist-single/index.html"
ASSET_HTML="${REPO_ROOT}/play/skills/snake/assets/snake.html"
ZIP_PATH="${REPO_ROOT}/dist-play/snake.zip"

if [ ! -f "${SOURCE_HTML}" ]; then
  echo "Error: ${SOURCE_HTML} is missing. Run npm run build:single first." >&2
  exit 1
fi

mkdir -p "${REPO_ROOT}/play/skills/snake/assets"
cp "${SOURCE_HTML}" "${ASSET_HTML}"

mkdir -p "${REPO_ROOT}/dist-play"
rm -f "${ZIP_PATH}" "${REPO_ROOT}/dist-play/play.zip"

cd "${REPO_ROOT}/play"
zip -r "${ZIP_PATH}" . -x "*.DS_Store" -x "pack.sh" -x "README.md" -x "*.gitkeep"

SIZE="$(du -h "${ZIP_PATH}" | awk '{print $1}')"

printf '\n'
printf '  Built /play:snake plugin\n'
printf '  ------------------------\n'
printf '  Artifact: %s  (%s)\n' "${ZIP_PATH}" "${SIZE}"
printf '  Install (Claude Desktop / Cowork):\n'
printf '    1. Plugins directory -> Personal -> Local uploads -> "+" -> Upload local plugin\n'
printf '    2. Pick dist-play/snake.zip\n'
printf '    3. In any conversation say "play snake" or "/play:snake"\n'
printf '\n'
