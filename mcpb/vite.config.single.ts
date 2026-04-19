import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "node:path";

const repoRoot = resolve(__dirname, "..");
const localNodeModules = resolve(__dirname, "node_modules");

export default defineConfig({
  root: repoRoot,
  plugins: [viteSingleFile()],
  resolve: {
    alias: {
      react: resolve(localNodeModules, "react"),
      "react-dom": resolve(localNodeModules, "react-dom"),
      "react/jsx-runtime": resolve(localNodeModules, "react/jsx-runtime.js"),
    },
  },
  build: {
    outDir: resolve(repoRoot, "dist-single"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(repoRoot, "index.html"),
    },
  },
});
