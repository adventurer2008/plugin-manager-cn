import { Plugin } from "obsidian";
import { Network } from "../src/network";
import {
  loadWujieReleases,
  downloadWujie,
  hashes,
  verifyBundle,
} from "../src/wujie";
import { Installer } from "../src/installer";
import { readBundle } from "../src/core";
export default class WujieSmoke extends Plugin {
  onload() {
    this.app.workspace.onLayoutReady(() => void this.run());
  }
  async run() {
    const results: string[] = [];
    const a = this.app.vault.adapter;
    try {
      const net = new Network(),
        releases = await loadWujieReleases(net);
      results.push("release-index-" + releases.length);
      const latest = releases.find((r) => r.version === "1.1.1"),
        older = releases.find((r) => r.version === "1.1.0");
      if (!latest || !older) throw Error("required real packages missing");
      const installer = new Installer(this.app, "plugin-manager-cn");
      const b = await downloadWujie(net, latest);
      results.push("real-1.1.1-digest-verified");
      await installer.install("wujie-sync", b); // Never enable sync or copy another device identity.
      const dir = this.app.vault.configDir + "/plugins/wujie-sync";
      await a.write(dir + "/data.json", '{"fixture":"isolated-no-account"}');
      const verified = await readBundle(a, dir),
        snapshotHashes = await hashes(verified);
      results.push("local-baseline-snapshot");
      const old = await downloadWujie(net, older);
      await installer.install("wujie-sync", old);
      results.push("real-history-1.1.0-installed");
      await verifyBundle(verified, snapshotHashes);
      await installer.install("wujie-sync", verified);
      results.push("offline-snapshot-rollback-1.1.1");
      if (
        (await a.read(dir + "/data.json")) !==
        '{"fixture":"isolated-no-account"}'
      )
        throw Error("configuration changed");
      results.push("config-preserved");
      if (JSON.parse(await a.read(dir + "/manifest.json")).version !== "1.1.1")
        throw Error("rollback version mismatch");
      await a.write(
        "wujie-result.json",
        JSON.stringify(
          {
            ok: true,
            results,
            alphaCount: releases.filter((r) => r.channel === "Alpha").length,
            enabled: false,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      await a.write(
        "wujie-result.json",
        JSON.stringify({ ok: false, results, error: String(e) }, null, 2),
      );
    }
  }
}
