---
name: sc-writeflow
description: Two-stage content authoring — turns raw source material (articles, transcripts, notes) into a platform-tuned outline, then into a publish-ready draft. Stage 1 (outline) distills the core claim, identifies the reader, and proposes structure. Stage 2 (draft) enforces platform constraints ( 公众号 long-form vs X thread). Works seamlessly with sc-content-mining output. Does not collect sources (use content-mining first) and does not publish (use sc-post-to-wechat / sc-post-to-x after). Use when user asks to "写大纲", "拟提纲", "写初稿", "写文章", "draft an article", "outline an article", "write a thread", or has source material and wants a draft. [Beta]
version: 0.2.0
---

# Writeflow: Outline + Draft

A two-stage authoring workflow that turns raw sources into platform-ready content.

## Usage

> ⚠️ **Beta** — 此 skill 通过 Claude 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Invoke it by describing what you need in the conversation.

```bash
# [示例，暂不可用] Stage 1: Generate an outline
# [示例，暂不可用] ./sc-run sc-writeflow outline source.md --platform wechat --angle "contrarian"

# [示例，暂不可用] Stage 2: Generate a draft from outline
# [示例，暂不可用] ./sc-run sc-writeflow draft outline.md --platform wechat --length medium
```

## Intents

- **Content Outlining**: Distill claims, identify readers, and map sources.
- **Draft Generation**: Expand outlines into publish-ready Markdown or threads.
- **Platform Adaptation**: Tune tone and structure for WeChat (公众号 long-form), X (Twitter thread), or Xiaohongshu (小红书 image-text note).

## Progressive Disclosure

For detailed stage requirements, outline schemas, and platform-specific style guides, see:

- [references/content-mining.md](references/content-mining.md) - **sc-content-mining → sc-writeflow 衔接指南**
- [references/stages.md](references/stages.md) - **Outline & Draft Stage Specs**
- [references/xhs-to-images-handover.md](references/xhs-to-images-handover.md) - **sc-xhs-images Skill Handover**
- [references/wechat-style.md](references/wechat-style.md) - **WeChat 公众号 Style Principles**
- [references/x-style.md](references/x-style.md) - **X (Twitter) Style Principles**
- [references/xhs-style.md](references/xhs-style.md) - **Xiaohongshu 小红书 Style Principles**
- [prompts/outline-wechat.md](prompts/outline-wechat.md) - **WeChat Outline Logic**
- [prompts/draft-wechat.md](prompts/draft-wechat.md) - **WeChat Drafting Logic**
- [prompts/outline-xhs.md](prompts/outline-xhs.md) - **Xiaohongshu Outline Logic**
- [prompts/draft-xhs.md](prompts/draft-xhs.md) - **Xiaohongshu Drafting Logic**
- [prompts/outline-x-thread.md](prompts/outline-x-thread.md) - **X Thread Outline Logic**
- [prompts/draft-x-thread.md](prompts/draft-x-thread.md) - **X Thread Drafting Logic**
