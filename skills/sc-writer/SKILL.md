---
name: sc-writer
description: 两阶段内容创作（大纲→草稿），支持微信公众号（wechat）和小红书（xhs）两个平台。将原始素材转为平台适配内容。不收集素材（先用 sc-content-mining）也不发布（公众号用 sc-publish-wechat，小红书用 sc-publish-xhs）。Use when user asks to "写大纲", "拟提纲", "写初稿", "写文章", "写小红书文案", "写公众号文章"。[Beta]
version: 0.3.0
---

# Writer: Outline + Draft

两阶段内容创作工作流，将原始素材转化为平台适配的内容。

## Usage

> ⚠️ **Beta** — 此 skill 通过 AI 对话调用（prompt 驱动），以下 CLI 命令仅作参考，尚未实现。

This skill is driven via prompt orchestration. Invoke it by describing what you need in the conversation.

```bash
# [示例，暂不可用] Stage 1: Generate an outline
# [示例，暂不可用] ./sc-run sc-writer outline source.md --platform wechat --angle "contrarian"

# [示例，暂不可用] Stage 2: Generate a draft from outline
# [示例，暂不可用] ./sc-run sc-writer draft outline.md --platform wechat --length medium
```

## Intents

- **内容大纲**：提炼核心主张、定位读者、规划结构。
- **草稿生成**：将大纲扩展为可发布的 Markdown 内容。
- **平台适配**：微信公众号长文 / 小红书图文笔记。

## Progressive Disclosure

For detailed stage requirements, outline schemas, and platform-specific style guides, see:

- [references/content-mining.md](references/content-mining.md) - **sc-content-mining → sc-writer 衔接指南**
- [references/stages.md](references/stages.md) - **Outline & Draft Stage Specs**
- [references/xhs-to-images-handover.md](references/xhs-to-images-handover.md) - **sc-xhs-images Skill Handover**
- [references/wechat-style.md](references/wechat-style.md) - **WeChat 公众号 Style Principles**
- [references/xhs-style.md](references/xhs-style.md) - **Xiaohongshu 小红书 Style Principles**
- [prompts/outline-wechat.md](prompts/outline-wechat.md) - **WeChat Outline Logic**
- [prompts/draft-wechat.md](prompts/draft-wechat.md) - **WeChat Drafting Logic**
- [prompts/outline-xhs.md](prompts/outline-xhs.md) - **Xiaohongshu Outline Logic**
- [prompts/draft-xhs.md](prompts/draft-xhs.md) - **Xiaohongshu Drafting Logic**
