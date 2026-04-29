import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));

function runBun(args: string[]): void {
  try {
    execFileSync("bun", args, { stdio: "pipe" });
  } catch {
    execFileSync("npx", ["-y", "bun", ...args], { stdio: "pipe" });
  }
}

test("main.ts produces thread.json from a markdown file", () => {
  const dir = mkdtempSync(join(tmpdir(), "mt-"));
  const input = join(dir, "a.md");
  const output = join(dir, "a.thread.json");
  writeFileSync(
    input,
    [
      "---",
      "title: Demo",
      "---",
      "",
      "# Demo",
      "",
      "First paragraph.",
      "",
      "Second paragraph with a bit more text.",
    ].join("\n"),
  );
  runBun([join(here, "main.ts"), input, "-o", output, "--cta", "End."]);
  const data = JSON.parse(readFileSync(output, "utf-8"));
  assert(Array.isArray(data));
  assert(data.length >= 2);
  assert.equal(data[0].index, 1);
  assert.equal(data[data.length - 1].text.includes("End."), true);
  for (const t of data) {
    assert.equal(typeof t.text, "string");
    assert.equal(typeof t.index, "number");
    assert.equal(typeof t.total, "number");
  }
  rmSync(dir, { recursive: true, force: true });
});
