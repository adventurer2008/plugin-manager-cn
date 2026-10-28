import { Plugin } from "obsidian";
import { Installer } from "../src/installer";
import { manager } from "../src/compat";
import { Network } from "../src/network";
export default class Smoke extends Plugin {
  async onload() {
    this.app.workspace.onLayoutReady(() => void this.run());
  }
  async run() {
    const results: string[] = [];
    try {
      const i = new Installer(this.app, "wujie-hub"),
        p = manager(this.app),
        a = this.app.vault.adapter;
      const make = (v: string, broken = false) => ({
        "manifest.json": JSON.stringify({
          id: "pmcn-fixture",
          name: "MVP Fixture",
          version: v,
          minAppVersion: "1.7.2",
          author: "test",
          description: "isolated test",
          isDesktopOnly: true,
        }),
        "main.js": broken
          ? 'throw Error("intentional failure")'
          : 'module.exports=class extends require("obsidian").Plugin {};',
        "styles.css": null,
      });
      await i.install("pmcn-fixture", make("1.0.0"));
      results.push("fresh-install");
      await a.write(
        ".obsidian/plugins/pmcn-fixture/data.json",
        '{"identity":"unchanged"}',
      );
      await p.enablePluginAndSave("pmcn-fixture");
      if (!p.plugins["pmcn-fixture"]) throw Error("not enabled");
      results.push("enable");
      await i.install("pmcn-fixture", make("1.0.1"));
      if (!p.plugins["pmcn-fixture"]) throw Error("update not enabled");
      results.push("enabled-update");
      try {
        await i.install("pmcn-fixture", make("1.0.2", true));
        throw Error("failure not detected");
      } catch (e) {
        if (!String(e).includes("原发行文件已恢复")) throw e;
      }
      if (
        p.manifests["pmcn-fixture"].version !== "1.0.1" ||
        !p.plugins["pmcn-fixture"]
      )
        throw Error("recovery failed");
      results.push("failed-load-recovery");
      await i.install("pmcn-fixture", make("1.0.0"));
      results.push("rollback");
      if (
        (await a.read(".obsidian/plugins/pmcn-fixture/data.json")) !==
        '{"identity":"unchanged"}'
      )
        throw Error("config changed");
      results.push("config-preserved");
      await i.uninstall("pmcn-fixture");
      results.push("uninstall");
      await a.write(
        "smoke-result.json",
        JSON.stringify({ ok: true, results }, null, 2),
      );
      const s = (this.app as any).setting;
      s.open();
      s.openTabById("wujie-hub");
      const n = new Network(),
        catalog = await n.catalog(),
        entry = catalog.find((e) => e.id === "templater-obsidian");
      if (!entry) throw Error("catalog missing templater");
      results.push("real-catalog");
      const latest = await n.latest(entry.repo),
        bundle = await n.release(entry.repo, latest.version);
      i.validate(entry.id, bundle, latest.version);
      results.push("real-release-download-" + latest.version);
      await i.install(entry.id, bundle, latest.version);
      results.push("real-community-install-disabled");
      await a.write(
        "smoke-result.json",
        JSON.stringify({ ok: true, results, mirror: n.last }, null, 2),
      );
    } catch (e) {
      await this.app.vault.adapter.write(
        "smoke-result.json",
        JSON.stringify({ ok: false, results, error: String(e) }),
      );
    }
  }
}
