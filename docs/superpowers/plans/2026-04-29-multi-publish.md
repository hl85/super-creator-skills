# multi-publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure-prompt `multi-publish` skill that orchestrates the existing publisher skills (`post-to-wechat`, `post-to-x`, `post-to-weibo`) plus their pre-flight neighbors (`content-review`, `compress-image`, `markdown-to-html`, `markdown-to-thread`) into a single end-to-end publication command.

**Architecture:** Zero new TypeScript. The skill is a `SKILL.md` plus `prompts/pipeline.md` that prescribes the exact step-by-step recipe the agent must follow when the user runs `/multi-publish`. The agent invokes existing skill scripts directly. No shared state files needed — each step's output file is the next step's input. Default to **draft mode** so nothing publishes without an explicit `--publish` flag.

**Tech Stack:** Markdown + YAML front matter only. No build step, no scripts.

---

## File Structure

```
skills/multi-publish/
├── SKILL.md                     # entry: invocation grammar, platform routing, defaults
├── prompts/
│   ├── pipeline.md              # step-by-step recipe per platform
│   └── platform-adapters.md     # per-platform input transforms (md → wechat-html / md → thread.json / md → weibo)
└── references/
    └── failure-handling.md      # what to do when a step fails (which to retry, which to abort)
```

Responsibilities:
- **`SKILL.md`** — Defines the invocation grammar, the platform list, the `--draft` / `--publish` distinction, the per-platform output paths, and points to prompts/references.
- **`prompts/pipeline.md`** — The canonical recipe: review → adapt → compress images → publish. The agent treats this as a checklist.
- **`prompts/platform-adapters.md`** — For each platform, names the exact input format the publisher expects and the exact upstream skill to produce it.
- **`references/failure-handling.md`** — Decision tree: if `content-review` returns `BLOCK`, abort all platforms; if a single publisher fails, continue others; etc.

No tests — no executable code. Validation is by example: a fake article runs through with `--draft` and produces draft entries on each platform without publishing.

---

## Task 1: SKILL.md scaffold

**Files:**
- Create: `skills/multi-publish/SKILL.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p skills/multi-publish/prompts skills/multi-publish/references
```

- [ ] **Step 2: Write SKILL.md**

Create `skills/multi-publish/SKILL.md`:

````markdown
---
name: multi-publish
description: One-command end-to-end publication. Takes a single source article and fans it out to multiple platforms (wechat, x, weibo), running pre-flight content-review, format adaptation per platform, and image compression before invoking each publisher. Defaults to draft mode (no live publish without --publish). Use when user asks to "一键发布", "发到所有平台", "multi-publish", "fan out", "cross-post", or names two or more platforms in one request.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/supper-creator
---

# Multi-Publish

End-to-end publish-fan-out. Takes one source article, runs it through review and per-platform adaptation, then drafts (or publishes) on each platform.

## Invocation

```
/multi-publish <article.md> --to <wechat,x,weibo> [--publish] [--skip-review] [--out-dir <dir>]
```

| Flag | Default | Meaning |
|------|---------|---------|
| `--to` | (required) | Comma-separated subset of `wechat,x,weibo` |
| `--publish` | off → **draft mode** | Actually publish; without this, every publisher leaves a platform-side draft and a local `drafts/` log entry |
| `--skip-review` | off | Skip `content-review`. Only set if the user explicitly asks. Never silently. |
| `--out-dir` | `./publish-out/<UTC-stamp>/` | Where adapted outputs and the run log live |

## Pipeline (high level)

```
   <article.md>
       │
       ▼
  ┌────────────────────────┐
  │  1. content-review     │  abort all on BLOCK; warn on REVIEW
  └────────────────────────┘
       │
       ▼   per platform in parallel:
  ┌────────────────────────┐
  │  2. adapt format       │  md → platform-specific input
  └────────────────────────┘
       │
       ▼
  ┌────────────────────────┐
  │  3. compress images    │  if any local image paths
  └────────────────────────┘
       │
       ▼
  ┌────────────────────────┐
  │  4. publish (or draft) │
  └────────────────────────┘
       │
       ▼
  <run-log.md>
```

The recipe the agent follows is in [prompts/pipeline.md](prompts/pipeline.md). Per-platform adapter specifics are in [prompts/platform-adapters.md](prompts/platform-adapters.md). What to do on failure: [references/failure-handling.md](references/failure-handling.md).

## Output Layout

```
<out-dir>/
├── review.md                     # content-review report
├── wechat/
│   ├── article.html              # markdown-to-html output
│   ├── images/                   # compressed images, original names
│   └── publish.log
├── x/
│   ├── thread.json               # markdown-to-thread output
│   └── publish.log
├── weibo/
│   ├── post.md                   # ≤ 140 字 normal post or full markdown for 长微博
│   └── publish.log
└── run-log.md                    # one-line-per-step summary
```

## Defaults that matter

- **Draft is the safe default.** Without `--publish`, no platform receives a live post. WeChat saves a 草稿; X writes the thread JSON without firing the publisher; Weibo same.
- **Review is mandatory by default.** `--skip-review` exists only for trusted recurring workflows.
- **Image compression is automatic.** Each platform has hard size limits (WeChat 5MB; X 5MB image / 512MB video; Weibo 20MB).
- **Platforms run in parallel for adaptation, but sequentially for publish** (CDP browser races otherwise).

## What multi-publish does NOT do

- **Doesn't draft content** — use `writeflow`.
- **Doesn't choose images** — use `cover-image` / `article-illustrator` first.
- **Doesn't translate** — if the user wants the article in two languages, run `translate` first and call `multi-publish` once per language.
- **Doesn't schedule** — if the user wants timed posting, use the `schedule` skill to fire `/multi-publish` at the chosen time.

## References

- [prompts/pipeline.md](prompts/pipeline.md)
- [prompts/platform-adapters.md](prompts/platform-adapters.md)
- [references/failure-handling.md](references/failure-handling.md)
````

- [ ] **Step 3: Verify YAML**

```bash
test -f skills/multi-publish/SKILL.md && head -5 skills/multi-publish/SKILL.md
```

Expected: 4 YAML lines visible.

- [ ] **Step 4: Commit**

```bash
git add skills/multi-publish/SKILL.md
git commit -m "feat(multi-publish): scaffold skill"
```

---

## Task 2: Pipeline procedure prompt

**Files:**
- Create: `skills/multi-publish/prompts/pipeline.md`

- [ ] **Step 1: Write the procedure**

Create `skills/multi-publish/prompts/pipeline.md`:

````markdown
# Pipeline Procedure

The agent runs these steps in order. Each step has explicit success criteria; if a step fails, consult `references/failure-handling.md` before continuing.

## Pre-flight

1. Parse the invocation. Required: `<article.md>`, `--to`. Determine effective `--out-dir`: if not given, `./publish-out/$(date -u +%Y%m%dT%H%M%SZ)/`.
2. Create the out-dir and per-platform subdirectories for everything in `--to`.
3. If `--publish` is **not** set, log "DRAFT MODE — no live posts will be made" prominently. Always say this before any subsequent step.

## Step 1 — content-review

Skip only if `--skip-review` was passed and the user explicitly asked for it.

For **each** platform in `--to`:

```
/content-review <article.md> --platform <wechat|x> -o <out-dir>/review-<platform>.md
```

(For `weibo`, reuse the `wechat` red-line set — they share regulators.)

Read each report. Compute the worst severity across all platforms:

| Worst severity | Action |
|----------------|--------|
| BLOCK | Stop. Print the BLOCK issue. Do not proceed. |
| REVIEW | Print the REVIEW issues to the user, then ask `Continue? [y/N]` and **wait**. Default no. |
| PASS | Proceed silently. |

## Step 2 — Per-platform adaptation (parallel-safe)

For each platform in `--to`, run the adapter from [platform-adapters.md](platform-adapters.md). The adapter writes a single canonical input file under `<out-dir>/<platform>/`:

| Platform | Adapter output |
|----------|----------------|
| wechat | `article.html` (and `images/` with compressed copies) |
| x | `thread.json` |
| weibo | `post.md` |

Adapters are independent → can be invoked back to back without waiting; they don't touch the network.

## Step 3 — Image compression

For any platform whose adapter referenced local images:

```
${BUN_X} skills/compress-image/scripts/main.ts <image-path> --max-size <limit>
```

Limits:
- wechat: `--max-size 5MB`
- x: `--max-size 5MB`
- weibo: `--max-size 20MB`

Replace the original references with the compressed paths in the adapter output.

## Step 4 — Publish (sequential)

CDP-based publishers cannot reliably share a Chrome session simultaneously. **Run sequentially**, one platform at a time, in this order: `wechat → weibo → x` (least intrusive first).

For each platform:

| Platform | Draft mode (`--publish` NOT set) | Live mode (`--publish` set) |
|----------|----------------------------------|------------------------------|
| wechat | invoke `post-to-wechat` with the publisher's built-in draft mode (don't click 发布) | invoke normally |
| x | write `thread.json` only, do NOT spawn the X publisher | invoke `post-to-x` with the JSON |
| weibo | save `post.md` to local drafts; do NOT spawn `post-to-weibo` | invoke normally |

Append a one-line entry to `<out-dir>/run-log.md` after each step:

```
[YYYY-MM-DD HH:MM:SS] <platform> <draft|publish> <status> <permalink-or-path>
```

## Step 5 — Final report

Print to user:

```
multi-publish complete (<draft|publish> mode)
out-dir: <path>
- wechat: <status> [<draft URL or 'local draft'>]
- x:      <status> [<draft path or thread URL>]
- weibo:  <status> [<draft path or post URL>]
review:   <PASS|REVIEW|BLOCK>
```

If anything failed, point at the per-platform `publish.log` for details.

## Anti-patterns

- ❌ Running publishers in parallel (Chrome CDP collision)
- ❌ Skipping content-review without `--skip-review`
- ❌ Auto-confirming on REVIEW severity
- ❌ Overwriting an existing out-dir without warning
- ❌ Inventing a platform not in `--to`
- ❌ Live-publishing on `BLOCK` severity even with `--publish`
````

- [ ] **Step 2: Commit**

```bash
git add skills/multi-publish/prompts/pipeline.md
git commit -m "feat(multi-publish): pipeline procedure prompt"
```

---

## Task 3: Platform adapters prompt

**Files:**
- Create: `skills/multi-publish/prompts/platform-adapters.md`

- [ ] **Step 1: Write the adapters reference**

Create `skills/multi-publish/prompts/platform-adapters.md`:

````markdown
# Per-Platform Adapters

How to turn a single source `article.md` into each platform's expected input.

`{baseDir}` = the source-article directory. `${BUN_X}` = `bun` if installed, else `npx -y bun`. `<out-dir>` = the multi-publish out-dir for the current run.

## WeChat

**Target:** styled HTML with bottom-citation external links and inline images.

```
${BUN_X} skills/markdown-to-html/scripts/main.ts \
  <article.md> \
  -o <out-dir>/wechat/article.html \
  --theme default \
  --convert-links bottom-citations
```

Notes:
- `--convert-links bottom-citations` is the WeChat-friendly default; in-body links are unclickable on 公众号.
- If the article has no front-matter `title`, derive it from the first H1 of the markdown.
- Local image references (`![alt](./img.png)`) → copy to `<out-dir>/wechat/images/` and rewrite paths to relative `images/img.png`.

## X

**Target:** `thread.json` array consumable by `post-to-x`.

```
${BUN_X} skills/markdown-to-thread/scripts/main.ts \
  <article.md> \
  -o <out-dir>/x/thread.json \
  --hook auto \
  --cta "Full post 👇" \
  --number on \
  --max-len 270
```

Notes:
- The CTA appended on the final tweet should include the WeChat permalink **only after** WeChat has been published in live mode; in draft mode use a placeholder `"Full post 👇 (link pending)"` and tell the user.
- Images embedded in markdown are NOT lifted into the thread — X images need explicit handling. If the article has 1–4 images, list them in `<out-dir>/x/images.txt` and tell the user to attach them manually before publish (v0.1.0 limitation).

## Weibo

**Target:** ≤ 140 字 short post if the article ≤ 140 字, otherwise a "长微博" markdown that `post-to-weibo` can render to image.

```
# short-post path (article body ≤ 140 chars):
cp <article.md> <out-dir>/weibo/post.md

# long-post path (> 140 chars):
${BUN_X} skills/markdown-to-html/scripts/main.ts \
  <article.md> \
  -o <out-dir>/weibo/long-post.html \
  --theme weibo
```

Notes:
- Weibo's "长微博" feature renders long markdown into a single image. The publisher accepts either the markdown or the rendered HTML; prefer markdown.
- For short posts, append the WeChat permalink (in live mode) at the end so 微博 readers can jump to the long version.

## Image compression hook

After every adapter, scan its output directory for `*.png|*.jpg|*.jpeg|*.webp`. For each, run:

```
${BUN_X} skills/compress-image/scripts/main.ts \
  <image> \
  --max-size <platform-limit>
```

Replace in-place. The adapter output already references these files by path, so no rewrite is needed.

## Anti-patterns

- ❌ Re-running an adapter without checking the previous output (idempotency: if `<out-dir>/<platform>/article.html` exists, ask before overwriting)
- ❌ Embedding the article's WeChat backlink in the X thread before WeChat has published
- ❌ Using `--theme default` for Weibo — Weibo doesn't render WeChat themes well; use `--theme weibo`
- ❌ Forgetting to copy local images for WeChat (broken images on 公众号 草稿)
````

- [ ] **Step 2: Commit**

```bash
git add skills/multi-publish/prompts/platform-adapters.md
git commit -m "feat(multi-publish): platform adapters prompt"
```

---

## Task 4: Failure handling reference

**Files:**
- Create: `skills/multi-publish/references/failure-handling.md`

- [ ] **Step 1: Write the reference**

Create `skills/multi-publish/references/failure-handling.md`:

````markdown
# Failure Handling

Decision tree for when a step fails. The agent should consult this before deciding to retry, skip, or abort.

## Step 1 (content-review) failures

| Symptom | Action |
|---------|--------|
| `content-review` script crashed (exit ≠ 0) | Retry once. If still crashing, abort and tell the user — review can't be skipped silently. |
| Review report `BLOCK` | Abort the entire run. Print the BLOCK reason and the offending excerpt. Exit code 1. |
| Review report `REVIEW` | Pause; show issues to user; wait for `y/N` confirmation. Default no on no-input. |
| Review report `PASS` | Proceed silently. |

## Step 2 (adapter) failures

Each platform's adapter is independent. If one fails:

- Print the failing platform and the adapter's stderr.
- **Continue** the other platforms' adapters.
- Mark the failing platform as `adapter-failed` in `run-log.md` and skip it in Step 4.

If **all** adapters fail, abort.

## Step 3 (image compression) failures

| Symptom | Action |
|---------|--------|
| Single image fails to compress | Log warning; keep the original; continue. The publisher may reject it later — that's fine, the publisher's failure is more informative. |
| All images fail (e.g., compress-image script broken) | Log; continue with originals. Don't abort — many articles have no images. |

## Step 4 (publish) failures

CDP publishers fail for many reasons (Chrome lock, login expired, network). Rules:

| Symptom | Action |
|---------|--------|
| Chrome singleton conflict | Tell user to close Chrome / use a different profile; retry once after they confirm. |
| Login expired (publisher prompts) | Open browser, let user log in, then re-invoke just that publisher. |
| Network timeout | Retry once with `--timeout 240000`. |
| Validation error (e.g., title missing) | Do NOT retry. Print the error, mark platform failed, continue others. |
| Unknown error | Mark failed, continue, surface the publisher's `publish.log` path in final report. |

A failed publish on platform A does **not** roll back already-successful publishes on B and C. Cross-platform consistency is the user's call.

## Cross-platform partial-success report

After all steps, the final report MUST clearly say which platforms made it. Example:

```
multi-publish complete (publish mode)
out-dir: ./publish-out/20260429T101530Z/
- wechat: PUBLISHED https://mp.weixin.qq.com/s/abc123
- x:      FAILED   see ./publish-out/.../x/publish.log
- weibo:  PUBLISHED https://weibo.com/12345
review:   PASS
```

Do not silently treat a partial publish as success. Surface failures prominently.

## What never to do

- ❌ Retry a `BLOCK` review by tweaking and re-running review (that's lying to the user)
- ❌ Run all publishers in parallel after one fails (CDP collision)
- ❌ Auto-translate or auto-rewrite an article to "fix" a review failure
- ❌ Auto-uninstall / reinstall Chrome on a singleton conflict (filesystem damage risk)
````

- [ ] **Step 2: Commit**

```bash
git add skills/multi-publish/references/failure-handling.md
git commit -m "feat(multi-publish): failure handling reference"
```

---

## Task 5: Marketplace registration

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add `./skills/multi-publish` keeping alphabetical order**

It should sit between `./skills/markdown-to-thread` and `./skills/post-to-weibo`:

```json
        "./skills/markdown-to-thread",
        "./skills/multi-publish",
        "./skills/post-to-weibo",
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))" && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(multi-publish): register skill in marketplace"
```

---

## Task 6: Smoke verification

**Files:**
- (read-only)

- [ ] **Step 1: Layout check**

```bash
ls skills/multi-publish/
ls skills/multi-publish/prompts/
ls skills/multi-publish/references/
```

Expected:
```
SKILL.md  prompts  references
pipeline.md  platform-adapters.md
failure-handling.md
```

- [ ] **Step 2: Cross-link sanity**

```bash
grep -cE "prompts/pipeline|prompts/platform-adapters|references/failure-handling" skills/multi-publish/SKILL.md
```

Expected: ≥ 3.

- [ ] **Step 3: Trigger phrase coverage**

```bash
grep -E "一键发布|发到所有平台|multi-publish|fan out|cross-post" skills/multi-publish/SKILL.md
```

Expected: present in description.

- [ ] **Step 4: Pipeline neighbor naming**

```bash
grep -oE "content-review|markdown-to-html|markdown-to-thread|compress-image|post-to-wechat|post-to-x|post-to-weibo|writeflow|cover-image|article-illustrator|translate|schedule" skills/multi-publish/SKILL.md skills/multi-publish/prompts/*.md skills/multi-publish/references/*.md | sort -u
```

Expected: at least 8 distinct neighbors named (proves the orchestrator references the actual ecosystem).

- [ ] **Step 5: No commit**

This task is read-only verification.

---

## Self-Review Notes

- **Spec coverage:** scaffold (T1) + pipeline procedure (T2) + per-platform adapters (T3) + failure handling (T4) + registration (T5) + smoke (T6). The original improvement-proposal asks — orchestration, draft-default safety, automatic compress-image stitching, integration with `content-review` and `markdown-to-thread` — are each handled by an explicit step in `pipeline.md`.
- **Placeholder scan:** No "TBD". Every CLI invocation is a complete command line. Every failure branch has a concrete action.
- **Type consistency:** No code, so no type drift. Output paths and flag names (`--to`, `--publish`, `--skip-review`, `--out-dir`) are defined once in SKILL.md and reused identically in the prompts. Severity vocabulary `PASS / REVIEW / BLOCK` matches `content-review`.
- **Risks:**
  - The X adapter's image-attachment limitation (manual attach) is documented but ergonomic; future v0.2 could lift images automatically once `post-to-x` exposes a JSON+images entry point. Acceptable for v0.1.0.
  - The `schedule` integration is referenced but not deep-linked; it's an orthogonal skill and works by wrapping `/multi-publish` in a cron entry.
