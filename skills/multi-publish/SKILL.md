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
