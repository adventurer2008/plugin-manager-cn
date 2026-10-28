export class Plugin {}
export class PluginSettingTab {}
export class Setting {}
export class Menu {}
export class Modal {}
export class Notice {
  constructor(...args: unknown[]) {}
}
export const requestUrl = () => {
  throw Error("unexpected request");
};
export const requireApiVersion = () => !(globalThis as unknown as { __pmcnLegacy?: boolean }).__pmcnLegacy;
export const Platform = { isMobile: false };
