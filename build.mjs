import { build } from "esbuild";
import { mkdir, copyFile, readFile } from "node:fs/promises";
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
const { id } = JSON.parse(await readFile("manifest.json", "utf8"));
if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw Error("Invalid plugin ID");
await mkdir("dist/" + id, { recursive: true });
for (const f of ["main.js", "manifest.json", "styles.css"])
  await copyFile(f, "dist/" + id + "/" + f);
