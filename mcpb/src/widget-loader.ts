import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function loadWidgetHtml(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const widgetPath = resolve(currentDir, "widget", "index.html");
  return readFileSync(widgetPath, "utf8");
}
