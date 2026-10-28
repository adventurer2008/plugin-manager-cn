import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
if (manifest.id === "wujie-hub") {
  const migration = JSON.parse(
    readFileSync("docs/validation/community-id-migration.json", "utf8"),
  );
  assert.equal(migration.toId, manifest.id);
  assert.equal(
    migration.status,
    "completed",
    "Community ID migration still requires administrator confirmation",
  );
  assert.ok(
    typeof migration.administratorConfirmation === "string" &&
      migration.administratorConfirmation.trim(),
  );
}
console.log("Community identity release check passed");
