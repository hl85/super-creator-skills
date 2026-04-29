import assert from "node:assert/strict";
import test from "node:test";
import { extractSegments } from "./slicer.ts";

test("extractSegments strips frontmatter and code fences", () => {
  const md = [
    "---",
    "title: Hello",
    "---",
    "",
    "First paragraph.",
    "",
    "```ts",
    "const x = 1;",
    "```",
    "",
    "Second paragraph.",
  ].join("\n");
  const segs = extractSegments(md);
  assert.deepEqual(
    segs.map((s) => s.text),
    ["First paragraph.", "Second paragraph."],
  );
});

test("extractSegments keeps headings and list items as separate segments", () => {
  const md = "# Title\n\nIntro line.\n\n- item one\n- item two\n";
  const segs = extractSegments(md);
  assert.deepEqual(
    segs.map((s) => s.text),
    ["Title", "Intro line.", "item one", "item two"],
  );
});

test("extractSegments returns empty list for empty doc", () => {
  assert.deepEqual(extractSegments(""), []);
  assert.deepEqual(extractSegments("---\nfoo: bar\n---\n"), []);
});
