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
