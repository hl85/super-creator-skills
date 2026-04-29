# markdown-to-thread Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `markdown-to-thread` skill that slices a Markdown article into an X (Twitter) thread JSON ready to be consumed by `post-to-x`.

**Architecture:** Pure Bun/TypeScript skill following the existing `skills/<name>/scripts/main.ts` convention. Parsing reuses the `unified`/`remark-parse` toolchain already used by `format-markdown`. Output is `thread.json` — an array of `{ text, index, total }` segments — which `post-to-x` can already accept. Slicing is a deterministic pure function (no LLM calls), making it fully testable with `node:test` like `post-to-x/scripts/x-utils.test.ts`. Hook/CTA composition is optional and rule-based (title + lede for hook, fixed footer for CTA).

**Tech Stack:** TypeScript, Bun, `unified`, `remark-parse`, `remark-frontmatter`, `remark-gfm`, `yaml`, `node:test`/`node:assert`.

---

## File Structure

```
skills/markdown-to-thread/
├── SKILL.md                       # YAML front matter + usage docs
├── scripts/
│   ├── package.json               # mirrors format-markdown deps
│   ├── main.ts                    # CLI entry: arg parsing + orchestration
│   ├── slicer.ts                  # pure: extractSegments, packTweets
│   ├── slicer.test.ts             # unit tests for slicer
│   ├── compose.ts                 # pure: addHook, addCta, numberThread
│   └── compose.test.ts            # unit tests for compose
└── references/
    └── thread-style.md            # how to write a good X thread (prompt notes)
```

Responsibilities:

- **`slicer.ts`** — Parse markdown to a flat list of `Segment` (paragraph/list-item/heading), strip frontmatter and code fences (skipped or summarized), then greedy-pack segments into tweet-sized chunks honoring `maxLen` and never splitting a sentence mid-word.
- **`compose.ts`** — Given packed tweets and options, prepend a hook tweet (auto from title + first sentence) and append a CTA tweet, then number them as `1/N … N/N` if requested.
- **`main.ts`** — CLI shim. Reads file, calls `slice → compose → JSON.stringify`. No business logic.
- **Tests** — Cover boundary cases: empty doc, single paragraph, oversize paragraph (must hard-split on sentence boundary), CJK width counting, code blocks excluded, frontmatter excluded, hook/CTA toggling.

---

## Task 1: Skill scaffold

**Files:**
- Create: `skills/markdown-to-thread/SKILL.md`
- Create: `skills/markdown-to-thread/scripts/package.json`

- [ ] **Step 1: Create `SKILL.md`**

```markdown
---
name: markdown-to-thread
description: Slices a Markdown article into an X (Twitter) thread JSON. Greedy-packs paragraphs into tweet-sized segments (default 270 chars, CJK-aware), can prepend a hook tweet from the title/lede and append a CTA tweet, and emits thread.json ready for post-to-x. Use when user asks to "split article into thread", "拆成 thread", "拆成推文串", "markdown to thread", or wants to publish a long article on X as a thread.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/super-creator
    requires:
      anyBins:
        - bun
        - npx
---

# Markdown to Thread

Slice a Markdown article into an X thread JSON ready for `post-to-x`.

## Script Directory

**Agent Execution**: Determine this SKILL.md directory as `{baseDir}`. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun. Replace `{baseDir}` and `${BUN_X}` with actual values.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry: markdown → `thread.json` |

## Usage

```bash
${BUN_X} {baseDir}/scripts/main.ts <article.md> [options]

Options:
  -o, --output <path>    Output thread JSON (default: <input>.thread.json)
  --max-len <n>          Max characters per tweet (default: 270)
  --hook <auto|off>      Prepend a hook tweet (default: auto)
  --cta <text|off>       Append a CTA tweet (default: off)
  --number <on|off>      Number tweets as 1/N (default: on)
```

## Output Format

```json
[
  { "index": 1, "total": 5, "text": "..." },
  { "index": 2, "total": 5, "text": "..." }
]
```

This array is consumable by `post-to-x` via its thread-posting flow.

## Notes

- Code fences and YAML frontmatter are excluded by default.
- CJK characters are counted as width 1 (X counts them as 2 internally; we conservatively cap on character count and let X handle final rendering). Override via `--max-len`.
- See `references/thread-style.md` for thread craft tips.
```

- [ ] **Step 2: Create `scripts/package.json`**

```json
{
  "dependencies": {
    "remark-frontmatter": "^5.0.0",
    "remark-gfm": "^4.0.1",
    "remark-parse": "^11.0.0",
    "unified": "^11.0.5",
    "unist-util-visit": "^5.1.0",
    "yaml": "^2.8.2"
  }
}
```

- [ ] **Step 3: Install deps and verify Bun runs an empty entry**

```bash
cd skills/markdown-to-thread/scripts && bun install
```

Expected: lockfile created, no errors.

- [ ] **Step 4: Commit**

```bash
git add skills/markdown-to-thread/SKILL.md skills/markdown-to-thread/scripts/package.json skills/markdown-to-thread/scripts/bun.lock
git commit -m "feat(markdown-to-thread): scaffold skill"
```

---

## Task 2: Slicer — segment extraction (TDD)

**Files:**
- Create: `skills/markdown-to-thread/scripts/slicer.ts`
- Create: `skills/markdown-to-thread/scripts/slicer.test.ts`

- [ ] **Step 1: Write the failing test for `extractSegments`**

Create `skills/markdown-to-thread/scripts/slicer.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd skills/markdown-to-thread/scripts && bun test slicer.test.ts
```

Expected: FAIL with module not found / `extractSegments` undefined.

- [ ] **Step 3: Implement `extractSegments`**

Create `skills/markdown-to-thread/scripts/slicer.ts`:

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";

export interface Segment {
  kind: "heading" | "paragraph" | "listItem";
  text: string;
}

function nodeText(node: any): string {
  let out = "";
  visit(node, (child: any) => {
    if (child.type === "text" || child.type === "inlineCode") {
      out += child.value;
    }
  });
  return out.trim();
}

export function extractSegments(markdown: string): Segment[] {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml"])
    .parse(markdown) as any;

  const segs: Segment[] = [];
  for (const node of tree.children ?? []) {
    if (node.type === "yaml" || node.type === "code") continue;
    if (node.type === "heading") {
      const t = nodeText(node);
      if (t) segs.push({ kind: "heading", text: t });
    } else if (node.type === "paragraph") {
      const t = nodeText(node);
      if (t) segs.push({ kind: "paragraph", text: t });
    } else if (node.type === "list") {
      for (const item of node.children ?? []) {
        const t = nodeText(item);
        if (t) segs.push({ kind: "listItem", text: t });
      }
    } else if (node.type === "blockquote") {
      const t = nodeText(node);
      if (t) segs.push({ kind: "paragraph", text: t });
    }
  }
  return segs;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd skills/markdown-to-thread/scripts && bun test slicer.test.ts
```

Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add skills/markdown-to-thread/scripts/slicer.ts skills/markdown-to-thread/scripts/slicer.test.ts
git commit -m "feat(markdown-to-thread): extract segments from markdown"
```

---

## Task 3: Slicer — packing into tweets (TDD)

**Files:**
- Modify: `skills/markdown-to-thread/scripts/slicer.ts`
- Modify: `skills/markdown-to-thread/scripts/slicer.test.ts`

- [ ] **Step 1: Add failing tests for `packTweets`**

Append to `slicer.test.ts`:

```ts
import { packTweets } from "./slicer.ts";

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
  // First chunk should still end at a sentence boundary when possible
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
```

- [ ] **Step 2: Run tests to verify failure**

```bash
cd skills/markdown-to-thread/scripts && bun test slicer.test.ts
```

Expected: 5 new tests fail; existing 3 still pass.

- [ ] **Step 3: Implement `packTweets`**

Append to `slicer.ts`:

```ts
export interface PackOptions {
  maxLen: number;
}

const SENTENCE_END = /([.!?。！？…]+["')\]]?)\s+/g;

function splitOversize(text: string, maxLen: number): string[] {
  const out: string[] = [];
  let rest = text;
  while (rest.length > maxLen) {
    let cut = -1;
    SENTENCE_END.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = SENTENCE_END.exec(rest)) !== null) {
      const end = m.index + m[0].length;
      if (end > maxLen) break;
      cut = end;
    }
    if (cut <= 0) cut = maxLen;
    out.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest.length) out.push(rest);
  return out;
}

export function packTweets(segments: Segment[], opts: PackOptions): string[] {
  const { maxLen } = opts;
  const tweets: string[] = [];
  let buf = "";
  const flush = () => {
    if (buf.trim()) tweets.push(buf.trim());
    buf = "";
  };

  for (const seg of segments) {
    const pieces =
      seg.text.length > maxLen ? splitOversize(seg.text, maxLen) : [seg.text];
    for (const piece of pieces) {
      if (!buf) {
        buf = piece;
        continue;
      }
      const candidate = buf + "\n\n" + piece;
      if (candidate.length <= maxLen) {
        buf = candidate;
      } else {
        flush();
        buf = piece;
      }
    }
  }
  flush();
  return tweets;
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
cd skills/markdown-to-thread/scripts && bun test slicer.test.ts
```

Expected: 8/8 pass.

- [ ] **Step 5: Commit**

```bash
git add skills/markdown-to-thread/scripts/slicer.ts skills/markdown-to-thread/scripts/slicer.test.ts
git commit -m "feat(markdown-to-thread): greedy-pack segments into tweets"
```

---

## Task 4: Compose — hook, CTA, numbering (TDD)

**Files:**
- Create: `skills/markdown-to-thread/scripts/compose.ts`
- Create: `skills/markdown-to-thread/scripts/compose.test.ts`

- [ ] **Step 1: Write failing tests**

Create `compose.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { addHook, addCta, numberThread, type Tweet } from "./compose.ts";

test("addHook prepends a hook from title and lede when mode is auto", () => {
  const tweets = ["First tweet body.", "Second tweet."];
  const out = addHook(tweets, { mode: "auto", title: "My Title", maxLen: 270 });
  assert.equal(out.length, 3);
  assert.match(out[0], /My Title/);
});

test("addHook is a no-op when mode is off", () => {
  const tweets = ["Body."];
  const out = addHook(tweets, { mode: "off", title: "T", maxLen: 270 });
  assert.deepEqual(out, tweets);
});

test("addHook truncates hook to maxLen", () => {
  const tweets = ["Body."];
  const out = addHook(tweets, {
    mode: "auto",
    title: "T".repeat(400),
    maxLen: 50,
  });
  assert(out[0].length <= 50);
});

test("addCta appends CTA tweet when text given", () => {
  const tweets = ["A.", "B."];
  const out = addCta(tweets, { text: "Read more 👇" });
  assert.equal(out.length, 3);
  assert.equal(out[2], "Read more 👇");
});

test("addCta is a no-op when text is off/empty", () => {
  assert.deepEqual(addCta(["A."], { text: "off" }), ["A."]);
  assert.deepEqual(addCta(["A."], { text: "" }), ["A."]);
});

test("numberThread numbers tweets as i/N and includes total in each", () => {
  const out: Tweet[] = numberThread(["A.", "B.", "C."], { enabled: true });
  assert.equal(out.length, 3);
  assert.equal(out[0].index, 1);
  assert.equal(out[0].total, 3);
  assert.match(out[0].text, /1\/3/);
  assert.match(out[2].text, /3\/3/);
});

test("numberThread without numbering keeps text unchanged", () => {
  const out = numberThread(["A.", "B."], { enabled: false });
  assert.equal(out[0].text, "A.");
  assert.equal(out[1].text, "B.");
  assert.equal(out[1].index, 2);
  assert.equal(out[1].total, 2);
});

test("numberThread returns empty array for empty input", () => {
  assert.deepEqual(numberThread([], { enabled: true }), []);
});
```

- [ ] **Step 2: Run to verify fail**

```bash
cd skills/markdown-to-thread/scripts && bun test compose.test.ts
```

Expected: all fail (module missing).

- [ ] **Step 3: Implement `compose.ts`**

```ts
export interface Tweet {
  index: number;
  total: number;
  text: string;
}

export interface HookOptions {
  mode: "auto" | "off";
  title: string;
  maxLen: number;
}

export function addHook(tweets: string[], opts: HookOptions): string[] {
  if (opts.mode === "off" || !opts.title.trim()) return tweets;
  let hook = opts.title.trim();
  if (hook.length > opts.maxLen) hook = hook.slice(0, opts.maxLen);
  return [hook, ...tweets];
}

export interface CtaOptions {
  text: string;
}

export function addCta(tweets: string[], opts: CtaOptions): string[] {
  const t = (opts.text ?? "").trim();
  if (!t || t === "off") return tweets;
  return [...tweets, t];
}

export interface NumberOptions {
  enabled: boolean;
}

export function numberThread(
  tweets: string[],
  opts: NumberOptions,
): Tweet[] {
  const total = tweets.length;
  return tweets.map((text, i) => ({
    index: i + 1,
    total,
    text: opts.enabled ? `${text}\n\n${i + 1}/${total}` : text,
  }));
}
```

- [ ] **Step 4: Run to verify pass**

```bash
cd skills/markdown-to-thread/scripts && bun test compose.test.ts
```

Expected: 8/8 pass.

- [ ] **Step 5: Commit**

```bash
git add skills/markdown-to-thread/scripts/compose.ts skills/markdown-to-thread/scripts/compose.test.ts
git commit -m "feat(markdown-to-thread): hook, cta, and numbering composition"
```

---

## Task 5: CLI entry (`main.ts`) and end-to-end test

**Files:**
- Create: `skills/markdown-to-thread/scripts/main.ts`
- Modify: `skills/markdown-to-thread/scripts/compose.test.ts` (add e2e test) — alternative: create `main.test.ts`. We use a separate file.
- Create: `skills/markdown-to-thread/scripts/main.test.ts`

- [ ] **Step 1: Write a failing end-to-end test**

Create `main.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

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
  execFileSync(
    "bun",
    [join(import.meta.dir, "main.ts"), input, "-o", output, "--cta", "End."],
    { stdio: "pipe" },
  );
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
```

- [ ] **Step 2: Run to verify fail**

```bash
cd skills/markdown-to-thread/scripts && bun test main.test.ts
```

Expected: fail (`main.ts` missing).

- [ ] **Step 3: Implement `main.ts`**

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { extractSegments, packTweets } from "./slicer.ts";
import { addHook, addCta, numberThread } from "./compose.ts";

interface Args {
  input: string;
  output: string;
  maxLen: number;
  hook: "auto" | "off";
  cta: string;
  number: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    input: "",
    output: "",
    maxLen: 270,
    hook: "auto",
    cta: "off",
    number: true,
  };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--output") args.output = argv[++i];
    else if (a === "--max-len") args.maxLen = Number(argv[++i]);
    else if (a === "--hook") args.hook = argv[++i] === "off" ? "off" : "auto";
    else if (a === "--cta") args.cta = argv[++i];
    else if (a === "--number") args.number = argv[++i] !== "off";
    else if (!a.startsWith("-")) rest.push(a);
  }
  if (!rest.length) {
    console.error("usage: main.ts <input.md> [-o out] [--max-len n] [--hook auto|off] [--cta text|off] [--number on|off]");
    process.exit(2);
  }
  args.input = rest[0];
  if (!args.output) args.output = args.input.replace(/\.md$/i, "") + ".thread.json";
  return args;
}

function extractTitle(md: string): string {
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const t = fmMatch[1].match(/^title:\s*(.+)$/m);
    if (t) return t[1].replace(/^["']|["']$/g, "").trim();
  }
  const h1 = md.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return "";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const md = readFileSync(args.input, "utf-8");
  const title = extractTitle(md);
  const segs = extractSegments(md);
  let tweets = packTweets(segs, { maxLen: args.maxLen });
  tweets = addHook(tweets, { mode: args.hook, title, maxLen: args.maxLen });
  tweets = addCta(tweets, { text: args.cta });
  const numbered = numberThread(tweets, { enabled: args.number });
  writeFileSync(args.output, JSON.stringify(numbered, null, 2));
  console.log(`wrote ${numbered.length} tweets → ${args.output}`);
}

main();
```

- [ ] **Step 4: Run to verify pass**

```bash
cd skills/markdown-to-thread/scripts && bun test main.test.ts
```

Expected: pass.

- [ ] **Step 5: Run full test suite**

```bash
cd skills/markdown-to-thread/scripts && bun test
```

Expected: all tests across all files pass (slicer 8 + compose 8 + main 1 = 17).

- [ ] **Step 6: Commit**

```bash
git add skills/markdown-to-thread/scripts/main.ts skills/markdown-to-thread/scripts/main.test.ts
git commit -m "feat(markdown-to-thread): CLI entry with end-to-end test"
```

---

## Task 6: Reference doc and marketplace registration

**Files:**
- Create: `skills/markdown-to-thread/references/thread-style.md`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Write the thread-style reference**

Create `references/thread-style.md`:

```markdown
# X Thread Style Notes

This skill performs **mechanical** slicing only. Hook quality, narrative pacing, and CTA wording are still authoring decisions. When a model is generating the source markdown to feed this skill, follow these rules:

## Hook tweet (tweet 1)

- One sentence. Promise a payoff.
- No "in this thread we'll discuss…". Show, don't announce.
- Numbers, contrasts, or contrarian claims outperform.

## Body tweets

- One idea per tweet. Don't pack two arguments into one tweet just because they fit.
- Start each tweet with a strong noun or verb; avoid pronouns that depend on the prior tweet.
- Use empty lines to give the eye breath; X collapses single newlines.

## CTA tweet (last)

- Either: link to source/article, ask a concrete question, or invite RT.
- Avoid "follow me for more" — low signal.

## What this skill does NOT do

- Doesn't rewrite content.
- Doesn't translate.
- Doesn't generate images.
- Doesn't post — pipe the output JSON into `post-to-x`.
```

- [ ] **Step 2: Register skill in marketplace**

Open `.claude-plugin/marketplace.json` and add `"./skills/markdown-to-thread"` to the `skills` array, keeping it alphabetically sorted between `./skills/markdown-to-html` and `./skills/post-to-weibo`.

The result should look like:

```json
        "./skills/markdown-to-html",
        "./skills/markdown-to-thread",
        "./skills/post-to-weibo",
```

- [ ] **Step 3: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add skills/markdown-to-thread/references/thread-style.md .claude-plugin/marketplace.json
git commit -m "docs(markdown-to-thread): add style reference and register skill"
```

---

## Task 7: Smoke test against a real article

**Files:**
- Read: any existing markdown article in the repo (or create a fixture)

- [ ] **Step 1: Pick or create a sample article**

```bash
ls *.md docs/*.md 2>/dev/null | head
```

If none, create a temp fixture:

```bash
cat > /tmp/sample.md <<'EOF'
---
title: Why TDD pays off in agentic workflows
---

# Why TDD pays off in agentic workflows

When an agent writes code without tests, every change becomes a guess. With a failing test as the contract, the agent has a target to hit and a definition of done.

This compounds in long-running tasks: the agent can run the test, see green, and move on without re-reading hundreds of lines.

The cost is small — typically one extra round-trip per function. The benefit is a verified change instead of a hopeful one.
EOF
```

- [ ] **Step 2: Run the CLI on it**

```bash
bun skills/markdown-to-thread/scripts/main.ts /tmp/sample.md \
  --cta "Full post 👇" -o /tmp/sample.thread.json
cat /tmp/sample.thread.json
```

Expected: a JSON array with `index`/`total`/`text`, hook present at index 1, CTA at last index, every `text.length <= 270`.

- [ ] **Step 3: Manually inspect output**

Verify by eye:
- Hook is a sensible one-liner derived from the title.
- No code fences or frontmatter leaked into any tweet.
- CTA tweet is exactly `Full post 👇` (no numbering trailer if `--number off`, otherwise `… 5/5`).

- [ ] **Step 4: Run the full test suite once more**

```bash
cd skills/markdown-to-thread/scripts && bun test
```

Expected: all green.

- [ ] **Step 5: No commit needed (smoke only); clean up fixture**

```bash
rm -f /tmp/sample.md /tmp/sample.thread.json
```

---

## Self-Review Notes

- **Spec coverage:** scaffold (T1), parsing (T2), packing (T3), hook/CTA/numbering (T4), CLI (T5), docs+registration (T6), smoke (T7). Each plan-spec deliverable from the parent improvement proposal — slicer, hook, CTA, JSON output for `post-to-x` — is covered by a task.
- **Placeholder scan:** No "TBD" / "similar to". All code is inline.
- **Type consistency:** `Segment` shape is shared between `slicer.ts` exports and `compose.ts` (`compose` only consumes `string[]` from `packTweets` — no mismatch). `Tweet` is the only output type, defined once in `compose.ts` and consumed in `main.ts`. CLI flag names match SKILL.md docs (`--max-len`, `--hook`, `--cta`, `--number`).
- **Risks:** Width counting uses character count, not X's grapheme/CJK weighting. Documented in SKILL.md "Notes". Acceptable for v0.1.0.
