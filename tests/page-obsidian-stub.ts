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
export const requireApiVersion = () => true;
