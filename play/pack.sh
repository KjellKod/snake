#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "${SCRIPT_DIR}/.." && pwd)"
SOURCE_HTML="${REPO_ROOT}/dist-single/index.html"
ASSET_HTML="${REPO_ROOT}/play/skills/snake/assets/snake.html"
PLUGIN_PATH="${REPO_ROOT}/dist-play/play.plugin"
ZIP_PATH="${REPO_ROOT}/dist-play/play.zip"

if [ ! -f "${SOURCE_HTML}" ]; then
  echo "Error: ${SOURCE_HTML} is missing. Run npm run build:single first." >&2
  exit 1
fi

mkdir -p "${REPO_ROOT}/play/skills/snake/assets"
cp "${SOURCE_HTML}" "${ASSET_HTML}"

mkdir -p "${REPO_ROOT}/dist-play"
rm -f "${PLUGIN_PATH}" "${ZIP_PATH}"

cd "${REPO_ROOT}/play"
zip -r ../dist-play/play.plugin . -x "*.DS_Store" -x "pack.sh" -x "README.md"
# Produce a .zip copy for the Claude web upload dialog, which currently
# only accepts .zip extensions (see play/README.md install notes).
cp "${PLUGIN_PATH}" "${ZIP_PATH}"

SIZE="$(du -h "${PLUGIN_PATH}" | awk '{print $1}')"

printf '\n'
printf '  Built /play:snake plugin\n'
printf '  ------------------------\n'
printf '  Artifacts:\n'
printf '    - %s  (%s)\n' "${PLUGIN_PATH}" "${SIZE}"
printf '    - %s  (same bytes, extension the web upload dialog accepts)\n' "${ZIP_PATH}"
printf '  Install:\n'
printf '    - Claude Desktop: drag play.plugin into the Claude Desktop window.\n'
printf '    - Claude web (Cowork/organization): Organization settings -> Plugins\n'
printf '      -> "Add plugins" -> "Upload a file" -> pick play.zip.\n'
printf '      (.plugin is rejected by the current upload dialog; .zip is the\n'
printf '       same archive bytes under a different extension.)\n'
printf '  Trigger: say "play snake" or "/play:snake" in any conversation.\n'
printf '\n'
