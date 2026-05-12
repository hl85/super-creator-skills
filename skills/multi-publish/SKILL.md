---
name: multi-publish
description: One-command end-to-end publication. Takes a single source article and fans it out to multiple platforms (wechat, x, weibo), running pre-flight content-review, format adaptation per platform, and image compression before invoking each publisher. Defaults to draft mode (no live publish without --publish). Use when user asks to "一键发布", "发到所有平台", "multi-publish", "fan out", "cross-post", or names two or more platforms in one request. [Beta]
version: 0.1.0
---

# Multi-Publish

End-to-end publish-fan-out. Takes one source article, runs it through review and per-platform adaptation, then drafts (or publishes) on each platform.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Specify your article and target platforms in the conversation.

```bash
# [示例，暂不可用]
# ./sc-run multi-publish main article.md --to wechat,x,weibo
# ./sc-run multi-publish main article.md --to wechat,x,weibo --publish
# ./sc-run multi-publish main article.md --to x,weibo --skip-review
```

| Flag | Default | Meaning |
|------|---------|---------| 
| `--to` | (required) | Comma-separated subset of `wechat,x,weibo` |
| `--publish` | off | Draft mode by default; add flag to live publish |
| `--skip-review` | off | Skip `content-review` (only if explicitly requested) |

## Pipeline

1.  **Content Review**: Run `content-review` for target platforms.
2.  **Adaptation**: Convert Markdown to platform-specific formats (HTML, JSON, etc.).
3.  **Image Compression**: Automatically optimize images for platform limits.
4.  **Publish/Draft**: Sequential execution of platform-specific publishers.

## Progressive Disclosure

For detailed pipeline logic, platform adapters, and failure handling, see:

- [prompts/pipeline.md](prompts/pipeline.md) - **Execution Steps & Logic**
- [prompts/platform-adapters.md](prompts/platform-adapters.md) - **Per-Platform Adaptation Details**
- [references/failure-handling.md](references/failure-handling.md) - **What to do on error**
