import { App, PluginManifest } from "obsidian";
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
