import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { syncSharedSkillPackages } from "./shared-skill-packages.mjs";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeFile(filePath: string, contents = ""): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

test("syncSharedSkillPackages vendors workspace packages into skill scripts", async (t) => {
  const root = await makeTempDir("sc-sync-shared-");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  await writeJson(path.join(root, "packages", "sc-md", "package.json"), {
    name: "sc-md",
    version: "1.0.0",
  });
  await writeFile(
    path.join(root, "packages", "sc-md", "src", "index.ts"),
    "export const markdown = true;\n",
  );
  await writeFile(
    path.join(root, "packages", "sc-md", "src", "index.test.ts"),
    "test('ignored', () => {});\n",
  );
  await writeFile(
    path.join(root, "packages", "sc-md", "src", "__tests__", "helper.ts"),
    "export const helper = true;\n",
  );
  await writeFile(
    path.join(root, "packages", "sc-md", "tests", "setup.ts"),
    "export const setup = true;\n",
  );
  await writeFile(
    path.join(root, "packages", "sc-md", ".changeset", "demo.md"),
    "---\n",
  );
  await writeFile(
    path.join(root, "packages", "sc-md", "CHANGELOG.md"),
    "# changelog\n",
  );

  const consumerDir = path.join(root, "skills", "demo-skill", "scripts");
  await writeJson(path.join(consumerDir, "package.json"), {
    name: "demo-skill-scripts",
    version: "1.0.0",
    dependencies: {
      "sc-md": "^1.0.0",
      kleur: "^4.1.5",
    },
  });

  const result = await syncSharedSkillPackages(root, { install: false });

  assert.deepEqual(result.packageDirs, [consumerDir]);
  assert.deepEqual(result.managedPaths, [
    "skills/demo-skill/scripts/bun.lock",
    "skills/demo-skill/scripts/package.json",
    "skills/demo-skill/scripts/vendor",
  ]);

  const updatedPackageJson = JSON.parse(
    await fs.readFile(path.join(consumerDir, "package.json"), "utf8"),
  ) as { dependencies: Record<string, string> };
  assert.equal(updatedPackageJson.dependencies["sc-md"], "file:./vendor/sc-md");
  assert.equal(updatedPackageJson.dependencies.kleur, "^4.1.5");

  const vendoredPackageJson = JSON.parse(
    await fs.readFile(path.join(consumerDir, "vendor", "sc-md", "package.json"), "utf8"),
  ) as { name: string };
  assert.equal(vendoredPackageJson.name, "sc-md");

  const vendoredFile = await fs.readFile(
    path.join(consumerDir, "vendor", "sc-md", "src", "index.ts"),
    "utf8",
  );
  assert.match(vendoredFile, /markdown = true/);

  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "sc-md", "src", "index.test.ts"), "utf8"),
    { code: "ENOENT" },
  );
  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "sc-md", "src", "__tests__", "helper.ts"), "utf8"),
    { code: "ENOENT" },
  );
  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "sc-md", "tests", "setup.ts"), "utf8"),
    { code: "ENOENT" },
  );
  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "sc-md", ".changeset", "demo.md"), "utf8"),
    { code: "ENOENT" },
  );
  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "sc-md", "CHANGELOG.md"), "utf8"),
    { code: "ENOENT" },
  );
});

test("syncSharedSkillPackages respects package.json files allowlists", async (t) => {
  const root = await makeTempDir("sc-sync-files-");
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  await writeJson(path.join(root, "packages", "demo-pkg", "package.json"), {
    name: "demo-pkg",
    version: "1.0.0",
    files: ["README.md", "src", "CHANGELOG.md", ".changeset"],
  });
  await writeFile(
    path.join(root, "packages", "demo-pkg", "README.md"),
    "# Demo\n",
  );
  await writeFile(
    path.join(root, "packages", "demo-pkg", "src", "index.ts"),
    "export const demo = true;\n",
  );
  await writeFile(
    path.join(root, "packages", "demo-pkg", "src", "index.test.ts"),
    "test('ignored', () => {});\n",
  );
  await writeFile(
    path.join(root, "packages", "demo-pkg", "docs", "private.md"),
    "private\n",
  );
  await writeFile(
    path.join(root, "packages", "demo-pkg", "CHANGELOG.md"),
    "# changelog\n",
  );
  await writeFile(
    path.join(root, "packages", "demo-pkg", ".changeset", "demo.md"),
    "---\n",
  );

  const consumerDir = path.join(root, "skills", "demo-skill", "scripts");
  await writeJson(path.join(consumerDir, "package.json"), {
    name: "demo-skill-scripts",
    version: "1.0.0",
    dependencies: {
      "demo-pkg": "^1.0.0",
    },
  });

  await syncSharedSkillPackages(root, { install: false });

  const readme = await fs.readFile(path.join(consumerDir, "vendor", "demo-pkg", "README.md"), "utf8");
  assert.match(readme, /Demo/);

  const vendoredSource = await fs.readFile(
    path.join(consumerDir, "vendor", "demo-pkg", "src", "index.ts"),
    "utf8",
  );
  assert.match(vendoredSource, /demo = true/);

  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "demo-pkg", "docs", "private.md"), "utf8"),
    { code: "ENOENT" },
  );
  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "demo-pkg", "CHANGELOG.md"), "utf8"),
    { code: "ENOENT" },
  );
  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "demo-pkg", ".changeset", "demo.md"), "utf8"),
    { code: "ENOENT" },
  );
  await assert.rejects(
    fs.readFile(path.join(consumerDir, "vendor", "demo-pkg", "src", "index.test.ts"), "utf8"),
    { code: "ENOENT" },
  );
});
