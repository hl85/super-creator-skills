---
name: markdown-to-thread
description: Slices a Markdown article into an X (Twitter) thread JSON. Greedy-packs paragraphs into tweet-sized segments (default 270 chars, CJK-aware), can prepend a hook tweet from the title/lede and append a CTA tweet, and emits thread.json ready for post-to-x. Use when user asks to "split article into thread", "拆成 thread", "拆成推文串", "markdown to thread", or wants to publish a long article on X as a thread.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/supercreator
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
