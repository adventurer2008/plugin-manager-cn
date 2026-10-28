import {
  App,
  PluginManifest,
  PluginSettingTab,
  Setting,
  requireApiVersion,
} from "obsidian";

// Structural subset shared with the 1.13+ declarative API; erased on 1.12.
export interface PortableSettingDefinition {
  name: string;
  desc: string;
  aliases: string[];
  render(setting: Setting): void;
}

export abstract class CompatibleSettingsTab extends PluginSettingTab {
  abstract renderLegacy(): void;
  // Obsidian 1.12 calls display; 1.13+ uses getSettingDefinitions instead.
  display(): void {
    this.renderLegacy();
  }
  refreshSettings(): void {
    const tab = this as unknown as { update?: () => void };
    if (requireApiVersion("1.13.0") && typeof tab.update === "function")
      tab.update();
    else this.renderLegacy();
  }
}
// Obsidian does not declare its plugin manager in the public SDK. Keep access here.
export interface Manager {
  manifests: Record<string, PluginManifest>;
  plugins: Record<string, unknown>;
  enabledPlugins: Set<string>;
  loadManifests(): Promise<void>;
  enablePluginAndSave(id: string): Promise<void>;
  disablePluginAndSave(id: string): Promise<void>;
  unloadPlugin(id: string): Promise<void>;
}
export function manager(app: App): Manager {
  const p = (app as unknown as { plugins: Manager }).plugins;
  if (!p?.manifests || !p.plugins || !(p.enabledPlugins instanceof Set))
    throw Error("此设备的插件管理接口不兼容，已停止操作");
  for (const key of [
    "loadManifests",
    "enablePluginAndSave",
    "disablePluginAndSave",
    "unloadPlugin",
  ] as const)
    if (typeof p?.[key] !== "function")
      throw Error("此 Obsidian 版本的插件管理接口不兼容");
  return p;
}

export function openPluginSettings(app: App, id: string): void {
  const setting = (
    app as unknown as {
      setting?: { open(): void; openTabById(id: string): void };
    }
  ).setting;
  if (
    typeof setting?.open !== "function" ||
    typeof setting.openTabById !== "function"
  )
    throw Error("此 Obsidian 版本的设置接口不兼容");
  setting.open();
  setting.openTabById(id);
}
