---
name: content-review
description: Audits an article before publishing. Runs three passes — compliance (platform red lines), factcheck (numbers/quotes/links via agent-reach), and link-health — then emits a Markdown report with severity-tagged issues. Tuned per platform (wechat | x). Does not rewrite the article. Use when user asks to "审一下这篇", "review this article", "检查合规", "fact check", "敏感词检查", or before any /post-to-wechat or /post-to-x invocation.
version: 0.1.0
metadata:
  openclaw:
    homepage: https://github.com/hl85/super-creator
---

# Content Review

Pre-publish audit for an article. Three passes:

| Pass | What it checks |
|------|----------------|
| **compliance** | Red lines per platform (政治 / 医疗 / 金融 / 涉黄涉暴 for WeChat; 法律风险 / 反讽误读 / shadowban 词 for X) |
| **factcheck** | Numbers, dates, named entities, quoted statements — verified via `agent-reach` web search |
| **link-health** | URLs reachable; no obvious paywall/login redirects |

Outputs a Markdown report. **Never** auto-rewrites the article.

## Invocation

```
/content-review <article.md|url> [--platform wechat|x] [--passes compliance,factcheck,links] [-o report.md]
```

Default `--platform` is inferred:
- `.md` containing CJK ≥ 30% → `wechat`
- `.md` < 30% CJK or short (≤ 2000 chars) → `x`
- URL → fetch first via `url-to-markdown`, then re-run inference

Default `--passes` is all three.

## What the agent does (no scripts)

1. Read the article (use `url-to-markdown` if URL).
2. Read the right red-line reference for the platform.
3. Follow `prompts/compliance.md` step by step.
4. Follow `prompts/factcheck.md` for each verifiable claim. Use `agent-reach` for searches; do not fabricate citations.
5. For each link in the article, run a `curl -sI -o /dev/null -w "%{http_code}" <url>` style check (or use `agent-reach` web read), record status.
6. Emit a single Markdown report (see schema below).

## Report Schema

```markdown
# Content Review — <article title>

**Platform:** wechat | x
**Verdict:** PASS | REVIEW | BLOCK
**Generated:** YYYY-MM-DD HH:MM

## Compliance ([N] issues)

### [BLOCK] <category> — line <n>
> <quoted excerpt>
**Why:** <one sentence>
**Fix:** <suggested rewrite or removal>

### [REVIEW] ...

## Factcheck ([N] claims)

### [REVIEW] <claim>
**Source(s):** <URLs>
**Verdict:** unsupported | partially-supported | supported | contradicted
**Note:** <one sentence>

## Links ([N] checked)

| URL | Status | Note |
|-----|--------|------|
| ... | 200 | ok |
| ... | 403 | requires login |
```

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **BLOCK** | Almost certain rejection / takedown / legal risk | Author MUST fix before publishing |
| **REVIEW** | Likely safe but needs human eyes | Author should reread and decide |
| **PASS** | No issue found | No action |

The overall verdict is the worst single severity across all passes.

## References

- [references/wechat-redlines.md](references/wechat-redlines.md)
- [references/x-redlines.md](references/x-redlines.md)
- [prompts/compliance.md](prompts/compliance.md)
- [prompts/factcheck.md](prompts/factcheck.md)
