import { build } from "esbuild";
import { mkdir, copyFile } from "node:fs/promises";
await build({
  entryPoints: ["src/main.ts"],
  outfile: "main.js",
  bundle: true,
  platform: "browser",
  format: "cjs",
  target: "es2020",
  external: ["obsidian", "electron"],
  sourcemap: false,
});
await mkdir("dist/plugin-manager-cn", { recursive: true });
for (const f of ["main.js", "manifest.json", "styles.css"])
  await copyFile(f, "dist/plugin-manager-cn/" + f);
