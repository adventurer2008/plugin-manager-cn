export const requireApiVersion = () => true;
export const Platform = {
  get isMobile() {
    return (
      (globalThis as unknown as { __pmcnMobile?: boolean }).__pmcnMobile ===
      true
    );
  },
};
export class PluginSettingTab {}

export const requestUrl = (args: any) =>
  (globalThis as any).__pmcnRequest(args);
