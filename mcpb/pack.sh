#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
MCPB_DIR="$ROOT_DIR/mcpb"
DIST_SINGLE_FILE="$ROOT_DIR/dist-single/index.html"
MCPB_DIST_DIR="$MCPB_DIR/dist"
PACK_DIR="$MCPB_DIR/.pack"
PROD_INSTALL_DIR="$MCPB_DIR/.prod-install"
OUTPUT_DIR="$ROOT_DIR/dist-mcpb"
OUTPUT_FILE="$OUTPUT_DIR/snake.mcpb"

prune_top_level_src_dirs() {
  node_modules_dir="$1"

  for package_dir in "$node_modules_dir"/* "$node_modules_dir"/@*/*; do
    [ -d "$package_dir" ] || continue
    case "$package_dir" in
      "$node_modules_dir/@modelcontextprotocol/sdk" | "$node_modules_dir/@modelcontextprotocol/ext-apps")
        # Keep SDK package layouts intact when they rely on dist/src conventions.
        continue
        ;;
    esac
    if [ -d "$package_dir/src" ]; then
      rm -rf "$package_dir/src"
    fi
  done
}

prune_production_node_modules() {
  node_modules_dir="$1"

  find "$node_modules_dir" -type d \( -name test -o -name tests -o -name __tests__ -o -name docs -o -name doc -o -name .github \) -prune -exec rm -rf {} +
  prune_top_level_src_dirs "$node_modules_dir"
  find "$node_modules_dir" -type f \( -name "*.md" -o -name "CHANGELOG*" -o -name "changelog*" -o -name "*.map" -o -name "*.ts" -o -name "*.tsx" -o -name "*.cts" -o -name "*.mts" -o -name "*.test.*" -o -name "tsconfig.json" \) -exec rm -f {} +
}

cd "$ROOT_DIR"
npm run build:single

cd "$MCPB_DIR"
npm run build:server

rm -rf "$MCPB_DIST_DIR/widget"
mkdir -p "$MCPB_DIST_DIR/widget"
cp "$DIST_SINGLE_FILE" "$MCPB_DIST_DIR/widget/index.html"

rm -rf "$PROD_INSTALL_DIR"
mkdir -p "$PROD_INSTALL_DIR"
cp "$MCPB_DIR/package.json" "$PROD_INSTALL_DIR/package.json"
if [ -f "$MCPB_DIR/package-lock.json" ]; then
  cp "$MCPB_DIR/package-lock.json" "$PROD_INSTALL_DIR/package-lock.json"
fi

cd "$PROD_INSTALL_DIR"
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi

prune_production_node_modules "$PROD_INSTALL_DIR/node_modules"

rm -rf "$PACK_DIR"
mkdir -p "$PACK_DIR/widget"
cp "$MCPB_DIST_DIR/server.js" "$PACK_DIR/server.js"
cp "$MCPB_DIST_DIR/widget-loader.js" "$PACK_DIR/widget-loader.js"
cp "$MCPB_DIST_DIR/registration.js" "$PACK_DIR/registration.js"
cp "$MCPB_DIST_DIR/widget/index.html" "$PACK_DIR/widget/index.html"
cp "$MCPB_DIR/manifest.json" "$PACK_DIR/manifest.json"
cp "$MCPB_DIR/icon.png" "$PACK_DIR/icon.png"
cp -R "$PROD_INSTALL_DIR/node_modules" "$PACK_DIR/node_modules"

mkdir -p "$OUTPUT_DIR"
rm -f "$OUTPUT_FILE"
cd "$PACK_DIR"
zip -r "$OUTPUT_FILE" . -x "*.DS_Store"

rm -rf "$PACK_DIR" "$PROD_INSTALL_DIR"
