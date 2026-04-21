#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "${SCRIPT_DIR}/.." && pwd)"
SOURCE_HTML="${REPO_ROOT}/dist-single/index.html"
ASSET_HTML="${REPO_ROOT}/play/skills/snake/assets/snake.html"
ARTIFACT_PATH="${REPO_ROOT}/dist-play/play.plugin"

if [ ! -f "${SOURCE_HTML}" ]; then
  echo "Error: ${SOURCE_HTML} is missing. Run npm run build:single first." >&2
  exit 1
fi

mkdir -p "${REPO_ROOT}/play/skills/snake/assets"
cp "${SOURCE_HTML}" "${ASSET_HTML}"

mkdir -p "${REPO_ROOT}/dist-play"
rm -f "${ARTIFACT_PATH}"

cd "${REPO_ROOT}/play"
zip -r ../dist-play/play.plugin . -x "*.DS_Store" -x "pack.sh" -x "README.md"

SIZE="$(du -h "${ARTIFACT_PATH}" | awk '{print $1}')"
echo "Packed: dist-play/play.plugin (${SIZE}) | Install: double-click it or drag it into Claude Desktop."
