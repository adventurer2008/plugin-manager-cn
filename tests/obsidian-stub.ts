export const requireApiVersion = () => true;

export const requestUrl = (args: any) =>
  (globalThis as any).__pmcnRequest(args);
