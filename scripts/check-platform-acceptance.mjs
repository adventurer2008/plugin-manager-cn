import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
if (!manifest.isDesktopOnly) {
  const acceptance = JSON.parse(
    readFileSync("docs/validation/platform-acceptance.json", "utf8"),
  );
  assert.equal(acceptance.pluginVersion, manifest.version);
  if (acceptance.status === "deferred") {
    assert.equal(
      acceptance.releaseAuthorization?.pluginVersion,
      manifest.version,
    );
    assert.equal(acceptance.releaseAuthorization?.maintainerApproved, true);
    assert.ok(acceptance.releaseAuthorization?.date);
    assert.ok(acceptance.releaseAuthorization?.instruction);
    console.log(
      "Maintainer authorized this version before device acceptance; device results remain unverified",
    );
  } else {
    assert.equal(
      acceptance.status,
      "passed",
      "Mobile release requires real-device acceptance",
    );
    for (const platform of ["Android", "iOS"]) {
      assert.ok(
        acceptance.devices.some(
          (d) =>
            d.platform === platform &&
            d.realDevice === true &&
            d.passed === true &&
            typeof d.model === "string" &&
            d.model &&
            typeof d.obsidianVersion === "string" &&
            d.obsidianVersion &&
            d.pluginVersion === manifest.version &&
            typeof d.evidence === "string" &&
            d.evidence,
        ),
        platform + " acceptance missing",
      );
    }
    assert.ok(
      acceptance.devices.some(
        (d) =>
          d.realDevice === true &&
          d.passed === true &&
          /^1\.12\./.test(d.obsidianVersion),
      ),
      "Obsidian 1.12 runtime acceptance missing",
    );
  }
}
console.log("Platform release policy satisfied");
