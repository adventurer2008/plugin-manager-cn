import { App, PluginManifest, Platform, requireApiVersion } from "obsidian";
import { Bundle, FILES, readBundle, safeId, writeBundle } from "./core";
import { manager } from "./compat";
export class Installer {
  busy = false;
  constructor(
    private app: App,
    private ownId: string,
  ) {}
  async run<T>(action: () => Promise<T>) {
    if (this.busy) throw Error("已有操作正在进行");
    this.busy = true;
    try {
      return await action();
    } finally {
      this.busy = false;
    }
  }
  validate(id: string, b: Bundle, version?: string) {
    safeId(id);
    if (id === this.ownId) throw Error("不能修改管理器自身");
    const m = JSON.parse(b["manifest.json"] || "null") as PluginManifest;
    if (
      !m ||
      m.id !== id ||
      typeof m.version !== "string" ||
      (version && m.version !== version) ||
      !b["main.js"]?.trim()
    )
      throw Error("插件 ID、版本或发行文件不匹配");
    if (!m.minAppVersion || !requireApiVersion(m.minAppVersion))
      throw Error("需要 Obsidian " + m.minAppVersion);
    if (Platform.isMobile && m.isDesktopOnly)
      throw Error("此插件仅支持桌面端，不能在移动设备上安装或更新");
    return m;
  }
  async install(id: string, b: Bundle, version?: string) {
    return this.run(async () => {
      this.validate(id, b, version);
      const p = manager(this.app),
        a = this.app.vault.adapter;
      const dir = this.app.vault.configDir + "/plugins/" + id;
      const old = await readBundle(a, dir),
        enabled = p.enabledPlugins.has(id);
      const root = this.app.vault.configDir + "/pmcn-backups";
      if (!(await a.exists(root))) await a.mkdir(root);
      const backup = root + "/" + id + "-" + Date.now();
      await a.mkdir(backup);
      await a.write(
        backup + "/snapshot.json",
        JSON.stringify({ id, enabled, files: old }),
      );
      if (p.plugins[id]) await p.unloadPlugin(id);
      try {
        await writeBundle(a, dir, b);
        await p.loadManifests();
        if (enabled) {
          await p.enablePluginAndSave(id);
          if (!p.plugins[id]) throw Error("新版本加载失败");
        }
      } catch (error) {
        try {
          if (p.plugins[id]) await p.unloadPlugin(id);
          await writeBundle(a, dir, old);
          await p.loadManifests();
          if (enabled) await p.enablePluginAndSave(id);
        } catch (recovery) {
          throw Error(
            "恢复失败，请重启并使用备份 " + backup + "：" + String(recovery),
          );
        }
        throw Error("安装失败，原发行文件已恢复：" + String(error));
      }
    });
  }
  async uninstall(id: string) {
    return this.run(async () => {
      safeId(id);
      if (id === this.ownId) throw Error("不能卸载管理器自身");
      const p = manager(this.app),
        a = this.app.vault.adapter,
        dir = this.app.vault.configDir + "/plugins/" + id;
      const root = this.app.vault.configDir + "/pmcn-backups";
      if (!(await a.exists(root))) await a.mkdir(root);
      await a.write(
        root + "/" + id + "-uninstall-" + Date.now() + ".json",
        JSON.stringify(await readBundle(a, dir)),
      );
      const old = await readBundle(a, dir),
        enabled = p.enabledPlugins.has(id);
      try {
        await p.disablePluginAndSave(id);
        for (const f of FILES)
          if (await a.exists(dir + "/" + f)) await a.remove(dir + "/" + f);
        await p.loadManifests();
      } catch (e) {
        await writeBundle(a, dir, old);
        await p.loadManifests();
        if (enabled) await p.enablePluginAndSave(id);
        throw Error("卸载失败，发行文件已恢复：" + String(e));
      }
    });
  }
}
