#!/usr/bin/env sh
set -eu

REPO_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
STANDALONE_HTML="${REPO_ROOT}/dist-single/index.html"
PLUGIN_ZIP="${REPO_ROOT}/dist-play/snake.zip"
DIST_DIR="${REPO_ROOT}/dist"

if [ ! -f "${STANDALONE_HTML}" ]; then
  echo "Error: ${STANDALONE_HTML} is missing. Run npm run build:single first." >&2
  exit 1
fi

if [ ! -f "${PLUGIN_ZIP}" ]; then
  echo "Error: ${PLUGIN_ZIP} is missing. Run npm run build:play first." >&2
  exit 1
fi

mkdir -p "${DIST_DIR}"
cp "${STANDALONE_HTML}" "${DIST_DIR}/standalone.html"
cp "${PLUGIN_ZIP}" "${DIST_DIR}/snake.zip"

printf 'Copied download artifacts:\n'
printf '  %s\n' "${DIST_DIR}/standalone.html"
printf '  %s\n' "${DIST_DIR}/snake.zip"
