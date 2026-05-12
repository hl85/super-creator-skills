---
name: writeflow
description: Two-stage content authoring — turns raw source material (articles, transcripts, notes) into a platform-tuned outline, then into a publish-ready draft. Stage 1 (outline) distills the core claim, identifies the reader, and proposes structure. Stage 2 (draft) enforces platform constraints ( 公众号 long-form vs X thread). Does not collect sources (use url-to-markdown / youtube-transcript first) and does not publish (use post-to-wechat / post-to-x after). Use when user asks to "写大纲", "拟提纲", "写初稿", "写文章", "draft an article", "outline an article", "write a thread", or has source material and wants a draft. [Beta]
version: 0.1.0
---

# Writeflow: Outline + Draft

A two-stage authoring workflow that turns raw sources into platform-ready content.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Invoke it by describing what you need in the conversation.

```bash
# [示例，暂不可用] Stage 1: Generate an outline
# [示例，暂不可用] ./sc-run writeflow outline source.md --platform wechat --angle "contrarian"

# [示例，暂不可用] Stage 2: Generate a draft from outline
# [示例，暂不可用] ./sc-run writeflow draft outline.md --platform wechat --length medium
```

## Intents

- **Content Outlining**: Distill claims, identify readers, and map sources.
- **Draft Generation**: Expand outlines into publish-ready Markdown or threads.
- **Platform Adaptation**: Tune tone and structure specifically for WeChat or X.

## Progressive Disclosure

For detailed stage requirements, outline schemas, and platform-specific style guides, see:

- [references/stages.md](references/stages.md) - **Outline & Draft Stage Specs**
- [references/style-guides.md](references/style-guides.md) - **WeChat & X Style Principles**
- [prompts/outline-wechat.md](prompts/outline-wechat.md) - **WeChat Outline Logic**
- [prompts/draft-wechat.md](prompts/draft-wechat.md) - **WeChat Drafting Logic**
