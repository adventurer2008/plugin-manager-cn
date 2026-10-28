import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
globalThis.window = globalThis;
await build({
  entryPoints: ["src/network.ts"],
  outfile: "test-output/network.mjs",
  bundle: true,
  format: "esm",
  platform: "node",
  alias: { obsidian: "./tests/obsidian-stub.ts" },
});
const { Network } = await import("../test-output/network.mjs");
test("unchanged version skips manifest; repeated lookup uses cache", async () => {
  const requests = [];
  globalThis.__pmcnRequest = async ({ url }) => {
    requests.push(url);
    return {
      status: 200,
      text: JSON.stringify({
        tag_name: "1.0.0",
        prerelease: false,
        draft: false,
      }),
    };
  };
  const network = new Network(),
    current = { id: "demo", version: "1.0.0" };
  assert.equal(await network.latest("author/demo", current), current);
  assert.ok(requests.every((url) => url.endsWith("/releases/latest")));
  const count = requests.length;
  await network.latest("author/demo", current);
  assert.equal(requests.length, count);
});
test("concurrent identical lookups share a request and failed source does not block success", async () => {
  let calls = 0;
  globalThis.__pmcnRequest = async ({ url }) => {
    calls++;
    if (!url.startsWith("https://ghfast.top/")) throw Error("unavailable");
    return {
      status: 200,
      text: JSON.stringify({
        tag_name: "1.0.0",
        prerelease: false,
        draft: false,
      }),
    };
  };
  const network = new Network(),
    current = { id: "demo", version: "1.0.0" };
  const result = await Promise.all([
    network.latest("author/demo", current),
    network.latest("author/demo", current),
  ]);
  assert.equal(calls, 3);
  assert.deepEqual(result, [current, current]);
});
