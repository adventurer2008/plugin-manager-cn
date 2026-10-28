import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const read = (name) => JSON.parse(readFileSync(name, "utf8"));
const manifest = read("manifest.json");
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.equal(read("package.json").version, manifest.version);
assert.equal(read("package-lock.json").version, manifest.version);
assert.equal(read("package-lock.json").packages[""].version, manifest.version);
assert.equal(read("versions.json")[manifest.version], manifest.minAppVersion);
if (process.argv[2])
  assert.equal(
    process.argv[2],
    manifest.version,
    "Tag must match manifest version exactly",
  );
console.log("Release metadata consistent:", manifest.version);
