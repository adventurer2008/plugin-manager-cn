export const FILES = ["manifest.json", "main.js", "styles.css"] as const;
export type Bundle = Record<string, string | null>;
export function isManagerPlugin(id: string, ownId: string): boolean {
  return id === ownId || id === "wujie-hub" || id === "plugin-manager-cn";
}
export function safeId(id: unknown): asserts id is string {
  if (typeof id !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(id))
    throw Error("插件 ID 不合法");
}
export function compare(a: string, b: string): number {
  if (!/^\d+\.\d+\.\d+$/.test(a) || !/^\d+\.\d+\.\d+$/.test(b))
    throw Error("不支持的版本格式");
  const x = a.split(".").map(Number),
    y = b.split(".").map(Number);
  if (
    x.length !== 3 ||
    y.length !== 3 ||
    [...x, ...y].some((n) => !Number.isInteger(n) || n < 0)
  )
    throw Error("不支持的版本格式");
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
  return 0;
}
export interface Store {
  exists(p: string): Promise<boolean>;
  read(p: string): Promise<string>;
  write(p: string, v: string): Promise<unknown>;
  remove(p: string): Promise<unknown>;
  mkdir(p: string): Promise<unknown>;
}
export async function readBundle(store: Store, dir: string): Promise<Bundle> {
  const result: Bundle = {};
  for (const f of FILES)
    result[f] = (await store.exists(dir + "/" + f))
      ? await store.read(dir + "/" + f)
      : null;
  return result;
}
export async function writeBundle(store: Store, dir: string, b: Bundle) {
  if (!(await store.exists(dir))) await store.mkdir(dir);
  for (const f of FILES) {
    const p = dir + "/" + f;
    if (b[f] !== null) await store.write(p, b[f]);
    else if (await store.exists(p)) await store.remove(p);
  }
}
