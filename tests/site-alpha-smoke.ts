import { Plugin } from "obsidian";
import { Network } from "../src/network";
import {
  loadSiteAlpha,
  downloadWujie,
  hashes,
  verifyBundle,
  WUJIE_ALPHA_FEED,
} from "../src/wujie";
import { Installer } from "../src/installer";
import { readBundle } from "../src/core";
export default class SiteAlphaSmoke extends Plugin {
  onload() {
    this.app.workspace.onLayoutReady(() => void this.run());
  }
  async run() {
    const a = this.app.vault.adapter,
      results: string[] = [];
    try {
      const net = new Network(),
        releases = await loadSiteAlpha(net),
        alpha = releases.find((r) => r.channel === "Alpha");
      if (!alpha) throw Error("no published alpha");
      results.push("real-download-site-alpha-" + alpha.version);
      const installer = new Installer(this.app, "plugin-manager-cn"),
        dir = this.app.vault.configDir + "/plugins/wujie-sync";
      const baseline = await readBundle(a, dir);
      installer.validate("wujie-sync", baseline);
      const baselineHashes = await hashes(baseline);
      await a.write(dir + "/data.json", '{"fixture":"no-account-alpha-test"}');
      const bundle = await downloadWujie(net, alpha);
      results.push("real-alpha-all-digests-verified");
      await installer.install("wujie-sync", bundle);
      results.push("real-alpha-installed-disabled");
      if (
        JSON.parse(await a.read(dir + "/manifest.json")).version !==
        alpha.version
      )
        throw Error("installed alpha version mismatch");
      await verifyBundle(baseline, baselineHashes);
      await installer.install("wujie-sync", baseline);
      results.push("offline-confirmed-snapshot-rollback");
      if (
        (await a.read(dir + "/data.json")) !==
        '{"fixture":"no-account-alpha-test"}'
      )
        throw Error("config changed");
      results.push("config-preserved");
      await a.write(
        "site-alpha-result.json",
        JSON.stringify(
          {
            ok: true,
            feed: WUJIE_ALPHA_FEED,
            alpha: alpha.version,
            alphaVersions: releases.map((r) => r.version),
            results,
            syncPluginEnabled: false,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      await a.write(
        "site-alpha-result.json",
        JSON.stringify({ ok: false, results, error: String(e) }, null, 2),
      );
    }
  }
}
