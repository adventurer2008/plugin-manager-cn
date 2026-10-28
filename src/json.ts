export function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function manifestVersion(text: string): string {
  const value = record(JSON.parse(text) as unknown);
  if (typeof value.version !== "string") throw Error("安装包缺少版本号");
  return value.version;
}
