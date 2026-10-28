import { Plugin, PluginManifest } from "obsidian";
import { Network } from "../src/network";
export default class NetworkSmoke extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => void this.run());
  }
  async run() {
    const report: Record<string, unknown> = {
      runtime: "Obsidian requestUrl",
      started: new Date().toISOString(),
    };
    const n = new Network(),
      a = this.app.vault.adapter;
    try {
      let start = Date.now();
      const w = await n.manifest(
        "adventurer2008/obsidian-smart-sync-release-cn",
      );
      report.wujie = {
        id: w.id,
        version: w.version,
        elapsedMs: Date.now() - start,
      };
      const targets = JSON.parse(await a.read("network-targets.json")) as {
        repo: string;
        manifest: PluginManifest;
      }[];
      let index = 0;
      const results: unknown[] = [];
      start = Date.now();
      await Promise.all(
        Array.from({ length: 4 }, async () => {
          while (index < targets.length) {
            const t = targets[index++];
            try {
              const m = await n.latest(t.repo, t.manifest);
              results.push({ id: m.id, version: m.version });
            } catch (e) {
              results.push({ id: t.manifest.id, error: String(e) });
            }
          }
        }),
      );
      report.elapsedMs = Date.now() - start;
      report.results = results;
      report.ok = results.every((r) => !("error" in (r as object)));
    } catch (e) {
      report.ok = false;
      report.error = String(e);
    }
    await a.write("network-result.json", JSON.stringify(report, null, 2));
  }
}
