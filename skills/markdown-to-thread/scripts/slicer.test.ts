import assert from "node:assert/strict";
import test from "node:test";
import { extractSegments, packTweets } from "./slicer.ts";

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

test("packTweets fits multiple short segments into one tweet", () => {
  const segs = [
    { kind: "paragraph", text: "Alpha." },
    { kind: "paragraph", text: "Beta." },
    { kind: "paragraph", text: "Gamma." },
  ] as const;
  const out = packTweets([...segs], { maxLen: 270 });
  assert.equal(out.length, 1);
  assert.match(out[0], /Alpha\./);
  assert.match(out[0], /Gamma\./);
});

test("packTweets starts a new tweet when adding a segment would exceed maxLen", () => {
  const segs = [
    { kind: "paragraph", text: "x".repeat(200) },
    { kind: "paragraph", text: "y".repeat(200) },
  ] as const;
  const out = packTweets([...segs], { maxLen: 270 });
  assert.equal(out.length, 2);
  assert.equal(out[0], "x".repeat(200));
  assert.equal(out[1], "y".repeat(200));
});

test("packTweets hard-splits a single oversize segment on sentence boundary", () => {
  const long =
    "Sentence one is here. " +
    "Sentence two follows. " +
    "Sentence three is the last and quite long indeed.".repeat(5);
  const out = packTweets([{ kind: "paragraph", text: long }], { maxLen: 80 });
  assert(out.length >= 2);
  for (const t of out) assert(t.length <= 80, `tweet too long: ${t.length}`);
  assert.match(out[0], /\.\s*$/);
});

test("packTweets hard-splits when no sentence boundary fits", () => {
  const long = "a".repeat(500);
  const out = packTweets([{ kind: "paragraph", text: long }], { maxLen: 100 });
  assert.equal(out.length, 5);
  for (const t of out) assert.equal(t.length, 100);
});

test("packTweets returns empty array for empty input", () => {
  assert.deepEqual(packTweets([], { maxLen: 270 }), []);
});
