---
name: writeflow
description: Two-stage content authoring — turns raw source material (articles, transcripts, notes) into a platform-tuned outline, then into a publish-ready draft. Stage 1 (outline) distills the core claim, identifies the reader, and proposes structure. Stage 2 (draft) enforces platform constraints (公众号 long-form vs X thread). Does not collect sources (use url-to-markdown / youtube-transcript first) and does not publish (use post-to-wechat / post-to-x after). Use when user asks to "写大纲", "拟提纲", "写初稿", "写文章", "draft an article", "outline an article", "write a thread", or has source material and wants a draft.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/super-creator
---

# Writeflow — Outline + Draft

Two stages. Always run them in order; the outline anchors the draft and prevents drift.

| Stage | Input | Output | What it does |
|-------|-------|--------|--------------|
| `outline` | one or more source files (markdown, transcripts, notes) | `outline.md` | Distill central claim; identify reader; propose structure |
| `draft` | the outline file (+ original sources if needed) | `draft.md` | Expand outline into publish-ready markdown for the chosen platform |

## Invocation

```
/writeflow outline <source...> --platform <wechat|x-thread> [-o outline.md] [--angle "..."]
/writeflow draft <outline.md>  --platform <wechat|x-thread> [-o draft.md] [--length short|medium|long]
```

- `<source>` accepts file paths or directories (recursive `*.md`).
- `--angle` optional one-line steer for the outline stage ("write it as a contrarian take", "frame around junior engineers").
- `--length` only meaningful for `wechat` (X thread length is governed by content, not flag).

## Stage 1: Outline

The agent follows the procedure in:
- WeChat: [prompts/outline-wechat.md](prompts/outline-wechat.md)
- X thread: [prompts/outline-x-thread.md](prompts/outline-x-thread.md)

The output `outline.md` always includes these sections:

```markdown
# Outline — <working title>

**Platform:** wechat | x-thread
**Angle:** <one sentence>
**Reader:** <one sentence — who, current belief, what they will gain>
**Core claim:** <one sentence — the single thing the piece argues>
**Counter-view:** <one sentence — the strongest objection>

## Structure

1. <hook / opener — what compels the reader to keep going>
2. <section title — one bullet per supporting point>
3. ...
N. <closer / CTA>

## Source map

- claim or fact → `<source-file>:#anchor` (or quote)
```

Refuse to emit a draft from anything missing **Reader**, **Core claim**, or **Counter-view** — those three force a non-trivial outline.

## Stage 2: Draft

The agent follows:
- WeChat: [prompts/draft-wechat.md](prompts/draft-wechat.md)
- X thread: [prompts/draft-x-thread.md](prompts/draft-x-thread.md)

The output `draft.md`:
- For `wechat`: a single markdown article with H1 title, opening hook ≤ 80 字, `##` sections, a closing CTA, and a `## 参考链接` section if the outline cited URLs.
- For `x-thread`: a markdown document with one paragraph per intended tweet, separated by blank lines. Pipe into `markdown-to-thread` for the JSON.

## What writeflow does NOT do

- **Doesn't collect sources** — use `url-to-markdown`, `youtube-transcript`, `danger-x-to-markdown`.
- **Doesn't fact-check or audit** — use `content-review` after drafting.
- **Doesn't generate images** — use `cover-image` / `article-illustrator` after drafting.
- **Doesn't publish** — use `post-to-wechat` / `post-to-x` after drafting.

## References

- [references/wechat-style.md](references/wechat-style.md)
- [references/x-style.md](references/x-style.md)
